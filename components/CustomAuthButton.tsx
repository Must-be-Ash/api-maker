'use client';

import { useRef } from 'react';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';

export function CustomAuthButton() {
  const authButtonRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    // Find and click the actual CDP AuthButton
    const button = authButtonRef.current?.querySelector('button');
    if (button) {
      button.click();
    }
  };

  return (
    <>
      {/* Hidden CDP AuthButton */}
      <div ref={authButtonRef} className="hidden">
        <AuthButton />
      </div>

      {/* Custom styled button */}
      <button
        onClick={handleClick}
        className="relative inline-flex items-center justify-center px-8 py-4 rounded-full font-medium text-white transition-all duration-200 border-0 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(0,0,0,0.3)] active:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_3px_6px_rgba(0,0,0,0.4)] hover:scale-[0.98] active:scale-[0.96]"
        style={{
          background: 'linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)'
        }}
      >
        <span className="relative">Get Started for Free</span>

        {/* Subtle inner highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-60 pointer-events-none" />

        {/* Bottom shadow accent */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-[90%] h-1 bg-black/20 rounded-full blur-sm" />
      </button>
    </>
  );
}
