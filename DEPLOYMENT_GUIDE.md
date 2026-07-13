# QuorumAI - Complete Deployment Guide

## Phase 1: Create GitHub Repository

### Step 1: Initialize Git Repository Locally

```bash
cd E:\GUMROAD\quorumai

# Initialize git if not already done
git init

# Add all files
git add .

# Initial commit
git commit -m "feat: initial QuorumAI MVP implementation

- Complete Prisma schema with multi-tenant isolation
- Four real committee personas with distinct analytical lenses
- Dissent-preservation guardrail (core product value)
- Stability detection for cross-examination stopping
- Document parsing (PDF/DOCX)
- Auth infrastructure (Clerk + RBAC)
- Complete folder structure and configuration"
```

### Step 2: Create GitHub Repository

**Option A: Via GitHub CLI (if installed)**
```bash
# Install GitHub CLI if needed: https://cli.github.com/
gh auth login
gh repo create quorumai --public --source=. --remote=origin --push
```

**Option B: Via GitHub Web Interface**
1. Go to https://github.com/new
2. Repository name: `quorumai`
3. Description: "Multi-Agent Investment Committee Deliberation Platform - Four AI personas independently analyze deals, cross-examine each other, and preserve genuine dissent"
4. Choose: **Public** (or Private if preferred)
5. Do NOT initialize with README, .gitignore, or license (we already have them)
6. Click "Create repository"

7. Link local repo to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/quorumai.git
git branch -M main
git push -u origin main
```

### Step 3: Configure GitHub Repository Settings

1. **Branch Protection** (Settings → Branches)
   - Protect `main` branch
   - Require pull request reviews
   - Require status checks to pass (once CI is set up)

2. **Repository Description**
   - Add topics: `ai`, `investment-analysis`, `multi-agent`, `nextjs`, `anthropic-claude`, `venture-capital`

3. **About Section**
   - Website: (will add Vercel URL after deployment)
   - Description: "Four sharp minds. One honest verdict — dissent included."

## Phase 2: Set Up External Services

### A. Neon Database (PostgreSQL)

1. Sign up at https://neon.tech
2. Create new project: "QuorumAI Production"
3. Copy connection string:
   ```
   postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require
   ```
4. Save as `DATABASE_URL` (needed for Vercel env vars)

### B. Anthropic Claude API

1. Sign up at https://console.anthropic.com
2. Navigate to API Keys
3. Create new API key: "QuorumAI Production"
4. Copy key (starts with `sk-ant-api03-`)
5. Save as `ANTHROPIC_API_KEY`

### C. Clerk Authentication

1. Sign up at https://clerk.com
2. Create new application: "QuorumAI"
3. Enable **Organizations** feature:
   - Dashboard → Organizations → Enable
   - Set "Organization membership" to required
4. Copy API keys:
   - `CLERK_SECRET_KEY` (Secret Key)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Publishable Key)
5. Configure webhook (do this AFTER Vercel deployment):
   - Dashboard → Webhooks → Add Endpoint
   - URL: `https://your-app.vercel.app/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `organization.created`, `organizationMembership.created`
   - Copy `CLERK_WEBHOOK_SIGNING_SECRET`

### D. Vercel Blob Storage

1. Will be configured during Vercel deployment
2. Blob storage is automatically available in Vercel projects
3. Token will be generated and provided as `BLOB_READ_WRITE_TOKEN`

### E. Resend Email

1. Sign up at https://resend.com
2. Create API key: "QuorumAI Production"
3. Copy key: `RESEND_API_KEY`
4. (Optional) Verify your sending domain for production emails

### F. Inngest Background Jobs

1. Sign up at https://inngest.com
2. Create new workspace: "QuorumAI"
3. Copy credentials:
   - `INNGEST_EVENT_KEY`
   - `INNGEST_SIGNING_KEY`
4. Configure webhook (do AFTER Vercel deployment):
   - Add app URL: `https://your-app.vercel.app/api/inngest`

## Phase 3: Deploy to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Connect GitHub Repository to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/new
2. Import your GitHub repository: `quorumai`
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave default)
   - **Install Command**: `npm install`

4. **Environment Variables** - Add all these:
   ```
   DATABASE_URL=postgresql://...
   ANTHROPIC_API_KEY=sk-ant-api03-...
   CLERK_SECRET_KEY=sk_...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
   BLOB_READ_WRITE_TOKEN=(will be auto-generated)
   RESEND_API_KEY=re_...
   INNGEST_EVENT_KEY=...
   INNGEST_SIGNING_KEY=...
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

5. Click **Deploy**

**Option B: Via Vercel CLI**

```bash
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? (your account)
# Link to existing project? No
# Project name? quorumai
# Directory? ./
# Override settings? No

# After deployment, add environment variables:
vercel env add DATABASE_URL
vercel env add ANTHROPIC_API_KEY
# ... (add all other env vars)

# Redeploy with env vars:
vercel --prod
```

### Step 3: Enable Vercel Blob Storage

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Blob**
4. Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables
5. Redeploy if needed

### Step 4: Run Database Migrations

After first deployment, you need to push the schema to your database:

**Option A: Via Vercel CLI**
```bash
# Set DATABASE_URL in your local .env
DATABASE_URL="your-neon-connection-string"

