'use client';

import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { Header } from '@/components/Header';
import { Bot, User, Send, CheckCircle2, XCircle, ExternalLink, Loader2, Wallet } from 'lucide-react';
import { useCurrentUser, useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react';
import { getCurrentUser, toViemAccount } from '@coinbase/cdp-core';
import { wrapFetchWithPayment, x402Client } from '@x402/fetch';
import { ExactEvmScheme, toClientEvmSigner } from '@x402/evm';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const { currentUser } = useCurrentUser();
  const { isSignedIn } = useIsSignedIn();
  const [executingSkill, setExecutingSkill] = useState<string | null>(null);
  const [input, setInput] = useState('');

  // Use Vercel AI SDK's useChat hook with streaming
  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),

    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

    async onToolCall({ toolCall }) {
      // Check for dynamic tools first (TypeScript requirement)
      if (toolCall.dynamic) {
        return;
      }

      console.log('[onToolCall] Received tool call:', toolCall);

      // Handle skill execution on client-side with x402 payment
      if (toolCall.toolName === 'executeSkill') {
        const { skillId, variables } = toolCall.input as { skillId: string; variables?: Record<string, any> };

        // Check wallet connection
        if (!isSignedIn || !currentUser) {
          addToolOutput({
            tool: 'executeSkill',
            toolCallId: toolCall.toolCallId,
            state: 'output-error',
            errorText: 'Please connect your wallet to execute skills',
          });
          return;
        }

        try {
          setExecutingSkill(skillId);
          console.log('[executeSkill] Executing skill:', skillId, 'with variables:', variables);

          // Get skill info for price
          const skillRes = await fetch(`/api/skills/${skillId}`);
          if (!skillRes.ok) {
            throw new Error('Failed to fetch skill info');
          }
          const skill = await skillRes.json();
          console.log('[executeSkill] Skill info:', skill);

          // Setup x402 payment wrapper (same as SkillTester)
          const user = await getCurrentUser();
          if (!user || !user.evmAccounts || user.evmAccounts.length === 0) {
            throw new Error('No wallet found. Please sign in again.');
          }

          const eoaAddress = user.evmAccounts[0];
          console.log('[executeSkill] Using EOA:', eoaAddress);

          const viemAccount = await toViemAccount(eoaAddress);

          const publicClient = createPublicClient({
            chain: base,
            transport: http('https://mainnet.base.org'),
          });

          // Calculate max payment amount in atomic units (6 decimals for USDC)
          const maxPaymentAmount = BigInt(Math.ceil(skill.price * 10 ** 6));
          console.log('[executeSkill] Max payment amount:', maxPaymentAmount.toString());

          // x402 v2 client; policy rejects requirements above the skill price
          const client = new x402Client()
            .register('eip155:8453', new ExactEvmScheme(toClientEvmSigner(viemAccount as any, publicClient)))
            .registerPolicy((_version, reqs) => reqs.filter((r) => BigInt(r.amount) <= maxPaymentAmount));
          const fetchFunc = wrapFetchWithPayment(fetch, client) as typeof fetch;

          // Execute skill with payment
          console.log('[executeSkill] Calling execute endpoint...');
          const response = await fetchFunc(`/api/skills/${skillId}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variables }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Skill execution failed');
          }

          const result = await response.json();
          console.log('[executeSkill] Execution result:', result);

          setExecutingSkill(null);

          // Use addToolOutput instead of returning
          addToolOutput({
            tool: 'executeSkill',
            toolCallId: toolCall.toolCallId,
            output: {
              success: result.success,
              extractedData: result.extractedData,
              data: result.data,
              strategy: result.strategy,
              executionTime: result.executionTime,
              tokensUsed: result.tokensUsed,
              sessionUrl: result.sessionUrl,
              payment: result.payment,
            },
          });
        } catch (error) {
          console.error('[executeSkill] Error:', error);
          setExecutingSkill(null);

          addToolOutput({
            tool: 'executeSkill',
            toolCallId: toolCall.toolCallId,
            state: 'output-error',
            errorText: error instanceof Error ? error.message : 'Skill execution failed',
          });
        }
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">


        {/* Wallet Connection Banner */}
        {!isSignedIn && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Wallet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-blue-900">
                  Connect Your Wallet to Use Skills
                </p>
                <p className="text-sm text-blue-700">
                  Skills require micropayments ($0.01-$2 USDC on Base). Connect your wallet to execute skills.
                </p>
              </div>
              <AuthButton />
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 340px)', minHeight: '600px' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-3 max-w-md">
                  <h2 className="text-xl font-semibold text-slate-900">Start a conversation</h2>
                  <p className="text-slate-600">
                    I can help you with web searches, Wikipedia lookups, and more. Try asking:
                  </p>
                </div>
                <div className="flex flex-col gap-3 mt-4 w-full max-w-md">
                  <button
                    onClick={() => setInput("What's the price of Nvidia stock?")}
                    className="text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 transition-all"
                  >
                    "What's the price of Nvidia stock?"
                  </button>
                  <button
                    onClick={() => setInput("Tell me about Bob Dylan")}
                    className="text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 transition-all"
                  >
                    "Tell me about Bob Dylan"
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg: UIMessage) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? '' : ''}`}>
                  {msg.parts.map((part, index) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <div
                            key={`${msg.id}-text-${index}`}
                            className={`rounded-2xl px-4 py-3 ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="my-1">{children}</p>,
                                  ul: ({ children }) => <ul className="my-2">{children}</ul>,
                                  ol: ({ children }) => <ol className="my-2">{children}</ol>,
                                }}
                              >
                                {part.text}
                              </ReactMarkdown>
                            </div>
                          </div>
                        );

                      case 'tool-executeSkill':
                        return (
                          <div key={`${msg.id}-tool-${index}`} className="text-sm">
                            {part.state === 'input-streaming' && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                                <span className="text-yellow-900 font-medium">
                                  Executing skill with payment...
                                </span>
                              </div>
                            )}

                            {part.state === 'output-available' && (() => {
                              const output = part.output as { payment?: { txHash?: string }; sessionUrl?: string } | undefined;
                              return (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-semibold text-green-900">
                                      Skill Executed Successfully
                                    </span>
                                  </div>
                                  <div className="pl-6 space-y-1">
                                    {output?.payment?.txHash && (
                                      <a
                                        href={`https://basescan.org/tx/${output.payment.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-green-700 hover:text-green-900 hover:underline flex items-center gap-1"
                                      >
                                        View transaction <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                    {output?.sessionUrl && (
                                      <a
                                        href={output.sessionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-green-700 hover:text-green-900 hover:underline flex items-center gap-1"
                                      >
                                        View session replay <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {part.state === 'output-error' && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  <span className="text-sm font-semibold text-red-900">
                                    Skill Execution Failed
                                  </span>
                                </div>
                                <p className="text-xs text-red-700 pl-6">
                                  {part.errorText || 'Unknown error'}
                                </p>
                              </div>
                            )}
                          </div>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mt-1">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {(status === 'submitted' || status === 'streaming') && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput('');
              }
            }}
            className="border-t border-slate-200 p-4 bg-slate-50"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={status !== 'ready'}
                className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
              />
              <button
                type="submit"
                disabled={status !== 'ready' || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {status === 'streaming' || status === 'submitted' ? 'Thinking...' : 'Send'}
              </button>
            </div>
            <p className="mt-2 text-xs text-center text-slate-500">
              Powered by AI Skills • Payments on Base mainnet
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
