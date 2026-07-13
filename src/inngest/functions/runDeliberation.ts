import { inngest } from '../client';
import { db } from '@/lib/db';
import { PersonaKey, ClaimStatus, DealStatus } from '@prisma/client';
import { generateInitialPosition } from '@/lib/ai/generateInitialPosition';
import { generateCrossExamReactions } from '@/lib/ai/runCrossExamRound';
import { compileConsensusAndDissentMemo } from '@/lib/ai/compileMemo';
import { 
  checkForStableConsensusOrDissent, 
  buildStatusMap, 
  shouldStopDeliberation 
} from '@/lib/deliberation/checkStability';
import type { TrackedClaimStatuses } from '@/types';

/**
 * THE CORE DELIBERATION PIPELINE
 * 
 * This is the orchestration heart of QuorumAI - runs the complete multi-round
 * four-persona deliberation process as a durable background job.
 */
export const runDeliberationFunction = inngest.createFunction(
  {
    id: 'deliberation-pipeline',
    name: 'Run Complete Deliberation',
    retries: 1,
  },
  { event: 'deliberation/started' },
  async ({ event, step }) => {
    const { dealId } = event.data;

    // Step 1: Fetch deal and validate
    const deal = await step.run('fetch-deal', async () => {
      const d = await db.deal.findUnique({
        where: { id: dealId },
        include: {
          organization: true,
        },
      });

      if (!d) throw new Error(`Deal ${dealId} not found`);
      if (!d.extractedText) throw new Error(`Deal ${dealId} has no extracted text`);

      return d;
    });

    // Step 2: Create deliberation record
    const deliberation = await step.run('create-deliberation', async () => {
      return db.deliberation.create({
        data: {
          dealId: deal.id,
          maxRounds: 3,
        },
      });
    });

    // Step 3: Generate initial positions for all four personas (PARALLEL)
    const initialPositions = await step.run('generate-initial-positions', async () => {
      const personas: PersonaKey[] = [
        PersonaKey.MARKET_SKEPTIC,
        PersonaKey.FINANCIAL_DILIGENCE,
        PersonaKey.FOUNDER_TEAM_EVALUATOR,
        PersonaKey.RISK_LEGAL_SPECIALIST,
      ];

      // Generate all four in parallel
      const positionPromises = personas.map(async (personaKey) => {
        const output = await generateInitialPosition({
          personaKey,
          dealName: deal.name,
          organizationName: deal.organization.name,
          extractedDealText: deal.extractedText!,
        });

        // Persist to database
        return db.initialPosition.create({
          data: {
            deliberationId: deliberation.id,
            persona: personaKey,
            overallStance: output.overallStance,
            claims: output.claims,
          },
        });
      });

      return Promise.all(positionPromises);
    });

    // Step 4: Build tracked claims set
    const trackedClaims = await step.run('build-tracked-claims', async () => {
      const claims: Array<{
        claimId: string;
        claimText: string;
        originPersona: PersonaKey;
        confidence: string;
        sourceCitation: string;
      }> = [];

      // Extract all claims from initial positions
      for (const position of initialPositions) {
        const positionClaims = position.claims as any[];
        for (const claim of positionClaims) {
          claims.push({
            claimId: claim.claimId,
            claimText: claim.claimText,
            originPersona: position.persona,
            confidence: claim.confidence,
            sourceCitation: claim.sourceCitation,
          });
        }
      }

      // Create TrackedClaim records with initial status
      const trackedClaimPromises = claims.map(async (claim) => {
        const initialStatus: TrackedClaimStatuses = {
          [PersonaKey.MARKET_SKEPTIC]: ClaimStatus.UNCERTAIN,
          [PersonaKey.FINANCIAL_DILIGENCE]: ClaimStatus.UNCERTAIN,
          [PersonaKey.FOUNDER_TEAM_EVALUATOR]: ClaimStatus.UNCERTAIN,
          [PersonaKey.RISK_LEGAL_SPECIALIST]: ClaimStatus.UNCERTAIN,
        };

        // Originating persona automatically agrees
        initialStatus[claim.originPersona] = ClaimStatus.AGREES;

        return db.trackedClaim.create({
          data: {
            deliberationId: deliberation.id,
            claimText: claim.claimText,
            originPersona: claim.originPersona,
            currentStatusByPersona: initialStatus,
          },
        });
      });

      return Promise.all(trackedClaimPromises);
    });

    // Step 5: Cross-examination rounds
    let currentRound = 0;
    let previousRoundStatuses = buildStatusMap(
      trackedClaims.map(tc => ({
        claimId: tc.id,
        currentStatusByPersona: tc.currentStatusByPersona as TrackedClaimStatuses,
      }))
    );

    while (currentRound < deliberation.maxRounds) {
      currentRound++;

      await step.run(`cross-exam-round-${currentRound}`, async () => {
        const personas: PersonaKey[] = [
          PersonaKey.MARKET_SKEPTIC,
          PersonaKey.FINANCIAL_DILIGENCE,
          PersonaKey.FOUNDER_TEAM_EVALUATOR,
          PersonaKey.RISK_LEGAL_SPECIALIST,
        ];

        // Get current claim statuses
        const currentClaims = await db.trackedClaim.findMany({
          where: { deliberationId: deliberation.id },
        });

        // For each persona, generate reactions to claims they haven't reacted to
        for (const persona of personas) {
          const claimsToReact = currentClaims
            .filter(claim => {
              const statuses = claim.currentStatusByPersona as TrackedClaimStatuses;
              return statuses[persona] === ClaimStatus.UNCERTAIN && claim.originPersona !== persona;
            })
            .map(claim => ({
              claimId: claim.id,
              claimText: claim.claimText,
              originPersona: claim.originPersona,
              sourceCitation: 'From initial analysis',
            }));

          if (claimsToReact.length === 0) continue;

          const reactions = await generateCrossExamReactions({
            personaKey: persona,
            claimsToReact,
            dealName: deal.name,
            extractedDealText: deal.extractedText!,
          });

          // Update TrackedClaim statuses
          for (const reaction of reactions) {
            const claim = currentClaims.find(c => c.id === reaction.claimId);
            if (!claim) continue;

            const updatedStatuses = claim.currentStatusByPersona as TrackedClaimStatuses;
            updatedStatuses[persona] = reaction.yourStatus;

            await db.trackedClaim.update({
              where: { id: claim.id },
              data: {
                currentStatusByPersona: updatedStatuses,
              },
            });

            // Create CrossExamTurn record
            await db.crossExamTurn.create({
              data: {
                deliberationId: deliberation.id,
                roundNumber: currentRound,
                challengingPersona: persona,
                challengedPersona: claim.originPersona,
                targetClaimId: claim.id,
                challengeText: `Reaction to: ${claim.claimText}`,
                responseType: reaction.yourStatus === ClaimStatus.AGREES ? 'CONCEDE' : 
                             reaction.yourStatus === ClaimStatus.DISAGREES ? 'HOLD_POSITION' : 
                             'PARTIAL_CONCEDE',
                responseText: reaction.reasoning,
              },
            });
          }
        }

        return { roundCompleted: currentRound };
      });

      // Check for stability
      const stabilityCheck = await step.run(`check-stability-round-${currentRound}`, async () => {
        const updatedClaims = await db.trackedClaim.findMany({
          where: { deliberationId: deliberation.id },
        });

        const currentStatusMap = buildStatusMap(
          updatedClaims.map(tc => ({
            claimId: tc.id,
            currentStatusByPersona: tc.currentStatusByPersona as TrackedClaimStatuses,
          }))
        );

        const stability = checkForStableConsensusOrDissent(
          updatedClaims.map(tc => ({
            claimId: tc.id,
            currentStatusByPersona: tc.currentStatusByPersona as TrackedClaimStatuses,
          })),
          previousRoundStatuses
        );

        // Mark stable claims
        for (const claim of updatedClaims) {
          if (!stability.stillMovingClaimIds.includes(claim.id)) {
            await db.trackedClaim.update({
              where: { id: claim.id },
              data: { isStable: true },
            });
          }
        }

        previousRoundStatuses = currentStatusMap;

        return stability;
      });

      // Check if we should stop
      if (shouldStopDeliberation(currentRound, deliberation.maxRounds, stabilityCheck)) {
        console.log(`[Deliberation] Stopping after round ${currentRound} - ${stabilityCheck.allStable ? 'all stable' : 'max rounds reached'}`);
        break;
      }
    }

    // Step 6: Compile final memo with dissent-preservation guardrail
    const memo = await step.run('compile-memo', async () => {
      const finalClaims = await db.trackedClaim.findMany({
        where: { deliberationId: deliberation.id },
      });

      const memoResult = await compileConsensusAndDissentMemo(
        deal.name,
        finalClaims.map(fc => ({
          claimId: fc.id,
          claimText: fc.claimText,
          originPersona: fc.originPersona,
          currentStatusByPersona: fc.currentStatusByPersona as TrackedClaimStatuses,
        }))
      );

      return db.deliberationMemo.create({
        data: {
          deliberationId: deliberation.id,
          consensusClaims: memoResult.consensusClaims,
          resolvedClaims: memoResult.resolvedClaims,
          unresolvedDissentClaims: memoResult.unresolvedDissentClaims,
          overallSynthesis: memoResult.overallSynthesis,
        },
      });
    });

    // Step 7: Mark deliberation complete
    await step.run('mark-complete', async () => {
      await db.deliberation.update({
        where: { id: deliberation.id },
        data: {
          isComplete: true,
          completedAt: new Date(),
          currentRound,
        },
      });

      await db.deal.update({
        where: { id: deal.id },
        data: {
          status: DealStatus.MEMO_READY,
        },
      });
    });

    // Step 8: Send notification (TODO: implement email)
    await step.run('send-notification', async () => {
      console.log(`[Deliberation Complete] Deal: ${deal.name}, Memo ID: ${memo.id}`);
      // TODO: Send email via Resend
      return { notificationSent: true };
    });

    return {
      success: true,
      deliberationId: deliberation.id,
      memoId: memo.id,
      rounds: currentRound,
    };
  }
);
