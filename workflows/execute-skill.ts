import { executeSkillStep } from './steps/execute-skill-step';
import type { ExecuteSkillInput, ExecuteSkillOutput } from "@/lib/types/skills";

/**
 * Execute Skill Workflow
 *
 * Thin orchestrator that delegates to the step function.
 */
export async function executeSkill(input: ExecuteSkillInput): Promise<ExecuteSkillOutput> {
  "use workflow";

  // Delegate all logic to the step function
  const result = await executeSkillStep(input);

  return result;
}
