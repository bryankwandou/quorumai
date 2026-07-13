import { PersonaKey, ClaimStatus } from '@prisma/client';
import type { TrackedClaimStatuses, UnresolvedDissentClaim } from '@/types';

/**
 * THE CRITICAL GUARDRAIL - Section 9.4
 * 
 * This is the single most important piece of logic in the entire product.
 * It structurally prevents AI synthesis from laundering away genuine disagreement.
 * 
 * Validates that the AI-generated memo's unresolvedDissentClaims correctly preserves
 * all genuine, non-unanimous claims from the tracked claim data.
 * 
 * If this validation fails, the synthesis output is rejected and retried.
 * After two consecutive failures, we fall back to mechanical generation from raw data.
 */

interface TrackedClaimData {
  claimId: string;
  claimText: string;
  currentStatusByPersona: TrackedClaimStatuses;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  missingDissent: string[];
}

/**
 * Validates that synthesis output correctly preserves genuine dissent
 */
export function validateDissentPreservation(
  trackedClaims: TrackedClaimData[],
  synthesizedUnresolvedDissent: UnresolvedDissentClaim[]
): ValidationResult {
  const errors: string[] = [];
  const missingDissent: string[] = [];

  // Find all claims that are genuinely non-unanimous (real disagreement)
  const nonUnanimousClaims = trackedClaims.filter((claim) => {
    const statuses = Object.values(claim.currentStatusByPersona);
    const uniqueStatuses = new Set(statuses);
    return uniqueStatuses.size > 1; // Not all personas have the same status
  });

  // For each non-unanimous claim, verify it appears in unresolvedDissentClaims
  for (const claim of nonUnanimousClaims) {
    const foundInDissent = synthesizedUnresolvedDissent.some((dissentClaim) =>
      dissentClaim.claimText.includes(claim.claimText.slice(0, 50)) ||
      claim.claimText.includes(dissentClaim.claimText.slice(0, 50))
    );

    if (!foundInDissent) {
      missingDissent.push(claim.claimId);
      errors.push(
        `Claim "${claim.claimText.slice(0, 100)}..." has genuine disagreement but is missing from unresolvedDissentClaims`
      );
    }
  }

  // For each claim in unresolvedDissentClaims, verify it has multiple distinct positions
  for (const dissentClaim of synthesizedUnresolvedDissent) {
    if (dissentClaim.positions.length < 2) {
      errors.push(
        `Dissent claim "${dissentClaim.claimText.slice(0, 100)}..." has fewer than 2 positions - not genuine dissent`
      );
    }

    // Verify positions are actually distinct (not just rephrased versions of the same stance)
    const positionTexts = dissentClaim.positions.map((p) => p.stance.toLowerCase());
    const uniquePositions = new Set(positionTexts);
    
    if (uniquePositions.size < 2) {
      errors.push(
        `Dissent claim "${dissentClaim.claimText.slice(0, 100)}..." has positions that are not genuinely distinct`
      );
    }
  }

  // Critical check: if we have non-unanimous claims but empty unresolvedDissentClaims,
  // the synthesis has completely failed to preserve disagreement
  if (nonUnanimousClaims.length > 0 && synthesizedUnresolvedDissent.length === 0) {
    errors.push(
      `CRITICAL: ${nonUnanimousClaims.length} claims have genuine disagreement, but unresolvedDissentClaims is empty - synthesis has laundered away all dissent`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingDissent,
  };
}

/**
 * Mechanically generates dissent section from raw tracked claim data
 * Used as fallback when AI synthesis fails validation twice
 */
export function mechanicallyGenerateDissentSection(
  trackedClaims: TrackedClaimData[]
): UnresolvedDissentClaim[] {
  const nonUnanimousClaims = trackedClaims.filter((claim) => {
    const statuses = Object.values(claim.currentStatusByPersona);
    const uniqueStatuses = new Set(statuses);
    return uniqueStatuses.size > 1;
  });

  return nonUnanimousClaims.map((claim) => {
    const positions = (Object.entries(claim.currentStatusByPersona) as [PersonaKey, ClaimStatus][])
      .map(([persona, status]) => ({
        persona,
        stance: status === ClaimStatus.AGREES ? 'Supports this claim' : 
                status === ClaimStatus.DISAGREES ? 'Challenges this claim' : 
                'Remains uncertain about this claim',
        reasoning: `[Mechanical fallback - AI synthesis failed to preserve genuine dissent]`,
      }));

    // Group by stance to show distinct positions
    const stanceGroups = new Map<string, PersonaKey[]>();
    for (const [persona, status] of Object.entries(claim.currentStatusByPersona) as [PersonaKey, ClaimStatus][]) {
      const stanceKey = status.toString();
      if (!stanceGroups.has(stanceKey)) {
        stanceGroups.set(stanceKey, []);
      }
      stanceGroups.get(stanceKey)!.push(persona);
    }

    return {
      claimText: claim.claimText,
      positions: positions.filter((p, idx, self) => 
        self.findIndex(x => x.stance === p.stance) === idx
      ),
    };
  });
}

/**
 * Checks if a specific claim has genuine disagreement
 */
export function hasGenuineDisagreement(
  statusByPersona: TrackedClaimStatuses
): boolean {
  const statuses = Object.values(statusByPersona);
  const uniqueStatuses = new Set(statuses);
  return uniqueStatuses.size > 1;
}

/**
 * Counts distinct positions on a claim
 */
export function countDistinctPositions(
  statusByPersona: TrackedClaimStatuses
): number {
  const statuses = Object.values(statusByPersona);
  return new Set(statuses).size;
}
