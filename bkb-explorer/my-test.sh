#!/bin/bash

# My Test Pipeline
# Runs minimal pipeline with selected Test views (Transaction, Order, Financial Account, Payment, Position, DP)
#
# This script:
#   1. Generates Test domain data from conceptspeak fixtures
#   2. Cleans output to keep only selected views
#   3. Runs domain-forge for Test domain
#   4. Runs ontology-lift for Test domain
#   5. Generates bkb-explorer visualization
#
# Usage: ./my-test.sh

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
SEMANTIC_PLATFORM="/Users/luke/claude/semantic-platform"
CONCEPTSPEAK="$SEMANTIC_PLATFORM/conceptspeak"
DOMAIN_FORGE="$SEMANTIC_PLATFORM/domain-forge"
ONTOLOGY_LIFT="$SEMANTIC_PLATFORM/ontology-lift"
BKB_EXPLORER="/Users/luke/claude/bkb-explorer"

# Utility functions
print_stage() {
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}  Stage $1: $2${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Start
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║     MY TEST PIPELINE (6 views)                             ║${NC}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# Stage 1: ConceptSpeak - Generate Test domain from fixtures
# ============================================================================
print_stage "1/5" "ConceptSpeak - Generate Test domain"

cd "$CONCEPTSPEAK"
./create-test-data.sh

print_success "Test data generated"

# ============================================================================
# Stage 2: Clean all outputs - keep only selected Test views
# ============================================================================
print_stage "2/5" "Clean outputs - keep selected views"

# Files to keep in Test domain
KEEP_FILES="Investment_Transaction.json Investment_Order.json Investment_Financial_Account.json Investment_Payment.json InvestmentPosition.json dp_edi_aum.json"

# Clean conceptspeak/output
echo -e "${BLUE}Cleaning conceptspeak/output...${NC}"
cd "$CONCEPTSPEAK/output"
for dir in */; do
    if [ "$dir" != "Test/" ]; then
        echo "  Removing conceptspeak/output/$dir"
        rm -rf "$dir"
    fi
done
cd Test
for file in *; do
    keep=false
    for keep_file in $KEEP_FILES; do
        if [ "$file" = "$keep_file" ]; then
            keep=true
            break
        fi
    done
    if [ "$keep" = false ]; then
        echo "  Removing conceptspeak/output/Test/$file"
        rm -f "$file"
    fi
done

# Clean domain-forge/output
echo -e "${BLUE}Cleaning domain-forge/output...${NC}"
cd "$DOMAIN_FORGE/output"
for dir in */; do
    if [ "$dir" != "Test/" ]; then
        echo "  Removing domain-forge/output/$dir"
        rm -rf "$dir"
    fi
done

# Clean ontology-lift/output
echo -e "${BLUE}Cleaning ontology-lift/output...${NC}"
cd "$ONTOLOGY_LIFT/output"
for dir in */; do
    if [ "$dir" != "Test/" ]; then
        echo "  Removing ontology-lift/output/$dir"
        rm -rf "$dir"
    fi
done

# Clean bkb-explorer/input symlinks
echo -e "${BLUE}Cleaning bkb-explorer/input symlinks...${NC}"
cd "$BKB_EXPLORER/input"
for link in */; do
    link_name="${link%/}"
    if [ "$link_name" != "Test" ]; then
        echo "  Removing bkb-explorer/input/$link_name"
        rm -f "$link_name"
    fi
done

# Clean bkb-explorer/output (cached data)
echo -e "${BLUE}Cleaning bkb-explorer/output...${NC}"
cd "$BKB_EXPLORER/output"
for dir in */; do
    if [ "$dir" != "Test/" ]; then
        echo "  Removing bkb-explorer/output/$dir"
        rm -rf "$dir"
    fi
done
# Also remove domains.js to force regeneration
rm -f domains.js

print_success "Cleaned: only Test domain remains"

# ============================================================================
# Stage 3: Domain Forge - Consolidate Test domain
# ============================================================================
print_stage "3/5" "Domain Forge - Consolidate Test domain"

cd "$DOMAIN_FORGE"
./run.sh domain Test

print_success "Domain consolidation complete"

# ============================================================================
# Stage 4: Ontology Lift - Map Test domain to FIBO
# ============================================================================
print_stage "4/5" "Ontology Lift - FIBO Mapping"

cd "$ONTOLOGY_LIFT"
./run.sh domain Test

print_success "Ontology lift complete"

# ============================================================================
# Stage 5: BKB Explorer - Generate visualization data
# ============================================================================
print_stage "5/5" "BKB Explorer - Generate visualization"

cd "$BKB_EXPLORER"
./run.sh

print_success "Explorer data generated"

# ============================================================================
# Complete
# ============================================================================
echo ""
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║              MY TEST COMPLETE ✓                            ║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Output:${NC}"
echo -e "  Domain Graph: $DOMAIN_FORGE/output/Test/domain.json"
echo -e "  Ontology:     $ONTOLOGY_LIFT/output/Test/ontology.json"
echo -e "  Glossary:     $ONTOLOGY_LIFT/output/Test/glossary.md"
echo ""
echo -e "${BOLD}Next:${NC} open $BKB_EXPLORER/index.html"
echo ""
