import { startRecordingStep } from './steps/start-recording-step';
import type { StartRecordingInput, StartRecordingOutput } from "@/lib/types/skills";

/**
 * Start Recording Workflow
 *
 * Thin orchestrator that delegates to the step function.
 */
export async function startRecording(input: StartRecordingInput): Promise<StartRecordingOutput> {
  "use workflow";

  // Delegate all logic to the step function
  const result = await startRecordingStep(input);

  return result;
}
