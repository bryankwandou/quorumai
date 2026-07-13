import { PersonaKey, ClaimStatus, CrossExamResponseType, DealStatus, OrgRole } from '@prisma/client';

export type { PersonaKey, ClaimStatus, CrossExamResponseType, DealStatus, OrgRole };

// Initial Position Structure
export interface InitialPositionClaim {
  claimId: string;
  claimText: string;
  confidence: 'high' | 'medium' | 'low';
  sourceCitation: string;
}

export interface InitialPositionOutput {
  overallStance: string;
  claims: InitialPositionClaim[];
}

// Cross-Examination Structures
export interface CrossExamReaction {
  claimId: string;
  yourStatus: ClaimStatus;
  reasoning: string;
}

export interface TrackedClaimStatuses {
  [key in PersonaKey]: ClaimStatus;
}

// Memo Structures
export interface ConsensusClaim {
  claimText: string;
  confidence: string;
  sourceCitation: string;
}

export interface ResolvedClaim {
  claimText: string;
  originPersona: PersonaKey;
  concededBy: PersonaKey[];
  concessionReasoning: string[];
}

export interface UnresolvedDissentPosition {
  persona: PersonaKey;
  stance: string;
  reasoning: string;
}

export interface UnresolvedDissentClaim {
  claimText: string;
  positions: UnresolvedDissentPosition[];
}

// Persona Configuration
export interface PersonaConfig {
  key: PersonaKey;
  name: string;
  shortName: string;
  description: string;
  incentive: string;
  color: string;
  icon: string;
  systemPromptFragment: string;
}

// API Response Types
export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

// Deliberation Event Types for SSE
export type DeliberationEventType = 
  | 'initial_position_complete'
  | 'round_start'
  | 'cross_exam_turn_complete'
  | 'round_complete'
  | 'stability_achieved'
  | 'memo_complete'
  | 'error';

export interface DeliberationEvent {
  type: DeliberationEventType;
  payload: unknown;
  timestamp: string;
}
