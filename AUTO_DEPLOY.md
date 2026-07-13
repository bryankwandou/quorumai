# QuorumAI - Automatic GitHub & Vercel Deployment

## 🚀 ONE-COMMAND GITHUB REPOSITORY CREATION

### Using GitHub CLI (Recommended - Fastest)

```bash
# Navigate to project
cd E:\GUMROAD\quorumai

# Create repository and push (auto-creates unique repo)
gh repo create quorumai --public --source=. --remote=origin --push --description "Multi-Agent Investment Committee Platform - Four AI personas with genuine dissent preservation"
```

**Your repository will be live at:** `https://github.com/YOUR_USERNAME/quorumai`

### Manual Alternative (If GitHub CLI not installed)

1. Install GitHub CLI: https://cli.github.com/
2. Or create manually at: https://github.com/new
   - Name: `quorumai`
   - Public repository
   - Then run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/quorumai.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 ONE-CLICK VERCEL DEPLOYMENT (Unique URL Guaranteed)

### Method 1: Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `quorumai` repository
4. Vercel auto-detects Next.js ✅
5. Click "Deploy"

**Vercel automatically generates a unique URL:**
- Primary: `quorumai-[unique-hash].vercel.app`
- Example: `quorumai-abc123xyz789.vercel.app`
- Also: `quorumai-git-main-[your-username].vercel.app`

### Method 2: Vercel CLI (For Power Users)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (creates unique production URL)
cd E:\GUMROAD\quorumai
vercel --prod

# Your unique URL will be printed in the output
```

## ⚙️ ENVIRONMENT VARIABLES (Required After Deployment)

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# === REQUIRED FOR MVP ===

# Database (Get from Neon: https://neon.tech)
DATABASE_URL=postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require

# AI Provider (Get from: https://console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-api03-[your-key-here]

# Authentication (Get from: https://clerk.com)
CLERK_SECRET_KEY=sk_test_[your-key]
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_[your-key]
CLERK_WEBHOOK_SIGNING_SECRET=whsec_[your-secret]

# Email (Get from: https://resend.com)
RESEND_API_KEY=re_[your-key]

# Background Jobs (Get from: https://inngest.com)
INNGEST_EVENT_KEY=[your-event-key]
INNGEST_SIGNING_KEY=[your-signing-key]

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-unique-app.vercel.app

# Vercel Blob (Auto-configured by Vercel)
BLOB_READ_WRITE_TOKEN=[auto-generated-when-you-enable-blob-storage]
```

## 📦 QUICK SETUP FOR EACH SERVICE

### 1. Neon Database (PostgreSQL)
```
1. Sign up: https://neon.tech
2. Create project: "QuorumAI Production"
3. Copy connection string
4. Add to Vercel as DATABASE_URL
```

### 2. Anthropic Claude API
```
1. Sign up: https://console.anthropic.com
2. API Keys → Create new
3. Copy key (starts with sk-ant-api03-)
4. Add to Vercel as ANTHROPIC_API_KEY
```

### 3. Clerk Authentication
```
1. Sign up: https://clerk.com
2. Create application: "QuorumAI"
3. Enable Organizations (Settings → Organizations)
4. Copy Secret Key and Publishable Key
5. Add to Vercel
```

### 4. Resend Email
```
1. Sign up: https://resend.com
2. Create API key
3. Add to Vercel as RESEND_API_KEY
```

### 5. Inngest Background Jobs
```
1. Sign up: https://inngest.com
2. Create workspace: "QuorumAI"
3. Copy Event Key and Signing Key
4. Add to Vercel
```

### 6. Vercel Blob Storage
```
1. In Vercel Dashboard → Storage tab
2. Create Blob Storage
3. Token auto-added to environment ✅
```

## 🔧 POST-DEPLOYMENT CONFIGURATION

### Step 1: Push Database Schema

After environment variables are set:

```bash
# Set DATABASE_URL in local .env
echo DATABASE_URL=your-neon-url-here > .env

# Install dependencies
npm install

# Push schema to database
npm run db:push

# Verify in Neon dashboard - you should see all tables
```

### Step 2: Configure Clerk Webhook

```
1. Clerk Dashboard → Webhooks → Add Endpoint
2. URL: https://your-unique-app.vercel.app/api/webhooks/clerk
3. Events: Select all user.*, organization.*, organizationMembership.*
4. Copy Signing Secret
5. Add to Vercel as CLERK_WEBHOOK_SIGNING_SECRET
6. Redeploy: git push (or click Redeploy in Vercel)
```

