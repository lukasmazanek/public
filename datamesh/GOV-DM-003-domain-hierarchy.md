# GOV-DM-003: Domain Hierarchy & Ownership

> **Status:** ACTIVE
> **Effective:** 2026-01-08
> **Owner:** CDO - Lukáš Mazánek
> **Parent:** [GOV-DM-001-data-mesh-governance.md](GOV-DM-001-data-mesh-governance.md)

---

## 1. Purpose

Define the domain hierarchy structure and ownership rules for Data Products at RBCZ, ensuring:
- Clear accountability for data
- Consistent inheritance of rules
- Proper interoperability through federated ontology

---

## 2. Domain Hierarchy

### 2.1 Complete Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL AUTHORITIES                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │    FIBO    │  │ Schema.org │  │    ČNB     │  │   ISO    │  │
│  │ (Finance)  │  │ (General)  │  │ (Regulator)│  │(Standards)│  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                       extends/maps (optional)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         RBI GROUP                                │
│                    (Group-level standards)                       │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      RBCZ GROUP                            │  │
│  │               (Czech Republic entities)                    │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                      RBCZ                            │  │  │
│  │  │            (Raiffeisen Bank Czech Republic)          │  │  │
│  │  │                                                      │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │  │
│  │  │  │   fin   │ │   mib   │ │ retail  │ │corporate│   │  │  │
│  │  │  │(Finance)│ │ (MIB BU)│ │(Retail) │ │(Corp.)  │   │  │  │
│  │  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │  │  │
│  │  │       │           │           │           │         │  │  │
│  │  │       │      ┌────┴────┐      │           │         │  │  │
│  │  │       │      │investment│      │           │         │  │  │
│  │  │       │      │ (Domain) │      │           │         │  │  │
│  │  │       │      └─────────┘      │           │         │  │  │
│  │  └───────┴───────────────────────┴───────────┴─────────┘  │  │
│  │                                                            │  │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │  │
│  │  │     RLCZ      │ │     RSTS      │ │  Other NWUs   │    │  │
│  │  │  (Leasing)    │ │(Stav.spoř.)   │ │  (RIS, ...)   │    │  │
│  │  └───────────────┘ └───────────────┘ └───────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Other Country Groups                    │  │
│  │              (Austria, Slovakia, Hungary, ...)             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Domain Types

| Level | Type | Examples | Characteristics |
|-------|------|----------|-----------------|
| 0 | **External** | FIBO, ČNB, ISO | Standards, regulations |
| 1 | **Group** | RBI | Group-wide policies |
| 2 | **Entity** | RBCZ, RLCZ | Legal entities |
| 3 | **Shared** | rbcz:countries, rbcz:currencies | Shared reference data (directly under entity, no `ref` subdomain) |
| 4 | **BU** | mib, retail, fin, corporate | Business Units |
| 5 | **Domain** | investment, gcc | Specific business domain |
| 6 | **Subdomain** | (future) | Specialized areas |

---

## 3. Ownership Model

### 3.1 Core Principle

**Domain Path = Ownership**

Whoever defines a concept at a given level in the hierarchy owns it.

### 3.2 Ownership Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| **OWN-1** | Path Defines Owner | `rbcz:mib:investment:X` → Investment Domain Owner owns X |
| **OWN-2** | Specialization Allowed | Child domain CAN add new attributes |
| **OWN-3** | Narrowing Allowed | Child domain CAN restrict constraints (subset) |
| **OWN-4** | Contradiction Forbidden | Child domain CANNOT change parent definitions |
| **OWN-5** | Weakening Forbidden | Child domain CANNOT relax parent constraints |
| **OWN-6** | Parent Rules Inherited | All parent rules apply automatically |

### 3.3 Specialization Matrix

| Operation | Allowed | Example |
|-----------|---------|---------|
| **Add attribute** | ✅ YES | `+ riskProfile` to Customer |
| **Add constraint** | ✅ YES | `segment IN ('MIB')` (subset) |
| **Change type** | ❌ NO | `id: string → int` |
| **Remove attribute** | ❌ NO | Remove inherited `name` |
| **Relax constraint** | ❌ NO | `required → optional` |
| **Widen enum** | ❌ NO | Add values to parent enum |

#### 3.3.1 Concrete Example: Investment Customer

When **Investment domain** extends a concept from **MIB domain** (e.g., Customer), these rules apply:

