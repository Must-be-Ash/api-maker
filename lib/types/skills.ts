/**
 * Skills System Type Definitions
 *
 * This file contains all TypeScript interfaces for the browser automation
 * recording and replay system (Skills).
 */

/**
 * User demonstration capture - exact actions the user performed
 */
export interface RecordedAction {
  type: 'navigate' | 'click' | 'fill' | 'select' | 'hover' | 'extract';
  selector: string;             // Exact selector from user action
  description: string;          // Human-readable description
  value?: string;               // For fill/select actions
  url?: string;                 // For navigate actions
  timestamp: number;
}

/**
 * Stagehand-compatible workflow action
 * Stores both exact selectors (fast path) and natural language (fallback)
 */
export interface StagehandAction {
  method: 'act' | 'extract' | 'navigate' | 'observe';

  // Fast path (exact selector)
  selector?: string;

  // Fallback path (natural language)
  instruction: string;

  // Additional parameters
  value?: string;
  schema?: object;
  url?: string;
}

/**
 * Stagehand validation run history entry
 */
export interface HistoryEntry {
  method: "act" | "extract" | "observe" | "navigate";
  parameters: {
    instruction?: string;
    action?: {
      selector: string;
      method: string;
      description: string;
      arguments?: any[];
    };
    schema?: object;
    url?: string;
  };
  result: any;
  timestamp: string;
}

/**
 * Variable definition for skill parameterization
 */
export interface SkillVariable {
  name: string;
  description: string;
  type: string;
  required: boolean;
}

/**
 * Skill metrics from validation run
 */
export interface SkillMetrics {
  totalTokens: number;
  duration: number;
  operations: number;
}

/**
 * Main Skill document stored in MongoDB
 */
export interface Skill {
  skillId: string;              // "skill_abc123"
  name: string;                 // "Amazon Price Extractor"
  goal: string;                 // User's original goal
  startUrl?: string;            // Optional starting URL

  // HYBRID STORAGE - Both formats stored
  recordedActions: RecordedAction[];     // Exact user demonstration
  stagehandWorkflow: StagehandAction[];  // Converted to Stagehand
  history: HistoryEntry[];               // Validation run history

  // Schema for data extraction (if applicable)
  schema?: object;              // Zod schema as JSON

  // Parameterization
  variables?: SkillVariable[];

  // Replay configuration
  replayStrategy: "hybrid";     // Always hybrid for max reliability

  // Metadata
  successfulRun: boolean;
  metrics: SkillMetrics;

  // Recording metadata
  sessionId: string;            // Browserbase session ID
  recordingSessionUrl: string;  // Session replay URL

  // x402 configuration
  price: number;                // Price in USD (default: 0.01)

  createdAt: string;
  updatedAt: string;
}

/**
 * Skill execution result (for analytics)
 */
export interface SkillExecution {
  executionId: string;
  skillId: string;
  variables?: Record<string, any>;

  // Execution details
  strategy: "exact_replay" | "natural_language" | "ai_relearn";
  success: boolean;
  result?: any;
  error?: string;

  // Performance
  duration: number;
  tokensUsed: number;

  // Browserbase
  sessionId: string;
  sessionUrl: string;

  createdAt: string;
}

/**
 * Recording session (temporary storage during recording)
 */
export interface RecordingSession {
  recordingId: string;
  sessionId: string;
  liveViewUrl: string;

  goal: string;
  startUrl?: string;

  // Captured actions (updated in real-time)
  recordedActions: RecordedAction[];

  status: 'recording' | 'finished' | 'failed';

  createdAt: string;
  updatedAt: string;
}

/**
 * Action result from Stagehand act() method
 */
export interface ActResult {
  success: boolean;
  message: string;
  actionDescription: string;
  actions?: {
    selector: string;
    description: string;
    method: string;
    arguments: string[];
  }[];
}

/**
 * Input for starting a recording session
 */
export interface StartRecordingInput {
  goal: string;
  startUrl?: string;
}

/**
 * Output from starting a recording session
 */
export interface StartRecordingOutput {
  recordingId: string;
  sessionId: string;
  liveViewUrl: string;
  status: 'recording';
  message: string;
}

/**
 * Input for finishing a recording session
 */
export interface FinishRecordingInput {
  recordingId: string;
  sessionId: string;
}

/**
 * Output from finishing a recording session
 */
export interface FinishRecordingOutput {
  skillId: string;
  name: string;
  recordedActions: RecordedAction[];
  stagehandWorkflow: StagehandAction[];
  testResult: {
    success: boolean;
    error?: string;
  };
  metrics: SkillMetrics;
}

/**
 * Input for executing a skill
 */
export interface ExecuteSkillInput {
  skillId: string;
  variables?: Record<string, any>;
}

/**
 * Output from executing a skill
 */
export interface ExecuteSkillOutput {
  success: boolean;
  data: any;
  strategy: "exact_replay" | "natural_language" | "ai_relearn";
  executionTime: number;
  tokensUsed: number;
  sessionId: string;
  sessionUrl: string;
}
