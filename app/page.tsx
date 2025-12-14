'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomAuthButton } from '@/components/CustomAuthButton';

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
          <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Please sign in to continue</span>
          </div>
        </div>
      )}

      {/* Hero Section with Navigation */}
      <section className="relative pt-12 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero container - image spans full width, text overlays left side */}
          <div className="relative">
            {/* Hero Visual - full width */}
            <motion.div
              className="relative w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative w-full aspect-[16/9] lg:aspect-[2/1]">
                <Image
                  src="/landing-asset.jpg"
                  alt="Browser automation visual showing JSON, CSV extraction"
                  fill
                  className="object-contain object-right"
                  priority
                />
              </div>
            </motion.div>

            {/* Text Content - positioned over the left side of the image */}
            <motion.div
              className="absolute inset-y-0 left-0 flex flex-col justify-center text-left max-w-xl lg:max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Navigation */}
              <nav className="mb-8">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo.png"
                    alt="Dittod"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="text-3xl md:text-4xl font-bold text-black tracking-tight">Dittod</span>
                </div>
              </nav>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black mb-6 leading-tight tracking-tight text-left">
                Turn any browser session into an API
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed text-left">
                Describe what you want, demonstrate it once in a live browser, and we'll generate a reusable API you can call with different inputs. Think of it as showing Ai how to do something, there's no coding.
              </p>

              <div className="text-left">
                <CustomAuthButton />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1: Teach by doing */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Title row: title left, image right */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-2xl font-bold text-black text-left">
                  Teach Once <br /> Reuse Forever
                </h3>
                <div className="w-28 h-28 relative flex-shrink-0">
                  <Image
                    src="/cursor.jpg"
                    alt="Cursor icon"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Body text below */}
              <p className="text-base text-gray-600 leading-relaxed text-left">
                Enter a goal like "Fill job applications". We spin up a virtual browser, and you simply click through the workflow once to demonstrate it.
              </p>
            </motion.div>

            {/* Feature 2: Self-healing automation */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Title row: title left, image right */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-2xl font-bold text-black text-left">
                  Dynamic Automation
                </h3>
                <div className="w-28 h-28 relative flex-shrink-0">
                  <Image
                    src="/layers.jpg"
                    alt="Layers icon"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Body text below */}
              <p className="text-base text-gray-600 leading-relaxed text-left">
                The API adapts. We use exact selectors, AI vision, and agentic re-learning to ensure APIs work even if the website changes its layout.
              </p>
            </motion.div>

            {/* Feature 3: Monetize your workflow */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Title row: title left, image right */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-2xl font-bold text-black text-left">
                  Monetize Endpoints
                </h3>
                <div className="w-28 h-28 relative flex-shrink-0">
                  <Image
                    src="/coin.jpg"
                    alt="USDC coin icon"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Body text below */}
              <p className="text-base text-gray-600 leading-relaxed text-left">
                Instantly monetize your API with x402. Charge users per API call by simply providing a wallet address and picking an amount to charge.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <p className="text-sm text-gray-400">
            © 2025 Dittod. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link
              href="/docs"
              className="text-gray-500 hover:text-black transition-colors"
            >
              Documentation
            </Link>
            <span className="text-gray-300">|</span>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-black transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
