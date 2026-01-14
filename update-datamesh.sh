#!/bin/bash
#
# Datamesh Documentation Update Script
#
# Updates datamesh/ from source, converts .md to .html
# Overwrites the last commit to keep only current version in git history.
#
# Usage: ./update-datamesh.sh
#

set -e

SOURCE_DIR="$HOME/claude/semantic-platform/datamesh"
TARGET_DIR="datamesh"

echo "Updating datamesh documentation from source..."
echo ""
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_DIR"
echo ""

# Check if source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Check if we're in public directory
if [ ! -f "publish-datamesh.sh" ]; then
    echo "Must run from ~/claude/public directory"
    exit 1
fi

# Check for npx
if ! command -v npx &> /dev/null; then
    echo "Error: 'npx' not found. Install Node.js"
    exit 1
fi

# Save index.html if exists
INDEX_BACKUP=""
if [ -f "$TARGET_DIR/index.html" ]; then
    INDEX_BACKUP=$(cat "$TARGET_DIR/index.html")
fi

# Clean target directory (except index.html)
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Restore index.html
if [ -n "$INDEX_BACKUP" ]; then
    echo "$INDEX_BACKUP" > "$TARGET_DIR/index.html"
fi

# HTML template - GitHub-like minimal style
html_header() {
    local title="$1"
    cat << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
            color: #1f2328;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            border-bottom: 1px solid #d1d9e0;
            padding-bottom: .3em;
        }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.25em; border-bottom: none; }
        h4, h5, h6 { border-bottom: none; }
        a { color: #0969da; text-decoration: none; }
        a:hover { text-decoration: underline; }
        pre {
            background: #f6f8fa;
            padding: 16px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            border-radius: 6px;
            font-size: 85%;
            line-height: 1.45;
            max-width: 100%;
        }
        @media (max-width: 767px) {
            body { padding: 16px; }
            pre { font-size: 12px; padding: 12px; }
        }
        code {
            background: rgba(175,184,193,0.2);
            padding: .2em .4em;
            border-radius: 6px;
            font-size: 85%;
        }
        pre code { background: none; padding: 0; font-size: 100%; }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }
        th, td {
            border: 1px solid #d1d9e0;
            padding: 6px 13px;
        }
        th { background: #f6f8fa; font-weight: 600; }
        tr:nth-child(2n) { background: #f6f8fa; }
        blockquote {
            border-left: .25em solid #d1d9e0;
            margin: 0;
            padding: 0 1em;
            color: #656d76;
        }
        hr { border: none; border-top: 1px solid #d1d9e0; margin: 24px 0; }
        ul, ol { padding-left: 2em; }
        li + li { margin-top: .25em; }
    </style>
</head>
<body>
EOF
}

html_footer() {
    echo "</body></html>"
}

# Convert .md files to .html
echo "Converting .md files to .html..."

find "$SOURCE_DIR" -name "*.md" | while read -r mdfile; do
    # Get relative path
    relpath="${mdfile#$SOURCE_DIR/}"
    dirname_part=$(dirname "$relpath")
    basename_part=$(basename "$relpath" .md)

    # Create target directory
    if [ "$dirname_part" != "." ]; then
        mkdir -p "$TARGET_DIR/$dirname_part"
        htmlfile="$TARGET_DIR/$dirname_part/$basename_part.html"
    else
        htmlfile="$TARGET_DIR/$basename_part.html"
    fi

    # Get title from first heading or filename
    title=$(grep -m1 "^# " "$mdfile" | sed 's/^# //' || echo "$basename_part")
    if [ -z "$title" ]; then
        title="$basename_part"
    fi

    # Convert
    {
        html_header "$title"
        npx -y marked "$mdfile"
        html_footer
    } > "$htmlfile"

    # Replace .md links with .html
    sed -i '' 's/\.md\([)"'"'"']\)/\.html\1/g' "$htmlfile"
    sed -i '' 's/\.md<\/a>/.html<\/a>/g' "$htmlfile"

    # Add IDs to headings for TOC links
    python3 -c "
import re
import sys

with open('$htmlfile', 'r') as f:
    content = f.read()

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s]+', '-', text)
    return text.strip('-')

def add_id(match):
    tag = match.group(1)
    content = match.group(2)
    slug = slugify(re.sub(r'<[^>]+>', '', content))
    return f'<h{tag} id=\"{slug}\">{content}</h{tag}>'

content = re.sub(r'<h([1-6])>([^<]+)</h\1>', add_id, content)

with open('$htmlfile', 'w') as f:
    f.write(content)
"

    echo "  $relpath -> ${htmlfile#$TARGET_DIR/}"
done

echo ""
echo "Conversion complete"
echo ""

# Update index.html with .html links - GitHub-like style
cat > "$TARGET_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Datamesh Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
            color: #1f2328;
        }
        h1, h2 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            border-bottom: 1px solid #d1d9e0;
            padding-bottom: .3em;
        }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        a { color: #0969da; text-decoration: none; }
        a:hover { text-decoration: underline; }
        ul { padding-left: 2em; }
        li { margin: .25em 0; }
    </style>
</head>
<body>
    <h1>Datamesh Documentation</h1>

    <h2>Governance</h2>
    <ul>
        <li><a href="GOV-DM-001-data-mesh-governance.html">GOV-DM-001 - Data Mesh Governance</a></li>
        <li><a href="GOV-DM-002-naming-convention.html">GOV-DM-002 - Naming Convention</a></li>
        <li><a href="GOV-DM-003-domain-hierarchy.html">GOV-DM-003 - Domain Hierarchy</a></li>
        <li><a href="GOV-DM-004-operating-model.html">GOV-DM-004 - Operating Model</a></li>
    </ul>

    <h2>Catalogs</h2>
    <ul>
        <li><a href="catalogs/gcc-dp-catalog.html">GCC Data Product Catalog</a></li>
        <li><a href="catalogs/investment-dp-catalog.html">Investment Data Product Catalog</a></li>
        <li><a href="catalogs/test-dp-catalog.html">Test Data Product Catalog</a></li>
    </ul>

    <h2>Reference</h2>
    <ul>
        <li><a href="reference/dpcc-catalog-2026-01-08.html">DPCC Catalog</a></li>
        <li><a href="reference/gcc-storage-mvp2-2026-01-08.html">GCC Storage MVP2</a></li>
    </ul>

    <h2>Review</h2>
    <ul>
        <li><a href="review/2026-01-08-domain-composability-framework.html">Domain Composability Framework</a></li>
        <li><a href="review/2026-01-08-domain-dp-edi-aum-analysis.html">Domain DP EDI AUM Analysis</a></li>
        <li><a href="review/2026-01-08-gcc-dp-catalog-review.html">GCC DP Catalog Review</a></li>
    </ul>

    <h2>Templates</h2>
    <ul>
        <li><a href="templates/dp-discovery-questionnaire.html">Data Product Discovery Questionnaire</a></li>
    </ul>
</body>
</html>
EOF

echo "Index updated"
echo ""

# Git operations
git add "$TARGET_DIR/"

if git diff --cached --quiet; then
    echo "No changes detected"
    exit 0
fi

echo "Changes detected:"
git diff --cached --stat
echo ""

# Check if last commit was a datamesh update
LAST_COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "")
if [[ "$LAST_COMMIT_MSG" == *"datamesh"* ]]; then
    echo "Amending last commit (keeping only current version in history)..."
    git commit --amend --no-edit
    echo ""
    echo "Commit amended"
    echo ""
    echo "Next step: Force push to publish"
    echo "   git push --force"
else
    echo "Creating new commit (last commit was not a datamesh update)..."
    git commit -m "Update datamesh documentation"
    echo ""
    echo "Commit created"
    echo ""
    echo "Next step: Push to publish"
    echo "   git push"
fi
