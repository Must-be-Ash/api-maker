'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { SkillTester } from '@/components/SkillTester';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  Zap,
  Layers,
  ChevronDown,
  ChevronUp,
  Code,
} from 'lucide-react';

interface Skill {
  skillId: string;
  name: string;
  goal: string;
  startUrl?: string;
  recordedActions: any[];
  stagehandWorkflow: any[];
  history: any[];
  replayStrategy: string;
  successfulRun: boolean;
  metrics: {
    totalTokens: number;
    duration: number;
    operations: number;
  };
  sessionId: string;
  recordingSessionUrl: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  variableMapping?: Record<string, string>;
}

export default function SkillDetailsPage() {
  const params = useParams();
  const skillId = params.skillId as string;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSkill();
  }, [skillId]);

  const fetchSkill = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/skills/${skillId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch skill');
      }

      const data = await response.json();
      setSkill(data);
    } catch (err) {
      console.error('Error fetching skill:', err);
      setError(err instanceof Error ? err.message : 'Failed to load skill');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (error && !skill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center py-20 space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900">Skill Not Found</h2>
            <p className="text-slate-600">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!skill) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              Skill ID: {skill.skillId}
            </div>
            {skill.successfulRun ? (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Validated
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                <XCircle className="h-3 w-3" />
                Needs Review
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-slate-900">{skill.name}</h1>
          <p className="text-lg text-slate-600">{skill.goal}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Layers className="h-4 w-4" />
              <span className="text-sm font-medium">Operations</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{skill.metrics.operations}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Avg Duration</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {(skill.metrics.duration / 1000).toFixed(1)}s
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Tokens</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {skill.metrics.totalTokens.toLocaleString()}
            </div>
          </div>
        </div>

        {/* API Endpoint */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">API Endpoint</h2>
          <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm space-y-2">
            <div className="text-blue-400">POST</div>
            <div>/api/skills/{skillId}/execute</div>
            <div className="text-slate-500 text-xs mt-3">
              Price: ${skill.price.toFixed(2)} per execution
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Recorded Workflow</h2>
            <button
              onClick={() => setShowWorkflow(!showWorkflow)}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showWorkflow ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show
                </>
              )}{' '}
              {skill.recordedActions.length} steps
            </button>
          </div>

          {showWorkflow && (
            <div className="space-y-3 pt-4">
              {skill.recordedActions.map((action: any, i: number) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        <Code className="h-3 w-3" />
                        {action.type}
                      </span>
                      <span className="text-sm font-medium text-slate-900">
                        {action.description}
                      </span>
                    </div>
                  </div>
                  {action.selector && (
                    <div className="text-xs text-slate-500 font-mono pl-9">
                      {action.selector}
                    </div>
                  )}
                  {action.value && (
                    <div className="text-xs text-slate-600 pl-9">
                      Value: <span className="font-medium">"{action.value}"</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recording Session */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-bold text-slate-900">Recording Session</h2>
          <a
            href={skill.recordingSessionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View Session Replay
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Test Section */}
        <SkillTester
          skillId={skill.skillId}
          goal={skill.goal}
          variableMapping={skill.variableMapping}
        />
      </main>
    </div>
  );
}
