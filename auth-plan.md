⏺ Perfect! I've written a comprehensive implementation plan to the plan file. The plan covers all aspects of implementing authentication with CDP embedded wallets, including:

  1. Client-side AuthGuard component for route protection
  2. Layout-based guards for /skills/* and /chat routes
  3. Landing page modifications to trigger auth and handle redirects
  4. AuthButton styling to match your landing page design
  5. Complete user flow scenarios for different authentication paths

  The plan includes detailed code snippets, file paths, and a testing checklist to ensure everything works correctly.
                                                                                            
⏺ User approved Claude's plan
  ⎿  Plan saved to: ~/.claude/plans/inherited-purring-papert.md · /plan to edit
     Plan: Add Authentication Requirements with CDP Embedded Wallets

     Overview

     Implement authentication using CDP embedded wallets so that only the landing page (/) is
      public, and all other pages require users to be authenticated. The "Get Started for
     Free" button on the landing page will trigger authentication, and after successful
     sign-in, users are redirected to the skills gallery (/skills).

     Requirements

     1. Public Landing Page Only: Only / accessible without authentication
     2. Protected Routes: /skills/*, /chat require authentication
     3. Server-Side Middleware: Lightweight route matching
     4. Client-Side Guards: Real authentication enforcement
     5. Auth Flow: Click "Get Started for Free" → Auth modal → Redirect to /skills
     6. Direct Access: Unauthenticated users accessing protected routes → Redirect to / with 
     auth prompt

     Current State

     Already Integrated:
     - ✅ CDP embedded wallets configured in /app/providers.tsx
     - ✅ Auth hooks available: useIsSignedIn(), useEvmAddress(), useCurrentUser()
     - ✅ AuthButton component from @coinbase/cdp-react
     - ✅ Header shows auth state (AuthButton or WalletDropdown)

     What's Missing:
     - ❌ No route protection (all pages currently public)
     - ❌ Landing page button links directly to /skills/record instead of triggering auth
     - ❌ No redirect logic after authentication
     - ❌ No middleware for route handling

     Implementation Plan

     Phase 1: Create Client-Side Auth Guard Component

     File: /components/AuthGuard.tsx (NEW)

     Purpose: Wraps protected routes and enforces authentication client-side.

     Key Features:
     - Checks useIsSignedIn() and useIsInitialized() hooks
     - Shows loading spinner while CDP initializes
     - Stores intended destination in sessionStorage before redirect
     - Redirects to /?auth=required if not authenticated

     Implementation:
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
           sessionStorage.setItem('redirectAfterAuth', pathname);
           router.push('/?auth=required');
         }
       }, [isSignedIn, isInitialized, requireAuth, pathname, router]);

       // Loading state
       if (!isInitialized) {
         return (
           <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex 
     items-center justify-center">
             <div className="text-center space-y-4">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 
     border-slate-900 mx-auto"></div>
               <p className="text-slate-600">Loading...</p>
             </div>
           </div>
         );
       }

       // Redirecting state
       if (requireAuth && !isSignedIn) {
         return (
           <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex 
     items-center justify-center">
             <p className="text-slate-600">Redirecting to sign in...</p>
           </div>
         );
       }

       return <>{children}</>;
     }

     Phase 2: Create Layout Guards for Protected Routes

     File: /app/skills/layout.tsx (NEW)

     Purpose: Wrap all /skills/* routes with auth guard.

     import { AuthGuard } from '@/components/AuthGuard';

     export default function SkillsLayout({
       children,
     }: {
       children: React.ReactNode;
     }) {
       return (
         <AuthGuard requireAuth={true}>
           {children}
         </AuthGuard>
       );
     }

     File: /app/chat/layout.tsx (NEW)

     Purpose: Wrap /chat route with auth guard.

     import { AuthGuard } from '@/components/AuthGuard';

     export default function ChatLayout({
       children,
     }: {
       children: React.ReactNode;
     }) {
       return (
         <AuthGuard requireAuth={true}>
           {children}
         </AuthGuard>
       );
     }

     Phase 3: Update Landing Page with Auth Logic

     File: /app/page.tsx

     Changes Required:

     1. Add imports (top of file):
     'use client';

     import Link from 'next/link';
     import Image from 'next/image';
     import { motion } from 'framer-motion';
     import { useIsSignedIn } from '@coinbase/cdp-hooks';
     import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
     import { useRouter, useSearchParams } from 'next/navigation';
     import { useEffect, useState } from 'react';

     2. Add redirect logic (inside component, after function declaration):
     export default function LandingPage() {
       const { isSignedIn } = useIsSignedIn();
       const router = useRouter();
       const searchParams = useSearchParams();
       const [showAuthPrompt, setShowAuthPrompt] = useState(false);

       // Redirect authenticated users to /skills
       useEffect(() => {
         if (isSignedIn) {
           const redirectPath = sessionStorage.getItem('redirectAfterAuth');

           if (redirectPath) {
             sessionStorage.removeItem('redirectAfterAuth');
             router.push(redirectPath);
           } else {
             router.push('/skills');
           }
         }
       }, [isSignedIn, router]);

       // Show auth prompt if redirected from protected route
       useEffect(() => {
         if (searchParams.get('auth') === 'required') {
           setShowAuthPrompt(true);
           const timeout = setTimeout(() => setShowAuthPrompt(false), 5000);
           return () => clearTimeout(timeout);
         }
       }, [searchParams]);

       return (
         <main className="min-h-screen bg-[#F8F8F9] relative overflow-x-hidden">
           {/* Auth prompt banner */}
           {showAuthPrompt && (
             <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
               <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex 
     items-center gap-2">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 
     11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
     clipRule="evenodd" />
                 </svg>
                 <span className="font-medium">Please sign in to continue</span>
               </div>
             </div>
           )}

           {/* Rest of landing page... */}

     3. Replace "Get Started" button (lines 63-79):

     BEFORE:
     <div className="text-left">
       <Link
         href="/skills/record"
         className="relative inline-flex items-center justify-center px-8 py-4 rounded-full 
     font-medium text-white transition-all duration-200 border-0 cursor-pointer shadow-[0_8px
     _32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] 
     hover:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(0,0,0,0.3)] 
     active:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_3px_6px_rgba(0,0,0,0.4)] 
     hover:scale-[0.98] active:scale-[0.96]"
         style={{
           background: 'linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)'
         }}
       >
         <span className="relative z-10">Get Started for Free</span>
         <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 
     to-transparent opacity-60 pointer-events-none" />
         <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-[90%] h-1 
     bg-black/20 rounded-full blur-sm" />
       </Link>
     </div>

     AFTER:
     <div className="text-left">
       <div className="auth-button-wrapper">
         <AuthButton />
       </div>
     </div>

     Note: The CDP AuthButton component automatically handles the auth flow. We'll need to 
     style it to match the landing page design using CSS or by wrapping it in a custom styled
      container.

     Phase 4: Create Next.js Middleware (Optional - Lightweight)

     File: /middleware.ts (NEW)

     Purpose: Lightweight route matcher (actual protection is client-side).

     import { NextResponse } from 'next/server';
     import type { NextRequest } from 'next/server';

     const PUBLIC_ROUTES = ['/', '/test', '/test-iframe'];
     const PROTECTED_ROUTE_PATTERNS = ['/skills', '/chat'];

     export function middleware(request: NextRequest) {
       const { pathname } = request.nextUrl;

       const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
       const isProtectedRoute = PROTECTED_ROUTE_PATTERNS.some(pattern =>
         pathname.startsWith(pattern)
       );

       // Let all requests through - client-side guards handle actual protection
       return NextResponse.next();
     }

     export const config = {
       matcher: [
         '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
       ],
     };

     Why Lightweight?: CDP auth is client-side only. Real protection happens in AuthGuard 
     component. Middleware is just for route awareness.

     Phase 5: Style AuthButton to Match Landing Page

     Option A - Custom Wrapper Component:

     File: /components/StyledAuthButton.tsx (NEW)

     'use client';

     import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';

     export function StyledAuthButton() {
       return (
         <div className="styled-auth-button-container">
           <AuthButton />
           <style jsx global>{`
             .styled-auth-button-container button {
               position: relative;
               display: inline-flex;
               align-items: center;
               justify-content: center;
               padding: 1rem 2rem;
               border-radius: 9999px;
               font-weight: 500;
               color: white;
               transition: all 0.2s;
               border: 0;
               cursor: pointer;
               background: linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%);
               box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px
      0 rgba(255,255,255,0.1);
             }

             .styled-auth-button-container button:hover {
               box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.3);
               transform: scale(0.98);
             }

             .styled-auth-button-container button:active {
               box-shadow: 0 2px 8px rgba(0,0,0,0.4), inset 0 3px 6px rgba(0,0,0,0.4);
               transform: scale(0.96);
             }
           `}</style>
         </div>
       );
     }

     Then use <StyledAuthButton /> instead of <AuthButton /> in landing page.

     Option B - Global CSS Override:

     Add to /app/globals.css:
     /* CDP AuthButton styling override */
     .cdp-auth-button button {
       position: relative;
       display: inline-flex;
       align-items: center;
       justify-content: center;
       padding: 1rem 2rem;
       border-radius: 9999px;
       font-weight: 500;
       color: white;
       transition: all 0.2s;
       border: 0;
       cursor: pointer;
       background: linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%);
       box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 
     rgba(255,255,255,0.1);
     }

     .cdp-auth-button button:hover {
       box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.3);
       transform: scale(0.98);
     }

     .cdp-auth-button button:active {
       box-shadow: 0 2px 8px rgba(0,0,0,0.4), inset 0 3px 6px rgba(0,0,0,0.4);
       transform: scale(0.96);
     }

     User Flow Examples

     Scenario 1: New User Clicks "Get Started for Free"

     1. User lands on / (landing page)
     2. Clicks "Get Started for Free" button (AuthButton)
     3. CDP auth modal opens with sign-in options
     4. User completes authentication (email OTP/OAuth)
     5. useEffect detects isSignedIn change
     6. Redirects to /skills (skills gallery)

     Scenario 2: Direct Access to Protected Route

     1. User navigates to https://dittod.com/skills/record
     2. AuthGuard in /app/skills/layout.tsx runs
     3. Detects user not signed in
     4. Stores /skills/record in sessionStorage
     5. Redirects to /?auth=required
     6. Landing page shows blue auth prompt banner
     7. User clicks AuthButton and signs in
     8. Redirects back to /skills/record

     Scenario 3: OAuth Redirect

     1. User clicks Google/X OAuth button
     2. Redirected to OAuth provider
     3. Completes OAuth authentication
     4. Redirected back to same page (CDP SDK handles this)
     5. CDP auto-completes sign-in
     6. useEffect detects sign-in
     7. Redirects to /skills

     Files to Create

     1. /components/AuthGuard.tsx - Client-side auth protection wrapper
     2. /app/skills/layout.tsx - Skills routes protection
     3. /app/chat/layout.tsx - Chat route protection
     4. /middleware.ts - (Optional) Lightweight route matcher
     5. /components/StyledAuthButton.tsx - (Optional) Custom styled auth button

     Files to Modify

     1. /app/page.tsx:
       - Lines 1-10: Add imports (useIsSignedIn, AuthButton, useRouter, useSearchParams, 
     useState)
       - Lines 7-40: Add redirect logic and auth prompt banner
       - Lines 63-79: Replace Link with AuthButton (or StyledAuthButton)
     2. /app/globals.css (if using global CSS option):
       - Add AuthButton styling override

     Testing Checklist

     Public Access

     - Landing page (/) accessible without auth
     - Test pages accessible without auth

     Protected Routes

     - /skills requires auth
     - /skills/record requires auth
     - /skills/[skillId] requires auth
     - /chat requires auth

     Auth Flows

     - Email OTP authentication works
     - Google OAuth works
     - X (Twitter) OAuth works
     - After auth from landing → redirects to /skills
     - After auth from protected route → redirects to original destination

     Edge Cases

     - Already authenticated user visits / → auto-redirects to /skills
     - User signs out → redirects to /
     - Direct URL access shows auth prompt
     - OAuth callback preserves redirect destination

     Success Criteria

     - ✅ Only landing page accessible without authentication
     - ✅ All /skills/* and /chat routes protected
     - ✅ "Get Started for Free" triggers CDP authentication
     - ✅ After sign-in, redirects to /skills (or intended destination)
     - ✅ AuthButton styled to match landing page design
     - ✅ OAuth flow works seamlessly
     - ✅ Loading states shown during CDP initialization
     - ✅ Auth prompt banner appears when accessing protected routes

     Implementation Notes

     Why Client-Side Guards?

     CDP embedded wallets are client-side only - tokens stored in browser 
     (localStorage/cookies). Client-side guards using React hooks provide immediate access to
      auth state without server round-trips.

     Why Optional Middleware?

     Middleware cannot directly check CDP auth status (client-side tokens). We use it only 
     for route awareness. Real protection is enforced by AuthGuard component.

     Session Management

     - CDP sessions last 7 days
     - Access tokens refresh automatically
     - useIsSignedIn() hook provides real-time auth state
     - No manual token management needed

     Styling Strategy

     CDP AuthButton comes with default styling. We override it to match the landing page's 
     premium button design with gradients and shadows.

     Next Steps After Implementation

     1. Test all authentication flows thoroughly
     2. Add loading states for better UX
     3. Consider adding analytics for auth completion tracking
     4. Test on mobile devices
     5. Add session timeout warnings (optional, for 7-day limit)

     ---
     Implementation Order:
     1. Create AuthGuard component
     2. Create layout files for protected routes
     3. Update landing page with auth logic
     4. Style AuthButton
     5. Test all flows
     6. (Optional) Add middleware
