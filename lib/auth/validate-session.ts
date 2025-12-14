import { cdpClient } from '@/lib/cdp-client';
import type { NextRequest } from 'next/server';

export interface ValidatedSession {
  isAuthenticated: true;
  userId: string;
  evmAddress: string; // Verified wallet address
  endUser: any; // Full endUser object from CDP
}

export interface InvalidSession {
  isAuthenticated: false;
  error: string;
}

export type SessionValidationResult = ValidatedSession | InvalidSession;

/**
 * Validates CDP access token from Authorization header
 * Returns verified session info including wallet address
 */
export async function validateSession(
  request: NextRequest
): Promise<SessionValidationResult> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return {
        isAuthenticated: false,
        error: 'Missing Authorization header',
      };
    }

    // Expect format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return {
        isAuthenticated: false,
        error: 'Invalid Authorization header format. Expected: Bearer <token>',
      };
    }

    const accessToken = parts[1];

    // Validate token with CDP SDK
    const endUser = await cdpClient.endUser.validateAccessToken({
      accessToken,
    });

    // Extract EVM address (verified by CDP)
    const evmAddress = endUser.evmAccounts?.[0];

    if (!evmAddress) {
      return {
        isAuthenticated: false,
        error: 'No EVM account found for user',
      };
    }

    return {
      isAuthenticated: true,
      userId: endUser.userId,
      evmAddress: evmAddress.toLowerCase(), // Normalize to lowercase
      endUser,
    };
  } catch (error) {
    console.error('[validateSession] Error:', error);

    return {
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Invalid or expired access token',
    };
  }
}
