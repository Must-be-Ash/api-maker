import { finishRecordingStep } from './steps/finish-recording-step';
import type { FinishRecordingInput, FinishRecordingOutput } from "@/lib/types/skills";

/**
 * Finish Recording Workflow
 *
 * Thin orchestrator that delegates to the step function.
 */
export async function finishRecording(input: FinishRecordingInput): Promise<FinishRecordingOutput> {
  "use workflow";

  // Delegate all logic to the step function
  const result = await finishRecordingStep(input);

  return result;
}
