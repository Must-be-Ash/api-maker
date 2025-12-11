/**
 * Execution Result Tracker
 *
 * Comprehensive tracking of skill execution for debugging and analytics
 */

import type { ExecutionResult, StrategyAttempt } from '@/lib/types/execution-results';
import { connectDB } from '@/lib/mongodb';

export class ExecutionResultTracker {
  private result: ExecutionResult;
  private strategyStartTime: number = 0;

  constructor(
    skillId: string,
    skillName: string,
    variables: Record<string, any>,
    endpoint: string
  ) {
    this.result = {
      executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      skillId,
      skillName,
      request: {
        variables,
        timestamp: new Date().toISOString(),
        endpoint,
      },
      strategyAttempts: [],
      finalStrategy: null,
      success: false,
      extractedData: null,
      validation: {
        valid: false,
        errors: [],
        timestamp: '',
      },
      performance: {
        totalExecutionTime: 0,
        strategyTimes: {},
        tokensUsed: 0,
      },
      session: {
        sessionId: '',
        sessionUrl: '',
        debugUrl: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Start tracking a strategy attempt
   */
  startStrategy(strategy: 'exact_replay' | 'natural_language' | 'ai_relearn') {
    this.strategyStartTime = Date.now();
    console.log(`[ResultTracker] Starting ${strategy}`);
  }

  /**
   * Record strategy success
   */
  recordStrategySuccess(
    strategy: 'exact_replay' | 'natural_language' | 'ai_relearn',
    details?: any
  ) {
    const executionTime = Date.now() - this.strategyStartTime;

    const attempt: StrategyAttempt = {
      strategy,
      attempted: true,
      success: true,
      executionTime,
      details,
    };

    this.result.strategyAttempts.push(attempt);
    this.result.finalStrategy = strategy;
    this.result.performance.strategyTimes[strategy] = executionTime;

    console.log(`[ResultTracker] ✓ ${strategy} succeeded in ${executionTime}ms`);
  }

  /**
   * Record strategy failure
   */
  recordStrategyFailure(
    strategy: 'exact_replay' | 'natural_language' | 'ai_relearn',
    error: Error,
    details?: any
  ) {
    const executionTime = Date.now() - this.strategyStartTime;

    const attempt: StrategyAttempt = {
      strategy,
      attempted: true,
      success: false,
      error: {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
      executionTime,
      details,
    };

    this.result.strategyAttempts.push(attempt);
    this.result.performance.strategyTimes[strategy] = executionTime;

    console.log(`[ResultTracker] ✗ ${strategy} failed in ${executionTime}ms:`, error.message);
  }

  /**
   * Set extracted data
   */
  setExtractedData(data: Record<string, any> | null) {
    this.result.extractedData = data;
    console.log('[ResultTracker] Extracted data:', data);
  }

  /**
   * Set validation result
   */
  setValidation(valid: boolean, errors: string[] = []) {
    this.result.validation = {
      valid,
      errors,
      timestamp: new Date().toISOString(),
    };
    console.log('[ResultTracker] Validation:', { valid, errors });
  }

  /**
   * Set session information
   */
  setSession(sessionId: string, sessionUrl: string, debugUrl: string) {
    this.result.session = {
      sessionId,
      sessionUrl,
      debugUrl,
    };
  }

  /**
   * Set final success state
   */
  setSuccess(success: boolean) {
    this.result.success = success;
  }

  /**
   * Set token usage
   */
  setTokensUsed(tokens: number) {
    this.result.performance.tokensUsed = tokens;
  }

  /**
   * Set total execution time
   */
  setTotalExecutionTime(time: number) {
    this.result.performance.totalExecutionTime = time;
  }

  /**
   * Set Stagehand action history
   */
  setStagehandHistory(history: any[]) {
    this.result.stagehandHistory = history;

    // Calculate action counts
    const counts = {
      act: 0,
      extract: 0,
      observe: 0,
      navigate: 0,
      agent: 0,
    };

    history.forEach((entry) => {
      if (entry.method in counts) {
        counts[entry.method as keyof typeof counts]++;
      }
    });

    this.result.actionCounts = counts;

    console.log('[ResultTracker] Stagehand history captured:', {
      totalActions: history.length,
      counts,
    });
  }

  /**
   * Get the result object
   */
  getResult(): ExecutionResult {
    this.result.updatedAt = new Date().toISOString();
    return this.result;
  }

  /**
   * Save to MongoDB
   */
  async save() {
    try {
      const db = await connectDB();
      this.result.updatedAt = new Date().toISOString();

      await db.collection('execution_results').insertOne(this.result as any);

      console.log('[ResultTracker] Saved to MongoDB:', {
        executionId: this.result.executionId,
        success: this.result.success,
        strategy: this.result.finalStrategy,
        validationValid: this.result.validation.valid,
      });
    } catch (error) {
      console.error('[ResultTracker] Error saving to MongoDB:', error);
    }
  }

  /**
   * Log summary to console
   */
  logSummary() {
    console.log('\n========== EXECUTION SUMMARY ==========');
    console.log('Execution ID:', this.result.executionId);
    console.log('Skill:', this.result.skillName);
    console.log('Variables:', this.result.request.variables);
    console.log('\n--- Strategy Attempts ---');
    this.result.strategyAttempts.forEach((attempt, i) => {
      console.log(`${i + 1}. ${attempt.strategy}: ${attempt.success ? '✓ SUCCESS' : '✗ FAILED'} (${attempt.executionTime}ms)`);
      if (attempt.error) {
        console.log(`   Error: ${attempt.error.message}`);
      }
      if (attempt.details) {
        console.log(`   Details:`, attempt.details);
      }
    });

    console.log('\n--- Final Result ---');
    console.log('Success:', this.result.success);
    console.log('Final Strategy:', this.result.finalStrategy);
    console.log('Total Time:', this.result.performance.totalExecutionTime, 'ms');
    console.log('Tokens Used:', this.result.performance.tokensUsed);

    console.log('\n--- Extraction ---');
    console.log('Data Extracted:', this.result.extractedData ? 'YES' : 'NO');
    if (this.result.extractedData) {
      console.log('Extracted Fields:', Object.keys(this.result.extractedData).length);
      // Show non-empty fields
      const nonEmptyFields = Object.entries(this.result.extractedData)
        .filter(([_, value]) => value && value !== '')
        .map(([key]) => key);
      console.log('Non-empty Fields:', nonEmptyFields.length > 0 ? nonEmptyFields : 'NONE');
    }

    console.log('\n--- Validation ---');
    console.log('Valid:', this.result.validation.valid);
    if (this.result.validation.errors.length > 0) {
      console.log('Errors:', this.result.validation.errors);
    }

    console.log('\n--- Session ---');
    console.log('Session URL:', this.result.session.sessionUrl);
    console.log('Debug URL:', this.result.session.debugUrl);

    if (this.result.stagehandHistory && this.result.stagehandHistory.length > 0) {
      console.log('\n--- Stagehand Action History ---');
      console.log('Total Actions:', this.result.stagehandHistory.length);
      if (this.result.actionCounts) {
        console.log('Action Breakdown:');
        Object.entries(this.result.actionCounts).forEach(([method, count]) => {
          if (count > 0) {
            console.log(`  ${method}: ${count}`);
          }
        });
      }

      // Show first 5 and last 5 actions for overview
      console.log('\nFirst Actions:');
      this.result.stagehandHistory.slice(0, 5).forEach((entry, i) => {
        console.log(`  ${i + 1}. [${entry.method}] at ${new Date(entry.timestamp).toLocaleTimeString()}`);
        if (entry.parameters?.instruction) {
          console.log(`     → ${entry.parameters.instruction}`);
        }
      });

      if (this.result.stagehandHistory.length > 10) {
        console.log('  ...');
        console.log('\nLast Actions:');
        this.result.stagehandHistory.slice(-5).forEach((entry, i) => {
          const idx = this.result.stagehandHistory!.length - 5 + i;
          console.log(`  ${idx + 1}. [${entry.method}] at ${new Date(entry.timestamp).toLocaleTimeString()}`);
          if (entry.parameters?.instruction) {
            console.log(`     → ${entry.parameters.instruction}`);
          }
        });
      }
    }

    console.log('=======================================\n');
  }
}