```
MIB:Customer (parent)                   Investment:Customer (child)
─────────────────────                   ───────────────────────────
id: string (required)                   id: string (required)      ← MUST remain
name: string (required)                 name: string (required)    ← MUST remain
segment: enum [MIB, Retail, Corp]       segment: enum [MIB]        ← OK: narrowing
                                        + mifidClass: enum         ← OK: new attribute
                                        + riskProfile: enum        ← OK: new attribute
```

**✅ What IS Allowed:**

| Operation | Example | Why OK |
|-----------|---------|--------|
| **Add attribute** | `+ mifidClass` | Investment needs MiFID classification, MIB doesn't |
| **Narrow constraint** | `segment IN ('MIB')` instead of `['MIB','Retail','Corp']` | Investment clients are always MIB segment |

**❌ What is FORBIDDEN:**

| Operation | Example | Why NOT |
|-----------|---------|---------|
| **Change type** | `id: string → int` | Code expecting string would fail |
| **Remove attribute** | Delete `name` | Code using `name` would fail |
| **Relax constraint** | `required → optional` | Code expecting value would fail |
| **Widen enum** | Add `'VIP'` to segment | Parent doesn't know 'VIP', cannot validate |

### 3.4 Liskov Substitution Principle

**Why these rules?** Any code expecting the parent type MUST work with the child type:

```
RULE:
Wherever code expects MIB:Customer,
it MUST also work with Investment:Customer

EXAMPLE:
┌──────────────────────────────────────────────────────┐
│  function processCustomer(c: MIB:Customer) {         │
│    console.log(c.name);       // MUST exist          │
│    console.log(c.id);         // MUST be string      │
│    if (c.segment === 'MIB')   // MUST be valid value │
│  }                                                   │
│                                                      │
│  // This MUST work:                                  │
│  processCustomer(investmentCustomer);  // ✅ OK      │
└──────────────────────────────────────────────────────┘
```

```
Child MUST be usable wherever Parent is expected.

RBCZ:MIB:Investment:Customer MUST be valid RBCZ:Customer

Any code/query that works with RBCZ:Customer
MUST work with Investment:Customer without modification.
```

---

## 4. Domain Owners

### 4.1 Current Assignments

| Domain Path | Owner Role | Current Owner |
|-------------|------------|---------------|
| `rbcz` | CDO | Lukáš Mazánek |
| `rbcz:fin` | Finance Domain Owner | TBD |
| `rbcz:mib` | MIB BU Owner | TBD |
| `rbcz:mib:investment` | Investment Domain Owner | Marek Podrabský |
| `rbcz:retail` | Retail BU Owner | TBD |
| `rbcz:corporate` | Corporate BU Owner | TBD |
| `rbcz:corporate:gcc` | GCC Product Owner | TBD |

### 4.2 Owner Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Define concepts** | Create and maintain domain ontology |
| **Approve changes** | Review and approve modifications |
| **Ensure quality** | Maintain data quality standards |
| **Manage consumers** | Track and approve data consumers |
| **Align with parent** | Ensure consistency with parent domain |

---

## 5. Interoperability: Federated Ontology

### 5.1 Domain-First Principle

```
PRIMARY AUTHORITY = RBCZ Domain Ontology

External authorities (FIBO, Schema.org) provide:
- Semantic grounding (what does it mean globally)
- Interoperability (cross-organization communication)
- Validation (is our model correct)

BUT they do NOT override domain definitions.
```

### 5.2 Mapping Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| **MAP-1** | Parent Mapping Required | Every concept MUST extend parent or define new |
| **MAP-2** | Transitive External | External mapping inherited from parent |
| **MAP-3** | New = External Important | New concepts SHOULD have external mapping |
| **MAP-4** | Bank-Specific OK | Domain-specific without external is allowed |
| **MAP-5** | Direct = Validation | Direct external at subdomain is for validation |

### 5.3 Transitive Mapping Examples

**Scenario 1: Concept exists in parent**
```
investment:Customer
       │ extends
       ▼
   rbcz:Customer ───────→ fibo-fbc:Customer

Result:
- investment:Customer inherits FIBO mapping transitively
- Direct mapping investment:Customer → fibo is REDUNDANT
- Can exist for VALIDATION purposes
```

**Scenario 2: New concept (no parent)**
```
investment:MiFIDClass (NEW - doesn't exist in parent)
       │
       ▼
   No parent mapping available

Result:
- MUST define direct external mapping
- investment:MiFIDClass → fibo-sec:MiFIDClassification
- This is CRITICAL for semantic grounding
```

**Scenario 3: Bank-specific concept**
```
investment:EDIContract (bank-specific)
       │
       ▼
   No FIBO/Schema.org equivalent exists

Result:
- Document as "domain-only"
- No external mapping required
- Must have clear domain definition
```

