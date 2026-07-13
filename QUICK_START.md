# QuorumAI - Quick Start Guide

## 🚀 AUTO-CREATE GITHUB REPO & DEPLOY TO VERCEL

This guide will help you automatically create a GitHub repository and deploy to Vercel with a unique, production-ready URL.

## Prerequisites

- GitHub account
- Vercel account (sign up at vercel.com)
- GitHub CLI installed (optional but recommended): https://cli.github.com/

## Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Fastest - Recommended)

```bash
# Navigate to project
cd E:\GUMROAD\quorumai

# Authenticate with GitHub (if not already)
gh auth login

# Create repository and push
gh repo create quorumai --public --source=. --remote=origin --push --description "Multi-Agent Investment Committee Deliberation Platform - Four AI personas that preserve genuine dissent"

# Done! Repository created at: https://github.com/YOUR_USERNAME/quorumai
```

### Option B: Manual GitHub Creation

```bash
# 1. Go to: https://github.com/new
# 2. Repository name: quorumai
# 3. Description: "Multi-Agent Investment Committee Deliberation Platform"
# 4. Public or Private (your choice)
# 5. Do NOT initialize with README (we already have one)
# 6. Click "Create repository"

# 7. Link and push from local:
cd E:\GUMROAD\quorumai
git remote add origin https://github.com/YOUR_USERNAME/quorumai.git
git branch -M main
git push -u origin main
```

## Step 2: Auto-Deploy to Vercel (Unique URL)

### Option A: One-Click Vercel Deployment (Easiest)

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `quorumai` repository
4. Vercel will auto-detect Next.js settings ✅
5. Click "Deploy"
6. **Your unique Vercel URL will be automatically generated**: 
   - Format: `quorumai-[unique-hash].vercel.app`
   - Example: `quorumai-9x4k2p.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project
cd E:\GUMROAD\quorumai

# Login to Vercel
vercel login

# Deploy (will create unique URL automatically)
vercel --prod

# Copy the deployment URL from output
# Example: https://quorumai-abc123.vercel.app
```

## Step 3: Set Up Environment Variables

After deployment, you need to configure environment variables in Vercel:

### Required Environment Variables

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-[your-key]

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_[your-key]
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_[your-key]
CLERK_WEBHOOK_SIGNING_SECRET=whsec_[your-secret]

# Vercel Blob (Auto-configured when you enable Vercel Blob Storage)
BLOB_READ_WRITE_TOKEN=[auto-generated]

# Resend Email
RESEND_API_KEY=re_[your-key]

# Inngest Background Jobs
INNGEST_EVENT_KEY=[your-key]
INNGEST_SIGNING_KEY=[your-key]

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-unique-app.vercel.app
```

### Quick Setup for Each Service:

**1. Neon Database (Free tier available)**
- Sign up: https://neon.tech
- Create project → Copy connection string
- Paste into `DATABASE_URL`

**2. Anthropic Claude API**
- Sign up: https://console.anthropic.com
- API Keys → Create → Copy
- Paste into `ANTHROPIC_API_KEY`

**3. Clerk Authentication**
- Sign up: https://clerk.com
- Create application → Enable Organizations
- Copy API keys from dashboard
- Paste into Clerk variables

**4. Vercel Blob Storage**
- In Vercel Dashboard → Storage → Create Blob Storage
- Token auto-generated ✅

**5. Resend Email**
- Sign up: https://resend.com
- Create API key
- Paste into `RESEND_API_KEY`

**6. Inngest Background Jobs**
- Sign up: https://inngest.com
- Create workspace → Copy keys
- Paste into Inngest variables

## Step 4: Deploy Database Schema

After environment variables are set:

```bash
# Set DATABASE_URL in local .env file (copy from Vercel)
echo "DATABASE_URL=your-neon-url" > .env

# Install dependencies
npm install

# Push Prisma schema to database
npm run db:push

# Verify schema in Neon dashboard
```

## Step 5: Configure Post-Deployment Webhooks

### Clerk Webhook:
1. Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `https://your-unique-app.vercel.app/api/webhooks/clerk`
3. Events: Select `user.*`, `organization.*`, `organizationMembership.*`
4. Copy signing secret → Add to Vercel as `CLERK_WEBHOOK_SIGNING_SECRET`
5. Redeploy: `vercel --prod` (or push to GitHub main branch)

