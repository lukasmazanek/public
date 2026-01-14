#!/bin/bash
# init-input.sh - Initialize symbolic links from ontology-lift output to bkb-explorer input
#
# Purpose: Set up read-only symbolic links following Pipeline Immutability Principle
# Links top-level domain trees from ontology-lift/output → bkb-explorer/input
#
# Structure created:
#   input/Test → ../../semantic-platform/ontology-lift/output/Test
#   input/RBCZ → ../../semantic-platform/ontology-lift/output/RBCZ
#
# Usage: ./init-input.sh

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEMANTIC_PLATFORM="${CLAUDE:-$SCRIPT_DIR/..}/semantic-platform"
ONTOLOGY_LIFT_OUTPUT="$SEMANTIC_PLATFORM/ontology-lift/output"
INPUT_DIR="$SCRIPT_DIR/input"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "Initializing input directory symbolic links..."
echo ""

# Check if ontology-lift output exists
if [ ! -d "$ONTOLOGY_LIFT_OUTPUT" ]; then
    echo -e "${RED}✗ Error: ontology-lift output directory not found${NC}"
    echo "  Expected: $ONTOLOGY_LIFT_OUTPUT"
    echo "  Please run ontology-lift pipeline first"
    exit 1
fi

echo -e "${GREEN}✓ Found ontology-lift output${NC}"
echo "  Directory: $ONTOLOGY_LIFT_OUTPUT"
echo ""

# Create input directory if it doesn't exist
if [ ! -d "$INPUT_DIR" ]; then
    echo "Creating input directory..."
    mkdir -p "$INPUT_DIR"
    echo -e "${GREEN}✓ Created${NC} $INPUT_DIR"
else
    echo -e "${GREEN}✓ Input directory exists${NC}"
fi

# Find all top-level directories in ontology-lift output
echo -e "${BLUE}Scanning for top-level domains...${NC}"
echo ""

linked_count=0
updated_count=0

while IFS= read -r domain_dir; do
    # Skip if empty or not a directory
    [ -z "$domain_dir" ] && continue
    [ ! -d "$ONTOLOGY_LIFT_OUTPUT/$domain_dir" ] && continue

    # Target symlink path
    input_path="$INPUT_DIR/$domain_dir"

    # Relative path from input dir to ontology-lift output
    relative_path="../../semantic-platform/ontology-lift/output/$domain_dir"

    # Create or update symlink
    if [ -L "$input_path" ]; then
        # Symlink exists, check if it points to the right place
        LINK_TARGET="$(readlink "$input_path")"

        if [ "$LINK_TARGET" = "$relative_path" ]; then
            # Already correct, skip
            :
        else
            echo -e "${YELLOW}! Updating${NC} $domain_dir"
            rm "$input_path"
            ln -s "$relative_path" "$input_path"
            updated_count=$((updated_count + 1))
        fi
    elif [ -e "$input_path" ]; then
        # File/directory exists but is not a symlink - error
        echo -e "${RED}✗ Error: $input_path exists but is not a symbolic link${NC}"
        echo "  Please remove it manually: rm -rf '$input_path'"
        exit 1
    else
        # Create new symlink
        ln -s "$relative_path" "$input_path"
        echo -e "${GREEN}+ Created${NC} $domain_dir → $relative_path"
        linked_count=$((linked_count + 1))
    fi
done < <(
    # List top-level directories in ontology-lift output
    ls -1 "$ONTOLOGY_LIFT_OUTPUT"
)

echo ""
echo "Summary:"
echo "  Input directory: $INPUT_DIR"
echo -e "  ${GREEN}Created:${NC} $linked_count symlinks"
if [ $updated_count -gt 0 ]; then
    echo -e "  ${YELLOW}Updated:${NC} $updated_count symlinks"
fi
echo ""
echo -e "${GREEN}✓ Input initialization complete${NC}"
