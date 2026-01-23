# CLAUDE.md

<!-- Last updated: 2026-01-23 -->

> **Public** - Public repository published to GitHub Pages
> **Status:** Active, maintained
> **URL:** https://lukasmazanek.github.io/public/

---

This file provides guidance to Claude Code when working with this repository.

## Purpose

This repository contains public-facing content published to GitHub Pages:

- **bkb-explorer/** - Interactive Business Knowledge Blueprint explorer (published)
- **ConceptSpeak-Text/** - ConceptSpeak notation specification (synced from semantic-platform)
- **inspirativni-patek/** - Presentation slides for Inspirativni Patek event (synced from presentation-room)

## Structure

```
public/
├── index.html                                # Root redirect to bkb-explorer/
├── .nojekyll                                 # Disable Jekyll processing
├── .gitignore                                # Publication control
├── publish-bkb.sh                            # Enable/disable publication
├── update-bkb.sh                             # Update bkb-explorer from source
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
├── inspirativni-patek/                        # Presentation slides (synced from presentation-room)
│   ├── index.html                             # Slide viewer
│   ├── slides-ascii-design.md                 # ASCII slide designs
│   ├── outline.md                             # Presentation outline
│   └── pro-speakery.md                        # Speaker notes
├── update-inspirativni-patek.sh               # Update slides from source
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

**Simple way** (recommended):

```bash
cd ~/claude/public
./update-bkb.sh
# Follow instructions (git push or git push --force)
```

**How it works:**
- Syncs latest data from `~/claude/bkb-explorer`
- If last commit was a bkb update: amends it (keeps only current version)
- If last commit was something else: creates new commit
- You must manually push (force push if amended)

**Manual way:**

```bash
cd ~/claude/public
rsync -av --delete \
  --exclude='node_modules' --exclude='.git' \
  --exclude='logs' --exclude='input' \
  ~/claude/bkb-explorer/ bkb-explorer/

git add bkb-explorer/
git commit --amend --no-edit  # Overwrites last commit
git push --force              # Required for amended commits
```

### Update Inspirativni Patek

```bash
cd ~/claude/public
./update-inspirativni-patek.sh
# Follow instructions (git push or git push --force)
```

**How it works:**
- Copies slides-ascii-design.md, outline.md, pro-speakery.md from `presentation-room/events/inspirativni-patek/`
- If last commit was an inspirativni-patek update: amends it (keeps only current version)
- If last commit was something else: creates new commit

### Update ConceptSpeak Specification

```bash
./ConceptSpeak-Text/sync-spec.sh
```

This pulls the latest version from `semantic-platform/conceptspeak/`.

## Related Projects

| Project | Relationship |
|---------|--------------|
| `~/claude/bkb-explorer` | Source of bkb-explorer (published copy here) |
| `~/claude/presentation-room` | Source of inspirativni-patek slides |
| `semantic-platform/conceptspeak` | Source of ConceptSpeak specification |

## GitHub Pages

- **Repository:** https://github.com/lukasmazanek/public
- **Published URL:** https://lukasmazanek.github.io/public/
- **BKB Explorer:** https://lukasmazanek.github.io/public/bkb-explorer/
- **Inspirativni Patek:** https://lukasmazanek.github.io/public/inspirativni-patek/
- **Branch:** master (auto-deployed to GitHub Pages)
