'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsSignedIn, useIsInitialized } from '@coinbase/cdp-hooks';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useIsSignedIn();
  const { isInitialized } = useIsInitialized();

  useEffect(() => {
    if (!isInitialized) return;

    if (requireAuth && !isSignedIn) {
      // Store intended destination before redirecting
      sessionStorage.setItem('redirectAfterAuth', pathname);
      router.push('/?auth=required');
    }
  }, [isSignedIn, isInitialized, requireAuth, pathname, router]);

  // Loading state while CDP initializes
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirecting state
  if (requireAuth && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Redirecting to sign in...</p>
      </div>
    );
  }

  return <>{children}</>;
}
