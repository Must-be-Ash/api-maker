'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Video, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { useEvmAddress } from '@coinbase/cdp-hooks';
import { useAccessToken } from '@/lib/hooks/use-access-token';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';

export default function RecordSkillPage() {
  const router = useRouter();
  const { evmAddress } = useEvmAddress();
  const accessToken = useAccessToken();
  const [step, setStep] = useState<'describe' | 'recording' | 'validating' | 'review'>('describe');
  const [goal, setGoal] = useState('');
  const [startUrl, setStartUrl] = useState('');
  const [recordingData, setRecordingData] = useState<any>(null);
  const [finishedSkill, setFinishedSkill] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartRecording = async () => {
    if (!goal.trim()) {
      setError('Please describe what you want to automate');
      return;
    }

    if (!startUrl.trim()) {
      setError('Please provide a starting URL');
      return;
    }

    if (!accessToken) {
      setError('Please sign in to create a skill');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        '/api/skills/start-recording',
        accessToken,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal: goal.trim(),
            startUrl: startUrl.trim(),
            // DON'T send creatorAddress - server will use verified address
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start recording');
      }

      const data = await response.json();
      setRecordingData(data);
      setStep('recording');

      // Open Live View in new window
      window.open(data.liveViewUrl, '_blank', 'width=1400,height=900');
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInferredGoal = () => {
    // User accepts the inferred goal, proceed to skill page
    if (finishedSkill) {
      router.push(`/skills/${finishedSkill.skillId}`);
    }
  };

  const handleEditManually = () => {
    // User wants to edit manually, redirect to skill page for editing
    // In the future, this could open an inline editor
    if (finishedSkill) {
      router.push(`/skills/${finishedSkill.skillId}`);
    }
  };

  const handleFinishRecording = async () => {
    if (!accessToken) {
      setError('Please sign in to finish recording');
      return;
    }

    setStep('validating');
    setError(null);

    try {
      const response = await authenticatedFetch(
        '/api/skills/finish-recording',
        accessToken,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recordingId: recordingData.recordingId,
            sessionId: recordingData.sessionId,
            // DON'T send creatorAddress - server will use verified address
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to finish recording');
      }

      const skill = await response.json();
      setFinishedSkill(skill);

      // If goal inference was performed, show review step
      if (skill.goalInference) {
        setStep('review');
      } else {
        // No inference, go directly to skill details page
        router.push(`/skills/${skill.skillId}`);
      }
    } catch (err) {
      console.error('Failed to finish recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to process recording. Please try again.');
      setStep('recording');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Step 1: Describe */}
        {step === 'describe' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Record Skill
              </div>
              <h1 className="text-4xl font-bold text-slate-900">
                Create a New Skill
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Describe what you want to automate, then demonstrate it visually.
                We'll capture your actions and turn them into a reusable API.
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  What would you like to automate? *
                </label>
                <textarea
                  className="w-full border border-slate-300 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  placeholder="e.g., Go to Amazon, search for gaming laptops, and extract the top 5 product prices"
                  value={goal}
                  onChange={(e) => {
                    setGoal(e.target.value);
                    setError(null);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Starting URL *
                </label>
                <input
                  type="url"
                  className="w-full border border-slate-300 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://amazon.com"
                  value={startUrl}
                  onChange={(e) => {
                    setStartUrl(e.target.value);
                    setError(null);
                  }}
                />
                <p className="text-sm text-slate-500 mt-2">
                  The browser will start here. You can navigate anywhere during recording.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleStartRecording}
                disabled={!goal.trim() || !startUrl.trim() || loading}
                className="w-full bg-blue-600 text-white rounded-xl p-4 font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Starting Recording...
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5" />
                    Start Recording
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Recording */}
        {step === 'recording' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium animate-pulse">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                Recording in Progress
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Demonstrate Your Task
              </h2>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 space-y-6">
              <div className="flex items-start gap-6">
                <div className="text-5xl">📹</div>
                <div className="flex-1 space-y-4">
                  <h3 className="font-bold text-xl text-slate-900">
                    Recording Mode Active
                  </h3>
                  <p className="text-slate-700">
                    A browser window has opened. Perform your task step-by-step:
                  </p>
                  <ol className="list-decimal list-inside space-y-3 text-slate-700">
                    <li>Navigate to the website you want to automate</li>
                    <li>Click buttons, fill forms, and extract data as you normally would</li>
                    <li>We're capturing every action you take</li>
                    <li>When done, come back here and click "Finish Recording"</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="text-sm font-medium text-slate-600">Live View URL:</div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={recordingData.liveViewUrl}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm font-mono"
                />
                <button
                  onClick={() => window.open(recordingData.liveViewUrl, '_blank', 'width=1400,height=900')}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Re-open
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleFinishRecording}
                className="flex-1 bg-green-600 text-white rounded-xl p-4 font-semibold text-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Finish Recording
              </button>
              <button
                onClick={() => {
                  setStep('describe');
                  setRecordingData(null);
                }}
                className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all"
              >
                Cancel
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="text-sm text-slate-700">
                  <strong>Tip:</strong> Don't worry about making mistakes! You can test and refine
                  your skill after creation. The system will validate your recording and show you
                  what was captured.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Validating */}
        {step === 'validating' && (
          <div className="text-center py-20 space-y-8">
            <div className="relative">
              <Loader2 className="h-20 w-20 text-blue-600 animate-spin mx-auto" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-slate-900">
                Processing Your Recording...
              </h2>
              <p className="text-lg text-slate-600 max-w-md mx-auto">
                We're validating your workflow and creating your skill. This may take a moment.
              </p>
            </div>
            <div className="max-w-md mx-auto bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* Step 4: Review Inferred Goal */}
        {step === 'review' && finishedSkill && finishedSkill.goalInference && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Goal Enhanced by AI
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Review Your Skill Goal
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                We analyzed your intent and demo to create a structured, reusable goal.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {/* Original Goal */}
              <div className="pb-6 border-b border-slate-200">
                <div className="text-sm font-semibold text-slate-500 mb-2">
                  Your Input
                </div>
                <div className="text-slate-700 bg-slate-50 rounded-lg p-4 font-mono text-sm">
                  "{finishedSkill.originalGoal}"
                </div>
              </div>

              {/* Inferred Goal */}
              <div className="pb-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-slate-900">
                    AI-Enhanced Goal
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Confidence: {Math.round(finishedSkill.goalInference.confidence * 100)}%
                  </div>
                </div>
                <div className="text-slate-900 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 font-mono text-sm">
                  "{finishedSkill.goalInference.structuredGoal}"
                </div>
              </div>

              {/* Variables Detected */}
              {finishedSkill.goalInference.variables && finishedSkill.goalInference.variables.length > 0 && (
                <div className="pb-6 border-b border-slate-200">
                  <div className="text-sm font-semibold text-slate-900 mb-3">
                    Variables Detected
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {finishedSkill.goalInference.variables.map((variable: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-mono font-medium border border-purple-200"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <div className="text-sm font-semibold text-slate-900 mb-3">
                  Category
                </div>
                <div className="inline-flex px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                  {finishedSkill.goalInference.category.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAcceptInferredGoal}
                className="flex-1 bg-blue-600 text-white rounded-xl p-4 font-semibold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Use This Goal
              </button>
              <button
                onClick={handleEditManually}
                className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all"
              >
                Edit Manually
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="text-sm text-slate-700">
                  <strong>Why use the enhanced goal?</strong> The AI-enhanced goal includes variable
                  placeholders (like <code className="px-1 bg-blue-100 rounded">%query%</code>) that make
                  your skill reusable with different inputs. This means you can execute the same skill
                  with different values without re-recording!
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
