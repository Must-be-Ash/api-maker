'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Send, Bot, User } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Chat Assistant</h1>
          <p className="text-lg text-slate-600">
            Ask me about flight prices and I'll help you find the information you need
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
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
                    I can help you find flight prices and travel information. Try asking:
                  </p>
                </div>
                <div className="flex flex-col gap-3 mt-4 w-full max-w-md">
                  <button
                    onClick={() => setInput("How much is the cheapest round trip flight from Vancouver to LAX from December 6th to 14th?")}
                    className="text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 transition-all"
                  >
                    "How much is the cheapest round trip flight from Vancouver to LAX from December 6th to 14th?"
                  </button>
                  <button
                    onClick={() => setInput("Find me round trip flights from Toronto to Miami departing December 10th, returning December 20th")}
                    className="text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 transition-all"
                  >
                    "Find me round trip flights from Toronto to Miami departing December 10th, returning December 20th"
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mt-1">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
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
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about flight prices..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
            <p className="mt-2 text-xs text-center text-slate-500">
              Powered by AI Skills System • Using recorded browser automation
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
