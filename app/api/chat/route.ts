import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// IMPORTANT: Replace this with your actual skill ID after recording
const SKILL_ID = process.env.SKILL_ID || 'YOUR_SKILL_ID_HERE';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Chat API
 *
 * Accepts natural language queries and uses the skills system to find results
 * Automatically detects skill variables and parses queries accordingly
 */
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('[POST /api/chat] Received message:', message);

    // Step 1: Fetch the skill to understand what variables it needs
    const skillInfoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/skills/${SKILL_ID}`
    );

    if (!skillInfoResponse.ok) {
      return NextResponse.json({
        response: `Sorry, I couldn't find the skill. Please check that SKILL_ID is set correctly.`
      });
    }

    const skillInfo = await skillInfoResponse.json();
    console.log('[POST /api/chat] Skill info:', { goal: skillInfo.goal, variables: skillInfo.variables });

    // Extract variable names from the skill
    const variableNames = skillInfo.variables?.map((v: any) => v.name) || [];
    
    // If no variables defined, try to infer from goal (look for %variable% patterns)
    const goalVariables = (skillInfo.goal?.match(/%(\w+)%/g) || []).map((v: string) => v.replace(/%/g, ''));
    const allVariables = [...new Set([...variableNames, ...goalVariables])];
    
    console.log('[POST /api/chat] Detected variables:', allVariables);

    // Step 2: Use OpenAI to parse the natural language query based on skill variables
    const variableDescriptions = allVariables.length > 0 
      ? allVariables.map((v: string) => `- ${v}: (extract from query based on context)`).join('\n')
      : 'No specific variables - extract the main search query or intent';

    const parseResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a query parser for a browser automation skill. 

The skill's goal is: "${skillInfo.goal || 'Unknown'}"

Extract the following variables from the user's query:
${variableDescriptions}

Return a JSON object with the extracted variables. Use the exact variable names: ${allVariables.join(', ')}

If the query doesn't match the skill's purpose or you cannot extract the required information, return:
{ "error": "Could not understand the query. Please rephrase your question." }

Examples:
- If skill needs "query" variable and user asks "find Kendrick Lamar concerts" → { "query": "Kendrick Lamar" }
- If skill needs "origin" and "destination" and user asks "flights from NYC to LAX" → { "origin": "NYC", "destination": "LAX" }

Today's date is: ${new Date().toISOString().split('T')[0]}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const parsedQuery = JSON.parse(parseResponse.choices[0].message.content || '{}');
    console.log('[POST /api/chat] Parsed query:', parsedQuery);

    if (parsedQuery.error) {
      return NextResponse.json({
        response: parsedQuery.error
      });
    }

    // Step 3: Call the skill execution API
    console.log('[POST /api/chat] Executing skill:', SKILL_ID);

    const skillResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/skills/${SKILL_ID}/execute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variables: parsedQuery,
        }),
      }
    );

    if (!skillResponse.ok) {
      const errorData = await skillResponse.json().catch(() => ({}));
      console.error('[POST /api/chat] Skill execution failed:', errorData);

      return NextResponse.json({
        response: `Sorry, I encountered an error while executing the skill. The skill may need to be re-recorded or the website structure may have changed.\n\nError: ${errorData.error || 'Skill execution failed'}`
      });
    }

    const skillResult = await skillResponse.json();
    console.log('[POST /api/chat] Skill result:', skillResult);

    // Step 4: Format the response using LLM
    if (skillResult.success) {
      // Extract the data from various possible locations (handle nested structures)
      let extractedData: any = null;
      
      // Try different paths to find the actual result data
      if (skillResult.data?.extraction?.result) {
        extractedData = skillResult.data.extraction.result;
      } else if (skillResult.data?.extraction && typeof skillResult.data.extraction === 'object' && 'result' in skillResult.data.extraction) {
        extractedData = skillResult.data.extraction.result;
      } else if (skillResult.data?.extraction && typeof skillResult.data.extraction === 'object' && !skillResult.data.extraction.type) {
        // If extraction is an object but not a Stagehand action object, use it directly
        extractedData = skillResult.data.extraction;
      } else if (skillResult.data?.result) {
        extractedData = skillResult.data.result;
      } else if (skillResult.data && typeof skillResult.data === 'object') {
        extractedData = skillResult.data;
      }

      console.log('[POST /api/chat] Extracted data for formatting:', extractedData);

      if (!extractedData || (typeof extractedData === 'object' && Object.keys(extractedData).length === 0)) {
        // Fallback if no data found
        return NextResponse.json({
          response: `✅ Search completed successfully, but no data was extracted. The skill may need to be updated to extract the information you're looking for.\n\n🔗 [View session recording](${skillResult.sessionUrl || 'N/A'})`
        });
      }

      // Use LLM to format the response in a user-friendly way
      const formatResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that formats search results in a clear, user-friendly way.

The user asked: "${message}"

Format the extracted data into a natural, conversational response. Answer the user's question directly using the data provided. Highlight the most important information (like prices, dates, locations, names) prominently. Use emojis sparingly but effectively. Make it easy to read and understand.

Guidelines:
- If the data contains prices: Show them clearly and prominently (e.g., "💰 **Price**: $181 incl. fees")
- If the data contains dates: Format them nicely (e.g., "📅 **Date**: December 13, 2025 at 11:00 AM")
- If the data contains locations: Show clearly (e.g., "📍 **Location**: Exhibition Park in Canberra, Australia")
- If the data contains events/names: Show prominently (e.g., "🎵 **Event**: Spilt Milk Canberra with Kendrick Lamar")

Keep the response concise but informative. Don't just list the data - present it naturally as if you're directly answering the user's question. Start with the most important information first.`
          },
          {
            role: 'user',
            content: `Here's the extracted data from the web search:\n\n${JSON.stringify(extractedData, null, 2)}\n\nFormat this into a clear, user-friendly response that directly answers: "${message}"`
          }
        ],
        temperature: 0.3,
      });

      let responseText = formatResponse.choices[0].message.content || '';

      // Add a link to the session recording if available
      if (skillResult.sessionUrl) {
        responseText += `\n\n🔗 [View full session recording](${skillResult.sessionUrl})`;
    }

    return NextResponse.json({
      response: responseText
    });
    } else {
      // Handle error case
      const errorText = `❌ Search failed.\n\n`;
      const errorDetails = `The automation encountered an issue. This could be due to:\n`;
      const errorReasons = `- Website changes\n- Network issues\n- Invalid search parameters\n\n`;
      const errorMessage = `Error: ${skillResult.error || 'Unknown error'}`;

      return NextResponse.json({
        response: errorText + errorDetails + errorReasons + errorMessage
      });
    }

  } catch (error) {
    console.error('[POST /api/chat] Error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        response: `Sorry, something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}
