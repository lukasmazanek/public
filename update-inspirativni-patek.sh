#!/bin/bash
# Update inspirativni-patek from presentation-room source
# Keeps only the latest version in git (amends last update commit)

set -e

cd "$(dirname "$0")"

SOURCE="../presentation-room/events/inspirativni-patek"
DEST="inspirativni-patek"

echo "Updating inspirativni-patek from source..."

# Copy files (keeping only the specified ones)
cp "$SOURCE/slides-ascii-design.md" "$DEST/"
cp "$SOURCE/outline.md" "$DEST/"
cp "$SOURCE/pro-speakery.md" "$DEST/"

echo "Files copied:"
ls -la "$DEST/"*.md

# Check if last commit was an inspirativni-patek update
LAST_MSG=$(git log -1 --pretty=%s 2>/dev/null || echo "")

if [[ "$LAST_MSG" == *"Update inspirativni-patek"* ]]; then
    echo ""
    echo "Last commit was inspirativni-patek update. Amending..."
    git add "$DEST/"
    git commit --amend --no-edit
    echo ""
    echo "Done. Run: git push --force"
else
    echo ""
    echo "Creating new commit..."
    git add "$DEST/"
    git commit -m "Update inspirativni-patek from source"
    echo ""
    echo "Done. Run: git push"
fi
