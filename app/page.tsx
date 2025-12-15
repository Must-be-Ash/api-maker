'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CustomAuthButton } from '@/components/CustomAuthButton';
import { MobileHero } from '@/components/MobileHero';
import { Play, X } from 'lucide-react';
import { AuthPromptHandler } from '@/components/AuthPromptHandler';
import { TextShimmer } from '@/components/ui/text-shimmer';

export default function LandingPage() {
  const { isSignedIn } = useIsSignedIn();
  const router = useRouter();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Redirect authenticated users only after fresh login or protected route access
  useEffect(() => {
    if (isSignedIn) {
      // Check if we should redirect (set by auth button click or protected route)
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      const shouldRedirect = sessionStorage.getItem('shouldRedirectAfterAuth');

      if (redirectPath) {
        // User was trying to access a protected route
        sessionStorage.removeItem('redirectAfterAuth');
        sessionStorage.removeItem('shouldRedirectAfterAuth');
        router.push(redirectPath);
      } else if (shouldRedirect === 'true') {
        // User just logged in from landing page auth button
        sessionStorage.removeItem('shouldRedirectAfterAuth');
        router.push('/skills');
      }
      // If neither flag is set, user manually navigated here - let them stay
    }
  }, [isSignedIn, router]);


  return (
    <main className="min-h-screen bg-[#F8F8F9] relative overflow-x-hidden flex flex-col">
      {/* Handle auth query parameter */}
      <Suspense fallback={null}>
        <AuthPromptHandler onShowPrompt={setShowAuthPrompt} />
      </Suspense>

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

      <div className="flex-grow flex flex-col">
        {/* Mobile Hero - shown only on mobile */}
        <div className="lg:hidden">
          <MobileHero onPlayDemo={() => setShowVideo(true)} />
        </div>

        {/* Desktop Hero Section - hidden on mobile */}
        <section className="relative pt-6 pb-4 px-8 lg:px-12 hidden lg:block lg:max-h-[60vh]">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Hero Visual */}
            <motion.div
              className="relative w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative w-full aspect-[2.5/1]">
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
              className="absolute inset-y-0 left-0 flex flex-col justify-center text-left max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Navigation */}
              <nav className="mb-3">
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/logo.png"
                    alt="Dittod"
                    width={20}
                    height={20}
                    className="rounded-lg"
                  />
                  <span className="text-xl font-bold text-black tracking-tight">Dittod</span>
                </div>
              </nav>

              <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold text-black mb-3 leading-tight tracking-tight text-left">
                Turn any browser session <br className="hidden lg:block" /> into an API
              </h1>

              <p className="text-xs xl:text-sm text-gray-600 mb-12 leading-relaxed text-left">
                Describe what you want, demonstrate it once in a live browser, and we'll generate a reusable API you can call with different inputs. Think of it as showing Ai how to do something without coding.
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-2.5">
                <CustomAuthButton />
                <button
                  onClick={() => setShowVideo(true)}
                  className="relative inline-flex items-center justify-center gap-1.5 px-8 py-4 rounded-full font-medium text-[#333333] transition-all duration-200 border-0 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(0,0,0,0.1)] active:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_3px_6px_rgba(0,0,0,0.15)] hover:scale-[0.98] active:scale-[0.96]"
                  style={{
                    background: 'linear-gradient(145deg, #f5f5f5 0%, #e8e8e8 50%, #dedede 100%)'
                  }}
                >
                  <Play className="w-4 h-4 fill-[#333333]" />
                  <span className="relative">Play Demo</span>

                  {/* Subtle inner highlight */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/60 to-transparent opacity-80 pointer-events-none" />

                  {/* Bottom shadow accent */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-[90%] h-1 bg-black/10 rounded-full blur-sm" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 lg:py-4 lg:pt-12 lg:pb-4 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-3">
            {/* Feature 1: Teach by doing */}
            <motion.div
              className="bg-white rounded-2xl p-8 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Title row: title left, image right */}
              <div className="flex items-center justify-between gap-4 lg:gap-3 mb-4 lg:mb-4">
                <h3 className="text-2xl lg:text-lg font-bold text-black text-left">
                  Teach Once <br /> Reuse Forever
                </h3>
                <div className="w-28 h-28 lg:w-20 lg:h-20 relative flex-shrink-0">
                  <Image
                    src="/cursor.jpg"
                    alt="Cursor icon"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Body text below */}
              <p className="text-base lg:text-xs text-gray-600 leading-relaxed text-left flex-grow">
                Enter a goal like "Fill job applications". We spin up a virtual browser, and you simply click through the workflow once to demonstrate it.
              </p>
            </motion.div>

            {/* Feature 2: Self-healing automation */}
            <motion.div
              className="bg-white rounded-2xl p-8 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Title row: title left, image right */}
              <div className="flex items-center justify-between gap-4 lg:gap-3 mb-4 lg:mb-4">
                <h3 className="text-2xl lg:text-lg font-bold text-black text-left">
                  Dynamic Automation
                </h3>
                <div className="w-28 h-28 lg:w-20 lg:h-20 relative flex-shrink-0">
                  <Image
                    src="/layers.jpg"
                    alt="Layers icon"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Body text below */}
              <p className="text-base lg:text-xs text-gray-600 leading-relaxed text-left flex-grow">
                The API adapts. We use exact selectors, AI vision, and agentic re-learning to ensure APIs work even if the website changes its layout.
              </p>
            </motion.div>

            {/* Feature 3: Monetize your workflow */}
            <motion.div
              className="bg-white rounded-2xl p-8 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Title row: title left, image right */}
              <div className="flex items-center justify-between gap-4 lg:gap-3 mb-4 lg:mb-4">
                <h3 className="text-2xl lg:text-lg font-bold text-black text-left">
                  Monetize Endpoints
                </h3>
                <div className="w-28 h-28 lg:w-20 lg:h-20 relative flex-shrink-0">
                  <Image
                    src="/coin.jpg"
                    alt="USDC coin icon"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Body text below */}
              <p className="text-base lg:text-xs text-gray-600 leading-relaxed text-left flex-grow">
                Instantly monetize your API with x402. Charge users per API call by simply providing a wallet address and picking an amount to charge.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Video container */}
              <div className="relative w-full aspect-video bg-slate-900">
                <iframe
                  src="https://www.youtube.com/embed/g9g9qa-NV_A?si=1DE0zt9u-J-wN49g"
                  title="Dittod Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {/* Bottom bar */}
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">See Dittod in Action</h3>
                    <p className="text-sm text-slate-500">Watch how to create your first API</p>
                  </div>
                  <button
                    onClick={() => setShowVideo(false)}
                    className="relative inline-flex items-center justify-center px-6 py-3 rounded-full font-medium text-white transition-all duration-200 border-0 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(0,0,0,0.3)] active:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_3px_6px_rgba(0,0,0,0.4)] hover:scale-[0.98] active:scale-[0.96]"
                    style={{
                      background: 'linear-gradient(145deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)'
                    }}
                  >
                    <span className="relative z-10">Close</span>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-60 pointer-events-none" />
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-[90%] h-1 bg-black/20 rounded-full blur-sm" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-8 lg:py-3 px-6 lg:px-12 mt-auto">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <a
            href="https://github.com/Must-be-Ash/api-maker"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity cursor-pointer inline-block"
          >
            <TextShimmer
              className="text-xs font-bold [--base-color:#1e40af] [--base-gradient-color:#3b82f6]"
              duration={3}
              spread={1.5}
            >
              Fork this Application and Start Building
            </TextShimmer>
          </a>
        </div>
      </footer>
    </main>
  );
}
