'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useRef } from 'react';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';

interface MobileHeroProps {
  onPlayDemo: () => void;
}

export function MobileHero({ onPlayDemo }: MobileHeroProps) {
  const authButtonRef = useRef<HTMLDivElement>(null);

  const handleAuthClick = () => {
    sessionStorage.setItem('shouldRedirectAfterAuth', 'true');
    const button = authButtonRef.current?.querySelector('button');
    if (button) {
      button.click();
    }
  };

  return (
    <section className="pt-8 pb-12 px-5 relative z-0">
      {/* Hidden CDP AuthButton */}
      <div ref={authButtonRef} className="hidden">
        <AuthButton />
      </div>

      {/* Navigation - centered */}
      <nav className="mb-12 flex justify-center">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Dittod"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="text-2xl font-bold text-black tracking-tight">Dittod</span>
        </div>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Headline */}
        <h1 className="text-4xl font-bold text-black mb-6 leading-tight tracking-tight">
          Turn any browser <br /> session into an API
        </h1>

        {/* Description */}
        <p className="text-base text-gray-600 mb-14 leading-relaxed px-4">
          Describe what you want, demonstrate it once in a live browser, and we'll generate a reusable API. Think of it as showing AI how to do something without coding.
        </p>

        {/* Buttons - mobile sized, centered */}
        <div className="flex flex-col items-center gap-4 relative z-0">
          {/* Primary CTA */}
          <button
            onClick={handleAuthClick}
            className="relative z-0 inline-flex items-center justify-center px-10 py-4 rounded-full font-medium text-white text-base transition-all duration-200 border-0 cursor-pointer shadow-[0_6px_24px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] active:shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(0,0,0,0.3)] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)'
            }}
          >
            <span className="relative z-0">Get Started for Free</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-60 pointer-events-none" />
          </button>
          
          {/* Secondary CTA */}
          <button
            onClick={onPlayDemo}
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-medium text-[#333333] text-base transition-all duration-200 border border-slate-200 bg-white shadow-sm active:bg-slate-50 active:scale-[0.98]"
          >
            <Play className="w-5 h-5 fill-[#333333]" />
            <span>Play Demo</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}

