#!/bin/bash
#
# Datamesh Publication Control
#
# Usage:
#   ./publish-datamesh.sh enable   - Enable datamesh publication
#   ./publish-datamesh.sh disable  - Disable datamesh publication
#   ./publish-datamesh.sh status   - Show current publication status
#

set -e

GITIGNORE_FILE=".gitignore"
DATAMESH_LINE="datamesh/"

show_usage() {
    cat << EOF
Datamesh Publication Control

Usage:
  $0 enable   - Enable datamesh publication to GitHub Pages
  $0 disable  - Disable datamesh publication (add to .gitignore)
  $0 status   - Show current publication status

Examples:
  # Enable publication
  $0 enable
  git add .
  git commit -m "Enable datamesh publication"
  git push

  # Disable publication
  $0 disable
  git rm -r --cached datamesh/
  git add .gitignore
  git commit -m "Disable datamesh publication"
  git push

EOF
}

check_status() {
    if grep -q "^${DATAMESH_LINE}$" "$GITIGNORE_FILE" 2>/dev/null; then
        echo "DISABLED - datamesh/ is in .gitignore (not published)"
        return 1
    else
        echo "ENABLED - datamesh/ will be published to GitHub Pages"
        return 0
    fi
}

enable_publication() {
    if grep -q "^${DATAMESH_LINE}$" "$GITIGNORE_FILE" 2>/dev/null; then
        # Remove the line
        sed -i '' "/^${DATAMESH_LINE}$/d" "$GITIGNORE_FILE"
        echo "Publication ENABLED"
        echo ""
        echo "Next steps:"
        echo "  git add ."
        echo "  git commit -m 'Enable datamesh publication'"
        echo "  git push"
    else
        echo "Already enabled"
    fi
}

disable_publication() {
    if grep -q "^${DATAMESH_LINE}$" "$GITIGNORE_FILE" 2>/dev/null; then
        echo "Already disabled"
    else
        # Add the line if not present
        echo "$DATAMESH_LINE" >> "$GITIGNORE_FILE"
        echo "Publication DISABLED"
        echo ""
        echo "Next steps:"
        echo "  git rm -r --cached datamesh/"
        echo "  git add .gitignore"
        echo "  git commit -m 'Disable datamesh publication'"
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
