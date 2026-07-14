#!/bin/bash

echo "========================================"
echo "QuorumAI - Auto GitHub + Vercel Deploy"
echo "========================================"
echo ""

echo "[1/3] Creating GitHub Repository..."
gh repo create quorumai --public --source=. --remote=origin --push --description "Multi-Agent Investment Committee Platform - Four AI personas with genuine dissent preservation"

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: GitHub CLI not found or authentication failed"
    echo ""
    echo "Please install GitHub CLI from: https://cli.github.com/"
    echo "Then run: gh auth login"
    echo ""
    echo "Alternatively, create repo manually at: https://github.com/new"
    exit 1
fi

echo ""
echo "[2/3] GitHub Repository Created Successfully!"
echo "Repository: https://github.com/$(git config user.name)/quorumai"
echo ""

echo "[3/3] Opening Vercel Deployment..."
echo ""
echo "Visit this URL to deploy to Vercel:"
echo "https://vercel.com/new/clone?repository-url=https://github.com/$(git config user.name)/quorumai"
echo ""
echo "Or use Vercel CLI:"
echo "  npm install -g vercel"
echo "  vercel --prod"
echo ""

# Open browser (cross-platform)
if command -v xdg-open > /dev/null; then
    xdg-open https://vercel.com/new
elif command -v open > /dev/null; then
    open https://vercel.com/new
else
    start https://vercel.com/new
fi

echo "========================================"
echo "DEPLOYMENT INITIATED"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Deploy to get your unique URL (quorumai-[hash].vercel.app)"
echo "3. See AUTO_DEPLOY.md for complete setup guide"
echo ""
echo "Your app will be live at a unique Vercel URL after deployment!"
echo "========================================"
