import { streamText, tool, stepCountIs, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

/**
 * Chat API with Vercel AI SDK
 *
 * Supports streaming responses with tool calling for dynamic skill execution
 * Tools:
 * - listSkills: Returns all available browser automation skills
 * - executeSkill: Triggers skill execution with x402 payment (client-side)
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    console.log('[POST /api/chat] Request body:', body.substring(0, 200));

    if (!body) {
      console.error('[POST /api/chat] Empty request body');
      return new Response(
        JSON.stringify({ error: 'Empty request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = JSON.parse(body);

    console.log('[POST /api/chat] Received messages:', JSON.stringify(messages, null, 2));

    // Tool 1: List available skills
    const listSkillsTool = tool({
      description: 'List all available browser automation skills with their details, goals, and required variables',
      inputSchema: z.object({}),
      execute: async () => {
        console.log('[listSkills] Tool called');
        // Fetch skills from our new GET endpoint
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/skills`, {
          cache: 'no-store', // Always get fresh data
        });

        if (!response.ok) {
          return { error: 'Failed to fetch skills' };
        }

        const { skills } = await response.json();

        return {
          skills: skills.map((skill: any) => ({
            skillId: skill.skillId,
            name: skill.name,
            goal: skill.goal,
            price: skill.price,
            variables: skill.variables || [],
            successfulRun: skill.successfulRun,
          })),
          count: skills.length,
        };
      },
    });

    // Tool 2: Execute skill (NO execute function - client-side only for x402 payment)
    const executeSkillTool = tool({
      description: 'Execute a browser automation skill. Call this IMMEDIATELY after getting the skill list to run the skill that matches the user\'s request. The skill will run with automatic payment from the user\'s wallet.',
      inputSchema: z.object({
        skillId: z.string().describe('The unique skill ID to execute (e.g., "skill_1765836699692_4ttbs6azo")'),
        variables: z.record(z.string(), z.any()).optional().describe('Variables required by the skill as a key-value object (e.g., {"query": "Nvidia stock price"} or {"topic": "Bob Dylan"})'),
      }),
      // NO execute function - this makes it a client-side tool that triggers onToolCall
    });

    console.log('[POST /api/chat] Starting streamText with converted messages');

    // Stream response with tool calling
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: convertToModelMessages(messages),
      onStepFinish: ({ stepType, toolCalls, toolResults, text }) => {
        console.log('[streamText] Step finished:', {
          stepType,
          toolCallsCount: toolCalls?.length || 0,
          toolCalls: toolCalls?.map(tc => ({ name: tc.toolName, args: tc.args })),
          toolResultsCount: toolResults?.length || 0,
          hasText: !!text,
        });
      },
      system: `You are a helpful AI assistant with access to browser automation skills that can search the web, extract information from websites, and perform automated tasks.

IMPORTANT WORKFLOW:
1. When a user asks a question, FIRST call the listSkills tool to see what skills are available
2. Analyze the user's request and match it to the most appropriate skill based on:
   - The skill's goal/description
   - The required variables
   - The skill's success rate (successfulRun: true is better)
3. Extract the required variables from the user's query
4. Call executeSkill with the skillId and extracted variables
5. The system will automatically handle payment ($0.01-$2 USDC on Base) and execution
6. Once you receive the execution result, format it in a clear, user-friendly way

SKILL SELECTION TIPS:
- Match user intent to skill goal (e.g., "google search" skill for web searches, "wikipedia" skill for encyclopedia info)
- Extract variables carefully - they should match what the skill expects
- If a skill requires a "query" variable, extract the main search term from the user's question
- If a skill requires "topic", extract the subject they want to learn about

RESPONSE FORMATTING:
- Present information clearly and conversationally
- Highlight key data points (prices, dates, names)
- Use markdown formatting when helpful
- If execution succeeds, explain what information was found
- If execution fails, explain what went wrong and suggest alternatives

ALWAYS be conversational and explain what you're doing at each step.`,
      tools: {
        listSkills: listSkillsTool,
        executeSkill: executeSkillTool,
      },
      stopWhen: stepCountIs(10), // Allow multi-step reasoning (list → select → execute → format)
    });

    console.log('[POST /api/chat] Streaming response started');

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (error) {
    console.error('[POST /api/chat] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
