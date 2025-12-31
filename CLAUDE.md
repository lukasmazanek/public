# CLAUDE.md

<!-- Last updated: 2025-12-31 -->

> **Public** - Public repository for sharing ConceptSpeak specification.
> **Status:** Active, maintained

---

This file provides guidance to Claude Code when working with this repository.

## Purpose

This repository contains public-facing documentation and specifications that are shared with external stakeholders:

- **ConceptSpeak-Text/** - ConceptSpeak notation specification (synced from semantic-platform)

## Structure

```
public/
├── ConceptSpeak-Text/
│   ├── ConceptSpeak-Text-Specification.md   # Main specification document
│   └── sync-spec.sh                          # Sync script from source
└── logs/                                      # Build/sync logs
```

## Rules

1. **Read-only content** - Files here are synced from source projects, not edited directly
2. **Sync, don't edit** - Use `sync-spec.sh` to update from semantic-platform
3. **Public-safe only** - No internal implementation details, credentials, or private data
4. **Keep documentation in English** (per global CLAUDE.md)

## Sync Workflow

To update the specification from source:

```bash
./ConceptSpeak-Text/sync-spec.sh
```

This pulls the latest version from `semantic-platform/conceptspeak/`.

## Related Projects

| Project | Relationship |
|---------|--------------|
| `semantic-platform/conceptspeak` | Source of ConceptSpeak specification |
| `bkb-explorer` | Consumes ConceptSpeak for visualization |
