#!/bin/bash
# BUG-011 Regression Test: Verify run.sh updates domains.js after single domain

# Exit on error
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=== BUG-011 Regression Test ==="
echo "Testing: run.sh domain mode updates domains.js"
echo ""

# 1. Backup domains.js if exists
DOMAINS_FILE="output/domains.js"
if [ -f "$DOMAINS_FILE" ]; then
    BACKUP="${DOMAINS_FILE}.backup"
    cp "$DOMAINS_FILE" "$BACKUP"
    echo "Backed up existing domains.js"
fi

# 2. Remove domains.js to test fresh generation
rm -f "$DOMAINS_FILE"
echo "Removed domains.js"

# 3. Run single domain mode
echo ""
echo "Running: ./run.sh domain Test"
./run.sh domain Test > /dev/null 2>&1

# 4. Verify domains.js was regenerated
if [ ! -f "$DOMAINS_FILE" ]; then
    echo "FAIL: domains.js was not generated!"
    # Restore backup
    if [ -f "$BACKUP" ]; then
        mv "$BACKUP" "$DOMAINS_FILE"
    fi
    exit 1
fi

echo "PASS: domains.js was generated"

# 5. Verify Test domain is in domains.js
if grep -q '"Test"' "$DOMAINS_FILE"; then
    echo "PASS: Test domain found in domains.js"
else
    echo "FAIL: Test domain NOT found in domains.js!"
    # Restore backup
    if [ -f "$BACKUP" ]; then
        mv "$BACKUP" "$DOMAINS_FILE"
    fi
    exit 1
fi

# 6. Verify output contains "Regenerating domains hierarchy..."
echo ""
echo "Verifying output message..."
OUTPUT=$(./run.sh domain Test 2>&1 | grep -c "Regenerating domains hierarchy" || true)
if [ "$OUTPUT" -gt 0 ]; then
    echo "PASS: 'Regenerating domains hierarchy' message present"
else
    echo "FAIL: Expected 'Regenerating domains hierarchy' message"
    exit 1
fi

# Cleanup
if [ -f "$BACKUP" ]; then
    rm "$BACKUP"
fi

echo ""
echo "=== BUG-011 Regression Test: ALL PASSED ==="
exit 0
