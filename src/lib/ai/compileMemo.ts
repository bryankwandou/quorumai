import { PersonaKey, ClaimStatus } from '@prisma/client';
import { callClaude } from './client';
import { getPersona } from './personas';
import { 
  validateDissentPreservation, 
  mechanicallyGenerateDissentSection 
} from '../deliberation/validateDissentPreservation';
import type { 
  ConsensusClaim, 
  ResolvedClaim, 
  UnresolvedDissentClaim,
  TrackedClaimStatuses 
} from '@/types';

interface TrackedClaimData {
  claimId: string;
  claimText: string;
  originPersona: PersonaKey;
  currentStatusByPersona: TrackedClaimStatuses;
  sourceCitation?: string;
}

interface MemoSynthesisResult {
  consensusClaims: ConsensusClaim[];
  resolvedClaims: ResolvedClaim[];
  unresolvedDissentClaims: UnresolvedDissentClaim[];
  overallSynthesis: string;
}

/**
 * THE CRITICAL SYNTHESIS STEP - Section 9.4
 * 
 * Compiles the final deliberation memo with THE DISSENT-PRESERVATION GUARDRAIL
 * This is the single most important function in the entire product.
 */
export async function compileConsensusAndDissentMemo(
  dealName: string,
  trackedClaims: TrackedClaimData[]
): Promise<MemoSynthesisResult> {
  // Separate claims by consensus status
  const consensusClaims: ConsensusClaim[] = [];
  const dissentClaims: TrackedClaimData[] = [];

  for (const claim of trackedClaims) {
    const statuses = Object.values(claim.currentStatusByPersona);
    const uniqueStatuses = new Set(statuses);

    if (uniqueStatuses.size === 1 && statuses[0] === ClaimStatus.AGREES) {
      // Unanimous agreement - consensus
      consensusClaims.push({
        claimText: claim.claimText,
        confidence: 'high',
        sourceCitation: claim.sourceCitation || 'Multiple sources',
      });
    } else if (uniqueStatuses.size > 1) {
      // Genuine disagreement
      dissentClaims.push(claim);
    }
  }

  // Attempt AI synthesis with explicit dissent preservation instructions
  let synthesisAttempt = 0;
  const maxAttempts = 2;

  while (synthesisAttempt < maxAttempts) {
    synthesisAttempt++;

    const systemPrompt = `You are synthesizing the final deliberation memo for an investment committee analysis of "${dealName}".

CRITICAL REQUIREMENT - DISSENT PRESERVATION:
When committee members genuinely disagree after real cross-examination, you MUST preserve that disagreement explicitly in the unresolvedDissentClaims section. NEVER blend genuinely different positions into a single hedged consensus statement.

For each claim where personas have DIFFERENT statuses (not all agree), you MUST include it in unresolvedDissentClaims with EVERY distinct position shown separately with the persona's real reasoning.

Your output must be ONLY valid JSON matching this exact structure:
{
  "unresolvedDissentClaims": [
    {
      "claimText": "<the contested claim>",
      "positions": [
        {
          "persona": "MARKET_SKEPTIC" | "FINANCIAL_DILIGENCE" | "FOUNDER_TEAM_EVALUATOR" | "RISK_LEGAL_SPECIALIST",
          "stance": "<this persona's specific position>",
          "reasoning": "<their specific reasoning>"
        }
      ]
    }
  ],
  "overallSynthesis": "<2-3 paragraph narrative that EXPLICITLY REFERENCES the unresolved disagreements rather than glossing past them>"
}`;

    const userPrompt = `Claims with genuine disagreement (these MUST appear in unresolvedDissentClaims):

${dissentClaims.map((claim, idx) => {
  const statusBreakdown = Object.entries(claim.currentStatusByPersona)
    .map(([persona, status]) => `  - ${getPersona(persona as PersonaKey).name}: ${status}`)
    .join('\n');
  
  return `${idx + 1}. "${claim.claimText}"
${statusBreakdown}`;
}).join('\n\n')}

Consensus claims (all four personas agree): ${consensusClaims.length}

Generate the memo synthesis preserving ALL genuine disagreement.`;

    try {
      const responseText = await callClaude({
        systemPrompt,
        userPrompt,
        temperature: 0.3, // Lower temperature for structured output
      });

      // Parse synthesis
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, responseText];
      
      const jsonText = jsonMatch[1] || responseText;
      const parsed = JSON.parse(jsonText.trim());

      const synthesizedDissent: UnresolvedDissentClaim[] = parsed.unresolvedDissentClaims || [];
      const overallSynthesis: string = parsed.overallSynthesis || '';

      // THE CRITICAL GUARDRAIL - validate dissent preservation
      const validation = validateDissentPreservation(trackedClaims, synthesizedDissent);

      if (validation.isValid) {
        // Success! Synthesis correctly preserved dissent
        return {
          consensusClaims,
          resolvedClaims: [], // TODO: Track concessions during cross-exam
          unresolvedDissentClaims: synthesizedDissent,
          overallSynthesis,
        };
      }

      // Validation failed
      console.warn(`[Memo Synthesis Attempt ${synthesisAttempt}] Validation failed:`, validation.errors);

      if (synthesisAttempt >= maxAttempts) {
        // Final attempt failed - fall back to mechanical generation
        console.error('[CRITICAL] AI synthesis failed dissent preservation twice. Using mechanical fallback.');
        
        const mechanicalDissent = mechanicallyGenerateDissentSection(trackedClaims);
        
        return {
          consensusClaims,
          resolvedClaims: [],
          unresolvedDissentClaims: mechanicalDissent,
          overallSynthesis: `[Note: This memo's dissent section was mechanically generated to ensure genuine disagreement is preserved. The committee analysis identified ${mechanicalDissent.length} claims with unresolved disagreement after ${trackedClaims.length} rounds of cross-examination. These represent genuine analytical tensions that deserve careful consideration rather than false consensus.]`,
        };
      }

      // Retry with explicit correction
      console.log(`[Memo Synthesis] Retrying with explicit correction (attempt ${synthesisAttempt + 1}/${maxAttempts})`);

    } catch (error) {
      console.error(`[Memo Synthesis Attempt ${synthesisAttempt}] Error:`, error);
      
      if (synthesisAttempt >= maxAttempts) {
        throw new Error(`Memo synthesis failed after ${maxAttempts} attempts`);
      }
    }
  }

  throw new Error('Memo synthesis failed - should not reach here');
}
