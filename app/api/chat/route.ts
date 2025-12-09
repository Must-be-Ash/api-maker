import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// IMPORTANT: Replace this with your actual skill ID after recording
const FLIGHT_SEARCH_SKILL_ID = process.env.FLIGHT_SEARCH_SKILL_ID || 'YOUR_SKILL_ID_HERE';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Chat API
 *
 * Accepts natural language queries about flights and uses the skills system to find results
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

    // Step 1: Use OpenAI to parse the natural language query
    const parseResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a flight query parser. Extract flight search parameters from user queries.

Return a JSON object with these fields:
- origin: departure city/airport (string)
- destination: arrival city/airport (string)
- departureDate: departure date in YYYY-MM-DD format (string, use current year ${new Date().getFullYear()} if not specified)
- returnDate: return date in YYYY-MM-DD format (string, optional for one-way)
- tripType: "roundtrip" or "oneway" (string)

If the query is not about flights or you cannot extract the information, return:
{ "error": "Could not understand the flight query. Please specify origin, destination, and dates." }

Examples:
- "cheapest flight from Vancouver to LAX December 6 to 14" → { origin: "Vancouver", destination: "LAX", departureDate: "2025-12-06", returnDate: "2025-12-14", tripType: "roundtrip" }
- "one way from NYC to Miami on Jan 15" → { origin: "NYC", destination: "Miami", departureDate: "2026-01-15", tripType: "oneway" }

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

    // Step 2: Call the skill execution API
    console.log('[POST /api/chat] Executing skill:', FLIGHT_SEARCH_SKILL_ID);

    const skillResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/skills/${FLIGHT_SEARCH_SKILL_ID}/execute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variables: {
            origin: parsedQuery.origin,
            destination: parsedQuery.destination,
            departureDate: parsedQuery.departureDate,
            returnDate: parsedQuery.returnDate || parsedQuery.departureDate,
          },
        }),
      }
    );

    if (!skillResponse.ok) {
      const errorData = await skillResponse.json().catch(() => ({}));
      console.error('[POST /api/chat] Skill execution failed:', errorData);

      return NextResponse.json({
        response: `Sorry, I encountered an error while searching for flights. The flight search skill may need to be re-recorded or the website structure may have changed.\n\nError: ${errorData.error || 'Skill execution failed'}`
      });
    }

    const skillResult = await skillResponse.json();
    console.log('[POST /api/chat] Skill result:', skillResult);

    // Step 3: Format the response
    let responseText = '';

    if (skillResult.success) {
      responseText = `✅ **Flight Search Results**\n\n`;
      responseText += `🛫 Route: ${parsedQuery.origin} → ${parsedQuery.destination}\n`;
      responseText += `📅 Dates: ${parsedQuery.departureDate}`;
      if (parsedQuery.returnDate && parsedQuery.returnDate !== parsedQuery.departureDate) {
        responseText += ` to ${parsedQuery.returnDate}`;
      }
      responseText += `\n\n`;

      // Add execution details
      responseText += `⚡ Strategy used: ${skillResult.strategy}\n`;
      responseText += `⏱️ Execution time: ${(skillResult.executionTime / 1000).toFixed(1)}s\n`;

      if (skillResult.data?.message) {
        responseText += `\n📝 ${skillResult.data.message}\n`;
      }

      if (skillResult.data?.extraction) {
        responseText += `\n💰 Price: ${skillResult.data.extraction}\n`;
      }

      if (skillResult.sessionUrl) {
        responseText += `\n🔗 [View session recording](${skillResult.sessionUrl})`;
      }

      // Add raw data for debugging
      if (skillResult.data && Object.keys(skillResult.data).length > 0) {
        responseText += `\n\n---\n**Raw data:**\n\`\`\`json\n${JSON.stringify(skillResult.data, null, 2)}\n\`\`\``;
      }
    } else {
      responseText = `❌ Flight search failed.\n\n`;
      responseText += `The automation encountered an issue. This could be due to:\n`;
      responseText += `- Website changes\n`;
      responseText += `- Network issues\n`;
      responseText += `- Invalid search parameters\n\n`;
      responseText += `Error: ${skillResult.error || 'Unknown error'}`;
    }

    return NextResponse.json({
      response: responseText
    });

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