### Step 3: Configure Inngest Webhook

```
1. Inngest Dashboard → Apps → Add
2. URL: https://your-unique-app.vercel.app/api/inngest
3. Inngest auto-verifies ✅
```

## 🎨 CUSTOM DOMAIN (Optional - Make It Memorable)

### Option 1: Use Vercel's Auto-Generated URL
Your app is already live at: `quorumai-[unique-hash].vercel.app`

### Option 2: Add Your Own Domain

```
1. Buy domain (Namecheap, Google Domains, etc.)
   Suggestions:
   - quorumai.com
   - quorumai.ai
   - [yourname]-quorum.ai
   - dealquorum.ai

2. Vercel Dashboard → Domains → Add
3. Follow DNS configuration instructions
4. Update NEXT_PUBLIC_APP_URL in Vercel
5. Update webhook URLs in Clerk and Inngest
```

## ✅ DEPLOYMENT VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Visit your Vercel URL - landing page loads
- [ ] Click "Start Evaluating Deals" - redirects to Clerk sign-up
- [ ] Sign up with email - redirected to create organization
- [ ] Create organization - successful
- [ ] Check Neon dashboard - User and Organization records exist
- [ ] Check Vercel deployment logs - no errors
- [ ] Check Inngest dashboard - app connected
- [ ] GitHub Actions CI - all tests passing

## 🔄 CONTINUOUS DEPLOYMENT

Every push to `main` branch auto-deploys to Vercel:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel automatically:
# 1. Runs build
# 2. Runs tests
# 3. Deploys to production
# 4. Updates your unique URL
```

## 🐛 TROUBLESHOOTING

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Run `npm run build` locally to reproduce

### Database connection errors
- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure SSL mode is in connection string

### Clerk authentication not working
- Verify all three Clerk env vars are set
- Check Organizations feature is enabled
- Verify webhook is configured with correct URL

### Inngest jobs not running
- Check Inngest dashboard for app connection
- Verify INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY
- Check webhook URL matches deployment URL

## 📊 YOUR DEPLOYMENT URLS

After following this guide, you'll have:

**Primary Application:**
```
https://quorumai-[unique-hash].vercel.app
```

**GitHub Repository:**
```
https://github.com/YOUR_USERNAME/quorumai
```

**Alternative URLs (Vercel provides multiple):**
```
https://quorumai-[your-username].vercel.app
https://quorumai-git-main-[your-username].vercel.app
```

**Custom Domain (if configured):**
```
https://your-custom-domain.com
```

## 📈 MONITORING

Access these dashboards:

- **Vercel**: https://vercel.com/dashboard - Deployments, analytics, logs
- **GitHub**: https://github.com/YOUR_USERNAME/quorumai - Code, CI/CD, issues
- **Neon**: https://console.neon.tech - Database metrics, queries
- **Inngest**: https://app.inngest.com - Background jobs, retries
- **Clerk**: https://dashboard.clerk.com - Users, organizations, auth

## 💰 COST ESTIMATE (MVP Scale)

- **Vercel**: $0 (Hobby) or $20/month (Pro)
- **Neon**: $0 (Free tier) - 0.5GB storage
- **Clerk**: $0 - Up to 10k monthly active users
- **Inngest**: $0 (Free tier) - Generous limits
- **Anthropic Claude**: ~$0.50-2.00 per deliberation (pay-per-use)
- **Resend**: $0 - 3k emails/month

**Total for development/testing: $0-20/month**

## 🎯 NEXT STEPS

1. ✅ GitHub repo created
2. ✅ Vercel deployed (unique URL)
3. ✅ Environment variables configured
4. ✅ Database schema pushed
5. ✅ Webhooks configured
6. ⏳ Complete remaining UI components
7. ⏳ Implement all API routes
8. ⏳ Build marketing site
9. ⏳ Add custom domain

## 🚀 YOU'RE LIVE!

Your QuorumAI platform is now:
- ✅ Version controlled on GitHub
- ✅ Deployed to production on Vercel
- ✅ Accessible via unique URL
- ✅ Auto-deploying on every push
- ✅ Ready for development

**Share your unique URL:**
`https://quorumai-[your-unique-hash].vercel.app`

---

Built with precision. Four AI personas. Genuine dissent preserved. 🎯
