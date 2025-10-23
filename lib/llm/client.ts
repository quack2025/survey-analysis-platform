import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

/**
 * Helper function to extract JSON from Claude's response
 * Claude sometimes wraps JSON in markdown code blocks
 */
function extractJSON(text: string): string {
  // Try to find JSON in markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (jsonMatch) {
    return jsonMatch[1];
  }

  // If no code block, return the text as-is (it should be JSON)
  return text.trim();
}

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.0,
  model: string = 'claude-sonnet-4-20250514'
): Promise<string> {
  const client = getAnthropicClient();

  try {
    // Add explicit JSON instruction to system prompt
    const enhancedSystemPrompt = `${systemPrompt}

IMPORTANT: You must respond with valid JSON only. Do not include any markdown formatting, code blocks, or explanatory text. Return only the raw JSON object.`;

    const response = await client.messages.create({
      model,
      max_tokens: 8192,
      temperature,
      system: enhancedSystemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response (handles markdown code blocks)
    const jsonText = extractJSON(content.text);

    // Validate it's valid JSON
    try {
      JSON.parse(jsonText);
    } catch (e) {
      console.error('Invalid JSON from Claude:', content.text);
      throw new Error('Claude did not return valid JSON');
    }

    return jsonText;
  } catch (error) {
    console.error('Error calling Claude:', error);
    throw error;
  }
}

export async function callLLMBatch(
  systemPrompt: string,
  userPrompts: string[],
  temperature: number = 0.0,
  model: string = 'claude-sonnet-4-20250514'
): Promise<string[]> {
  const results = await Promise.all(
    userPrompts.map((userPrompt) => callLLM(systemPrompt, userPrompt, temperature, model))
  );
  return results;
}
