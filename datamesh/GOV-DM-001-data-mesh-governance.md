# GOV-DM-001: Data Mesh Governance

> **Status:** ACTIVE
> **Effective:** 2026-01-08
> **Owner:** CDO - Lukáš Mazánek (RBCZ/IT/Data Management)
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document establishes the governance framework for Data Products and Data Mesh at RBCZ, covering:
- Data Product definition and mandatory features
- Domain hierarchy and ownership model
- Interoperability through federated ontology
- Composability rules for DP dependencies
- Naming conventions

---

## 2. Scope

This policy applies to:
- All Data Products within RBCZ and subsidiary entities (RLCZ, etc.)
- All business domains (MIB, Retail, Corporate, Payments, Finance)
- Platform/shared reference data
- Cross-entity data sharing within RBI Group

---

## 3. Core Principles

### 3.1 Data Mesh Principles (Dehghani)

| Principle | RBCZ Implementation |
|-----------|---------------------|
| **Domain Ownership** | Domain Path = Ownership |
| **Data as a Product** | DATSIS characteristics mandatory |
| **Self-Serve Platform** | Databricks + DPCC Catalog |
| **Federated Governance** | This document + Guild structure |

### 3.2 RBCZ-Specific Principles

| Principle | Description |
|-----------|-------------|
| **Domain-First** | RBCZ domain ontology is primary authority |
| **Specialization without Contradiction** | Child domain can extend, not contradict parent |
| **Transitive Mapping** | External authority mapping inherited through hierarchy |
| **Purpose-Driven Products** | DP names reflect business value, not just entities |

---

## 4. Data Product Definition

### 4.1 DATSIS Characteristics

Every Data Product MUST satisfy:

| Characteristic | Requirement | Verification |
|----------------|-------------|--------------|
| **D**iscoverable | Listed in DPCC Catalog | Catalog entry exists |
| **A**ddressable | Has unique ID (domain path) | ID assigned |
| **T**rustworthy | Maturity Score ≥ threshold | Score calculated |
| **S**elf-describing | Data Contract exists | YAML validated |
| **I**nteroperable | Domain mapping defined | Ontology linked |
| **S**ecure | Classification assigned | PII/GDPR tagged |

### 4.2 Mandatory Technical Features

Per RBCZ Governance (existing):

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Immutability** | Only INSERT allowed | No UPDATE/DELETE/TRUNCATE |
| **Bitemporality** | Two timestamps per record | `DP_ACTUAL_DATE`, `DP_RECORD_DATE` |
| **Read Only** | Consumers have SELECT only | Separate database/schema |
| **Multimodality** | Multiple output interfaces | Batch, micro-batch, streaming |

---

## 5. Domain Hierarchy

### 5.1 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL AUTHORITIES                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │    FIBO    │  │ Schema.org │  │    ČNB     │  │   ISO    │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                       extends/maps
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         RBI GROUP                                │
│                    (Group-level standards)                       │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐      │
│  │                    RBCZ GROUP                          │      │
│  │              (Czech Republic entities)                 │      │
│  │                                                        │      │
│  │  ┌─────────────────────┐    ┌─────────────────────┐   │      │
│  │  │        RBCZ         │    │        RLCZ         │   │      │
│  │  │  (Raiffeisen Bank)  │    │ (Raiffeisen Leasing)│   │      │
│  │  │                     │    │                     │   │      │
│  │  │  ┌───┐ ┌───┐ ┌───┐ │    │  ┌───┐              │   │      │
│  │  │  │fin│ │mib│ │ret│ │    │  │fin│              │   │      │
│  │  │  └───┘ └─┬─┘ └───┘ │    │  └───┘              │   │      │
│  │  │          │         │    │                     │   │      │
│  │  │     investment     │    │                     │   │      │
│  │  └─────────────────────┘    └─────────────────────┘   │      │
│  │                                                        │      │
│  │  ┌─────────────────────┐    ┌─────────────────────┐   │      │
│  │  │        RSTS         │    │     Other NWUs      │   │      │
│  │  │ (Stavební spoř.)    │    │     (RIS, ...)      │   │      │
│  │  └─────────────────────┘    └─────────────────────┘   │      │
│  └────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Domain Types

