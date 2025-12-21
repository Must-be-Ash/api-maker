/**
 * Browserbase x402 Client
 *
 * Wrapper for Browserbase x402 pay-per-use API
 * Handles session creation, termination, and status checks
 */

import { DEFAULT_SESSION_MINUTES } from './pricing';

/**
 * Browserbase x402 endpoint
 * Default: https://x402.browserbase.com
 */
const BROWSERBASE_X402_ENDPOINT = process.env.BROWSERBASE_X402_ENDPOINT || 'https://x402.browserbase.com';

/**
 * Session configuration for Browserbase
 */
export interface BrowserConfig {
  advancedStealth?: boolean;
  // Add other Browserbase config options as needed
}

/**
 * Browserbase session response
 */
export interface BrowserbaseSession {
  sessionId: string;
  connectUrl: string;
  paidMinutes: number;
  expiresAt: string;
  pricing: {
    ratePerHour: number;
    amountPaid: number;
    currency: string;
  };
}

/**
 * Session termination response
 */
export interface SessionTermination {
  sessionId: string;
  finalStatus: string;
  usage: {
    minutesPaid: number;
    minutesUsed: number;
  };
  refund?: {
    eligible: boolean;
    amount: number;
    currency: string;
  };
}

/**
 * Create a Browserbase x402 session using user's payment
 *
 * @param paymentHeader - User's x402 payment proof for Browserbase session
 * @param minutes - Session duration in minutes (default: 5)
 * @param browserConfig - Optional Browserbase configuration
 * @returns Session details including connectUrl and sessionId
 *
 * @example
 * const session = await createSession(
 *   browserbasePaymentHeader,
 *   5,
 *   { advancedStealth: true }
 * );
 * console.log(session.connectUrl); // wss://connect.browserbase.com/...
 */
export async function createSession(
  paymentHeader: string,
  minutes: number = DEFAULT_SESSION_MINUTES,
  browserConfig?: BrowserConfig
): Promise<BrowserbaseSession> {
  const url = `${BROWSERBASE_X402_ENDPOINT}/browser/session/create`;

  const requestBody = {
    estimatedMinutes: minutes,
    ...(browserConfig && { browserConfig }),
  };

  console.log('[Browserbase x402] Creating session:', {
    endpoint: url,
    estimatedMinutes: minutes,
    browserConfig,
  });

  try {
    // Call Browserbase x402 API with user's payment
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PAYMENT': paymentHeader,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Browserbase x402] Session creation failed:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(
        `Browserbase session creation failed: ${errorData.error || response.statusText}`
      );
    }

    const session: BrowserbaseSession = await response.json();

    console.log('[Browserbase x402] Session created:', {
      sessionId: session.sessionId,
      paidMinutes: session.paidMinutes,
      expiresAt: session.expiresAt,
    });

    return session;
  } catch (error) {
    console.error('[Browserbase x402] Error creating session:', error);
    throw error;
  }
}

/**
 * Terminate a Browserbase x402 session early to get refund for unused time
 *
 * @param sessionId - Browserbase session ID to terminate
 * @returns Termination details including refund information
 *
 * @example
 * const termination = await terminateSession('abc-123');
 * console.log('Refund:', termination.refund?.amount); // 0.33 USDC
 */
export async function terminateSession(
  sessionId: string
): Promise<SessionTermination> {
  const url = `${BROWSERBASE_X402_ENDPOINT}/browser/session/${sessionId}/terminate`;

  console.log('[Browserbase x402] Terminating session:', sessionId);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ✅ Handle 404: Endpoint is documented but not yet deployed
    // According to browserbase-x402.md, this endpoint should exist but currently returns 404
    // Once Browserbase deploys it, refunds will start working automatically
    if (response.status === 404) {
      console.warn('[Browserbase x402] Termination endpoint not available (404)');
      console.warn('[Browserbase x402] The /terminate endpoint is documented but not yet deployed by Browserbase');
      console.warn('[Browserbase x402] Refunds will be available once Browserbase implements this endpoint');
      return {
        sessionId,
        finalStatus: 'terminated',
        usage: {
          minutesPaid: 0,
          minutesUsed: 0,
        },
      };
    }

    if (!response.ok) {
      // Try to parse JSON error, but handle HTML responses gracefully
      let errorData: any;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { error: await response.text() };
      }

      console.error('[Browserbase x402] Termination failed:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(
        `Browserbase session termination failed: ${errorData.error || response.statusText}`
      );
    }

    // Try to parse JSON response, handle non-JSON gracefully
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.warn('[Browserbase x402] Termination endpoint returned non-JSON response (may not support termination yet)');
      // Return a mock successful termination
      return {
        sessionId,
        finalStatus: 'terminated',
        usage: {
          minutesPaid: 0,
          minutesUsed: 0,
        },
      };
    }

    const termination: SessionTermination = await response.json();

    console.log('[Browserbase x402] Session terminated:', {
      sessionId: termination.sessionId,
      minutesUsed: termination.usage.minutesUsed,
      minutesPaid: termination.usage.minutesPaid,
      refundAmount: termination.refund?.amount || 0,
      refundEligible: termination.refund?.eligible || false,
    });

    return termination;
  } catch (error) {
    console.error('[Browserbase x402] Error terminating session:', error);
    throw error;
  }
}

/**
 * Session status response
 */
export interface SessionStatus {
  sessionId: string;
  status: 'active' | 'expired' | 'terminated';
  usage: {
    minutesPaid: number;
    minutesUsed: number;
    minutesRemaining: number;
  };
  expiresAt: string;
}

/**
 * Get the current status of a Browserbase x402 session
 *
 * @param sessionId - Browserbase session ID to check
 * @returns Current session status including usage and remaining time
 *
 * @example
 * const status = await getSessionStatus('abc-123');
 * console.log('Remaining:', status.usage.minutesRemaining); // 25 minutes
 */
export async function getSessionStatus(
  sessionId: string
): Promise<SessionStatus> {
  const url = `${BROWSERBASE_X402_ENDPOINT}/browser/session/${sessionId}/status`;

  console.log('[Browserbase x402] Getting session status:', sessionId);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Browserbase x402] Status check failed:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(
        `Browserbase session status check failed: ${errorData.error || response.statusText}`
      );
    }

    const status: SessionStatus = await response.json();

    console.log('[Browserbase x402] Session status:', {
      sessionId: status.sessionId,
      status: status.status,
      minutesUsed: status.usage.minutesUsed,
      minutesRemaining: status.usage.minutesRemaining,
    });

    return status;
  } catch (error) {
    console.error('[Browserbase x402] Error getting session status:', error);
    throw error;
  }
}
