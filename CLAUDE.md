# CLAUDE.md

<!-- Last updated: 2026-01-05 -->

> **Public** - Public repository published to GitHub Pages
> **Status:** Active, maintained
> **URL:** https://lukasmazanek.github.io/public/

---

This file provides guidance to Claude Code when working with this repository.

## Purpose

This repository contains public-facing content published to GitHub Pages:

- **bkb-explorer/** - Interactive Business Knowledge Blueprint explorer (published)
- **ConceptSpeak-Text/** - ConceptSpeak notation specification (synced from semantic-platform)

## Structure

```
public/
├── index.html                                # Root redirect to bkb-explorer/
├── .nojekyll                                 # Disable Jekyll processing
├── publish-bkb.sh                            # Publication control script
├── bkb-explorer/                             # BKB Explorer (copied from ~/claude/bkb-explorer)
│   ├── index.html                            # Main explorer page
│   ├── js/                                   # Application code
│   ├── css/                                  # Styles
│   ├── lib/                                  # Vendor libraries
│   ├── output/                               # Domain data and hierarchy
│   └── CLAUDE.md                             # BKB Explorer documentation
├── ConceptSpeak-Text/
│   ├── ConceptSpeak-Text-Specification.md   # Main specification document
│   └── sync-spec.sh                          # Sync script from source
└── logs/                                      # Build/sync logs
```

## Rules

1. **Published to GitHub Pages** - Content here is publicly accessible
2. **Read-only copies** - bkb-explorer/ is copied from source, not edited here
3. **Public-safe only** - No internal implementation details, credentials, or private data
4. **Keep documentation in English** (per global CLAUDE.md)

## Publication Control

Use `publish-bkb.sh` to enable/disable bkb-explorer publication:

```bash
# Check current status
./publish-bkb.sh status

# Enable publication (default)
./publish-bkb.sh enable
git add .
git commit -m "Enable bkb-explorer publication"
git push

# Disable publication
./publish-bkb.sh disable
git rm -r --cached bkb-explorer/
git add .gitignore
git commit -m "Disable bkb-explorer publication"
git push
```

**How it works:**
- **Enabled:** bkb-explorer/ is committed and published to GitHub Pages
- **Disabled:** bkb-explorer/ is added to .gitignore (not published)

## Sync Workflows

### Update BKB Explorer

Copy latest version from source project:

```bash
# From ~/claude/bkb-explorer (source) to public/bkb-explorer (published)
cd ~/claude/public
rsync -av --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='logs' \
  --exclude='test-screenshots' \
  --exclude='.pytest_cache' \
  --exclude='input' \
  ~/claude/bkb-explorer/ bkb-explorer/

git add bkb-explorer/
git commit -m "Update bkb-explorer from source"
git push
```

### Update ConceptSpeak Specification

```bash
./ConceptSpeak-Text/sync-spec.sh
```

This pulls the latest version from `semantic-platform/conceptspeak/`.

## Related Projects

| Project | Relationship |
|---------|--------------|
| `~/claude/bkb-explorer` | Source of bkb-explorer (published copy here) |
| `semantic-platform/conceptspeak` | Source of ConceptSpeak specification |

## GitHub Pages

- **Repository:** https://github.com/lukasmazanek/public
- **Published URL:** https://lukasmazanek.github.io/public/
- **BKB Explorer:** https://lukasmazanek.github.io/public/bkb-explorer/
- **Branch:** master (auto-deployed to GitHub Pages)