| Type | Examples | Characteristics |
|------|----------|-----------------|
| **External** | FIBO, ČNB, ISO | Standards, regulatory requirements |
| **Group** | RBI | Group-wide policies |
| **Entity** | RBCZ, RLCZ | Legal entities, own data |
| **BU** | fin, mib, retail | Business Units |
| **Domain** | investment | Specific business domain |

### 5.3 Ownership Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| **OWN-1** | Domain Path = Ownership | Who defines concept at given level = owner |
| **OWN-2** | Specialization Allowed | Child can ADD attributes |
| **OWN-3** | Contradiction Forbidden | Child CANNOT change parent constraints |
| **OWN-4** | Parent Rules Respected | Child inherits all parent rules |

#### Example: Customer Ownership

```
RBCZ:Customer (Enterprise - CDO owns)
├── Core attributes: ID, Name, Status
│
├── extends → RBCZ:MIB:Customer (MIB owns)
│              └── + RiskProfile, + Segment
│
└── extends → RBCZ:MIB:Investment:Customer (Investment owns)
               └── + MiFIDClass, + InvestmentPreferences
```

---

## 6. Interoperability Model

### 6.1 Federated Ontology

```
PRIMÁRNÍ AUTORITA = RBCZ Doménová Ontologie
                         │
                         │ optional alignment
                         ▼
            ┌────────────────────────┐
            │   External Authorities │
            │   (FIBO, Schema.org,   │
            │    ISO, ČNB, ...)      │
            └────────────────────────┘
```

### 6.2 Mapping Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| **MAP-1** | Domain Mapping Required | Every concept MUST map to parent domain |
| **MAP-2** | Transitive External Mapping | Parent's external mapping is inherited |
| **MAP-3** | New Concepts Need External | Concepts without parent SHOULD have external mapping |
| **MAP-4** | Domain-Specific Allowed | Bank-specific concepts without external match are OK |
| **MAP-5** | Direct External = Validation | Direct external mapping at subdomain level is for validation |

#### Transitive Mapping Example

```
Scenario 1: Concept EXISTS in parent
─────────────────────────────────────
investment:Customer
       │ extends
       ▼
   rbcz:Customer ───→ fibo:Customer

Result: investment:Customer → fibo:Customer is INHERITED

Scenario 2: Concept is NEW (no parent)
──────────────────────────────────────
investment:MiFIDClass (new in investment)
       │ extends
       ▼
   rbcz:??? ─── DOES NOT EXIST

Result: External mapping (fibo-sec:MiFIDClassification) is IMPORTANT
```

---

## 7. Composability

### 7.1 Data Product Layers

```
LAYER 3: Analytics/Reporting DPs (Domain owns)
         ├── Purpose: Answer business questions
         └── Examples: investment-aum-reporting, investment-profitability

LAYER 2: Domain/BU Master Data DPs (Domain/BU owns)
         ├── Purpose: Single source of truth for domain entities
         └── Examples: investment-products-catalog, mib-segmentation

LAYER 1: Shared Reference Data DPs (CDO/RBCZ root owns)
         ├── Purpose: Cross-BU standards
         └── Examples: ref-countries (ISO 3166), ref-currencies (ISO 4217)
```

### 7.2 Classification Criteria

| Criterion | Embedded | Separate DP | Shared (RBCZ root) |
|-----------|----------|-------------|---------------------|
| **Reuse** | None | Within domain/BU | Cross-BU (all) |
| **Ownership** | Same as parent DP | Domain/BU Owner | CDO (RBCZ root) |
| **Lifecycle** | Tied to parent | Independent | Centrally managed |
| **Standardization** | Not needed | Domain standard | ISO/Enterprise |

#### A) Embedded Pattern

**When to use:** Data that no one else needs

```
┌─────────────────────────────────────────┐
│         investment-aum-reporting         │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Lookup table for AUM calculation  │ │  ← EMBEDDED
│  │  (no one else uses it)             │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Business logic, transformations...     │
└─────────────────────────────────────────┘
```

