import { PersonaKey } from '@prisma/client';
import { callClaude } from './client';
import { getPersona } from './personas';
import type { InitialPositionOutput } from '@/types';

/**
 * Generates one persona's initial independent position on a deal
 * Section 8 - Initial Position Generation
 * 
 * Each persona sees ONLY the extracted deal text, never other personas' positions.
 * This ensures genuine analytical independence.
 */
export async function generateInitialPosition(params: {
  personaKey: PersonaKey;
  dealName: string;
  organizationName: string;
  extractedDealText: string;
}): Promise<InitialPositionOutput> {
  const { personaKey, dealName, organizationName, extractedDealText } = params;
  const persona = getPersona(personaKey);

  const systemPrompt = `${persona.systemPromptFragment}

You are evaluating a deal called "${dealName}" on behalf of ${organizationName}.

CRITICAL REQUIREMENTS:
1. Produce 3-6 real, substantive claims - not padded trivial observations
2. Each claim must be specific and falsifiable
3. Every claim must cite the specific real content in the materials that supports it
4. If materials lack information for important assessment, say so explicitly
5. Each claim should be something another committee member might plausibly disagree with

Your output must be ONLY valid JSON matching this exact structure:
{
  "overallStance": "<2-3 sentence substantive summary of your position>",
  "claims": [
    {
      "claimText": "<specific, falsifiable assertion>",
      "confidence": "high" | "medium" | "low",
      "sourceCitation": "<specific reference to content in materials>"
    }
  ]
}`;

  const userPrompt = `Real deal materials (extracted text from uploaded pitch deck and supporting documents):

"""
${extractedDealText}
"""

Analyze this deal strictly from your assigned analytical lens: ${persona.incentive}

Respond with ONLY the JSON object as specified.`;

  const responseText = await callClaude({
    systemPrompt,
    userPrompt,
    temperature: 0.8, // Slightly higher for analytical creativity
  });

  // Parse and validate the JSON response
  try {
    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                      responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                      [null, responseText];
    
    const jsonText = jsonMatch[1] || responseText;
    const parsed = JSON.parse(jsonText.trim()) as InitialPositionOutput;

    // Validate structure
    if (!parsed.overallStance || !Array.isArray(parsed.claims)) {
      throw new Error('Invalid response structure from Claude');
    }

    // Generate claimIds if not present
    parsed.claims = parsed.claims.map((claim, idx) => ({
      ...claim,
      claimId: claim.claimId || `${personaKey}_initial_${idx}`,
    }));

    return parsed;
  } catch (error) {
    console.error('[Parse Error]', responseText);
    throw new Error(`Failed to parse initial position from Claude: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
