# BKB Explorer

Interactive **Business Knowledge Blueprint** Explorer for Semantic Platform.

**Live Demo:** https://lukasmazanek.github.io/bkb-explorer/

> **BKB** = Business Knowledge Blueprint
> **CST** = ConceptSpeak Text

## Quick Start

```bash
# Initialize input symlinks (one-time setup)
./init-input.sh

# Process all domains from ontology-lift
./run.sh all

# Open in browser
open index.html
```

**No server required** - works offline with file:// protocol. Domains are lazy-loaded on demand.

## Setup & Workflow

### Prerequisites

- **Semantic Platform** - Must be set up alongside bkb-explorer:
  ```
  semantic-platform/
  ├── conceptspeak/    # Parser
  ├── domain-forge/    # Consolidation
  └── ontology-lift/   # FIBO alignment, OWL export
      └── output/      # Generated ontology data
  ```

- **ontology-lift must be run first** to generate data in `ontology-lift/output/`

### 1. Initialize Input (one-time)

Create symlinks to ontology-lift output:

```bash
./init-input.sh
```

This creates:
```
input/
├── Test → ../../semantic-platform/ontology-lift/output/Test
├── RBCZ → ../../semantic-platform/ontology-lift/output/RBCZ
└── Example → ../../semantic-platform/ontology-lift/output/Example
```

### 2. Process Domains

Generate browser bundles:

```bash
# All domains (recommended)
./run.sh all

# Single domain (for development)
./run.sh domain Test
```

**What happens:**
1. Copies `input/{domain}/ontology.json` → `output/{domain}/ontology.json`
2. Generates `js/{domain}/data.js` with lazy-load wrapper
3. Creates `output/domains.js` with navigation hierarchy

### 3. Open in Browser

```bash
open index.html
```

The explorer will lazy-load domains as you navigate.

### Updating Data

When ontology-lift output changes:

```bash
./run.sh all        # Regenerate all bundles
# OR
./run.sh domain Test   # Regenerate specific domain
```

No need to re-run `init-input.sh` unless directory structure changes.

## Features

### Domain Navigation
- Browse domains: **Test**, **Example**, **RBCZ** › **MIB** › **Investment** / **Allin** / **Retail**
- Sidebar tree automatically populated from `output/domains.js`
- Concept counts shown next to each domain
- Domains lazy-load on click (no initial page load delay)

### Interactive Graph
- **Cytoscape.js** powered visualization
- **Zoom** - mouse scroll (desktop) / pinch-to-zoom (mobile)
- **Pan** - right-click drag (desktop) / one-finger drag (mobile)
- **Hover/Tap** - tooltips for concepts and edges
- **Click** - expand/collapse hierarchy

### Mobile Support

Responsive design with mobile-optimized UI:

- **Hamburger menu** (☰) - tap to open sidebar drawer
- **Slide-out sidebar** - domain tree, search, filters
- **Pinch-to-zoom** - zoom in/out on graph
- **One-finger pan** - move around the graph
- **Bottom sheet tooltips** - tap concept to see details
- **Larger touch targets** - 44px minimum for easy tapping

Works on iOS (Safari, Chrome) and Android devices.

### CST Element Toggles

Filter what's visible in the graph:

```
☑ Domain (45)      - Domain-specific concepts
☑ FIBO (32)        - FIBO-mapped concepts
☑ Schema.org (15)  - Schema.org-mapped concepts
☑ Unknown (60)     - Unmapped concepts
☑ Orphans (3)      - Concepts with no visible edges
───────────────────
☑ Context (12)     - Context reference concepts
☑ Categorizations  - Is-a hierarchy edges
☑ Relationships    - Binary verb edges
```

All toggles default ON. Uncheck to hide. Graph re-layouts automatically.

### Layout Selector

Choose graph layout algorithm:

| Layout | Best for |
|--------|----------|
| **Dagre** (default) | Hierarchical structures |
| **Cose** | Force-directed, relationships |
| **Breadthfirst** | Tree exploration |
| **Circle** | Small graphs |
| **Grid** | Overview of all concepts |
| **Concentric** | Hub-centric graphs |

### Tooltips

**Concept tooltip:**
- Name and source badge (FIBO/Schema/Domain/Unknown)
- Definition text
- FIBO mapping URI
- Cross-domain indicator
- Child count

**Edge tooltip:**
- Relationship type (Binary Verb / Categorization)
- Natural language description
- CST notation

### Cross-Domain

- Thick border indicates concept shared across domains
- Portal buttons to navigate to other domains
- Ghost nodes show external references

## BKB Notation Legend

### Concepts

| Style | Meaning |
|-------|---------|
| Green fill | FIBO mapped |
| Blue fill | Schema.org mapped |
| Purple fill | Domain-specific |
| Orange fill | Unknown (needs mapping) |
| Dotted border | Context reference |
| Thick border | Cross-domain shared |

### Edges

| Style | Meaning |
|-------|---------|
| Thick black | Categorization (is-a) |
| Thin purple | Binary verb (relationship) |

## Data Pipeline

BKB Explorer follows the **Unified I/O Directory Convention** (ADR-065):

```
ontology-lift/output/  →  input/  →  output/  →  js/  →  Browser
   (ontology.json)      (symlinks)  (copy)     (bundles) (lazy load)
```

### Data Structure

Each domain has three representations:

1. **Input** - `input/{domain}/` - Symlink to ontology-lift output (read-only)
2. **Output** - `output/{domain}/ontology.json` - Copied for local processing
3. **JS Bundle** - `js/{domain}/data.js` - Browser-ready bundle with `window.BKB_LOADED`

### Available Domains

Discovered automatically from `ontology-lift/output/`:

| Domain | Path | Concepts | Description |
|--------|------|----------|-------------|
| **Test** | Test | ~92 | Test domain with 5 views |
| **Example** | Example | ~15 | Example domain |
| **Investment** | RBCZ:MIB:Investment | ~91 | Investment domain |
| **Allin** | RBCZ:MIB:Allin | ~264 | Allin domain |
| **Retail** | RBCZ:MIB:Retail | ~9 | Retail domain |

*Counts include domain + external concepts*

### Data Generation

```bash
# Process all domains
./run.sh all

# Process single domain
./run.sh domain Test
./run.sh domain RBCZ:MIB:Investment
```

**Output:**
- `output/{domain}/ontology.json` - Ontology data
- `js/{domain}/data.js` - Lazy-loadable JS bundle
- `output/domains.js` - Domain hierarchy for navigation

### Legacy Scripts

These scripts still work but are being replaced by `run.sh`:

- `prepare-test-demo.sh` - Generates test data (public, committed)
- `prepare-demo.sh` - Generates organization data (private, gitignored)

## Browser Support

**Desktop:**
- Chrome (recommended)
- Firefox
- Safari
- Edge

**Mobile:**
- iOS Safari
- iOS Chrome
- Android Chrome
- Other mobile browsers (Maxthon, Firefox, etc.)

## Tech Stack

- **Cytoscape.js** - Graph visualization
- **Dagre** - Hierarchical layout algorithm
- **Vanilla JS** - No framework dependencies

## License

MIT License - See LICENSE file.
