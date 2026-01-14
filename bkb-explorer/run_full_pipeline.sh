#!/bin/bash

# Full Semantic Pipeline Orchestrator
# Runs complete pipeline: miro-digest → conceptspeak → domain-forge → ontology-lift
#
# This script orchestrates all pipeline stages in sequence. Each stage reads
# from the previous stage's output via symlinks (Pipeline Immutability Principle).
#
# Pipeline Flow:
#   1. miro-digest:    Download Miro boards → extract frames
#   2. conceptspeak:   Parse Miro/DataContract → ConceptSpeak JSON
#   3. domain-forge:   Consolidate concepts → Domain Graph JSON
#   4. ontology-lift:  Map to FIBO → OWL/Glossary
#   5. bkb-explorer:   Visualize domain graphs (manual: open index.html)
#
# Usage:
#   ./run_full_pipeline.sh [MODE] [DOMAIN]
#
# Modes:
#   all              Process entire pipeline for all domains (default)
#   domain <path>    Process single domain (e.g., RBCZ:MIB:Investment)
#   refresh-miro     Re-download Miro boards only, then process all
#   skip-miro        Skip Miro download, process existing data
#
# Examples:
#   ./run_full_pipeline.sh                           # Full pipeline, all domains
#   ./run_full_pipeline.sh domain RBCZ:MIB:Investment  # Single domain
#   ./run_full_pipeline.sh skip-miro                 # Use existing Miro data
#   ./run_full_pipeline.sh refresh-miro              # Re-download boards first

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
MIRO_DIGEST="$SEMANTIC_PLATFORM/miro-digest"
CONCEPTSPEAK="$SEMANTIC_PLATFORM/conceptspeak"
DOMAIN_FORGE="$SEMANTIC_PLATFORM/domain-forge"
ONTOLOGY_LIFT="$SEMANTIC_PLATFORM/ontology-lift"
BKB_EXPLORER="$SEMANTIC_PLATFORM/ontology-lift/bkb-explorer"

# Parse arguments
MODE="all"
DOMAIN=""
SKIP_MIRO=false
REFRESH_MIRO=false

# Process all arguments
while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help)
            cat << EOF
${BOLD}${BLUE}Full Semantic Pipeline Orchestrator${NC}

Runs complete pipeline: miro-digest → conceptspeak → domain-forge → ontology-lift

${BOLD}Usage:${NC}
  $0 [FLAGS] [MODE] [DOMAIN]

${BOLD}Flags:${NC}
  --skip-miro      Skip Miro download, use existing data
  --refresh-miro   Re-download Miro boards only, then stop
  -h, --help       Show this help

${BOLD}Modes:${NC}
  all              Process entire pipeline for all domains (default)
  domain <path>    Process single domain (e.g., RBCZ:MIB:Investment)

${BOLD}Examples:${NC}
  $0                                    # Full pipeline, all domains
  $0 domain RBCZ:MIB:Investment         # Single domain only
  $0 --skip-miro                        # All domains, skip Miro download
  $0 --skip-miro domain Test            # Test domain (from fixtures, skip Miro)
  $0 --refresh-miro                     # Re-download boards only

${BOLD}Pipeline Stages:${NC}
  1. miro-digest    Download Miro boards + extract frames
  2. conceptspeak   Parse Miro/DataContract → ConceptSpeak JSON
  3. domain-forge   Consolidate concepts → Domain Graph JSON
  4. ontology-lift  Map to FIBO → OWL/Glossary
  5. bkb-explorer   Visualize (manual: open index.html)
EOF
            exit 0
            ;;
        --skip-miro|-s)
            SKIP_MIRO=true
            shift
            ;;
        --refresh-miro|-r)
            REFRESH_MIRO=true
            shift
            ;;
        all)
            MODE="all"
            shift
            ;;
        domain)
            MODE="domain"
            shift
            DOMAIN="$1"
            if [ -z "$DOMAIN" ]; then
                echo -e "${RED}Error: domain mode requires domain path${NC}"
                echo "Usage: $0 domain <path>"
                exit 1
            fi
            shift
            ;;
        *)
            echo -e "${RED}Error: Unknown argument '$1'${NC}"
            echo "Run '$0 --help' for usage information"
            exit 1
            ;;
    esac
done

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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Start pipeline
clear
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║                                                            ║${NC}"
echo -e "${BOLD}${BLUE}║          SEMANTIC PLATFORM - FULL PIPELINE                 ║${NC}"
echo -e "${BOLD}${BLUE}║                                                            ║${NC}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Configuration:${NC}"
echo -e "  Mode:        ${YELLOW}$MODE${NC}"
if [ "$MODE" = "domain" ]; then
    echo -e "  Domain:      ${YELLOW}$DOMAIN${NC}"
