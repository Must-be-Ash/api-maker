'use client';

import { useState, useEffect } from 'react';
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  Clock,
  Zap,
  Wallet,
} from 'lucide-react';
import { useCurrentUser, useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react';
import { getCurrentUser, toViemAccount } from '@coinbase/cdp-core';
import { wrapFetchWithPayment } from 'x402-fetch';
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';

interface SkillTesterProps {
  skillId: string;
  goal: string;
  variableMapping?: Record<string, string>;
  price?: number;
}

export function SkillTester({ skillId, goal, variableMapping, price = 0.01 }: SkillTesterProps) {
  // Format price with smart decimal display
  // Shows 2 decimals by default (e.g., 1.00, 0.01)
  // Shows 3 decimals only when third decimal is non-zero (e.g., 1.234, 0.205)
  const formatPrice = (price: number) => {
    const thirdDecimal = Math.round((price * 1000) % 10);
    return thirdDecimal !== 0 ? price.toFixed(3) : price.toFixed(2);
  };

  const [variables, setVariables] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // CDP embedded wallet hooks
  const { currentUser } = useCurrentUser();
  const { isSignedIn } = useIsSignedIn();

  // Get the EOA address (the one actually used for x402 payments)
  const eoaAddress = currentUser?.evmAccounts?.[0];

  // Extract variable names from goal
  const variableNames = extractVariables(goal);

  // Initialize variable values
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    variableNames.forEach((varName) => {
      initialValues[varName] = '';
    });
    setVariables(initialValues);
  }, [goal]);

  const handleTest = async () => {
    // Check if user is signed in
    if (!isSignedIn || !currentUser) {
      setError('Please sign in to test this skill');
      return;
    }

    // Validate all variables have values
    const emptyVars = variableNames.filter((name) => !variables[name]?.trim());
    if (emptyVars.length > 0) {
      setError(`Please provide values for: ${emptyVars.join(', ')}`);
      return;
    }

    setTesting(true);
    setResult(null);
    setError(null);
    setTxHash(null);

    try {
      console.log('[SkillTester] Setting up x402 payment wrapper');

      // Step 1: Get CDP user account (EOA)
      const user = await getCurrentUser();
      if (!user || !user.evmAccounts || user.evmAccounts.length === 0) {
        throw new Error('No wallet found. Please sign in again.');
      }

      // Use the EOA for x402 payment signing
      const eoaAddress = user.evmAccounts[0];
      console.log('[SkillTester] Using EOA:', eoaAddress);

      // Convert EOA to viem account for signing x402 payments
      const viemAccount = await toViemAccount(eoaAddress);
      console.log('[SkillTester] Viem account created:', viemAccount.address);

      // Step 2: Create viem wallet client for signing
      const walletClient = createWalletClient({
        account: viemAccount,
        chain: base,
        transport: http('https://mainnet.base.org'),
      }).extend(publicActions);
      console.log('[SkillTester] Created wallet client on Base network');

      // Step 3: Wrap fetch with x402 payment capability
      // Max payment amount in atomic units (USDC has 6 decimals)
      const maxPaymentAmount = BigInt(Math.ceil(price * 10 ** 6)); // Convert to 6 decimals
      const fetchFunc = wrapFetchWithPayment(
        fetch,
        walletClient as any,
        maxPaymentAmount
      ) as typeof fetch;
      console.log('[SkillTester] Wrapped fetch with payment capability, max amount:', maxPaymentAmount.toString());

      // Step 4: Make API call with payment wrapper
      const response = await fetchFunc(`/api/skills/${skillId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variables }),
      });

      console.log('[SkillTester] Response status:', response.status);

      // Handle 402 Payment Required
      if (response.status === 402) {
        console.warn('[SkillTester] Payment required (402), x402-fetch will handle automatically');
        // The x402-fetch wrapper will retry with payment
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute skill');
      }

      const data = await response.json();
      console.log('[SkillTester] Skill executed successfully');
      setResult(data);

      // Extract payment info from response
      if (data.payment?.txHash) {
        setTxHash(data.payment.txHash);
        console.log('[SkillTester] Payment settled with tx:', data.payment.txHash);
      }

    } catch (err) {
      console.error('[SkillTester] Execution failed:', err);

      let errorMessage = 'An unknown error occurred';
      if (err instanceof Error) {
        if (err.message.includes('402') || err.message.includes('Payment')) {
          errorMessage = `Payment failed. Please ensure you have sufficient USDC balance ($${formatPrice(price)}) on Base network.`;
        } else if (err.message.includes('rejected')) {
          errorMessage = 'Payment was rejected by your wallet';
        } else if (err.message.includes('Insufficient funds') || err.message.includes('insufficient_funds')) {
          errorMessage = 'Insufficient funds';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariables((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null); // Clear error when user types
  };

  const getSampleValue = (varName: string): string => {
    const samples: Record<string, string> = {
      query: "what's the price of nvidia stock?",
      topic: 'Bob Dylan',
      from: 'NYC',
      to: 'LAX',
      origin: 'New York',
      destination: 'Los Angeles',
      product: 'iPhone 15 Pro',
      city: 'San Francisco',
      date: '2025-01-15',
      start_date: '2025-12-20',
      end_date: '2025-12-27',
      departDate: '2025-12-19',
      departdate: '2025-12-19',
      returnDate: '2025-12-23',
      returndate: '2025-12-23',
      email: 'user@example.com',
      name: 'John Doe',
      company: 'Acme Inc',
    };

    return samples[varName.toLowerCase()] || '';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">Test This Skill</h2>
      </div>

      {/* Wallet Connection */}
      {!isSignedIn && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Wallet className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-blue-900">
                Wallet Connection Required
              </p>
              <p className="text-sm text-blue-700">
                Sign in with your Coinbase account to test this skill. Cost: ${formatPrice(price)} USDC on Base mainnet
              </p>
            </div>
          </div>
          <AuthButton />
        </div>
      )}


      {/* Variable Inputs */}
      {variableNames.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This skill uses {variableNames.length} variable
            {variableNames.length > 1 ? 's' : ''}. Provide values to test:
          </p>

          {variableNames.map((varName) => (
            <div key={varName} className="space-y-2">
              <label htmlFor={varName} className="block text-sm font-medium text-slate-700">
                {formatVariableName(varName)}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id={varName}
                  value={variables[varName] || ''}
                  onChange={(e) => handleVariableChange(varName, e.target.value)}
                  placeholder={
                    getSampleValue(varName) || `Enter ${formatVariableName(varName).toLowerCase()}`
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                  disabled={testing}
                />
                {getSampleValue(varName) && !variables[varName] && (
                  <button
                    onClick={() => handleVariableChange(varName, getSampleValue(varName))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    type="button"
                  >
                    Use example
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          This skill has no variables. Click test to run with default configuration.
        </p>
      )}

      {/* Error Message */}
      {error && !result && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={!isSignedIn || testing}
        className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
      >
        {testing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing payment & executing...
          </>
        ) : !isSignedIn ? (
          <>
            <Wallet className="h-5 w-5" />
            Sign In to Test
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            Test Skill (${formatPrice(price)} USDC)
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 space-y-4">
          {/* Result Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900">Execution Result</h3>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {result.success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Success
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Failed
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Payment Success */}
          {result.success && txHash && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Payment Successful</span>
              </div>
              <div className="pl-7 space-y-1">
                <p className="text-xs text-green-700">
                  <span className="font-medium">Transaction Hash:</span>
                </p>
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono text-green-700 hover:text-green-900 hover:underline"
                >
                  <span>{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <p className="text-xs text-green-600 mt-1">
                  ${formatPrice(price)} USDC paid on Base
                </p>
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Duration</span>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {result.executionTime ? `${(result.executionTime / 1000).toFixed(1)}s` : 'N/A'}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-500">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-medium">Tokens</span>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {result.tokensUsed?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-500">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-medium">Strategy</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {result.strategy ? result.strategy.replace(/_/g, ' ') : 'N/A'}
              </div>
            </div>
          </div>

          {/* Extracted Data */}
          {result.extractedData && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">Extracted Data:</div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                {typeof result.extractedData === 'object' ? (
                  Object.entries(result.extractedData).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {key}
                      </div>
                      <div className="text-sm text-slate-900 whitespace-pre-wrap">
                        {String(value)}
                      </div>
                    </div>
                  ))
                ) : (
                  <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap">
                    {JSON.stringify(result.extractedData, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Full Response (collapsible) */}
          {result.data && (
            <details className="space-y-2">
              <summary className="text-sm font-medium text-slate-700 cursor-pointer hover:text-slate-900">
                Full Response (click to expand)
              </summary>
              <pre className="bg-white border border-slate-200 rounded-lg p-4 overflow-x-auto text-xs text-slate-700 font-mono">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}

          {/* Error Message */}
          {result.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              <strong>Error:</strong> {result.error}
            </div>
          )}

          {/* Session Replay Link */}
          {result.sessionUrl && (
            <div className="pt-2 border-t border-slate-200">
              <a
                href={result.sessionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View Session Replay on Browserbase
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper: Extract variable names from goal string
function extractVariables(goal: string): string[] {
  const regex = /%([a-zA-Z0-9_]+)%/g;
  const matches = goal.matchAll(regex);
  const variables = Array.from(matches, (m) => m[1]);
  return [...new Set(variables)]; // Remove duplicates
}

// Helper: Format variable name for display
function formatVariableName(varName: string): string {
  // Convert camelCase or snake_case to Title Case
  return varName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (l) => l.toUpperCase()) // Capitalize first letter of each word
    .trim();
}
