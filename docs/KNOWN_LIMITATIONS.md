# Known Limitations - QuorumAI MVP

## Honest MVP Scope Boundaries

This document explicitly documents what QuorumAI MVP does NOT include, by deliberate product and scope decisions, not technical limitations.

## Explicitly Excluded from MVP

### 1. Configurable Persona Count or Custom Personas
**Current State**: Four fixed personas (Market Skeptic, Financial Diligence, Founder/Team Evaluator, Risk/Legal Specialist).

**Why**: Four personas provide sufficient analytical diversity without unwieldy cross-examination. This is a deliberate product decision, not a technical limitation.

**Phase 2 Consideration**: Custom persona focus areas and configurable count once the fixed four-persona mechanism is proven.

### 2. Portfolio Tracking / Post-Investment Monitoring
**Current State**: Platform evaluates deals pre-decision only. No post-investment tracking.

**Why**: Clear MVP scope boundary. Platform's value is pre-decision analysis.

**Phase 2 Feature**: Portfolio tracking correlating deliberation dissent patterns against actual investment outcomes (genuinely compelling once historical data exists).

### 3. Deal Sourcing / Matchmaking
**Current State**: No deal pipeline or founder-investor matching features.

**Why**: Platform is an analysis tool, not a deal-flow tool.

**Not Planned**: This would be a fundamentally different product.

### 4. Multi-Investor Collaborative Deliberation
**Current State**: Single organization use only. No features for multiple investors voting or deliberating together on a deal.

**Why**: MVP targets solo investors and small internal teams.

**Phase 2 Consideration**: Syndicate collaboration features for small investor groups jointly evaluating deals.

### 5. Subscription Billing / Payment Processing
**Current State**: No Stripe integration, no subscription tiers, no payment collection.

**Why**: Consistent with series-wide "build product first" approach. Marketing site presents pricing, but no enforcement.

**Phase 2 Priority**: Stripe subscription billing once product-market fit is validated.

## Technical Limitations

### 1. Document Parsing
**Scanned Image PDFs**: Cannot extract text from PDFs that are scanned images (no OCR in MVP). Platform honestly reports this and suggests manual text entry.

**Complex Layouts**: PDF extraction may struggle with complex multi-column layouts, tables, or charts. Text extraction is best-effort.

**Supported Formats**: PDF and DOCX only. No PowerPoint, Excel, or Google Docs direct import.

### 2. AI Model Constraints
**Model**: claude-sonnet-4 only. No fallback models or configurable model selection.

**Context Window**: Very large pitch decks (>200 pages) may exceed context limits. Recommend splitting into multiple documents.

**Response Time**: Full deliberation (4 personas × 3 rounds) takes 2-5 minutes with real Claude API calls. No instant results.

### 3. Real-Time Updates
**SSE Implementation**: Live deliberation feed uses polling-underneath SSE pattern. Updates typically within 1-2 seconds, not true instant.

**Concurrent Users**: Not optimized for hundreds of simultaneous deliberations. Inngest handles queuing, but expect some latency under heavy load.

### 4. Cross-Examination Quality
**Deterministic Stopping**: Deliberation stops when positions stabilize OR maxRounds (default 3) is reached. Some debates might benefit from more rounds, but MVP limits to control cost and latency.

**Similarity Detection**: Claim deduplication uses simple heuristics. Near-duplicate claims might occasionally be tracked separately.

**Dissent Quality**: The guardrail prevents FALSE consensus, but cannot force MORE disagreement where personas genuinely agree. If all four personas independently reach the same conclusion, that's genuine consensus, not a failure.

## Data & Analytics Limitations

### 1. Historical Analysis
**No Benchmarking**: Cannot compare current deal against historical deals in your pipeline (no deal database built up yet).

**No Outcome Correlation**: Cannot show "deals with high Financial Diligence dissent had X% failure rate" (requires post-investment tracking not in MVP).

### 2. Export Formats
**PDF Only**: Memo export is PDF only. No Word, Markdown, or API export in MVP.

**No Bulk Export**: Can export individual deliberations, but no "export all deals as CSV" feature.

## Security & Compliance Limitations

### 1. SOC 2 Compliance
**Current State**: Foundational security controls present (audit logging, access control, encryption), but NOT formally SOC 2 certified.

**Phase 2**: Formal compliance certification once product is proven.

### 2. SSO / Enterprise Auth
**Current State**: Clerk authentication only (email, Google, GitHub). No SAML, no Active Directory integration.

**Phase 2**: Enterprise SSO for larger fund customers.

### 3. Custom Data Retention
**Current State**: Data retained indefinitely unless org requests deletion. No configurable retention policies.

**Phase 2**: Configurable retention per org's internal compliance requirements.

## Integration Limitations

### 1. No External Integrations
**Current State**: Standalone platform. No Salesforce, Airtable, Notion, or other tool integrations.

**Phase 2**: Consider deal-flow tool integrations once core product is proven.

### 2. No API
**Current State**: No public API for programmatic access.

**Phase 2**: REST API for enterprise customers who want to embed deliberation in their own tools.

## UI/UX Limitations

### 1. Desktop-First
**Current State**: Optimized for desktop reading experience. Mobile responsive, but not mobile-optimized.

**Why**: Deliberation reading is document-heavy, best on larger screens.

**Not Prioritized**: Mobile-first redesign not planned (wrong use case).

### 2. Light Mode Only
**Current State**: Light mode default, no dark mode toggle.

**Why**: Document-heavy reading; light mode is standard for professional documents.

**Phase 2**: Dark mode if user feedback shows strong demand.

### 3. English Only
**Current State**: UI and AI prompts in English only.

**Phase 2**: Internationalization if expanding to non-English markets.

## Performance Limitations

### 1. Deliberation Latency
**Expected**: 2-5 minutes for complete deliberation (4 initial positions + up to 3 cross-exam rounds).

**Not Instant**: Real Claude API calls take time. This is inherent to the product.

### 2. Concurrent Deliberations
**Current State**: Inngest handles queuing, but dozens of simultaneous deliberations will queue behind each other.

**Phase 2**: Optimize for scale once user volume justifies infrastructure investment.

## Cost Considerations

### 1. Claude API Costs
**Per Deliberation**: Approximately 7-10 Claude API calls (4 initial + 6-9 cross-exam reactions + 1 synthesis).

**High Token Usage**: Large pitch decks consume significant tokens per call.

**Future**: May need tiered pricing based on deliberation complexity/length.

### 2. Storage Costs
**Vercel Blob**: Charged per GB stored. Large deal document portfolios will incur ongoing storage costs.

**Future**: May need cleanup policy for old deliberations.

## Honest Assessment

### What This MVP IS:
- A genuinely novel four-persona cross-examination mechanism
- A real, production-grade implementation of dissent preservation
- A functional tool for solo investors and small funds evaluating real deals

### What This MVP IS NOT:
- A comprehensive portfolio management platform
- A deal-sourcing or matchmaking tool
- A replacement for human judgment (the human makes the final decision)
- An instant, one-click analysis (real deliberation takes real time)

## Reporting Issues

If you encounter limitations NOT documented here, please report:
- GitHub Issues: [link]
- Email: support@yourdomain.com

We maintain honest, transparent documentation of what the platform can and cannot do.

---

Last Updated: Initial MVP implementation
This document will be updated as features are added and limitations are addressed.
