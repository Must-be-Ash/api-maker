'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, MessageCircle } from 'lucide-react';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { WalletDropdown } from './WalletDropdown';

export function Header() {
  const { isSignedIn } = useIsSignedIn();
  const pathname = usePathname();
  const isSkillsPage = pathname === '/skills';
  const isChatPage = pathname === '/chat';

  return (
    <header className="relative py-3 sm:py-4 px-4 sm:px-6 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 group">
          <Image
            src="/logo.png"
            alt="Dittod"
            width={30}
            height={30}
            className="object-contain"
          />
          <span
            className="hidden md:inline text-lg font-semibold text-slate-900 group-hover:text-slate-600 transition-colors"
            style={{ fontFamily: 'var(--font-caprasimo)' }}
          >
            Dittod
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {!isSkillsPage && (
            <Link
              href="/skills"
              className="inline-flex items-center gap-2 px-4 py-2 h-9 bg-white text-slate-900 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all shadow-sm shadow-black/5 border border-slate-200"
            >
              <Search className="h-4 w-4" />
              <span>Skills</span>
            </Link>
          )}
          {!isChatPage && (
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 h-9 bg-white text-slate-900 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all shadow-sm shadow-black/5 border border-slate-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </Link>
          )}

          {/* Auth / Wallet */}
          {isSignedIn ? (
            <WalletDropdown />
          ) : (
            <AuthButton />
          )}
        </nav>
      </div>
    </header>
  );
}


