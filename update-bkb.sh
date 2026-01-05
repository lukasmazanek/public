#!/bin/bash
#
# BKB Explorer Update Script
#
# Updates bkb-explorer from source and overwrites the last commit
# to keep only current version in git history.
#
# Usage: ./update-bkb.sh
#

set -e

SOURCE_DIR="$HOME/claude/bkb-explorer"
TARGET_DIR="bkb-explorer"

echo "📦 Updating BKB Explorer from source..."
echo ""
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_DIR"
echo ""

# Check if source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Check if we're in public directory
if [ ! -f "publish-bkb.sh" ]; then
    echo "❌ Must run from ~/claude/public directory"
    exit 1
fi

# Sync from source
echo "🔄 Syncing files..."
rsync -av --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='logs' \
  --exclude='test-screenshots' \
  --exclude='.pytest_cache' \
  --exclude='input' \
  "$SOURCE_DIR/" "$TARGET_DIR/"

echo ""
echo "✅ Files synced"
echo ""

# Git status
git add "$TARGET_DIR/"

if git diff --cached --quiet; then
    echo "ℹ️  No changes detected"
    exit 0
fi

echo "📝 Changes detected:"
git diff --cached --stat
echo ""

# Check if last commit was a bkb update
LAST_COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "")
if [[ "$LAST_COMMIT_MSG" == *"Update bkb-explorer"* ]] || [[ "$LAST_COMMIT_MSG" == *"bkb-explorer"* ]]; then
    echo "🔄 Amending last commit (keeping only current version in history)..."
    git commit --amend --no-edit
    echo ""
    echo "✅ Commit amended"
    echo ""
    echo "⚠️  Next step: Force push to publish"
    echo "   git push --force"
else
    echo "📝 Creating new commit (last commit was not a bkb update)..."
    git commit -m "Update bkb-explorer from source

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
    echo ""
    echo "✅ Commit created"
    echo ""
    echo "⚠️  Next step: Push to publish"
    echo "   git push"
fi

echo ""
echo "📊 Summary:"
echo "  - Source data synced"
echo "  - Git commit ready"
echo "  - Run 'git push' or 'git push --force' to publish"