# Push schema
npm run db:push
```

**Option B: Via GitHub Actions** (Recommended for production)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npx prisma generate
      - run: npx prisma db push
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Step 5: Configure Post-Deployment Webhooks

**Clerk Webhook:**
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/clerk`
3. Select events: `user.*`, `organization.*`, `organizationMembership.*`
4. Copy webhook secret and add as `CLERK_WEBHOOK_SIGNING_SECRET` in Vercel env vars

**Inngest Webhook:**
1. Go to Inngest Dashboard
2. Add app: `https://your-app.vercel.app/api/inngest`
3. Inngest will verify the endpoint automatically

### Step 6: Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test sign-up flow (Clerk)
3. Create test organization
4. Check database in Neon dashboard - should see User and Organization records
5. Test deal upload (small test PDF)
6. Verify Inngest dashboard shows deliberation job starting

## Phase 4: Custom Domain (Optional)

### Add Custom Domain

1. Purchase domain (Namecheap, Google Domains, etc.)
2. In Vercel project → Settings → Domains
3. Add your domain: `quorumai.com`
4. Configure DNS records as instructed by Vercel:
   ```
   A record: @ → 76.76.21.21
   CNAME: www → cname.vercel-dns.com
   ```
5. Wait for DNS propagation (up to 48 hours)
6. Update environment variables:
   ```
   NEXT_PUBLIC_APP_URL=https://quorumai.com
   ```
7. Update Clerk and Inngest webhook URLs to use custom domain

## Phase 5: Monitoring & Observability

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor performance, Core Web Vitals

### Sentry Error Tracking

1. Sign up at https://sentry.io
2. Create project: "QuorumAI"
3. Copy DSN
4. Add to Vercel env vars:
   ```
   SENTRY_DSN=https://...@sentry.io/...
   ```
5. Vercel has built-in Sentry integration

### Inngest Dashboard

Monitor background jobs:
- Deliberation pipeline execution
- Retry attempts
- Error rates

### Neon Database Monitoring

- Connection pool usage
- Query performance
- Storage usage

## Phase 6: Post-Deployment Configuration

### Update Repository README

Update GitHub repo README.md with live Vercel URL:
```markdown
## Live Demo

🚀 **[Live Application](https://quorumai.vercel.app)**
```

### Configure GitHub About Section

Add website URL: `https://quorumai.vercel.app`

### Test Complete Flow

1. Sign up with test email
2. Create organization
3. Upload real test pitch deck PDF
4. Start deliberation
5. Watch live feed
6. Verify final memo shows dissent correctly
7. Export PDF
8. Verify email notification sent

## Maintenance & Updates

### Deploy Updates

1. Commit changes to git:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

2. Vercel automatically deploys from `main` branch

### Database Migrations

When schema changes:
```bash
# Create migration
npx prisma migrate dev --name descriptive_name

# Commit migration files
git add prisma/migrations
git commit -m "db: add new table for X"
git push

# Migration runs automatically on Vercel deployment
```

### Environment Variable Updates

```bash
# Via Vercel CLI
vercel env add NEW_VAR_NAME

# Or via Vercel dashboard → Settings → Environment Variables
```

## Troubleshooting

### Build Fails on Vercel

Check Vercel build logs for specific errors:
- Missing environment variables
- TypeScript errors
- Prisma generation issues

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Neon database is running
- Verify IP allowlist (Neon allows all by default)

### Inngest Jobs Not Running

- Check Inngest webhook is configured: `https://your-app.vercel.app/api/inngest`
- Verify `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
- Check Inngest dashboard for errors

### Clerk Auth Issues

- Verify Clerk environment variables
- Check webhook is configured correctly
- Ensure Organizations feature is enabled

### Blob Upload Fails

- Verify `BLOB_READ_WRITE_TOKEN` exists
- Check Vercel Blob storage is enabled
- Verify file size limits (Vercel Blob has limits)

## Security Checklist

Before announcing to users:

- [ ] All environment variables configured
- [ ] No secrets committed to git (check git history)
- [ ] Clerk webhook signature verification enabled
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] Database connection uses SSL
- [ ] Cross-org isolation tests passing
- [ ] Rate limiting configured (recommend Vercel KV + middleware)
- [ ] Error messages don't leak sensitive info
- [ ] GDPR compliance reviewed (if applicable)

## Cost Monitoring

### Monthly Cost Estimates (MVP scale)

- **Vercel**: Free tier for hobby, Pro $20/month for production
- **Neon**: Free tier (0.5GB), $19/month for 3GB
- **Anthropic Claude**: ~$0.50-2.00 per deliberation (model usage)
- **Clerk**: Free up to 10k MAUs, then $25/month
- **Inngest**: Free tier generous, ~$20/month for moderate usage
- **Vercel Blob**: $0.15/GB stored
- **Resend**: Free 3k emails/month, then $20/month

Estimate for 100 deliberations/month: **$50-100/month**

## Support

Issues? Check:
- GitHub Issues: https://github.com/YOUR_USERNAME/quorumai/issues
- Vercel Support: https://vercel.com/support
- Neon Docs: https://neon.tech/docs
- Clerk Docs: https://clerk.com/docs

---

**Deployment Complete! 🚀**

Your QuorumAI platform is now live and ready to help investors make better-informed decisions with genuine multi-perspective analysis.
