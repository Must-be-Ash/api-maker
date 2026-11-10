import { NextResponse } from 'next/server';
import { x402ResourceServer, HTTPFacilitatorClient } from '@x402/core/server';
import {
  decodePaymentSignatureHeader,
  encodePaymentRequiredHeader,
  encodePaymentResponseHeader,
} from '@x402/core/http';
import type { Network, PaymentPayload, PaymentRequirements, SettleResponse } from '@x402/core/types';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { facilitator } from '@coinbase/x402';
import { calculateSessionCost } from './browserbase/pricing';

// CDP Facilitator - Required for Base mainnet (x402 v2)
const resourceServer = new x402ResourceServer(new HTTPFacilitatorClient(facilitator))
  .register('eip155:8453', new ExactEvmScheme());

let initPromise: Promise<void> | null = null;
function ensureInitialized() {
  initPromise ??= resourceServer.initialize().catch((error) => {
    initPromise = null;
    throw error;
  });
  return initPromise;
}

export interface PaymentResource {
  url: string;
  description: string;
}

export async function createPaymentRequirements(
  price: string, // e.g. "$0.01"
  network: Network, // CAIP-2, e.g. "eip155:8453"
  payTo: `0x${string}` // Dynamic payment destination (skill creator's wallet)
): Promise<PaymentRequirements> {
  await ensureInitialized();
  const [requirements] = await resourceServer.buildPaymentRequirements({
    scheme: 'exact',
    price,
    network,
    payTo, // Dynamic payTo based on skill creator
    maxTimeoutSeconds: 120,
  });

  if (!requirements) {
    throw new Error(`Facilitator does not support exact payments on ${network}`);
  }
  return requirements;
}

/**
 * Create dual payment requirements for skill execution + Browserbase session
 *
 * Returns TWO payment requirements:
 * 1. Skill payment → Sent to skill creator's wallet
 * 2. Browserbase session payment → Sent to x402.browserbase.com
 *
 * @param skillPrice - Price in USDC set by skill creator (e.g., 0.01)
 * @param sessionMinutes - Browserbase session duration in minutes (default: 5)
 * @param network - Payment network (CAIP-2, e.g. "eip155:8453")
 * @param skillCreatorAddress - Wallet address of skill creator
 * @returns Array of 2 PaymentRequirements [skillPayment, browserbasePayment]
 */
