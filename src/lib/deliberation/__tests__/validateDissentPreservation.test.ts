import { describe, it, expect } from 'vitest';
import { PersonaKey, ClaimStatus } from '@prisma/client';
import {
  validateDissentPreservation,
  mechanicallyGenerateDissentSection,
  hasGenuineDisagreement,
  countDistinctPositions,
} from '../validateDissentPreservation';
import type { TrackedClaimStatuses, UnresolvedDissentClaim } from '@/types';

/**
 * CRITICAL TESTS - Non-skippable in CI
 * 
 * These tests verify the product's core value proposition:
 * genuine dissent is structurally preserved, never laundered into false consensus.
 */

describe('validateDissentPreservation', () => {
  it('accepts valid synthesis that preserves genuine dissent', () => {
    const trackedClaims = [
      {
        claimId: 'claim-1',
        claimText: 'Market size is overstated based on disclosed TAM calculations',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.UNCERTAIN,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.DISAGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.UNCERTAIN,
        },
      },
    ];

    const synthesizedDissent: UnresolvedDissentClaim[] = [
      {
        claimText: 'Market size is overstated based on disclosed TAM calculations',
        positions: [
          {
            persona: PersonaKey.MARKET_SKEPTIC,
            stance: 'Supports - TAM calculations appear inflated',
            reasoning: 'Market sizing methodology is flawed',
          },
          {
            persona: PersonaKey.FOUNDER_TEAM_EVALUATOR,
            stance: 'Challenges - Market opportunity is viable',
            reasoning: 'Team has proven market understanding',
          },
        ],
      },
    ];

    const result = validateDissentPreservation(trackedClaims, synthesizedDissent);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('REJECTS synthesis that collapses genuine dissent into false consensus', () => {
    const trackedClaims = [
      {
        claimId: 'claim-1',
        claimText: 'Market size is overstated',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.DISAGREES, // Real disagreement
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    // Synthesis INCORRECTLY omits this from unresolvedDissentClaims
    const synthesizedDissent: UnresolvedDissentClaim[] = [];

    const result = validateDissentPreservation(trackedClaims, synthesizedDissent);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.includes('missing from unresolvedDissentClaims'))).toBe(true);
  });

  it('CRITICAL: rejects completely empty dissent when genuine disagreement exists', () => {
    const trackedClaims = [
      {
        claimId: 'claim-1',
        claimText: 'Financial projections are realistic',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES, // Genuine dissent
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
      {
        claimId: 'claim-2',
        claimText: 'Team composition is adequate',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.UNCERTAIN,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.DISAGREES, // Genuine dissent
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    // AI synthesis FAILED to preserve ANY dissent
    const synthesizedDissent: UnresolvedDissentClaim[] = [];

    const result = validateDissentPreservation(trackedClaims, synthesizedDissent);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('CRITICAL'))).toBe(true);
    expect(result.errors.some(e => e.includes('laundered away all dissent'))).toBe(true);
  });

  it('accepts unanimous consensus (no dissent to preserve)', () => {
    const trackedClaims = [
      {
        claimId: 'claim-1',
        claimText: 'All personas agree on this',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    const synthesizedDissent: UnresolvedDissentClaim[] = [];

    const result = validateDissentPreservation(trackedClaims, synthesizedDissent);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects dissent claims with insufficient distinct positions', () => {
    const trackedClaims = [
      {
        claimId: 'claim-1',
        claimText: 'Claim with genuine disagreement',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    // Synthesis includes claim but with only ONE position (invalid)
    const synthesizedDissent: UnresolvedDissentClaim[] = [
      {
        claimText: 'Claim with genuine disagreement',
        positions: [
          {
            persona: PersonaKey.MARKET_SKEPTIC,
            stance: 'Some stance',
            reasoning: 'Some reasoning',
          },
        ],
      },
    ];

    const result = validateDissentPreservation(trackedClaims, synthesizedDissent);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('fewer than 2 positions'))).toBe(true);
  });
});

describe('mechanicallyGenerateDissentSection', () => {
  it('generates correct dissent structure from raw claim data', () => {
    const trackedClaims = [
      {
        claimId: 'claim-1',
        claimText: 'Market opportunity is smaller than claimed',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.UNCERTAIN,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.DISAGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    const generated = mechanicallyGenerateDissentSection(trackedClaims);

    expect(generated).toHaveLength(1);
    expect(generated[0].claimText).toBe('Market opportunity is smaller than claimed');
    expect(generated[0].positions.length).toBeGreaterThan(0);
  });

  it('only includes non-unanimous claims', () => {
    const trackedClaims = [
      {
        claimId: 'unanimous',
        claimText: 'Everyone agrees',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
      {
        claimId: 'dissent',
        claimText: 'Disagreement exists',
        currentStatusByPersona: {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
        },
      },
    ];

    const generated = mechanicallyGenerateDissentSection(trackedClaims);

    expect(generated).toHaveLength(1);
    expect(generated[0].claimText).toBe('Disagreement exists');
  });
});

describe('hasGenuineDisagreement', () => {
  it('returns true when personas have different statuses', () => {
    const statuses: TrackedClaimStatuses = {
      [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
      [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES,
      [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
      [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.UNCERTAIN,
    };

    expect(hasGenuineDisagreement(statuses)).toBe(true);
  });

  it('returns false when all personas agree', () => {
    const statuses: TrackedClaimStatuses = {
      [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
      [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
      [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.AGREES,
      [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.AGREES,
    };

    expect(hasGenuineDisagreement(statuses)).toBe(false);
  });
});

describe('countDistinctPositions', () => {
  it('correctly counts unique position statuses', () => {
    const statuses: TrackedClaimStatuses = {
      [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.AGREES,
      [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.AGREES,
      [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.DISAGREES,
      [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.UNCERTAIN,
    };

    expect(countDistinctPositions(statuses)).toBe(3); // AGREES, DISAGREES, UNCERTAIN
  });

  it('returns 1 for unanimous positions', () => {
    const statuses: TrackedClaimStatuses = {
      [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.DISAGREES,
      [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.DISAGREES,
      [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.DISAGREES,
      [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.DISAGREES,
    };

    expect(countDistinctPositions(statuses)).toBe(1);
  });
});
