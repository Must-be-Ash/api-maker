/**
 * Comprehensive Execution Results Schema
 *
 * This tracks EVERYTHING that happens during skill execution:
 * - API request details
 * - All strategy attempts (success/failure)
 * - Extracted data
 * - Validation results
 * - Session info for debugging
 */

export interface ExecutionResult {
  // Basic Identification
  _id?: string;
  executionId: string;  // Unique ID for this execution
  skillId: string;
  skillName: string;

  // Request Details
  request: {
    variables: Record<string, any>;
    timestamp: string;
    endpoint: string;
  };

  // Strategy Attempts
  strategyAttempts: StrategyAttempt[];

  // Final Result
  finalStrategy: 'exact_replay' | 'natural_language' | 'ai_relearn' | null;
  success: boolean;

  // Extracted Data
  extractedData: Record<string, any> | null;

  // Validation
  validation: {
    valid: boolean;
    errors: string[];
    timestamp: string;
  };

  // Performance
  performance: {
    totalExecutionTime: number;
    strategyTimes: Record<string, number>;
    tokensUsed: number;
  };

  // Debugging
  session: {
    sessionId: string;
    sessionUrl: string;
    debugUrl: string;
  };

  // Stagehand Action History
  stagehandHistory?: StagehandHistoryEntry[];
  actionCounts?: {
    act: number;
    extract: number;
    observe: number;
    navigate: number;
    agent: number;
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface StagehandHistoryEntry {
  method: 'act' | 'extract' | 'observe' | 'navigate' | 'agent';
  parameters: any;  // Input parameters to the method
  result: any;      // Output/result from the method
  timestamp: string; // ISO 8601 timestamp
}

export interface StrategyAttempt {
  strategy: 'exact_replay' | 'natural_language' | 'ai_relearn';
  attempted: boolean;
  success: boolean;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  executionTime: number;
  details?: {
    actionsAttempted?: number;
    actionsCompleted?: number;
    failedAction?: string;
    failedSelector?: string;
    agentIterations?: number;
    extractionAttempted?: boolean;
  };
}

export interface ActionResult {
  actionIndex: number;
  type: string;
  description: string;
  success: boolean;
  executionTime: number;
  selector?: string;
  selectorUsed?: string;  // If fallback was used
  error?: string;
  screenshot?: string;  // Base64 or URL to screenshot
}
