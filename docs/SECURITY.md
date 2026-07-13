# Security Documentation

## Overview

QuorumAI handles genuinely sensitive data: real startup pitch decks containing non-public financial information, cap tables, and strategic plans. Security and data privacy are non-negotiable requirements.

## Multi-Tenant Isolation

### Database Level
Every model with organization-scoped data enforces `organizationId` filtering at the query layer. Cross-org data access is structurally prevented by:

1. **Mandatory organizationId filtering** in all queries
2. **Automated cross-org isolation tests** in CI/CD
3. **Index optimization** on `organizationId` for performance

### Example Pattern:
```typescript
// GOOD - enforces org isolation
const deals = await db.deal.findMany({
  where: {
    organizationId: auth.organizationId, // Required
    status: DealStatus.INTAKE,
  },
});

// BAD - would leak data across orgs
const deals = await db.deal.findMany({
  where: {
    status: DealStatus.INTAKE, // Missing organizationId filter
  },
});
```

## Document Storage Security

### Vercel Blob
- All deal documents stored with **private access**
- Access via **signed, time-limited URLs** only
- No publicly guessable URLs
- URL signing happens server-side only

### Document Access Pattern:
```typescript
import { put } from '@vercel/blob';

// Upload with private access
const blob = await put(filename, file, {
  access: 'public', // Public with signed URLs, not publicly listable
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

// Generate signed URL for time-limited access
const signedUrl = generateSignedUrl(blob.url, expiresIn);
```

## Secrets Management

### Environment Variables
Never commit secrets to version control. All secrets must be:
- Defined in `.env` (gitignored)
- Documented in `.env.example` (no actual values)
- Configured in Vercel environment variables for production

### Build-Time Secret Leak Prevention:
```bash
# Run before every deployment
grep -r "sk-ant-api" dist/
grep -r "ANTHROPIC_API_KEY" dist/
# Should return no matches in built client code
```

### Protected Secrets:
- `ANTHROPIC_API_KEY` - Never exposed to client
- `CLERK_SECRET_KEY` - Server-only
- `BLOB_READ_WRITE_TOKEN` - Server-only
- `RESEND_API_KEY` - Server-only
- `INNGEST_SIGNING_KEY` - Server-only
- `DATABASE_URL` - Server-only

## Authentication & Authorization

### Clerk Integration
- Multi-tenant Organizations model
- Webhook-based user/org sync
- Webhook signature verification required

### RBAC (Role-Based Access Control)
Two roles: `ORG_ADMIN` and `ANALYST`

Permission matrix documented in `src/lib/auth/permissions.ts`.

### API Route Protection:
```typescript
import { requireOrgAuth } from '@/lib/auth/context';
import { requirePermission } from '@/lib/auth/permissions';

export async function POST(request: Request) {
  const auth = await requireOrgAuth();
  requirePermission('deals:create', auth.role);
  
  // Protected logic here
}
```

## Data Privacy

### AI Training Data
**Policy**: No deal materials used for AI model training.

Current implementation relies on Anthropic's [current data usage policy](https://www.anthropic.com/legal/commercial-terms). Monitor policy changes and update documentation accordingly.

### Data Retention
- Organizations can export all their data
- Organizations can request complete data deletion
- Deletion cascades properly via Prisma `onDelete: Cascade`

### PII Handling
Minimal PII collected:
- Email (required for auth)
- Full name (required for attribution)
- IP address and user agent (audit logs only)

## Audit Logging

### AuditLogEntry Model
Immutable, append-only log of all significant actions:
- Who performed the action (`userId`)
- Which organization (`organizationId`)
- What action (`action`)
- When (`createdAt`)
- Additional context (`metadata` JSON)

### Logged Actions:
- Deal creation
- Deliberation start/completion
- Final decision recording
- Member invitations/removals
- Document uploads

## API Security

### Rate Limiting
(Phase 2 - not in MVP)
Recommend Vercel's built-in rate limiting or Upstash Redis-based middleware.

### Input Validation
All API inputs validated with Zod schemas:
- Client-side validation (react-hook-form + zod)
- Server-side validation (same schemas shared)
- Type-safe end-to-end

### CORS
Default Next.js CORS policy (same-origin only).

## Webhook Security

### Clerk Webhooks
- Signature verification using `@svix` library
- Webhook secret configured in Clerk dashboard
- Replay attack prevention via timestamp validation

### Inngest Webhooks
- Signing key verification
- Automatic retry with exponential backoff
- Event deduplication

## Database Security

### Connection Security
- TLS-encrypted connections to Neon
- Connection pooling via Prisma
- Credentials never logged or exposed

### SQL Injection Prevention
Prisma's parameterized queries prevent SQL injection. Never use raw SQL unless absolutely necessary, and always use parameterized queries when you do.

## Client-Side Security

### XSS Prevention
- React's automatic escaping
- CSP headers (configure in `next.config.js`)
- No `dangerouslySetInnerHTML` without sanitization

### CSRF Protection
- Next.js automatic CSRF tokens for mutations
- SameSite cookie policy

## Sensitive Data in Logs

### Logging Policy
- Never log full document contents
- Never log API keys or tokens
- Log request IDs, not full payloads
- Structured logging with log levels

### Sensitive Fields
These should NEVER appear in logs:
- `ANTHROPIC_API_KEY`
- `CLERK_SECRET_KEY`
- Full deal document text (log truncated previews only)
- User passwords (not stored anyway - Clerk handles auth)

## Incident Response

### Data Breach Response Plan
1. Immediately rotate all API keys and secrets
2. Notify affected organizations within 24 hours
3. Investigate extent of exposure via audit logs
4. Document incident in security log
5. Implement preventive measures

### Contact
Security issues: [security@yourdomain.com](mailto:security@yourdomain.com)

## Security Checklist

Before production deployment:

- [ ] All secrets configured in Vercel environment variables
- [ ] No secrets committed to git history
- [ ] Build-time secret leak grep check passes
- [ ] Cross-org isolation tests passing in CI
- [ ] Webhook signature verification enabled
- [ ] Clerk Organizations configured correctly
- [ ] Database connection uses TLS
- [ ] Vercel Blob uses private access
- [ ] RBAC tests passing
- [ ] Audit logging enabled for all significant actions
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting configured (Phase 2)

## Compliance Notes

### GDPR Considerations
- Right to access: Full data export available
- Right to deletion: Complete org deletion available
- Right to portability: JSON export format
- Data minimization: Only essential PII collected

### SOC 2 (Future)
Current implementation includes foundational controls:
- Audit logging
- Access control
- Data encryption in transit and at rest
- Incident response procedures

Formal SOC 2 compliance is a Phase 2 goal.

---

Last Updated: Initial implementation
Security is a continuous process. This document should be reviewed quarterly and updated as the platform evolves.
