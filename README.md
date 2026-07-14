# QuorumAI

**When perspectives clash by design.**

QuorumAI helps solo investors and small funds analyze deals through multiple specialized viewpoints. Upload pitch materials, and four analyst personas examine the opportunity from distinct angles — market viability, financial health, team capability, and structural risk. They debate specific points across several rounds, and the platform delivers a report showing where they align and where they split, without forcing artificial agreement.

## The Core Innovation

Standard analysis tools provide one model's single viewpoint. QuorumAI reproduces the value of multiple perspectives through debate between specialized analyst roles.

Four analyst types:
- **Market Analyst** - Questions sizing claims, competitive position, demand evidence
- **Finance Specialist** - Examines economics, projections, calculation consistency  
- **Team Evaluator** - Reviews founder background, execution history, organizational structure
- **Risk Assessor** - Identifies regulatory exposure, structural concerns, legal complexity

The output preserves distinct viewpoints rather than blending them:
- **Aligned findings** - Points where all analysts agree
- **Resolved debates** - Claims where an analyst conceded after examination
- **Unresolved splits** - Genuine disagreement that survived scrutiny, with each position shown separately

**Conflict becomes structured data, not something to eliminate.**

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
- npm package manager
- PostgreSQL database (Neon recommended)
- Anthropic API access
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

Required variables:
- `DATABASE_URL` - Neon PostgreSQL connection
- `ANTHROPIC_API_KEY` - Claude API access
- `CLERK_SECRET_KEY` - Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Client auth
- `CLERK_WEBHOOK_SIGNING_SECRET` - Webhook validation
- `BLOB_READ_WRITE_TOKEN` - File storage
- `RESEND_API_KEY` - Email delivery
- `INNGEST_EVENT_KEY` - Background jobs
- `INNGEST_SIGNING_KEY` - Job validation

4. Set up the database:
```bash
npm run db:push
```

5. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

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
Upload pitch decks (PDF) and supporting documents. Text extraction handles standard formats with clear notification when scanned images need manual entry.

### 2. Live Analysis Feed
Watch the review unfold in sequence: initial positions from each analyst, then challenge rounds where they examine each other's reasoning.

### 3. Final Report Structure
The output separates consensus points, resolved debates, and persistent disagreement. When analysts reach different conclusions after examination, both positions appear with their supporting logic.

### 4. PDF Export
Download the complete report with the same structural separation intact.

### 5. Analysis Metrics
Track reviews over time, average rounds to resolution, and frequency of unresolved splits across your deal pipeline.

## The Conflict Validation Layer

The platform includes a validation step that checks synthesis output against underlying analyst positions. This prevents the system from smoothing over actual disagreement.

`src/lib/deliberation/validateDissentPreservation.ts` performs this check:
1. Compares synthesis output to raw analyst position data
2. Rejects output that collapses distinct viewpoints into single statements
3. Falls back to mechanical generation if synthesis fails validation twice

This structural approach makes it difficult to accidentally eliminate conflict information.

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
