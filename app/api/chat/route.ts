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

    // Load skills from database ONCE at the start
    let cachedSkills: any[] = [];
    try {
      const { connectDB } = await import('@/lib/mongodb');
      const db = await connectDB();
      const skillsFromDb = await db.collection('skills')
        .find({})
        .project({
          skillId: 1,
          name: 1,
          goal: 1,
          price: 1,
          variables: 1,
          successfulRun: 1,
          _id: 0
        })
        .sort({ createdAt: -1 })
        .toArray();

      cachedSkills = skillsFromDb.map((skill: any) => ({
        skillId: skill.skillId,
        name: skill.name,
        goal: skill.goal,
        price: skill.price,
        variables: skill.variables || [],
        successfulRun: skill.successfulRun,
      }));

      console.log('[POST /api/chat] Loaded skills from database:', cachedSkills.length);
    } catch (error) {
      console.error('[POST /api/chat] Failed to load skills:', error);
    }

    // Tool 1: List available skills (returns cached skills)
    const listSkillsTool = tool({
      description: 'List all available browser automation skills with their details, goals, and required variables',
      inputSchema: z.object({}),
      execute: async () => {
        console.log('[listSkills] Tool called');
        const result = {
          skills: cachedSkills,
          count: cachedSkills.length,
        };
        console.log('[listSkills] Returning result:', JSON.stringify(result, null, 2));
        return result;
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
      onStepFinish: ({ toolCalls, toolResults, text }) => {
        console.log('[streamText] Step finished:', {
          toolCallsCount: toolCalls?.length || 0,
          toolCalls: toolCalls?.map(tc => ({
            name: tc.toolName,
            args: 'args' in tc ? tc.args : undefined
          })),
          toolResultsCount: toolResults?.length || 0,
          hasText: !!text,
          textPreview: text ? text.substring(0, 200) : null,
        });
      },
      system: `You are an AI assistant that MUST use browser automation skills to answer user questions. You do NOT have knowledge about current information - you MUST execute skills to get real-time data.

CRITICAL RULES:
1. NEVER answer from your training data - you do NOT have current information
2. You MUST ALWAYS call executeSkill to get real-time data
3. DO NOT respond with text until you have executed a skill and received results

REQUIRED WORKFLOW (NO EXCEPTIONS):
1. User asks a question → IMMEDIATELY call listSkills
2. Receive skills list → IMMEDIATELY call executeSkill with the matching skill
3. Receive skill results → THEN format and present the results to the user

SKILL MATCHING:
- "google search" skill: Use for web searches, stock prices, news, current events
- "wikipedia" skill: Use for encyclopedic information about people, places, topics
- Extract variables from user's question (e.g., "Bob Dylan" → {"topic": "Bob Dylan"})

Example flow:
User: "What's the price of Nvidia stock?"
1. [You call listSkills]
2. [You receive: "Google Search API" with variables: ["query"]]
3. [You call executeSkill with skillId="skill_xxx", variables={"query": "Nvidia stock price"}]
4. [You receive results with price data]
5. [You respond: "The current price of Nvidia stock is $XXX..."]

DO NOT SKIP STEP 3. You MUST call executeSkill before responding.`,
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
