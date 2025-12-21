import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for Browserbase x402 session creation
 *
 * Two-step flow:
 * 1. Call without payment → Get 402 with Browserbase's actual payment requirements
 * 2. Call with payment → Get session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paymentHeader = request.headers.get('x-402-payment');

    // Call Browserbase x402 endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Include payment header if provided
    if (paymentHeader) {
      headers['X-PAYMENT'] = paymentHeader;
      console.log('[Browserbase Proxy] Forwarding with payment to Browserbase');
    } else {
      console.log('[Browserbase Proxy] Calling Browserbase to get payment requirements');
    }

    const browserbaseResponse = await fetch('https://x402.browserbase.com/browser/session/create', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('[Browserbase Proxy] Browserbase response status:', browserbaseResponse.status);

    const data = await browserbaseResponse.json();

    // Forward 402 responses (payment required) to client
    if (browserbaseResponse.status === 402) {
      console.log('[Browserbase Proxy] Returning 402 with Browserbase payment requirements');
      return NextResponse.json(data, { status: 402 });
    }

    if (!browserbaseResponse.ok) {
      console.error('[Browserbase Proxy] Browserbase error:', data);
      return NextResponse.json(
        { error: 'Browserbase session creation failed', details: data },
        { status: browserbaseResponse.status }
      );
    }

    console.log('[Browserbase Proxy] ✓ Session created:', data.sessionId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Browserbase Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create Browserbase session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
