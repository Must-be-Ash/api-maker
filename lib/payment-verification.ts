import { exact } from 'x402/schemes';
import { useFacilitator } from 'x402/verify';
import {
  PaymentPayload,
  PaymentRequirements,
  Resource,
  Network,
} from 'x402/types';
import { processPriceToAtomicAmount } from 'x402/shared';
import { facilitator } from '@coinbase/x402';
import { calculateSessionCost } from './browserbase/pricing';

// CDP Facilitator - Required for Base mainnet
const { verify, settle } = useFacilitator(facilitator);
const x402Version = 1;

export function createPaymentRequirements(
  price: string, // e.g. "$0.01"
  network: Network,
  resource: Resource,
  description: string,
  payTo: `0x${string}` // Dynamic payment destination (skill creator's wallet)
): PaymentRequirements {
  const atomicAmountForAsset = processPriceToAtomicAmount(price, network);

  if ('error' in atomicAmountForAsset) {
    throw new Error(atomicAmountForAsset.error);
  }

  const { maxAmountRequired, asset } = atomicAmountForAsset;

  // Type guard: EVM assets have eip712 property
  const extra = 'eip712' in asset ? {
    name: asset.eip712.name,
    version: asset.eip712.version,
  } : undefined;

  return {
    scheme: 'exact',
    network,
    maxAmountRequired,
    resource,
    description,
    mimeType: 'application/json',
    payTo, // Dynamic payTo based on skill creator
    maxTimeoutSeconds: 120,
    asset: asset.address,
    outputSchema: undefined,
    extra,
  };
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
 * @param network - Payment network (base)
 * @param skillResource - Resource URL for skill execution
 * @param skillCreatorAddress - Wallet address of skill creator
 * @returns Array of 2 PaymentRequirements [skillPayment, browserbasePayment]
 */
export function createDualPaymentRequirements(
  skillPrice: number,
  sessionMinutes: number,
  network: Network,
  skillResource: Resource,
  skillCreatorAddress: `0x${string}`
): PaymentRequirements[] {
  // 1. Skill payment (to creator)
  const skillPaymentRequirements = createPaymentRequirements(
    `$${skillPrice.toFixed(2)}`,
    network,
    skillResource,
    `Skill execution payment`,
    skillCreatorAddress
  );

  // 2. Browserbase session payment (to x402.browserbase.com)
  const sessionCost = calculateSessionCost(sessionMinutes);
  const browserbaseEndpoint = process.env.BROWSERBASE_X402_ENDPOINT || 'https://x402.browserbase.com';

  const browserbasePaymentRequirements = createPaymentRequirements(
    `$${sessionCost.toFixed(2)}`,
    network,
    `${browserbaseEndpoint}/browser/session/create` as Resource,
    `Browserbase session (${sessionMinutes} min)`,
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}` // Browserbase payment address (USDC on Base)
  );

  return [skillPaymentRequirements, browserbasePaymentRequirements];
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
      error: 'X-PAYMENT header is required',
    };
  }

  // Decode payment
  let decodedPayment: PaymentPayload;
  try {
    decodedPayment = exact.evm.decodePayment(paymentHeader);
    decodedPayment.x402Version = x402Version;
  } catch (error) {
    console.error('[x402] Failed to decode payment:', error);
    return {
      isValid: false,
      error: 'Invalid or malformed payment header',
    };
  }

  // Log payment details
  console.log('[x402] Payment received:');
  // Type guard: EVM payloads have authorization, Solana has transaction
  if (decodedPayment.payload && 'authorization' in decodedPayment.payload) {
    console.log('  From:', decodedPayment.payload.authorization.from);
    console.log('  To:', decodedPayment.payload.authorization.to);
    console.log('  Amount:', decodedPayment.payload.authorization.value);
  }
  console.log('  Network:', decodedPayment.network);

  // Verify with CDP facilitator
  try {
    const response = await verify(decodedPayment, paymentRequirements);

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
  error?: string;
}> {
  try {
    const decodedPayment = exact.evm.decodePayment(paymentHeader);
    decodedPayment.x402Version = x402Version;

    const settleResponse = await settle(decodedPayment, paymentRequirements);

    if (!settleResponse.success) {
      console.error('[x402] Payment settlement failed');
      return {
        success: false,
        error: 'Settlement failed',
      };
    }

    console.log('[x402] ✓ Payment settled:', settleResponse.transaction);
    return {
      success: true,
      txHash: settleResponse.transaction,
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

export function create402Response(
  paymentRequirements: PaymentRequirements | PaymentRequirements[],
  error?: string,
  payer?: string
) {
  return {
    x402Version,
    error: error || 'Payment required',
    accepts: Array.isArray(paymentRequirements) ? paymentRequirements : [paymentRequirements],
    ...(payer && { payer }),
  };
}

export function createPaymentResponseHeader(txHash: string): string {
  return `tx_hash:${txHash}`;
}