---

## 6. Cross-Domain Concepts

### 6.1 Customer Example

```
rbcz:Customer (Enterprise - CDO owns)
│
├── Core Attributes (inherited by all):
│   ├── id: string (required)
│   ├── name: string (required)
│   ├── status: enum [Active, Inactive, Closed]
│   └── created: date
│
├──extends→ rbcz:retail:Customer (Retail owns)
│           └── + channelPreference: enum
│           └── + digitalConsent: boolean
│
├──extends→ rbcz:mib:Customer (MIB owns)
│           └── + riskProfile: enum [Low, Medium, High]
│           └── + segment: string
│           │
│           └──extends→ rbcz:mib:investment:Customer (Investment owns)
│                       └── + mifidClass: enum [Retail, Professional, ECP]
│                       └── + investmentPreference: string
│
└──extends→ rbcz:corporate:Customer (Corporate owns)
            └── + legalForm: enum
            └── + industryCode: string
```

### 6.2 Multi-Origin Entities

When entity can be created in multiple domains (e.g., Customer):

| Origin | Creates | Owns |
|--------|---------|------|
| Retail onboarding | Retail Customer | Retail:Customer attributes |
| Corporate onboarding | Corporate Customer | Corporate:Customer attributes |
| MIB onboarding | Investment Customer | Investment:Customer attributes |

**Rule:** Each domain owns its VIEW of the entity, but RBCZ:Customer is the unified base (CDO owns).

---

## 7. Reference Data Ownership

### 7.1 Shared Reference Data (RBCZ Level)

| Data | Domain Path | Owner | Standard |
|------|-------------|-------|----------|
| Countries | `rbcz:countries` | CDO | ISO 3166-1 |
| Currencies | `rbcz:currencies` | CDO | ISO 4217 |
| Calendars | `rbcz:calendars` | CDO | Business |
| Legal Entities | `rbcz:legal-entities` | CDO | LEI (ISO 17442) |

### 7.2 Domain-Owned Master Data

| Data | Domain Path | Owner | Consumers |
|------|-------------|-------|-----------|
| MIB Segments | `rbcz:mib:segments` | MIB | Investment, other MIB |
| Investment Products | `rbcz:mib:investment:products` | Investment | All Investment DPs |
| Retail Channels | `rbcz:retail:channels` | Retail | All Retail DPs |

---

## 8. Governance Processes

### 8.1 New Concept Creation

```
1. Check if concept exists in parent domain
   │
   ├── YES → Extend parent (add only new attributes)
   │
   └── NO → Create new concept
            │
            ├── Check external authority (FIBO, Schema.org)
            │   │
            │   ├── EXISTS → Map to external
            │   │
            │   └── NOT EXISTS → Document as domain-only
            │
            └── Register in domain ontology
```

### 8.2 Cross-Domain Promotion

When concept should move to higher level (e.g., Investment → MIB):

1. Domain Owner proposes promotion
2. Parent Domain Owner reviews
3. Impact analysis on existing consumers
4. Migration plan created
5. Both owners approve
6. Concept moved, aliases maintained

---

## 9. Validation Rules

### 9.1 Hierarchy Validation

- [ ] Every concept has valid domain path
- [ ] Parent domain exists (or is root)
- [ ] No circular inheritance
- [ ] Child attributes don't conflict with parent

### 9.2 Ownership Validation

- [ ] Domain Owner assigned
- [ ] Owner has authority for domain level
- [ ] Changes approved by Owner

### 9.3 Mapping Validation

- [ ] Parent mapping exists (if parent has concept)
- [ ] External mapping exists for new concepts (if available)
- [ ] No conflicting external mappings in hierarchy

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Banking Domain Expert | Initial version |
| 1.1 | 2026-01-08 | Banking Domain Expert | Added detailed Specialization Matrix explanation (3.3.1) |
| 1.2 | 2026-01-08 | Data Mesh Consultant | **Fixed Level 3:** `rbcz:ref` → `rbcz:countries`, `rbcz:currencies` (no `ref` subdomain exists). Renamed "Platform" → "Shared". Added `corporate` to BU examples, `gcc` to Domain examples. |
| 1.3 | 2026-01-08 | Principal Architect | **Fixed Section 4.1 and 7.1:** Removed `rbcz:ref` from Domain Owners (no such subdomain). Updated Section 7.1 paths to `rbcz:countries` etc. Added `rbcz:corporate:gcc` to Domain Owners. |
