# QuorumAI

**Four sharp minds. One honest verdict — dissent included.**

QuorumAI is a multi-agent investment committee deliberation platform for solo angel investors, small fund GPs, and lean venture teams. Upload real deal materials, and four distinct AI committee personas independently analyze from genuinely different analytical lenses, cross-examine each other's specific claims across multiple rounds, and produce a structured memo that explicitly preserves genuine disagreement rather than averaging it away into false consensus.

## The Core Innovation

Unlike typical AI deal-analysis tools that provide one model's single opinion, QuorumAI reproduces the real value of an investment committee: **productive friction between genuinely different analytical perspectives**.

Four fixed personas:
- **Market Skeptic** - Challenges market sizing, competitive landscape, demand assumptions
- **Financial Diligence Specialist** - Scrutinizes unit economics, projections, internal consistency
- **Founder & Team Evaluator** - Assesses founder-market fit, track record, team gaps
- **Risk & Legal Specialist** - Identifies structural, regulatory, IP, and deal-term risks

The platform's output is NOT a single blended recommendation. It's a real, structured memo showing:
- **Consensus** - Claims all four personas agree on
- **Resolved** - Claims where personas conceded during cross-examination (with reasoning preserved)
- **Unresolved Dissent** - Genuine disagreement that survived scrutiny, with all distinct positions shown verbatim

**Dissent is a first-class, persisted data structure, never averaged away.**

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma 5.x
- **Auth**: Clerk (multi-tenant Organizations)
- **AI**: Anthropic Claude API (claude-sonnet-4)
- **Background Jobs**: Inngest (multi-round deliberation pipeline)
- **Storage**: Vercel Blob (deal documents)
- **Deployment**: Vercel + Neon + Inngest Cloud

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm
- PostgreSQL database (Neon recommended)
- Anthropic API key
- Clerk account
- Vercel Blob storage
- Inngest account

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/quorumai.git
cd quorumai
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Claude API key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_WEBHOOK_SIGNING_SECRET` - Clerk webhook secret
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token
- `RESEND_API_KEY` - Resend email API key
- `INNGEST_EVENT_KEY` - Inngest event key
- `INNGEST_SIGNING_KEY` - Inngest signing key

4. Set up the database:
```bash
npm run db:push
```

5. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
quorumai/
├── prisma/
│   └── schema.prisma          # Complete data model
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (marketing)/       # Public marketing site
│   │   ├── (auth)/            # Clerk authentication
│   │   ├── (app)/             # Authenticated application
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── deliberation/      # Persona badges, claim cards, cross-exam turns
│   │   ├── memo/              # Dissent panel, consensus/resolved sections
│   │   ├── dashboard/         # Analytics charts
│   │   ├── marketing/         # Landing page components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── ai/                # Claude client, persona configs, generation logic
│   │   ├── deliberation/      # Stability detection, dissent-preservation guardrail
│   │   ├── documents/         # PDF/DOCX parsing
│   │   ├── auth/              # RBAC, context
│   │   └── db.ts              # Prisma client
│   ├── inngest/
│   │   └── functions/         # Background deliberation pipeline
│   ├── hooks/                 # React hooks
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
└── docs/
    ├── DECISIONS.md           # Architecture decision record
    ├── SECURITY.md            # Security documentation
    └── KNOWN_LIMITATIONS.md   # Honest MVP limitations
```

## Key Features

### 1. Deal Intake
Upload real pitch decks (PDF) and supporting financial documents. Automatic text extraction with honest "scanned image" fallback.

### 2. Live Deliberation Feed
Watch the committee debate unfold in real-time (SSE). See initial positions, then each cross-examination round's genuine challenges and responses.

### 3. Final Memo & Dissent
Structured output showing consensus, resolved concessions, and **genuine unresolved disagreement** preserved verbatim - never blended into false consensus.

### 4. PDF Export
Export complete memo with dissent structure intact for sharing with co-investors or LPs.

### 5. Deal-Flow Analytics
Track deliberations run, average rounds to stability, and dissent rate (% of deliberations with unresolved disagreement).

## The Dissent-Preservation Guardrail

The product's entire value rests on one promise: when personas genuinely disagree after real scrutiny, the final memo shows that disagreement honestly.

`src/lib/deliberation/validateDissentPreservation.ts` is the critical guardrail that:
1. Validates AI synthesis output against raw tracked claim data
2. Rejects any synthesis that collapses genuine disagreement into false consensus
3. Falls back to mechanical generation if AI synthesis fails validation twice

This deterministic validation ensures dissent is structurally difficult to fabricate away.

## Development

### Run tests:
```bash
npm run test
```

### Type checking:
```bash
npm run type-check
```

### Database management:
```bash
npm run db:studio    # Prisma Studio UI
npm run db:migrate   # Create migration
```

## Deployment

### Vercel + Neon + Inngest

1. **Create Neon database**:
   - Sign up at [neon.tech](https://neon.tech)
   - Create new project
   - Copy connection string to `DATABASE_URL`

2. **Set up Clerk**:
   - Create application at [clerk.com](https://clerk.com)
   - Enable Organizations
   - Copy API keys
   - Configure webhook for user/org sync

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   - Add all environment variables in Vercel dashboard
   - Enable Vercel Blob storage
   - Connect Neon database

4. **Set up Inngest**:
   - Create account at [inngest.com](https://inngest.com)
   - Get event and signing keys
   - Configure webhook endpoint: `https://your-domain.vercel.app/api/inngest`

5. **Run database migrations**:
   ```bash
   npm run db:push
   ```

The app will be live at your Vercel domain.

## Security & Privacy

- Multi-tenant isolation enforced at query layer
- Deal documents stored with private, signed, time-limited URLs
- No deal materials used for AI training (refer to Anthropic's current policy)
- Full org data export/deletion available
- Cross-org isolation tested automatically

## MVP Limitations

Explicitly excluded from MVP:
- Configurable persona count (fixed four personas)
- Portfolio tracking / post-investment monitoring
- Deal sourcing / matchmaking
- Multi-investor collaborative deliberation
- Subscription billing (Stripe integration in Phase 2)

See `docs/KNOWN_LIMITATIONS.md` for complete list.

## Contributing

This is a production SaaS application. Contributions should:
1. Maintain the dissent-preservation guarantee
2. Pass all tests including the critical guardrail tests
3. Follow TypeScript strict mode
4. Maintain cross-org security isolation
5. Document architectural decisions in `docs/DECISIONS.md`

## License

Proprietary - All Rights Reserved

## Support

For issues or questions:
- Documentation: `/docs`
- GitHub Issues: [github.com/YOUR_USERNAME/quorumai/issues](https://github.com/YOUR_USERNAME/quorumai/issues)

---

**QuorumAI** - Your AI committee doesn't always agree. That's the point.
