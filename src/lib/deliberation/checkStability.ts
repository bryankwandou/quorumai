import { PersonaKey, ClaimStatus } from '@prisma/client';
import type { TrackedClaimStatuses } from '@/types';

/**
 * STABILITY DETECTION - Section 9.3
 * 
 * A TrackedClaim is "stable" once no persona's status on it changed between
 * consecutive rounds. Once EVERY tracked claim is stable (or maxRounds is reached),
 * cross-examination stops.
 * 
 * This is a real, deterministic check, never an AI's judgment.
 */

export interface StabilityCheckResult {
  allStable: boolean;
  stillMovingClaimIds: string[];
  stableCount: number;
  unstableCount: number;
}

export interface ClaimWithStatuses {
  claimId: string;
  currentStatusByPersona: TrackedClaimStatuses;
}

/**
 * Checks if all tracked claims have stabilized between rounds
 */
export function checkForStableConsensusOrDissent(
  currentClaims: ClaimWithStatuses[],
  previousRoundStatuses: Map<string, TrackedClaimStatuses>
): StabilityCheckResult {
  const stillMoving: string[] = [];
  let stableCount = 0;
  let unstableCount = 0;

  for (const claim of currentClaims) {
    const previousStatuses = previousRoundStatuses.get(claim.claimId);

    // If this claim didn't exist in previous round, it's new and unstable
    if (!previousStatuses) {
      stillMoving.push(claim.claimId);
      unstableCount++;
      continue;
    }

    // Check if any persona's status changed
    const hasChanged = hasStatusChanged(
      claim.currentStatusByPersona,
      previousStatuses
    );

    if (hasChanged) {
      stillMoving.push(claim.claimId);
      unstableCount++;
    } else {
      stableCount++;
    }
  }

  return {
    allStable: stillMoving.length === 0 && currentClaims.length > 0,
    stillMovingClaimIds: stillMoving,
    stableCount,
    unstableCount,
  };
}

/**
 * Checks if any persona's status changed between two rounds
 */
function hasStatusChanged(
  current: TrackedClaimStatuses,
  previous: TrackedClaimStatuses
): boolean {
  const allPersonas: PersonaKey[] = [
    PersonaKey.MARKET_SKEPTIC,
    PersonaKey.FINANCIAL_DILIGENCE,
    PersonaKey.FOUNDER_TEAM_EVALUATOR,
    PersonaKey.RISK_LEGAL_SPECIALIST,
  ];

  for (const persona of allPersonas) {
    if (current[persona] !== previous[persona]) {
      return true;
    }
  }

  return false;
}

/**
 * Builds a map of claim statuses for a given round (for comparison)
 */
export function buildStatusMap(
  claims: ClaimWithStatuses[]
): Map<string, TrackedClaimStatuses> {
  const map = new Map<string, TrackedClaimStatuses>();
  
  for (const claim of claims) {
    map.set(claim.claimId, claim.currentStatusByPersona);
  }
  
  return map;
}

/**
 * Checks if a claim is unanimous (all personas have the same status)
 */
export function isUnanimous(
  statusByPersona: TrackedClaimStatuses
): boolean {
  const statuses = Object.values(statusByPersona);
  const firstStatus = statuses[0];
  return statuses.every((status) => status === firstStatus);
}

/**
 * Gets the consensus status if unanimous, otherwise returns null
 */
export function getConsensusStatus(
  statusByPersona: TrackedClaimStatuses
): ClaimStatus | null {
  if (!isUnanimous(statusByPersona)) {
    return null;
  }
  return Object.values(statusByPersona)[0];
}

/**
 * Determines if early stopping should occur
 * Returns true if all claims are stable OR maxRounds is reached
 */
export function shouldStopDeliberation(
  currentRound: number,
  maxRounds: number,
  stabilityResult: StabilityCheckResult
): boolean {
  // Stop if we've reached max rounds
  if (currentRound >= maxRounds) {
    return true;
  }

  // Stop if all claims are stable
  if (stabilityResult.allStable) {
    return true;
  }

  return false;
}
