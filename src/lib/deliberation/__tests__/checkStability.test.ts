import { describe, it, expect } from 'vitest';
import { PersonaKey, ClaimStatus } from '@prisma/client';
import {
  checkForStableConsensusOrDissent,
  buildStatusMap,
  isUnanimous,
  getConsensusStatus,
  shouldStopDeliberation,
} from '../checkStability';
import type { TrackedClaimStatuses } from '@/types';

/**
 * CRITICAL TESTS - Stability Detection
 * 
 * These tests verify the deterministic stopping condition for cross-examination.
 * Stability is reached when no persona's position changed between consecutive rounds.
 */

describe('checkForStableConsensusOrDissent', () => {
  it('detects all claims as stable when no statuses changed', () => {
    const currentClaims = [
      {
        claimId: 'claim-1',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    const previousStatuses = new Map([
      [
        'claim-1',
        {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      ],
    ]);

    const result = checkForStableConsensusOrDissent(currentClaims, previousStatuses);

    expect(result.allStable).toBe(true);
    expect(result.stillMovingClaimIds).toHaveLength(0);
    expect(result.stableCount).toBe(1);
    expect(result.unstableCount).toBe(0);
  });

  it('detects unstable claim when any persona status changed', () => {
    const currentClaims = [
      {
        claimId: 'claim-1',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES, // Changed
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    const previousStatuses = new Map([
      [
        'claim-1',
        {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.UNCERTAIN, // Was UNCERTAIN
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      ],
    ]);

    const result = checkForStableConsensusOrDissent(currentClaims, previousStatuses);

    expect(result.allStable).toBe(false);
    expect(result.stillMovingClaimIds).toContain('claim-1');
    expect(result.unstableCount).toBe(1);
  });

  it('correctly handles mix of stable and unstable claims', () => {
    const currentClaims = [
      {
        claimId: 'stable-claim',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
      {
        claimId: 'unstable-claim',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.DISAGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    const previousStatuses = new Map([
      [
        'stable-claim',
        {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      ],
      [
        'unstable-claim',
        {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.UNCERTAIN, // Changed
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      ],
    ]);

    const result = checkForStableConsensusOrDissent(currentClaims, previousStatuses);

    expect(result.allStable).toBe(false);
    expect(result.stillMovingClaimIds).toEqual(['unstable-claim']);
    expect(result.stableCount).toBe(1);
    expect(result.unstableCount).toBe(1);
  });

  it('treats new claims (not in previous round) as unstable', () => {
    const currentClaims = [
      {
        claimId: 'new-claim',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    const previousStatuses = new Map(); // Empty - no previous round data

    const result = checkForStableConsensusOrDissent(currentClaims, previousStatuses);

    expect(result.allStable).toBe(false);
    expect(result.stillMovingClaimIds).toContain('new-claim');
  });

  it('handles dissent that stabilized (personas still disagree, but positions stopped changing)', () => {
    const currentClaims = [
      {
        claimId: 'stable-dissent',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES, // Disagree
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    const previousStatuses = new Map([
      [
        'stable-dissent',
        {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES, // Same as current
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      ],
    ]);

    const result = checkForStableConsensusOrDissent(currentClaims, previousStatuses);

    // This is STABLE even though there's disagreement - positions stopped changing
    expect(result.allStable).toBe(true);
    expect(result.stillMovingClaimIds).toHaveLength(0);
  });
});

describe('isUnanimous', () => {
  it('returns true when all personas have identical status', () => {
    const statuses: TrackedClaimStatuses = {
      [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
      [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
      [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
      [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
    };

    expect(isUnanimous(statuses)).toBe(true);
  });

  it('returns false when any persona has different status', () => {
    const statuses: TrackedClaimStatuses = {
      [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
      [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES,
      [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
      [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
    };

    expect(isUnanimous(statuses)).toBe(false);
  });
});

describe('getConsensusStatus', () => {
  it('returns the consensus status when unanimous', () => {
    const statuses: TrackedClaimStatuses = {
      [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.DISAGREES,
      [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES,
      [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.DISAGREES,
      [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.DISAGREES,
    };

    expect(getConsensusStatus(statuses)).toBe(ClaimStatus.DISAGREES);
  });

  it('returns null when not unanimous', () => {
    const statuses: TrackedClaimStatuses = {
      [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
      [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES,
      [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.UNCERTAIN,
      [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
    };

    expect(getConsensusStatus(statuses)).toBeNull();
  });
});

describe('shouldStopDeliberation', () => {
  it('stops when maxRounds is reached', () => {
    const stabilityResult = {
      allStable: false,
      stillMovingClaimIds: ['claim-1'],
      stableCount: 2,
      unstableCount: 1,
    };

    expect(shouldStopDeliberation(3, 3, stabilityResult)).toBe(true);
  });

  it('stops when all claims are stable before maxRounds', () => {
    const stabilityResult = {
      allStable: true,
      stillMovingClaimIds: [],
      stableCount: 3,
      unstableCount: 0,
    };

    expect(shouldStopDeliberation(2, 3, stabilityResult)).toBe(true);
  });

  it('continues when neither condition is met', () => {
    const stabilityResult = {
      allStable: false,
      stillMovingClaimIds: ['claim-1'],
      stableCount: 2,
      unstableCount: 1,
    };

    expect(shouldStopDeliberation(1, 3, stabilityResult)).toBe(false);
  });
});

describe('buildStatusMap', () => {
  it('correctly builds map from claims array', () => {
    const claims = [
      {
        claimId: 'claim-1',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
      {
        claimId: 'claim-2',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.DISAGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.DISAGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.DISAGREES,
        },
      },
    ];

    const map = buildStatusMap(claims);

    expect(map.size).toBe(2);
    expect(map.has('claim-1')).toBe(true);
    expect(map.has('claim-2')).toBe(true);
    expect(map.get('claim-1')?.[PersonaKey.MARKET_SKEPTIC]).toBe(ClaimStatus.AGREES);
  });
});
