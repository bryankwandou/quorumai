import { PersonaKey, ClaimStatus } from '@prisma/client';
import { callClaude } from './client';
import { getPersona } from './personas';
import type { CrossExamReaction, TrackedClaimStatuses } from '@/types';

/**
 * Runs one cross-examination round for a single persona
 * Section 9.2 - Cross-Examination Engine
 * 
 * Shows this persona the other personas' claims and asks for genuine engagement
 */
export async function generateCrossExamReactions(params: {
  personaKey: PersonaKey;
  claimsToReact: Array<{
    claimId: string;
    claimText: string;
    originPersona: PersonaKey;
    sourceCitation: string;
  }>;
  dealName: string;
  extractedDealText: string;
}): Promise<CrossExamReaction[]> {
  const { personaKey, claimsToReact, dealName, extractedDealText } = params;
  
  if (claimsToReact.length === 0) {
    return [];
  }

  const persona = getPersona(personaKey);

  const systemPrompt = `${persona.systemPromptFragment}

You are continuing your committee evaluation of "${dealName}".

Your fellow committee members have raised specific claims from their own analytical perspectives. Your job is to GENUINELY engage with each claim:

1. If you find it well-supported by the actual deal materials, say so honestly (AGREES)
2. If you find specific evidence that contradicts or complicates it, challenge it (DISAGREES)
3. If you're genuinely uncertain given the available information, say so (UNCERTAIN)

DO NOT manufacture disagreement for its own sake. Your value is your genuinely independent judgment from your specific analytical lens: ${persona.incentive}

For reference, here are the original deal materials:
"""
${extractedDealText.slice(0, 8000)}
"""

Respond with ONLY valid JSON matching this exact structure:
[
  {
    "claimId": "<id>",
    "yourStatus": "agrees" | "disagrees" | "uncertain",
    "reasoning": "<real, specific reasoning grounded in deal materials or logical analysis>"
  }
]`;

  const claimsText = claimsToReact
    .map((claim, idx) => 
      `${idx + 1}. [${claim.claimId}] Raised by ${getPersona(claim.originPersona).name}:\n   "${claim.claimText}"\n   (Their support: "${claim.sourceCitation}")`
    )
    .join('\n\n');

  const userPrompt = `Review these ${claimsToReact.length} claims and respond genuinely to each:

${claimsText}

For each claim, provide your status (agrees/disagrees/uncertain) with real, specific reasoning.`;

  const responseText = await callClaude({
    systemPrompt,
    userPrompt,
    temperature: 0.7,
  });

  // Parse JSON response
  try {
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                      responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                      [null, responseText];
    
    const jsonText = jsonMatch[1] || responseText;
    const parsed = JSON.parse(jsonText.trim()) as CrossExamReaction[];

    // Validate and normalize
    const validated = parsed.map(reaction => ({
      claimId: reaction.claimId,
      yourStatus: normalizeStatus(reaction.yourStatus),
      reasoning: reaction.reasoning || 'No reasoning provided',
    }));

    return validated;
  } catch (error) {
    console.error('[Cross-Exam Parse Error]', responseText);
    throw new Error(`Failed to parse cross-exam reactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function normalizeStatus(status: string): ClaimStatus {
  const normalized = status.toLowerCase();
  if (normalized.includes('agree')) return ClaimStatus.AGREES;
  if (normalized.includes('disagree')) return ClaimStatus.DISAGREES;
  return ClaimStatus.UNCERTAIN;
}
