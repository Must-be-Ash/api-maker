'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { SkillTester } from '@/components/SkillTester';
import { useEvmAddress } from '@coinbase/cdp-hooks';
import { useAccessToken } from '@/lib/hooks/use-access-token';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';
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
  Copy,
  Check,
  Pencil,
  X,
  DollarSign,
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
  creatorAddress?: string | null;
}

export default function SkillDetailsPage() {
  const params = useParams();
  const skillId = params.skillId as string;
  const { evmAddress } = useEvmAddress();
  const accessToken = useAccessToken();

  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPrice, setEditedPrice] = useState('');

  // Check if current user is the creator of this skill
  const isCreator = skill?.creatorAddress &&
                     evmAddress &&
                     skill.creatorAddress.toLowerCase() === evmAddress.toLowerCase();

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

  const copyEndpoint = async () => {
    const endpoint = `/api/skills/${skillId}/execute`;
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateCurlCommand = () => {
    if (!skill) return '';

    // Extract variable names from variableMapping
    const variables: Record<string, string> = {};
    if (skill.variableMapping && Object.keys(skill.variableMapping).length > 0) {
      // variableMapping is like { "San Francisco": "%city%" }
      // We need to extract "city" and provide example values
      Object.entries(skill.variableMapping).forEach(([exampleValue, placeholder]) => {
        // Extract variable name from placeholder (e.g., "%city%" -> "city")
        const varName = placeholder.replace(/%/g, '');
        variables[varName] = exampleValue;
      });
    }

    const curlCommand = `curl -X POST http://localhost:3000/api/skills/${skillId}/execute \\
  -H "Content-Type: application/json" \\
  -d '{
    "variables": ${JSON.stringify(variables, null, 6).replace(/\n/g, '\n    ')}
  }'`;

    return curlCommand;
  };

  const copyCurlCommand = async () => {
    const curlCommand = generateCurlCommand();
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const startEditingName = () => {
    if (skill) {
      setEditedName(skill.name);
      setIsEditingName(true);
    }
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const saveSkillName = async () => {
    if (!skill || !editedName.trim()) return;

    if (!accessToken) {
      alert('Please sign in to edit skills');
      return;
    }

    try {
      const response = await authenticatedFetch(
        `/api/skills/${skillId}`,
        accessToken,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editedName.trim(),
            // REMOVED: requestorAddress (server-verified now!)
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update skill name');
      }

      // Update local state
      setSkill({ ...skill, name: editedName.trim() });
      setIsEditingName(false);
      setEditedName('');
    } catch (err) {
      console.error('Error updating skill name:', err);
      alert(err instanceof Error ? err.message : 'Failed to update skill name');
    }
  };

  const startEditingPrice = () => {
    if (skill) {
      setEditedPrice(skill.price.toString());
      setIsEditingPrice(true);
    }
  };

  const cancelEditingPrice = () => {
    setIsEditingPrice(false);
    setEditedPrice('');
  };

  const saveSkillPrice = async () => {
    if (!skill) return;

    const newPrice = parseFloat(editedPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Please enter a valid price');
      return;
    }

    if (!accessToken) {
      alert('Please sign in to edit skills');
      return;
    }

    try {
      const response = await authenticatedFetch(
        `/api/skills/${skillId}`,
        accessToken,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price: newPrice,
            // REMOVED: requestorAddress (server-verified now!)
          }),
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update skill price');
      }

      // Update local state
      setSkill({ ...skill, price: newPrice });
      setIsEditingPrice(false);
      setEditedPrice('');
    } catch (err) {
      console.error('Error updating skill price:', err);
      alert(err instanceof Error ? err.message : 'Failed to update skill price');
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
          {isEditingName ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 text-4xl font-bold text-slate-900 bg-white border-2 border-blue-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveSkillName();
                  if (e.key === 'Escape') cancelEditingName();
                }}
              />
              <button
                onClick={saveSkillName}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Save"
              >
                <Check className="h-5 w-5" />
              </button>
              <button
                onClick={cancelEditingName}
                className="p-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                title="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-slate-900">{skill.name}</h1>
              {isCreator && (
                <button
                  onClick={startEditingName}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Edit name"
                >
                  <Pencil className="h-5 w-5 text-slate-600" />
                </button>
              )}
            </div>
          )}
          <p className="text-lg text-slate-600">{skill.goal}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4">
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2 group relative">
            <div className="flex items-center gap-2 text-slate-500">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Price</span>
            </div>
            {isEditingPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="w-20 text-xl font-bold text-slate-900 bg-white border-2 border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveSkillPrice();
                    if (e.key === 'Escape') cancelEditingPrice();
                  }}
                />
                <button
                  onClick={saveSkillPrice}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  title="Save"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={cancelEditingPrice}
                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-slate-900">
                  ${skill.price.toFixed(2)}
                </div>
                {isCreator && (
                  <button
                    onClick={startEditingPrice}
                    className="absolute top-6 right-6 p-1.5 hover:bg-slate-100 rounded transition-colors"
                    title="Edit price"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* API Endpoint */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">API Endpoint</h2>
          <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm space-y-2 relative">
            <button
              onClick={copyEndpoint}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-md transition-colors"
              title="Copy endpoint"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-slate-400 hover:text-slate-200" />
              )}
            </button>
            <div className="text-blue-400">POST</div>
            <div>/api/skills/{skillId}/execute</div>
            <div className="text-slate-500 text-xs mt-3">
              Price: ${skill.price.toFixed(2)} per execution
            </div>
          </div>
        </div>

        {/* cURL Command Example */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">cURL Command Example</h2>
          <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm relative">
            <button
              onClick={copyCurlCommand}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-md transition-colors"
              title="Copy cURL command"
            >
              {copiedCurl ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-slate-400 hover:text-slate-200" />
              )}
            </button>
            <pre className="whitespace-pre-wrap break-all pr-12">
              {generateCurlCommand()}
            </pre>
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
        {/* <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
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
        </div> */}

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
