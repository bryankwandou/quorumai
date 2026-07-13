# QuorumAI — Architecture Decision Record

## Core Product Decisions

### Four Fixed Personas (Not Configurable in MVP)
**Decision**: MVP ships with exactly four fixed committee personas, not a configurable count or custom focus areas.

**Rationale**: Four personas provide sufficient analytical diversity (market viability, financial rigor, team execution risk, legal/structural risk) without diluting debate quality or making cross-examination unwieldy. This is a deliberate product decision informed by real investment committee dynamics, not a technical limitation.

**Future Consideration**: Phase 2 may add configurable persona count/focus once the fixed four-persona mechanism is proven.

### Dissent as First-Class Data Structure
**Decision**: The `DeliberationMemo.unresolvedDissentClaims` field stores an array preserving every distinct persona position on genuinely unresolved claims, never blending them into consensus prose.

**Rationale**: The platform's entire value proposition is honest disagreement. By making dissent a structured data type (not AI-generated prose), we make false-consensus fabrication structurally difficult. The UI renders this by iterating the array and displaying positions side-by-side.

**Implementation**: The dissent-preservation guardrail (Section 9.4) validates synthesis output against real TrackedClaim data and rejects any synthesis that collapses genuine disagreement.

### Deterministic Stability Detection
**Decision**: Cross-examination stops when no persona's position on any tracked claim changed between consecutive rounds, OR maxRounds is reached (default 3).

**Rationale**: This is a real, deterministic check (no AI judgment of "we've discussed enough"). Prevents unnecessary AI calls while ensuring genuine disagreement has space to emerge and stabilize.

## Technical Decisions

### Real-Time Feed Implementation
**Decision**: Server-sent events (SSE) with polling underneath for the live deliberation feed.

**Rationale**: Consistent with series-wide pattern. Provides real-time updates during multi-minute deliberation runs without websocket infrastructure complexity.

### Document Parsing Strategy
**Decision**: pdf-parse for PDFs, mammoth for DOCX, with honest "scanned image, no extractable text" fallback.

**Rationale**: Series-consistent approach. Real pitch decks are often PDFs with extractable text; when they're scanned images, we notify the investor honestly rather than proceeding with empty/garbage input.

### Background Job Orchestration
**Decision**: Inngest for the complete deliberation pipeline (4 initial positions + multiple cross-exam rounds).

**Rationale**: Total latency (4+ personas × 3+ rounds × real Claude API calls) exceeds any reasonable synchronous request timeout. Inngest provides durable execution, automatic retries, and clear visibility into multi-step pipeline progress.

### Cross-Examination Turn Structure
**Decision**: Each round, each persona receives a single Claude call showing all claims needing reaction, responds with structured JSON array of reactions.

**Rationale**: More efficient than separate challenge/response calls while preserving genuine independent judgment. Each reaction includes specific reasoning grounded in real deal materials.

## Data Model Decisions

### TrackedClaim.currentStatusByPersona Structure
**Decision**: JSON field storing `{ [PersonaKey]: ClaimStatus }` for all four personas on every tracked claim.

**Rationale**: Enables efficient stability detection by comparing this structure across rounds. Alternative of separate ClaimPosition join table would work but adds query complexity for this specific access pattern.

### No Portfolio Tracking in MVP
**Decision**: Platform evaluates deals pre-decision only. No post-investment monitoring or outcome correlation.

**Rationale**: Clear MVP scope boundary. Portfolio tracking correlating deliberation patterns against actual outcomes is genuinely compelling Phase 2 feature once historical deliberation data exists.

## Security Decisions

### Multi-Tenant Isolation
**Decision**: Every query filtered by organizationId at data-access layer, with automated cross-org isolation tests.

**Rationale**: Real pitch decks contain genuinely sensitive cap table and revenue data. Cross-org data leaks are unacceptable. Series-consistent pattern.

### Document Storage
**Decision**: Vercel Blob with private, signed, time-limited URLs.

**Rationale**: Deal documents must never be publicly guessable. Signed URLs provide secure, time-limited access without managing object ACLs.

## API Design Decisions

### PDF Export Endpoint
**Decision**: `/api/deliberations/[id]/memo/pdf` generates PDF on-demand using @react-pdf/renderer.

**Rationale**: Allows investors to share memos with co-investors/LPs. On-demand generation avoids storing duplicate PDF blobs. Caching layer can be added if needed.

### SSE Stream Endpoint
**Decision**: `/api/deliberations/[id]/stream` provides live updates as deliberation progresses.

**Rationale**: Core product experience is watching committee debate unfold in real-time. SSE provides efficient one-way server→client updates.

## AI Integration Decisions

### Model Selection
**Decision**: claude-sonnet-4-6 for all persona calls and synthesis.

**Rationale**: Latest model with strong reasoning capabilities required for genuine analytical cross-examination. Server-only calls (never client-side) for security.

### Prompt Strategy
**Decision**: Each persona gets distinct system prompt with specific analytical incentive and lens (Section 7), explicitly instructed to ground all claims in actual uploaded materials with citations.

**Rationale**: Real analytical independence requires genuinely different incentives, not just tone variations. Citation requirement enables validation and prevents generic speculation.

### Synthesis Constraints
**Decision**: Final synthesis call explicitly instructed to preserve dissent, with deterministic post-synthesis validation rejecting false-consensus output.

**Rationale**: AI models naturally tend to smooth disagreement into hedged consensus. The guardrail structurally prevents this, which is the product's entire value proposition.

## Deferred to Phase 2

- Configurable persona count and custom focus areas
- Portfolio tracking and outcome correlation
- Multi-investor collaborative deliberation for syndicates
- Stripe billing integration for SaaS subscription revenue
- Advanced analytics on deliberation patterns over time
- Export/import of deliberation templates
- Integration with deal-flow management tools

---

Last Updated: Initial implementation
