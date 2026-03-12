#!/bin/bash
#
# Bratislavská Web Update Script
#
# Rebuilds DB, encrypts, and syncs to public repo.
# Overwrites last commit to keep only current version in git history.
#
# Usage: ./update-bratislavska.sh
#

set -e

SOURCE_DIR="$HOME/claude/bratislavska"
TARGET_DIR="bratislavska"

echo "📦 Updating Bratislavská web from source..."
echo ""

# Check if source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Check if we're in public directory
if [ ! -f "update-bratislavska.sh" ]; then
    echo "❌ Must run from ~/claude/public directory"
    exit 1
fi

# Rebuild DB + encrypt
echo "🔄 Rebuilding SQLite..."
python3 "$SOURCE_DIR/scripts/yaml_to_sqlite.py"
echo ""

if [ -z "$WEB_DB_PASSWORD" ]; then
    echo -n "🔑 Encryption password: "
    read -s WEB_DB_PASSWORD
    echo ""
    export WEB_DB_PASSWORD
fi

echo "🔒 Encrypting DB..."
WEB_DB_PASSWORD="$WEB_DB_PASSWORD" python3 "$SOURCE_DIR/scripts/encrypt_db.py"
echo ""

# Sync web files
echo "🔄 Syncing web files..."
mkdir -p "$TARGET_DIR"
cp "$SOURCE_DIR/web/index.html" "$TARGET_DIR/"
cp "$SOURCE_DIR/web/app.js" "$TARGET_DIR/"
cp "$SOURCE_DIR/web/style.css" "$TARGET_DIR/"
cp "$SOURCE_DIR/web/bratislavska.db.enc" "$TARGET_DIR/"

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

# Check if last commit was a bratislavska update
LAST_COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "")
if [[ "$LAST_COMMIT_MSG" == *"Update bratislavska"* ]] || [[ "$LAST_COMMIT_MSG" == *"bratislavska"* ]]; then
    echo "🔄 Amending last commit (keeping only current version in history)..."
    git commit --amend --no-edit
    echo ""
    echo "✅ Commit amended"
    echo ""
    echo "⚠️  Next step: Force push to publish"
    echo "   git push --force"
else
    echo "📝 Creating new commit..."
    git commit -m "Update bratislavska web

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
    echo ""
    echo "✅ Commit created"
    echo ""
    echo "⚠️  Next step: Push to publish"
    echo "   git push"
fi
