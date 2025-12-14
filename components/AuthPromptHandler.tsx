'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface AuthPromptHandlerProps {
  onShowPrompt: (show: boolean) => void;
}

export function AuthPromptHandler({ onShowPrompt }: AuthPromptHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('auth') === 'required') {
      onShowPrompt(true);
      const timeout = setTimeout(() => onShowPrompt(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, onShowPrompt]);

  return null; // This component doesn't render anything
}
