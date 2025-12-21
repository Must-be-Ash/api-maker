'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { SkillTester } from '@/components/SkillTester';
import { useEvmAddress, useCurrentUser } from '@coinbase/cdp-hooks';
import { useAccessToken } from '@/lib/hooks/use-access-token';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';
import { calculateTotalCost, DEFAULT_SESSION_MINUTES } from '@/lib/browserbase/pricing';
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
  Trash2,
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
  const { currentUser } = useCurrentUser();
  const accessToken = useAccessToken();

  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPrice, setEditedPrice] = useState('');
  const [editedGoal, setEditedGoal] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get EOA address for creator comparison (not Smart Wallet address)
  // Skills are created with EOA addresses, so we compare against that
  const eoaAddress = currentUser?.evmAccounts?.[0];

  // Check if current user is the creator of this skill
  const isCreator = skill?.creatorAddress &&
                     eoaAddress &&
                     skill.creatorAddress.toLowerCase() === eoaAddress.toLowerCase();

  // Debug logging for edit permissions
  useEffect(() => {
    if (skill) {
      console.log('[Skill Edit Debug]', {
        skillCreatorAddress: skill.creatorAddress,
        currentEOAAddress: eoaAddress,
        currentSmartWalletAddress: evmAddress,
        isCreator,
        creatorLower: skill.creatorAddress?.toLowerCase(),
        eoaLower: eoaAddress?.toLowerCase(),
        skillId: skill.skillId,
      });
    }
  }, [skill, eoaAddress, evmAddress, isCreator]);

  useEffect(() => {
    fetchSkill();
  }, [skillId]);

  // Format price with smart decimal display
  // Shows 2 decimals by default (e.g., 1.00, 0.01)
  // Shows 3 decimals only when third decimal is non-zero (e.g., 1.234, 0.205)
  const formatPrice = (price: number) => {
    const thirdDecimal = Math.round((price * 1000) % 10);
    return thirdDecimal !== 0 ? price.toFixed(3) : price.toFixed(2);
  };

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

  const startEditingName = () => {
    if (skill) {
      setEditedName(skill.name);
      setEditedGoal(skill.goal);
      setIsEditingName(true);
    }
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditedName('');
    setEditedGoal('');
  };

  const saveSkillName = async () => {
    if (!skill || !editedName.trim() || !editedGoal.trim()) return;

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
            goal: editedGoal.trim(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update skill');
      }

      // Update local state
      setSkill({ ...skill, name: editedName.trim(), goal: editedGoal.trim() });
      setIsEditingName(false);
      setEditedName('');
      setEditedGoal('');
    } catch (err) {
      console.error('Error updating skill:', err);
      alert(err instanceof Error ? err.message : 'Failed to update skill');
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
    if (isNaN(newPrice) || newPrice < 0.001) {
      alert('Please enter a valid price (minimum: $0.001)');
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
      );

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

  const deleteSkill = async () => {
    if (!skill || !accessToken) return;

    setIsDeleting(true);
    try {
      const response = await authenticatedFetch(
        `/api/skills/${skillId}`,
        accessToken,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete skill');
      }

      // Redirect to skills gallery after successful deletion
      window.location.href = '/skills';
    } catch (err) {
      console.error('Error deleting skill:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete skill');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
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
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <div className="text-center py-20 space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Skill Not Found</h2>
            <p className="text-sm sm:text-base text-slate-600 px-4">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!skill) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium break-all">
                <span className="hidden sm:inline">Skill ID: </span>
                <span className="sm:hidden">ID: </span>
                <span className="break-all">{skill.skillId}</span>
              </div>
              {skill.successfulRun ? (
                <div className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Validated
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                  <XCircle className="h-3 w-3" />
                  Needs Review
                </div>
              )}
            </div>
            {isCreator && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto justify-center"
                title="Delete skill"
              >
                <Trash2 className="h-4 w-4" />
                Delete Skill
              </button>
            )}
          </div>
          {isEditingName ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Skill name"
                  className="flex-1 text-2xl sm:text-4xl font-bold text-slate-900 bg-white border-2 border-blue-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={saveSkillName}
                    disabled={!editedName.trim() || !editedGoal.trim()}
                    className="flex-1 sm:flex-none p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                    title="Save"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={cancelEditingName}
                    className="flex-1 sm:flex-none p-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <textarea
                  value={editedGoal}
                  onChange={(e) => setEditedGoal(e.target.value)}
                  placeholder="e.g., Search Wikipedia for %query%"
                  className="w-full text-lg text-slate-900 bg-white border-2 border-blue-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  rows={2}
                />
                <p className="text-xs text-slate-500">
                  Use %variable% syntax for dynamic values (e.g., %query%, %product%, %city%)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 break-words flex-1">{skill.name}</h1>
                {isCreator && (
                  <button
                    onClick={startEditingName}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                    title="Edit skill"
                  >
                    <Pencil className="h-5 w-5 text-slate-600" />
                  </button>
                )}
              </div>
              <p className="text-base sm:text-lg text-slate-600 break-words">{skill.goal}</p>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Layers className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">Operations</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{skill.metrics.operations}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">Avg Duration</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {(skill.metrics.duration / 1000).toFixed(1)}s
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Zap className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">Tokens</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {skill.metrics.totalTokens.toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-2 group relative">
            <div className="flex items-center gap-2 text-slate-500">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">Price</span>
            </div>
            {isEditingPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-slate-900">$</span>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="flex-1 sm:w-20 text-lg sm:text-xl font-bold text-slate-900 bg-white border-2 border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                    ~${formatPrice(calculateTotalCost(skill.price, DEFAULT_SESSION_MINUTES).total)}
                  </div>
                  {isCreator && (
                    <button
                      onClick={startEditingPrice}
                      className="absolute top-4 right-4 sm:top-6 sm:right-6 p-1.5 hover:bg-slate-100 rounded transition-colors"
                      title="Edit price"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-500 break-words">
                  Skill: ${formatPrice(skill.price)} + Session: ~${formatPrice(calculateTotalCost(skill.price, DEFAULT_SESSION_MINUTES).sessionCost)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Endpoint */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">API Endpoint</h2>
          <div className="bg-slate-900 text-green-400 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm space-y-2 relative">
            <button
              onClick={copyEndpoint}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-slate-800 rounded-md transition-colors"
              title="Copy endpoint"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-slate-400 hover:text-slate-200" />
              )}
            </button>
            <div className="text-blue-400">POST</div>
            <div className="break-all pr-10 sm:pr-12">/api/skills/{skillId}/execute</div>
            <div className="text-slate-500 text-xs mt-3 break-words pr-10 sm:pr-12">
              Price: ~${formatPrice(calculateTotalCost(skill.price, DEFAULT_SESSION_MINUTES).total)} per execution (Skill: ${formatPrice(skill.price)} + Session: ~${formatPrice(calculateTotalCost(skill.price, DEFAULT_SESSION_MINUTES).sessionCost)})
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Recorded Workflow</h2>
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
                  className="border border-slate-200 rounded-lg p-3 sm:p-4 bg-slate-50 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        <Code className="h-3 w-3" />
                        {action.type}
                      </span>
                      <span className="text-sm font-medium text-slate-900 break-words">
                        {action.description}
                      </span>
                    </div>
                  </div>
                  {action.selector && (
                    <div className="text-xs text-slate-500 font-mono pl-0 sm:pl-9 break-all">
                      {action.selector}
                    </div>
                  )}
                  {action.value && (
                    <div className="text-xs text-slate-600 pl-0 sm:pl-9 break-words">
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Delete Skill</h3>
                <p className="text-sm text-slate-600">
                  Are you sure you want to delete <span className="font-semibold">{skill.name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={deleteSkill}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
