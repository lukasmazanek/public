# BKB Explorer Visual Guide

This document describes the visual representation of ConceptSpeak (CST) elements in BKB Explorer.

## Node Types

### Concept Nodes (by FIBO/Schema.org mapping)

| Visual | Class | Meaning | Color |
|--------|-------|---------|-------|
| ![#4a90d9](https://via.placeholder.com/20/4a90d9/4a90d9) | `fibo` | FIBO mapped concept | `#4a90d9` Steel Blue |
| ![#50c878](https://via.placeholder.com/20/50c878/50c878) | `schema` | Schema.org mapped (no FIBO) | `#50c878` Emerald |
| ![#f5a623](https://via.placeholder.com/20/f5a623/f5a623) | `domain-local` | Domain-specific (no external mapping) | `#f5a623` Orange |
| ![#cccccc](https://via.placeholder.com/20/cccccc/cccccc) | `unknown` | Unknown/unmapped | `#cccccc` Gray |
| ![#9b59b6](https://via.placeholder.com/20/9b59b6/9b59b6) | `cross-domain` | Cross-domain reference | `#9b59b6` Purple |

### Special Node Types

| Visual | Class | Meaning | Style |
|--------|-------|---------|-------|
| ![#e8e8e8](https://via.placeholder.com/20/e8e8e8/e8e8e8) | `external` | External concept (Schema.org/FIBO) | Light gray, smaller |
| ◯ dotted | `context` | Context reference (ADR-047) | **Dotted border** |
| ![#666666](https://via.placeholder.com/20/666666/666666) | `ghost` | Ghost node (hidden connections) | Dark gray, semi-transparent |
| ● large | `hub` | High-connectivity hub | Larger size, bold border |

### Property Nodes (ADR-054)

| Visual | Class | Meaning | Color |
|--------|-------|---------|-------|
| ![#ffe4c4](https://via.placeholder.com/20/ffe4c4/ffe4c4) | `property` | Entity property/attribute | `#ffe4c4` Bisque (small) |
| ![#d3d3d3](https://via.placeholder.com/20/d3d3d3/d3d3d3) | `property-type` | Shared property type | `#d3d3d3` Light Gray (smallest) |

### Internal Nodes

| Visual | Class | Meaning | Style |
|--------|-------|---------|-------|
| (hidden) | `junction` | Categorization junction | Invisible, layout only |

---

## Edge Types

### Relationship Edges

| Visual | Class | Meaning | Style |
|--------|-------|---------|-------|
| ─── | `relationship` | Binary verb relationship | Solid, gray `#666` |
| ─▶ | `isA` (hierarchy) | Extends/inherits | Solid, dark `#333`, arrow |
| ┄┄┄ | `context` | Context relationship | **Dotted**, gray `#999` |
| ┄┄┄ | `transitive` | Transitive path (ADR-048) | Dotted, shows hop count |

### Property Edges (ADR-054)

| Visual | Class | Meaning | Style |
|--------|-------|---------|-------|
| ─── | `has-property` | Concept → Property | Thin, chocolate `#d2691e` |
| ─── | `has-type` | Property → PropertyType | Thin, gray `#808080` |
| ╌╌▶ | `isA` (ADR-055) | Property → Definition Concept | **Dashed**, purple `#9370db`, arrow |

### Categorization Edges

| Visual | Class | Meaning | Style |
|--------|-------|---------|-------|
| ═══ | `trunk` | Parent → Junction | Thick `#333`, 2px |
| ─── | `branch` | Junction → Children | Medium `#333`, 1.5px |

---

## Visual Patterns

### Context References (ADR-047)

Context concepts are displayed with **dotted borders** to indicate they are referenced but not defined in the current view:

```
┌╌╌╌╌╌╌╌╌╌╌╌╌┐
╎  Account   ╎  ← Context reference (dotted border)
└╌╌╌╌╌╌╌╌╌╌╌╌┘
      │
      ╎ (dotted edge)
      ▼
┌────────────┐
│   Order    │  ← Full concept (solid border)
└────────────┘
```

### Property Visualization (ADR-054)

Properties form a chain from concept to type:

```
┌────────────┐     ┌─────────┐     ┌────────┐
│  EDI AUM   │────▶│  datum  │────▶│ String │
│   (blue)   │     │ (bisque)│     │ (gray) │
└────────────┘     └─────────┘     └────────┘
   Concept      has-property   has-type  PropertyType
```

### isA Relationship (ADR-055)

Properties can have isA relationship to definition concepts:

```
┌─────────┐   is a    ┌──────────────┐
│  datum  │╌╌╌╌╌╌╌╌╌▶│ Calendar Day │
│ (bisque)│  (purple) │    (blue)    │
└─────────┘           └──────────────┘
  Property              Definition Concept
```

### Categorization Pattern (ADR-051)

Categorizations use junction nodes for clean layout:

```
         ┌────────────┐
         │  Payment   │
         │  (parent)  │
         └─────┬──────┘
               │ trunk (thick)
               ●  ← junction (hidden)
              /│\
             / │ \ branch (medium)
            ▼  ▼  ▼
       ┌───┐ ┌───┐ ┌───┐
       │ACH│ │Wire│ │Card│
       └───┘ └───┘ └───┘
         children
```

---

## Size Hierarchy

Nodes are sized by importance:

1. **Hub concepts** - largest (high connectivity)
2. **Regular concepts** - standard size
3. **External concepts** - smaller
4. **Property nodes** - small
5. **PropertyType nodes** - smallest (shared)
6. **Junction nodes** - invisible

---

## Filter Legend

The sidebar filter shows counts with colors:

| Icon | Meaning |
|------|---------|
| 🔵 | FIBO mapped |
| 🟢 | Schema.org mapped |
| 🟠 | Domain local |
| ⚪ | Unknown |
| 🟣 | Cross-domain |
| ◯ | Context references |
| 🔶 | Properties |
| ⬜ | External concepts |

---

## Related ADRs

- [ADR-028](../semantic-platform/decisions/ADR-028-bkb-inline-styles.md) - Inline styles decision
- [ADR-047](../semantic-platform/decisions/ADR-047-dotted-concept-directive.md) - Context concepts
- [ADR-048](../semantic-platform/decisions/ADR-048-transitive-context-relationships.md) - Transitive paths
- [ADR-054](../semantic-platform/decisions/ADR-054-property-visualization.md) - Property nodes
- [ADR-055](../semantic-platform/decisions/ADR-055-field-definition-isa.md) - Property isA pattern
