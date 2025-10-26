#!/bin/bash

# 🎮 GTA 2D - GitHub Pages Auto-Setup Script
# Created by ZEROAGI-PRAKASH

echo "🚀 GitHub Pages Setup for GTA 2D"
echo "================================="
echo ""

# Check if gh CLI is authenticated
if gh auth status &>/dev/null; then
    echo "✅ Already authenticated with GitHub"
else
    echo "⚠️  Need to authenticate with GitHub first"
    echo "Run: gh auth login"
    echo ""
    echo "Steps:"
    echo "1. Select: GitHub.com"
    echo "2. Select: HTTPS"
    echo "3. Select: Login with a web browser"
    echo "4. Copy the code shown"
    echo "5. Press Enter to open browser"
    echo "6. Paste code and authorize"
    exit 1
fi

echo ""
echo "📦 Checking GitHub Pages status..."

# Check if Pages is already enabled
if gh api repos/ZEROAGI-prakash/fungta/pages &>/dev/null; then
    echo "✅ GitHub Pages is ALREADY ENABLED!"
    echo ""
    echo "📊 Current Status:"
    gh api repos/ZEROAGI-prakash/fungta/pages | jq '{status: .status, url: .html_url, source_branch: .source.branch}'
else
    echo "⚙️  Enabling GitHub Pages..."
    
    # Enable GitHub Pages
    gh api repos/ZEROAGI-prakash/fungta/pages \
        -X POST \
        -f source[branch]=main \
        -f source[path]=/ \
        -f build_type=legacy
    
    if [ $? -eq 0 ]; then
        echo "✅ GitHub Pages ENABLED successfully!"
    else
        echo "❌ Failed to enable GitHub Pages"
        echo "Try manually: https://github.com/ZEROAGI-prakash/fungta/settings/pages"
        exit 1
    fi
fi

echo ""
echo "🔍 Checking deployment status..."
gh run list --repo ZEROAGI-prakash/fungta --limit 3

echo ""
echo "🎉 SETUP COMPLETE!"
echo ""
echo "📍 Your game will be live at:"
echo "   🌐 https://prakashchoudhary.me/fungta/"
echo "   🌐 https://zeroagi-prakash.github.io/fungta/"
echo ""
echo "⏱️  Wait 2-3 minutes for deployment to complete"
echo ""
echo "🔍 Monitor deployment:"
echo "   gh run watch --repo ZEROAGI-prakash/fungta"
echo ""
echo "✅ Local game running at: http://localhost:3000"
echo ""