**Examples:** Helper calculation tables, staging data, DP-specific constants

#### B) Separate DP Pattern (Domain owns)

**When to use:** Data used by multiple DPs within the SAME domain

```
┌─────────────────────────────────────────────────────────────┐
│                    INVESTMENT DOMAIN                         │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │   investment-products-catalog        │ ← SEPARATE DP     │
│  │   (ISIN, name, product type)         │                   │
│  └──────────────────┬───────────────────┘                   │
│                     │                                        │
│         ┌───────────┼───────────┐                           │
│         ▼           ▼           ▼                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │   AUM    │ │  Sales   │ │ Position │  ← all use         │
│  │ Reporting│ │  Volume  │ │ Overview │    products-catalog │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

**Examples:** `investment-products-catalog`, `mib-segmentation`, `retail-channels`

#### C) Shared Reference Pattern (RBCZ root owns)

**When to use:** Data used by ALL BUs and domains

```
┌─────────────────────────────────────────────────────────────┐
│                    RBCZ (root domain)                        │
│                      CDO owns                                │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ref-countries │ │ref-currencies│ │ref-calendars │         │
│  │  (ISO 3166)  │ │  (ISO 4217)  │ │              │         │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘         │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │    MIB     │  │   Retail   │  │  Corporate │             │
│  │  (+ inv.)  │  │            │  │            │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

**Examples:** `rbcz:ref:countries` (ISO 3166), `rbcz:ref:currencies` (ISO 4217), `rbcz:ref:legal-entities` (LEI)

**Principle:** RBCZ as root domain owns all shared data. CDO is owner of RBCZ level.

#### Decision Tree

```
                    Used by more than one DP?
                              │
               ┌──────────────┴──────────────┐
               │ NO                          │ YES
               ▼                             ▼
           EMBEDDED                 Used by multiple BUs/domains?
                                            │
                         ┌──────────────────┴──────────────────┐
                         │ NO (within BU only)                 │ YES (cross-BU)
                         ▼                                     ▼
                   SEPARATE DP                          Is it ISO/standard?
                  (Domain/BU owns)                             │
                                            ┌──────────────────┴──────────────┐
                                            │ NO                              │ YES
                                            ▼                                 ▼
                                     SEPARATE DP                      SHARED (RBCZ root)
                                     per BU                            (CDO owns)
```

#### Example: Classifying IDM_* from DP EDI AUM

| Data | Reuse | Cross-BU? | ISO? | → Pattern | Owner |
|------|-------|-----------|------|-----------|-------|
| IDM_COUNTRIES | Yes | Yes (everyone) | Yes (ISO 3166) | **Shared** | CDO (RBCZ root) |
| IDM_PRODUCTS | Yes | No (Investment only) | No | **Separate DP** | Investment Domain |
| IDM_SEGMENTS | Yes | No (MIB only) | No | **Separate DP** | MIB BU |
| Helper lookup | No | - | - | **Embedded** | Parent DP |

### 7.3 Dependency Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| **COMP-1** | Shared Reference Allowed | DP can consume RBCZ root reference data (ref-*) |
| **COMP-2** | Same Domain Allowed | DP can consume from same domain |
| **COMP-3** | Parent Domain Allowed | DP can consume from parent domain/BU |
| **COMP-4** | Sibling Needs Contract | Cross-BU consumption requires explicit contract |
| **COMP-5** | No Circular Dependencies | A→B→A is forbidden |
| **COMP-6** | Consumer Registration | Consumer MUST be in Consumers Catalog |
| **COMP-7** | Cross-Domain via DP Only | Production data exchange across domain boundary requires DP + Contract |

#### COMP-7: Cross-Domain Data Exchange (Detail)

