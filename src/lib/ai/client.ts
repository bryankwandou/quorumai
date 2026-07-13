import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = 'claude-sonnet-4-20250514' as const;
export const MAX_TOKENS = 4096;

/**
 * Wrapper for Claude API calls with consistent error handling and logging
 */
export async function callClaude(params: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}): Promise<string> {
  const { systemPrompt, userPrompt, temperature = 0.7 } = params;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    return content.text;
  } catch (error) {
    console.error('[Claude API Error]', error);
    throw new Error(`Claude API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
