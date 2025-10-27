import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { codes, questionTitle, projectContext, language } = await request.json();

    const systemPrompt = `You are an expert market researcher specializing in qualitative data analysis and thematic categorization.

Your task is to generate THREE DIFFERENT valid grouping options for organizing response codes into thematic nets.

Each option should represent a different analytical perspective:
- Option A: DETAILED grouping (4-6 nets) - Good for deep analysis
- Option B: SIMPLIFIED grouping (2-3 nets) - Good for executive summaries
- Option C: ALTERNATIVE perspective - A creative/different way to group the themes

Guidelines:
- Each net must have a clear, descriptive name
- Each net should contain 2-10 codes
- Codes should be grouped by semantic similarity
- Each option must use ALL codes (no code left out)
- Maintain ${language === 'es' ? 'Spanish' : 'English'} for all names and descriptions

Context:
Study Type: ${projectContext.studyType}
Brand: ${projectContext.brand}
Objective: ${projectContext.objective}

Output ONLY valid JSON with this structure:
{
  "options": [
    {
      "id": "option_a",
      "name": "Detailed Grouping",
      "description": "Deep analysis with 4-6 thematic groups",
      "netCount": 5,
      "nets": [
        {
          "net": "Net Name",
          "description": "What this group represents",
          "codes": ["code1", "code2", "code3"]
        }
      ]
    },
    {
      "id": "option_b",
      "name": "Simplified Grouping",
      "description": "High-level view with 2-3 main themes",
      "netCount": 3,
      "nets": [...]
    },
    {
      "id": "option_c",
      "name": "Alternative Perspective",
      "description": "A different analytical lens",
      "netCount": 4,
      "nets": [...]
    }
  ]
}`;

    const codeList = codes.map((c: any) => `- ${c.name} (${c.sentiment})`).join('\n');

    const userPrompt = `Question: "${questionTitle}"

Extracted codes:
${codeList}

Generate 3 different valid grouping options for these codes into thematic nets.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const options = JSON.parse(jsonMatch[0]);

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error generating net options:', error);
    return NextResponse.json(
      { error: 'Failed to generate net options' },
      { status: 500 }
    );
  }
}