export async function createDualPaymentRequirements(
  skillPrice: number,
  sessionMinutes: number,
  network: Network,
  skillCreatorAddress: `0x${string}`
): Promise<PaymentRequirements[]> {
  // 1. Skill payment (to creator)
  const skillPaymentRequirements = await createPaymentRequirements(
    `$${skillPrice.toFixed(2)}`,
    network,
    skillCreatorAddress
  );

  // 2. Browserbase session payment (to x402.browserbase.com)
  const sessionCost = calculateSessionCost(sessionMinutes);
  const browserbasePaymentRequirements = await createPaymentRequirements(
    `$${sessionCost.toFixed(2)}`,
    network,
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}` // Browserbase payment address (USDC on Base)
  );

  return [skillPaymentRequirements, browserbasePaymentRequirements];
}

// Reads the v2 PAYMENT-SIGNATURE header (falls back to the legacy v1 X-PAYMENT header name)
export function getPaymentHeader(request: Request): string | null {
  return request.headers.get('PAYMENT-SIGNATURE') ?? request.headers.get('X-PAYMENT');
}

function decodePayment(
  paymentHeader: string,
  paymentRequirements: PaymentRequirements
): PaymentPayload {
  const decodedPayment = decodePaymentSignatureHeader(paymentHeader);
  if (!resourceServer.findMatchingRequirements([paymentRequirements], decodedPayment)) {
    throw new Error('Payment does not match the payment requirements');
  }
  return decodedPayment;
}

export async function verifyPayment(
  paymentHeader: string | null,
  paymentRequirements: PaymentRequirements
): Promise<{
  isValid: boolean;
  error?: string;
  payer?: string;
}> {
  // No payment header - return 402
  if (!paymentHeader) {
    return {
      isValid: false,
      error: 'PAYMENT-SIGNATURE header is required',
    };
  }

  // Decode payment
  let decodedPayment: PaymentPayload;
  try {
    decodedPayment = decodePayment(paymentHeader, paymentRequirements);
  } catch (error) {
    console.error('[x402] Failed to decode payment:', error);
    return {
      isValid: false,
      error: 'Invalid or malformed payment header',
    };
  }

  // Log payment details
  console.log('[x402] Payment received:');
  const authorization = (decodedPayment.payload as { authorization?: Record<string, string> }).authorization;
  if (authorization) {
    console.log('  From:', authorization.from);
    console.log('  To:', authorization.to);
    console.log('  Amount:', authorization.value);
  }
  console.log('  Network:', decodedPayment.accepted.network);

  // Verify with CDP facilitator
  try {
    const response = await resourceServer.verifyPayment(decodedPayment, paymentRequirements);

    if (!response.isValid) {
      console.error('[x402] Payment verification failed:', response.invalidReason);
      return {
        isValid: false,
        error: response.invalidReason || 'Payment verification failed',
        payer: response.payer,
      };
    }

    console.log('[x402] ✓ Payment verified for:', response.payer);
    return {
      isValid: true,
      payer: response.payer,
    };
  } catch (error) {
    console.error('[x402] Facilitator error:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown verification error',
    };
  }
}

export async function settlePayment(
  paymentHeader: string,
  paymentRequirements: PaymentRequirements
): Promise<{
  success: boolean;
  txHash?: string;
  settleResponse?: SettleResponse;
  error?: string;
}> {
  try {
    const decodedPayment = decodePayment(paymentHeader, paymentRequirements);

    const settleResponse = await resourceServer.settlePayment(decodedPayment, paymentRequirements);

    if (!settleResponse.success) {
      console.error('[x402] Payment settlement failed:', settleResponse.errorReason);
      return {
        success: false,
        error: settleResponse.errorReason || 'Settlement failed',
      };
    }

    console.log('[x402] ✓ Payment settled:', settleResponse.transaction);
    return {
      success: true,
      txHash: settleResponse.transaction,
      settleResponse,
    };
  } catch (error) {
    console.error('[x402] Settlement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown settlement error',
    };
  }
}

/**
 * Settle payment with automatic retry on transient failures
 * Retries up to 3 times with exponential backoff: 1s, 2s, 4s
 */
export async function settlePaymentWithRetry(
  paymentHeader: string,
  paymentRequirements: PaymentRequirements,
  maxRetries: number = 3
): Promise<{
  success: boolean;
  txHash?: string;
  settleResponse?: SettleResponse;
  error?: string;
  attempts: number;
}> {
  let lastError: string = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[x402] Settlement attempt ${attempt}/${maxRetries}`);

    const result = await settlePayment(paymentHeader, paymentRequirements);

    if (result.success) {
      console.log(`[x402] ✓ Settlement succeeded on attempt ${attempt}`);
      return {
        success: true,
        txHash: result.txHash,
        settleResponse: result.settleResponse,
        attempts: attempt,
      };
    }

    lastError = result.error || 'Unknown settlement error';
    console.error(`[x402] ✗ Attempt ${attempt} failed:`, lastError);

    // Don't wait after the last attempt
    if (attempt < maxRetries) {
      const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      console.log(`[x402] Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`[x402] ✗ All ${maxRetries} settlement attempts failed`);
  return {
    success: false,
    error: lastError,
    attempts: maxRetries,
  };
}

// Builds a v2 402 response: requirements in the PAYMENT-REQUIRED header (and mirrored in the body)
export async function create402Response(
  paymentRequirements: PaymentRequirements | PaymentRequirements[],
  resource: PaymentResource,
  error?: string,
  payer?: string
): Promise<NextResponse> {
  const paymentRequired = await resourceServer.createPaymentRequiredResponse(
    Array.isArray(paymentRequirements) ? paymentRequirements : [paymentRequirements],
    { url: resource.url, description: resource.description, mimeType: 'application/json' },
    error || 'Payment required'
  );

  return NextResponse.json(
    { ...paymentRequired, ...(payer && { payer }) },
    {
      status: 402,
      headers: {
        'PAYMENT-REQUIRED': encodePaymentRequiredHeader(paymentRequired),
        'Access-Control-Expose-Headers': 'PAYMENT-REQUIRED',
      },
    }
  );
}

export function createPaymentResponseHeader(settleResponse: SettleResponse): string {
  return encodePaymentResponseHeader(settleResponse);
}