### Inngest Webhook:
1. Inngest Dashboard → Apps → Add
2. URL: `https://your-unique-app.vercel.app/api/inngest`
3. Inngest will auto-verify ✅

## Step 6: Add Custom Domain (Optional but Recommended)

### Get a Unique, Professional Domain

1. **Buy domain** (Namecheap, Google Domains, etc.):
   - Suggestion: `quorumai-[yourname].com` or `[yourname]-quorum.ai`

2. **Add to Vercel**:
   - Vercel Dashboard → Domains → Add
   - Enter your domain → Follow DNS instructions

3. **Update environment variables**:
   ```env
   NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
   ```

4. **Update webhooks** to use custom domain

## Step 7: Verify Deployment

### Test checklist:

✅ Visit your Vercel URL
✅ Landing page loads correctly
✅ Click "Start Evaluating Deals" → Clerk sign-up works
✅ Create organization
✅ Check Neon dashboard → User and Organization records created
✅ (Full deliberation testing requires implementing remaining features)

## 🎉 Your QuorumAI Platform is Live!

**Your unique URLs:**
- **Primary**: `https://quorumai-[unique-id].vercel.app`
- **GitHub**: `https://github.com/YOUR_USERNAME/quorumai`
- **Custom** (if configured): `https://your-domain.com`

## Next Steps: Complete MVP Implementation

The current deployment includes:
✅ Complete infrastructure
✅ Database schema
✅ Auth system
✅ Persona configurations
✅ Critical guardrails (dissent preservation, stability detection)
✅ Document parsing
✅ Test suite
✅ Landing page

**To complete the full MVP**, you need to implement:

1. **Inngest deliberation pipeline** (`src/inngest/functions/runDeliberation.ts`)
2. **API routes** (`src/app/api/*`)
3. **Application UI** (`src/app/(app)/*`)
4. **React components** (`src/components/*`)
5. **Cross-examination engine** (`src/lib/ai/runCrossExamRound.ts`)
6. **Memo synthesis** (`src/lib/ai/compileMemo.ts`)

These are partially scaffolded. Follow the comprehensive spec in the initial prompt to complete each phase systematically.

## Development Workflow

```bash
# Local development
npm run dev

# Run tests
npm run test:run

# Type check
npm run type-check

# Deploy to production
git add .
git commit -m "feat: implement X feature"
git push origin main
# Vercel auto-deploys on push to main ✅
```

## Monitoring & Maintenance

- **Vercel Dashboard**: Monitor deployments, performance, logs
- **Neon Dashboard**: Monitor database usage, queries
- **Inngest Dashboard**: Monitor background jobs, retries
- **Clerk Dashboard**: Monitor auth, user growth
- **GitHub Actions**: CI/CD status, test results

## Troubleshooting

**Build fails on Vercel:**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `npm run build` works locally

**Database connection issues:**
- Verify `DATABASE_URL` is correct
- Check Neon database is running
- Run `npm run db:push` to sync schema

**Clerk authentication not working:**
- Verify all three Clerk env vars are set
- Check Organizations feature is enabled in Clerk dashboard
- Verify webhook is configured correctly

## Cost Estimates (MVP Scale)

- **Vercel**: Free tier (hobby) or $20/month (Pro)
- **Neon**: Free tier (0.5GB) or $19/month (3GB)
- **Clerk**: Free up to 10k MAUs
- **Inngest**: Free tier (generous)
- **Anthropic**: Pay-per-use (~$0.50-2.00/deliberation)
- **Resend**: Free 3k emails/month

**Total**: ~$0-50/month for development/testing

## Support & Resources

- **Full Documentation**: See `README.md` and `DEPLOYMENT_GUIDE.md`
- **Architecture Decisions**: See `docs/DECISIONS.md`
- **Security Notes**: See `docs/SECURITY.md`
- **Known Limitations**: See `docs/KNOWN_LIMITATIONS.md`

---

**Questions or issues?** 
Create an issue on GitHub: `https://github.com/YOUR_USERNAME/quorumai/issues`

**Ready to build the full MVP?**
Follow the 10-phase implementation plan in the original spec document.
