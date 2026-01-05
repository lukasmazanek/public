#!/bin/bash
#
# BKB Explorer Publication Control
#
# Usage:
#   ./publish-bkb.sh enable   - Enable bkb-explorer publication
#   ./publish-bkb.sh disable  - Disable bkb-explorer publication
#   ./publish-bkb.sh status   - Show current publication status
#

set -e

GITIGNORE_FILE=".gitignore"
BKB_LINE="bkb-explorer/"

show_usage() {
    cat << EOF
BKB Explorer Publication Control

Usage:
  $0 enable   - Enable bkb-explorer publication to GitHub Pages
  $0 disable  - Disable bkb-explorer publication (add to .gitignore)
  $0 status   - Show current publication status

Examples:
  # Enable publication
  $0 enable
  git add .
  git commit -m "Enable bkb-explorer publication"
  git push

  # Disable publication
  $0 disable
  git add .gitignore
  git commit -m "Disable bkb-explorer publication"
  git push

EOF
}

check_status() {
    if grep -q "^${BKB_LINE}$" "$GITIGNORE_FILE" 2>/dev/null; then
        echo "❌ DISABLED - bkb-explorer/ is in .gitignore (not published)"
        return 1
    else
        echo "✅ ENABLED - bkb-explorer/ will be published to GitHub Pages"
        return 0
    fi
}

enable_publication() {
    if grep -q "^${BKB_LINE}$" "$GITIGNORE_FILE" 2>/dev/null; then
        # Remove the line
        sed -i '' "/^${BKB_LINE}$/d" "$GITIGNORE_FILE"
        echo "✅ Publication ENABLED"
        echo ""
        echo "Next steps:"
        echo "  git add ."
        echo "  git commit -m 'Enable bkb-explorer publication'"
        echo "  git push"
    else
        echo "✅ Already enabled"
    fi
}

disable_publication() {
    if grep -q "^${BKB_LINE}$" "$GITIGNORE_FILE" 2>/dev/null; then
        echo "❌ Already disabled"
    else
        # Add the line if not present
        echo "$BKB_LINE" >> "$GITIGNORE_FILE"
        echo "❌ Publication DISABLED"
        echo ""
        echo "Next steps:"
        echo "  git rm -r --cached bkb-explorer/"
        echo "  git add .gitignore"
        echo "  git commit -m 'Disable bkb-explorer publication'"
        echo "  git push"
    fi
}

# Main
case "${1:-}" in
    enable)
        enable_publication
        ;;
    disable)
        disable_publication
        ;;
    status)
        check_status
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