**Rule:** Any PRODUCTION exchange of analytical data across domain boundary MUST be realized through a published Data Product with a valid Data Contract.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOMAIN BOUNDARY                               │
│                         │                                        │
│     INVESTMENT          │              MIB                       │
│                         │                                        │
│  ┌─────────────┐        │        ┌─────────────┐                │
│  │ Internal    │        │        │ Internal    │                │
│  │ processing  │        │        │ processing  │                │
│  └──────┬──────┘        │        └──────┬──────┘                │
│         │               │               ▲                        │
│         ▼               │               │                        │
│  ┌─────────────┐        │        ┌──────┴──────┐                │
│  │     DP      │────────┼───────▶│  Consumer   │                │
│  │ + Contract  │        │        │  registers  │                │
│  └─────────────┘        │        └─────────────┘                │
│                         │                                        │
│                   DATA CONTRACT                                  │
│                   enforced here                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Rule Applicability:**

| Exchange Type | Require DP? | Reason |
|---------------|-------------|--------|
| Production consumption | ✅ Yes, always | Core use case |
| Ad-hoc exploration (sandbox) | ⚠️ Not necessarily | Max 30 days, discovery purposes |
| Same BU, different domain | ✅ Yes | Still cross-domain |
| Same domain, different DP | ❌ No | Internal implementation |

**Enforcement:**
- Without registered DP, no access to production data of another domain
- Consumer MUST be registered in Consumer Catalog
- Breaking changes require notification of all registered consumers

### 7.4 Design Guidance: Embedded vs. Separate DP

Key question during design: *"How do I know if data will be used by more than one DP?"*

**Short answer:** You don't know for sure. But you have signals.

#### Signals for Reuse

| Signal | Example | Reuse Probability |
|--------|---------|-------------------|
| **It's an entity (noun)** | Customer, Product, Account | 🔴 High |
| **It's a classification/codelist** | Segment, Status, Type | 🔴 High |
| **Someone else is already asking** | "Where can I find products?" | 🔴 High |
| **Exists in source system as master** | IDM_PRODUCTS in EDI | 🟡 Medium |
| **It's a dimension for reporting** | Time, Geography, Channel | 🔴 High |
| **It's a calculation/metric** | AUM balance, Risk score | 🟢 Low (often DP-specific) |
| **It's a fact/transaction** | Order, Payment, Trade | 🟡 Medium |

#### Evolution Pattern: Start Small, Promote When Needed

```
EVOLUTION PATTERN:

Time 0: Don't know if anyone will need it
       │
       ▼
┌─────────────────────────────────────┐
│  Start as EMBEDDED in DP            │
│  (simplest, fastest)                │
└─────────────────────────────────────┘
       │
       │  Second consumer appears
       ▼
┌─────────────────────────────────────┐
│  REFACTOR → SEPARATE DP             │
│  (extract, publish, contract)       │
└─────────────────────────────────────┘
       │
       │  Cross-BU consumer appears
       ▼
┌─────────────────────────────────────┐
│  PROMOTE → RBCZ root / higher level │
│  (governance decision)              │
└─────────────────────────────────────┘
```

**Key insight:** Refactoring is cheap, over-engineering is expensive.

#### Decision Questions During Design

```
1. "Is this an ENTITY or a CALCULATION?"
   │
   ├── ENTITY (Customer, Product) → probably SEPARATE DP
   │
   └── CALCULATION (AUM per segment) → probably EMBEDDED

2. "Does this exist in source system as a standalone table/API?"
   │
   ├── YES (IDM_PRODUCTS) → consider SEPARATE DP
   │
   └── NO (helper calculation) → EMBEDDED

3. "Can I imagine someone else wanting this?"
   │
   ├── YES, easily → SEPARATE DP
   │
   └── NO, it's specific to my use case → EMBEDDED

4. "Does this change independently of my DP?"
   │
   ├── YES (products added independently of AUM report) → SEPARATE DP
   │
   └── NO (always changes together) → EMBEDDED
```

#### Updated Decision Tree

```
                    Is it an ENTITY or CLASSIFICATION?
                              │
               ┌──────────────┴──────────────┐
               │ YES                         │ NO (calculation/metric)
               ▼                             ▼
      Probably will be               Probably EMBEDDED
      reused → SEPARATE DP           (can promote later)
               │
               ▼
      Used by multiple BUs?
               │
    ┌──────────┴──────────┐
    │ YES                 │ NO
    ▼                     ▼
SHARED (RBCZ root)    SEPARATE DP
                      (Domain/BU)
```

#### Examples from Investment Domain

