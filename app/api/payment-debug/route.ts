import { NextRequest, NextResponse } from 'next/server';
import {
  createPaymentRequirements,
  verifyPayment,
  create402Response,
  getPaymentHeader,
} from '@/lib/payment-verification';

/**
 * DEBUG ENDPOINT - DISABLED IN PRODUCTION
 * This endpoint is for testing x402 payment verification.
 * Only available in development environment.
 */
export async function POST(request: NextRequest) {
  // SECURITY: Block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  const paymentHeader = getPaymentHeader(request);
  const requestUrl = `${new URL(request.url).origin}${new URL(request.url).pathname}`;

  const paymentRequirements = await createPaymentRequirements(
    '$0.001', // Small amount for testing
    'eip155:8453', // Base mainnet (CAIP-2)
    process.env.NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS as `0x${string}` // Debug endpoint uses platform wallet
  );
  const paymentResource = { url: requestUrl, description: 'Payment debug test' };

  const verificationResult = await verifyPayment(paymentHeader, paymentRequirements);

  if (!verificationResult.isValid) {
    return create402Response(paymentRequirements, paymentResource, verificationResult.error, verificationResult.payer);
  }

  return NextResponse.json({
    success: true,
    message: 'Payment verified successfully',
    payer: verificationResult.payer,
    amount: '$0.001 USDC',
  });
}