fi
if [ "$SKIP_MIRO" = true ]; then
    print_warning "Skipping Miro download (using existing data)"
fi
if [ "$REFRESH_MIRO" = true ]; then
    print_warning "Refreshing Miro boards only, then processing all"
fi
echo -e "  Platform:    ${BLUE}$SEMANTIC_PLATFORM${NC}"
echo ""
read -p "Press Enter to start pipeline (Ctrl+C to cancel)..."

# ============================================================================
# Stage 1: Miro Digest - Download boards and extract frames
# ============================================================================
if [ "$SKIP_MIRO" = false ]; then
    print_stage "1/4" "Miro Digest - Download & Extract Frames"

    cd "$MIRO_DIGEST"
    ./run.sh

    print_success "Miro digest complete"

    # If refresh-miro mode, stop here
    if [ "$REFRESH_MIRO" = true ]; then
        echo ""
        print_success "Miro boards refreshed successfully"
        echo ""
        echo "Run without 'refresh-miro' flag to continue processing:"
        echo "  $0"
        exit 0
    fi
else
    print_warning "Skipping Stage 1: Miro Digest (using existing data)"
fi

# ============================================================================
# Stage 2: ConceptSpeak - Parse Miro/DataContract to ConceptSpeak JSON
# ============================================================================
print_stage "2/4" "ConceptSpeak - Parse to ConceptSpeak JSON"

cd "$CONCEPTSPEAK"

if [ "$MODE" = "domain" ]; then
    # Special handling for Test domain (generated from test fixtures)
    if [ "$DOMAIN" = "Test" ]; then
        print_warning "Test domain: Regenerating from test fixtures"
        ./create-test-data.sh
    else
        # Single domain - process only that domain's files
        print_warning "Processing single domain: $DOMAIN"
        ./run.sh all -d "$DOMAIN"
    fi
else
    # All domains
    ./run.sh all
fi

print_success "ConceptSpeak parsing complete"

# ============================================================================
# Stage 3: Domain Forge - Consolidate concepts to Domain Graph
# ============================================================================
print_stage "3/4" "Domain Forge - Consolidate Domain Graph"

cd "$DOMAIN_FORGE"

if [ "$MODE" = "domain" ]; then
    # Single domain
    ./run.sh domain "$DOMAIN"
else
    # All domains
    ./run.sh all
fi

print_success "Domain consolidation complete"

# ============================================================================
# Stage 4: Ontology Lift - Map to FIBO, generate OWL/Glossary
# ============================================================================
print_stage "4/4" "Ontology Lift - FIBO Mapping & Export"

cd "$ONTOLOGY_LIFT"

if [ "$MODE" = "domain" ]; then
    # Single domain
    ./run.sh domain "$DOMAIN"
else
    # All domains
    ./run.sh all
fi

print_success "Ontology lift complete"

# ============================================================================
# Pipeline Complete
# ============================================================================
echo ""
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║                                                            ║${NC}"
echo -e "${BOLD}${GREEN}║              PIPELINE COMPLETE ✓                           ║${NC}"
echo -e "${BOLD}${GREEN}║                                                            ║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Output Locations:${NC}"
echo ""
echo -e "  ${BLUE}1. Miro Frames:${NC}"
echo -e "     $MIRO_DIGEST/output/frames/*.json"
echo ""
echo -e "  ${BLUE}2. ConceptSpeak JSON:${NC}"
echo -e "     $CONCEPTSPEAK/output/**/*.json"
echo ""
echo -e "  ${BLUE}3. Domain Graphs:${NC}"
echo -e "     $DOMAIN_FORGE/output/**/domain.json"
echo ""
echo -e "  ${BLUE}4. Ontology Outputs:${NC}"
echo -e "     $ONTOLOGY_LIFT/output/**/ontology.json  (FIBO-mapped)"
echo -e "     $ONTOLOGY_LIFT/output/**/glossary.md    (Business glossary)"
echo -e "     $ONTOLOGY_LIFT/output/**/ontology.ttl   (OWL/RDF)"
echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo ""
echo -e "  ${GREEN}1.${NC} Update BKB Explorer data:"
echo -e "     cd $BKB_EXPLORER"
echo -e "     ./init-input.sh"
echo ""
echo -e "  ${GREEN}2.${NC} Open BKB Explorer in browser:"
echo -e "     open $BKB_EXPLORER/index.html"
echo ""
echo -e "  ${GREEN}3.${NC} Review glossaries:"
echo -e "     find $ONTOLOGY_LIFT/output -name glossary.md"
echo ""
