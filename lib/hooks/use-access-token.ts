'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser, useIsSignedIn } from '@coinbase/cdp-hooks';

/**
 * Hook to get CDP access token for authenticated API requests
 *
 * IMPORTANT: Access tokens are managed by CDP SDK internally.
 * We need to extract them for server-side validation.
 */
export function useAccessToken() {
  const { currentUser } = useCurrentUser();
  const { isSignedIn } = useIsSignedIn();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    async function extractToken() {
      if (!isSignedIn || !currentUser) {
        setAccessToken(null);
        return;
      }

      try {
        // Access token is stored in CDP SDK internals
        // We'll need to call CDP Core's getAccessToken()
        const { getAccessToken } = await import('@coinbase/cdp-core');
        const token = await getAccessToken();
        setAccessToken(token);
      } catch (error) {
        console.error('Failed to get access token:', error);
        setAccessToken(null);
      }
    }

    extractToken();
  }, [isSignedIn, currentUser]);

  return accessToken;
}