| Data | Type | Signal | Decision |
|------|------|--------|----------|
| **Products (ISIN)** | Entity | Exists in EDI as master, AUM and Sales both need it | → SEPARATE DP from start |
| **Segments** | Classification | MIB-wide codelist, all MIB DPs need it | → SEPARATE DP (MIB level) |
| **AUM per product per day** | Calculation | Specific to AUM reporting | → EMBEDDED (in aum-reporting) |
| **Countries** | Classification | ISO standard, everyone needs it | → SHARED (RBCZ root) |
| **Fee calculation lookup** | Helper table | Only for profitability calculation | → EMBEDDED |

#### Practical Rule

> **"When in doubt, start embedded. First duplicate request = signal to extract."**

**Why?**
- Embedded → Separate is an easy refactor
- Separate → Embedded is hard (consumers depend on it)
- Premature abstraction costs more than late extraction

---

## 8. Naming Convention

### 8.1 Three-Level Naming

| Level | Purpose | Format | Example |
|-------|---------|--------|---------|
| **ID** | Technical identifier | Domain path (colon) | `rbcz:mib:investment:aum` |
| **Slug** | Short reference | lowercase-hyphen | `investment-aum-reporting` |
| **Title** | Business name | Human readable | "Investment AUM Performance Reporting" |

### 8.2 Rules

See [GOV-DM-002-naming-convention.md](GOV-DM-002-naming-convention.md) for detailed rules.

**Key Principles:**
- **Purpose-Driven**: Title reflects business value, not just entity
- **No Application Names**: Use domain names, not system names (EDI, AMS)
- **Domain Prefix**: Slug starts with domain identifier

---

## 9. Maturity Score

Maturity Score indicates production-readiness (per existing RBCZ Governance):

| Criterion | Weight |
|-----------|--------|
| Documentation completeness | 20% |
| Data quality measures | 20% |
| SLA definitions | 20% |
| Governance compliance | 20% |
| Technical implementation | 20% |

**Thresholds:**
- ≥ 80%: Production ready
- 60-79%: Development complete, validation pending
- < 60%: In development

---

## 10. Federated Governance - Guild

| Guild | Responsibilities |
|-------|------------------|
| **Enterprise Architecture** | Technical standards, platform decisions |
| **Data Products & Data Mesh** | This governance, DP lifecycle |
| **Finance & Risk & Controlling** | Financial data quality, regulatory |
| **Development & Operations & Support** | Implementation, operations |
| **GDPR & PII & Data Classification** | Privacy, classification |
| **Cyber Security** | Security standards |

---

## 11. Related Documents

| Document | Purpose |
|----------|---------|
| [GOV-DM-002-naming-convention.md](GOV-DM-002-naming-convention.md) | Detailed naming rules |
| [GOV-DM-003-domain-hierarchy.md](GOV-DM-003-domain-hierarchy.md) | Domain hierarchy & ownership |
| [GOV-DM-004-operating-model.md](GOV-DM-004-operating-model.md) | Operating model, lifecycle, quality |
| [Composability Framework](review/2026-01-08-domain-composability-framework.md) | Composability patterns |
| [Investment DP Catalog](catalogs/investment-dp-catalog.md) | Investment domain DPs |

---

## 12. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Banking Domain Expert | Initial version based on QAR session |

---

## Appendix A: Quick Reference

### Data Product Checklist

- [ ] Unique ID assigned (domain path)
- [ ] Slug defined (lowercase-hyphen)
- [ ] Purpose-driven Title
- [ ] Data Contract YAML exists
- [ ] Domain mapping defined
- [ ] External authority mapped (if new concept)
- [ ] Maturity Score calculated
- [ ] Listed in DPCC Catalog
- [ ] Owner assigned
- [ ] Consumers documented

### Governance Decision Tree

```
New Data Product?
       │
       ▼
Does parent domain concept exist?
       │
   ┌───┴───┐
   YES     NO
   │       │
   ▼       ▼
Extend   Define new +
parent   map to external
   │     authority
   ▼       │
Both: Register in Catalog
      Define Data Contract
      Calculate Maturity
```
