import { start } from 'workflow/api';
import { executeSkill } from '@/workflows/execute-skill';
import { connectDB } from '@/lib/mongodb';
import type { ExecuteSkillInput } from '@/lib/types/skills';
import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/validate-session';
import type { Resource } from 'x402/types';
import {
  createPaymentRequirements,
  verifyPayment,
  settlePayment,
  create402Response,
  createPaymentResponseHeader,
} from '@/lib/payment-verification';

/**
 * POST /api/skills/[skillId]/execute
 *
 * Executes a skill using the triple replay strategy with x402 payment gating.
 *
 * PAYMENT REQUIRED: All skill executions require payment via x402 protocol
 * - Payment is verified before execution
 * - Payments are routed to skill creator's wallet
 * - Skills without valid creator address will fail
 *
 * AUTHENTICATION: Optional (for tracking purposes)
 * - Execution works with or without authentication
 * - If authenticated, executor is tracked for analytics
 * - If not authenticated, executor is logged as 'anonymous'
 *
 * Request Headers:
 * - X-PAYMENT: string (REQUIRED) - x402 payment proof
 * - Authorization: Bearer <CDP_ACCESS_TOKEN> (optional) - For tracking who executed
 *
 * Request Body:
 * - variables: Record<string, any> (optional) - Variables to substitute in the workflow
 *
 * Response (200):
 * - success: boolean
 * - data: any - Result data from the execution
 * - strategy: 'exact_replay' | 'natural_language' | 'ai_relearn'
 * - executionTime: number - Duration in milliseconds
 * - tokensUsed: number - LLM tokens used
 * - sessionId: string - Browserbase session ID
 * - sessionUrl: string - URL to view session replay
 *
 * Response (402 Payment Required):
 * - error: string - Error message
 * - accepts: PaymentRequirements[] - Payment requirements
 * - x402Version: number - Protocol version
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await params;

    // ========== STEP 1: VALIDATE SKILL ID ==========
    if (!skillId || typeof skillId !== 'string') {
      return NextResponse.json(
        { error: 'skillId is required' },
        { status: 400 }
      );
    }

    // ========== STEP 2: LOAD SKILL FROM DATABASE ==========
    const db = await connectDB();
    const skill = await db.collection('skills').findOne({ skillId });

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // ========== STEP 3: VALIDATE PRICE CONFIGURATION ==========
    const skillPrice = skill.price;
    if (!skillPrice || skillPrice <= 0 || isNaN(skillPrice)) {
      console.error('[x402] Invalid skill price:', skillPrice);
      return NextResponse.json(
        { error: 'Skill price configuration error' },
        { status: 500 }
      );
    }

    // ========== STEP 4: VALIDATE PAYOUT ADDRESS (NO FALLBACK) ==========
    const payToAddress = skill.creatorAddress;

    if (!payToAddress || !payToAddress.startsWith('0x') || payToAddress.length !== 42) {
      console.error('[x402] Skill missing creator address:', skillId);
      return NextResponse.json(
        {
          error: 'Payment configuration error: Skill does not have a valid creator address',
          message: 'This skill cannot accept payments. Please contact the skill creator.'
        },
        { status: 500 }
      );
    }

    // ========== STEP 5: CREATE PAYMENT REQUIREMENTS ==========
    const paymentHeader = request.headers.get('X-PAYMENT');
    const requestUrl = `${new URL(request.url).origin}${new URL(request.url).pathname}` as Resource;
    const network = 'base' as const; // Base mainnet only

    const paymentRequirements = createPaymentRequirements(
      `$${skillPrice}`, // Dynamic price from skill
      network,
      requestUrl,
      `Execute skill: ${skill.name}`,
      payToAddress as `0x${string}` // Dynamic payout address
    );

    // ========== STEP 6: VERIFY PAYMENT ==========
    const verificationResult = await verifyPayment(paymentHeader, paymentRequirements);

    if (!verificationResult.isValid) {
      console.log('[x402] Payment required - returning 402');
      return NextResponse.json(
        create402Response(paymentRequirements, verificationResult.error, verificationResult.payer),
        { status: 402 }
      );
    }

    console.log('[x402] ✓ Payment verified from:', verificationResult.payer);

    // ========== STEP 7: SETTLE PAYMENT SYNCHRONOUSLY ==========
    const settlementResult = await settlePayment(paymentHeader!, paymentRequirements);
    if (settlementResult.success) {
      console.log('[x402] ✓ Payment settled:', settlementResult.txHash);
    } else {
      console.error('[x402] ✗ Settlement failed:', settlementResult.error);
    }

    // ========== STEP 8: EXECUTE WORKFLOW ==========
    const body = await request.json();
    const { variables } = body;

    // OPTIONAL AUTH: Check if user is authenticated (for analytics)
    const session = await validateSession(request);

    const input: ExecuteSkillInput = {
      skillId,
      variables,
      executorAddress: session.isAuthenticated ? session.evmAddress : null,
    };

    console.log('[POST /api/skills/[skillId]/execute] Executing skill', input);

    const workflowResult = await start(executeSkill, [input]);
    const result = await workflowResult.returnValue;

    console.log('[POST /api/skills/[skillId]/execute] Skill executed:', {
      skillId,
      strategy: result.strategy,
      success: result.success,
    });

    // ========== STEP 9: LOG EXECUTION WITH PAYMENT INFO ==========
    await db.collection('skill_executions').insertOne({
      executionId: workflowResult.runId,
      skillId,
      variables,
      executorAddress: session.isAuthenticated ? session.evmAddress : 'anonymous',
      payer: verificationResult.payer,
      paymentAmount: skillPrice,
      payToAddress: payToAddress,
      ...result,
      createdAt: new Date().toISOString(),
    });

    // ========== STEP 10: RETURN RESULT WITH PAYMENT INFO ==========
    return NextResponse.json({
      ...result,
      payment: {
        txHash: settlementResult.txHash,
        settled: settlementResult.success,
      },
    });

  } catch (error) {
    console.error('[POST /api/skills/[skillId]/execute] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to execute skill',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
