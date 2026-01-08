# Data Product Discovery Questionnaire

> **Purpose:** Structured interview guide for Domain Owner sessions
> **Participants:** Domain Owner, Architect, Business Analyst
> **Method:** QAR (Question → Alternatives → Explanation → Recommendation)
> **Output:** Data Product Catalog entry ready for implementation
> **Version:** 1.8
> **Date:** 2026-01-08

---

## Table of Contents

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Section 1: Domain & Ownership](#section-1-domain--ownership)
   - [Q1.1: Domain Placement](#q11-domain-placement)
   - [Q1.2: Domain Owner Assignment](#q12-domain-owner-assignment)
   - [Q1.3: Existing Concepts Check](#q13-existing-concepts-check)
3. [Section 2: Purpose & Business Value](#section-2-purpose--business-value)
   - [Q2.1: Business Question](#q21-business-question)
   - [Q2.2: Independent Usefulness](#q22-independent-usefulness)
   - [Q2.3: Known Consumers](#q23-known-consumers)
4. [Section 3: Data Product Classification](#section-3-data-product-classification)
   - [Q3.1: Layer Classification](#q31-layer-classification)
   - [Q3.2: Composability Pattern](#q32-composability-pattern)
   - [Q3.3: Reference Data Decision](#q33-reference-data-decision)
5. [Section 4: Naming](#section-4-naming)
   - [Q4.1: Technical ID](#q41-technical-id)
   - [Q4.2: Slug (Short Name)](#q42-slug-short-name)
   - [Q4.3: Business Title](#q43-business-title)
6. [Section 5: Schema & Concepts](#section-5-schema--concepts)
   - [Q5.1: Aggregation Level](#q51-aggregation-level) *(NEW)*
   - [Q5.2: Core Entities](#q52-core-entities)
   - [Q5.3: Key Attributes](#q53-key-attributes)
   - [Q5.4: FIBO Alignment](#q54-fibo-alignment)
7. [Section 6: Data Sources & Dependencies](#section-6-data-sources--dependencies)
   - [Q6.1: Data Sources](#q61-data-sources) *(NEW)*
   - [Q6.2: Reference Data Dependencies](#q62-reference-data-dependencies)
   - [Q6.3: Domain Dependencies](#q63-domain-dependencies)
   - [Q6.4: Cross-Domain Dependencies](#q64-cross-domain-dependencies)
8. [Section 7: Outputs & SLA](#section-7-outputs--sla)
   - [Q7.1: Output Ports](#q71-output-ports)
   - [Q7.2: Freshness SLA](#q72-freshness-sla)
   - [Q7.3: Data Period & Temporality](#q73-data-period--temporality) *(NEW)*
   - [Q7.4: Quality Expectations](#q74-quality-expectations)
9. [Section 8: Security & Compliance](#section-8-security--compliance)
   - [Q8.1: Data Classification](#q81-data-classification)
   - [Q8.2: PII Identification](#q82-pii-identification)
10. [Section 9: Lifecycle](#section-9-lifecycle)
    - [Q9.1: Initial Maturity](#q91-initial-maturity)
    - [Q9.2: Retirement Planning](#q92-retirement-planning)
11. [Section 10: Summary & Validation](#section-10-summary--validation)
    - [Q10.1: DATSIS Checklist](#q101-datsis-checklist)
    - [Q10.2: Naming Validation](#q102-naming-validation)
    - [Q10.3: Dependency Graph Validation](#q103-dependency-graph-validation)
12. [Appendix A: Quick Reference Card](#appendix-a-quick-reference-card)
13. [Appendix B: Session Output Template](#appendix-b-session-output-template)
14. [Related Documents](#related-documents)

---

## How to Use This Guide

1. **Before session:** Architect reviews existing domain context, related DPs
2. **During session:** BA leads questions, Architect validates technical feasibility
3. **After session:** BA drafts DP catalog entry, Architect reviews compliance
4. **Each question:** Follow QAR format - explore alternatives, explain governance context

**Time estimate:** 60-90 minutes per Data Product

---

## Section 1: Domain & Ownership

### Q1.1: Domain Placement

**Question:**
> Where does this Data Product belong in the domain hierarchy?

**Alternatives:**

| Option | Path | Meaning |
|--------|------|---------|
| A | `rbcz:{bu}:{domain}` | Domain-specific (e.g., `rbcz:corporate:gcc`) |
| B | `rbcz:{bu}` | BU-wide shared (e.g., `rbcz:mib`) |
| C | `rbcz` | Enterprise-wide shared |

**Explanation:**
- Domain path determines ownership ([GOV-DM-003](../GOV-DM-003-domain-hierarchy.md) OWN-1)
- Child domains inherit parent concepts but cannot modify them
- Incorrect placement causes governance conflicts later

**Recommendation:**
- Start at lowest specific level (domain)
- Promote to higher level only when cross-domain reuse proven
- Per [GOV-DM-001](../GOV-DM-001-data-mesh-governance.md) Section 7.4: "Start embedded, extract when needed"

---

### Q1.2: Domain Owner Assignment

**Question:**
> Who is accountable for this Data Product?

**Alternatives:**

| Role | Responsibility | Decision Rights |
|------|----------------|-----------------|
| Domain Owner | Business accountability, definition quality | Approve changes, deprecate, delete |
| Data Product Manager | Prioritization, roadmap | Day-to-day decisions |
| Data Engineer | Build & maintain | Technical implementation |

**Explanation:**
- [GOV-004](../../policies/GOV-004-data-ownership.md) requires single accountable owner
- Owner must respond to change requests within 5 business days
- Owner responsible for FIBO mapping validation

**Recommendation:**
- Assign Domain Owner (business role) - not technical lead
- Document contact: `{role}@rbcz.cz`
- Verify owner has authority for this domain level

---

### Q1.3: Existing Concepts Check

**Question:**
> Do concepts that this DP uses already exist in parent domain?

**Alternatives:**

| Scenario | Action |
|----------|--------|
| A - Concept exists in parent | EXTEND parent concept, add domain-specific attributes |
| B - Concept is new | CREATE new concept, map to FIBO/Schema.org |
| C - Concept exists but different meaning | CREATE homonym with qualified name |

**Explanation:**
- [GOV-DM-003](../GOV-DM-003-domain-hierarchy.md) Section 3.3: Child can ADD attributes, cannot CHANGE parent
- Liskov Substitution: Child must work wherever parent is expected
- Homonyms are allowed if meaning is genuinely different

**Recommendation:**
- Always check parent domain first (`rbcz`, `rbcz:{bu}`)
- If extending, only add NEW attributes
- If homonym, document distinction clearly

---

## Section 2: Purpose & Business Value

### Q2.1: Business Question

**Question:**
> What business question does this Data Product answer?

**Alternatives:**

| Type | Example | Indicators |
|------|---------|------------|
| A - Who/What question | "Who are our GCC members?" | Identity, master data |
| B - How much/many question | "What is our AUM?" | Metrics, aggregations |
| C - Why/How question | "Why did customer churn?" | Analytics, insights |
| D - What happened question | "What transactions occurred?" | Events, audit trail |

**Explanation:**
- [GOV-DM-002](../GOV-DM-002-naming-convention.md) [TITLE-1](../GOV-DM-002-naming-convention.md#52-rules): Must state business purpose
- Purpose-driven naming prevents "data dump" products
- Clear purpose helps consumers evaluate relevance

**Recommendation:**
- Formulate as question the DP answers
- Use format: "What/Who/How [specific business need]?"
- Document 2-4 business questions per DP

---

### Q2.2: Independent Usefulness

**Question:**
> Is this Data Product useful on its own, without other DPs?

**Alternatives:**

| Answer | Implication |
|--------|-------------|
| A - Yes, fully independent | Good DP boundary |
| B - Partially, needs reference data | OK - reference DPs are expected dependencies |
| C - No, only makes sense with other DPs | Consider merging or redesigning |

**Explanation:**
- Design principle: "Every DP must be independently useful"
- Prevents tight coupling and cascade failures
- Enables incremental adoption

**Recommendation:**
- If answer is C, reconsider DP boundary
- Dependencies on reference data (L1) are acceptable
- Dependencies on other domain DPs should be minimized

---

### Q2.3: Known Consumers

**Question:**
> Who will use this Data Product?

**Alternatives:**

| Consumer Type | Example | Registration |
|---------------|---------|--------------|
| A - Known application | MS PaaS, Reporting | Mandatory ([COMP-6](../GOV-DM-001-data-mesh-governance.md)) |
| B - Known team | Marketing, Risk | Mandatory |
| C - Unknown/hypothetical | "Maybe someone" | WARNING: Build for known need |
| D - Internal processing only | Intermediate step | Consider: Is this really a DP? |

**Explanation:**
- [GOV-DM-001](../GOV-DM-001-data-mesh-governance.md) [COMP-6](../GOV-DM-001-data-mesh-governance.md): Consumer MUST be registered
- Anti-pattern: "Build it and they will come"
- No consumers = no Data Product needed

**Recommendation:**
- List specific consumers by name
- If no known consumer, question whether DP is needed
- Document use case for each consumer

---

## Section 3: Data Product Classification

### Q3.1: Layer Classification

**Question:**
> Which layer does this Data Product belong to?

**Alternatives:**

| Layer | Purpose | Ownership | Examples |
|-------|---------|-----------|----------|
| **L1 - Shared Reference** | Cross-BU standards | CDO | countries, currencies |
| **L2 - Domain Master Data** | Single source of truth for domain | Domain Owner | gcc-members, investment-products |
| **L3 - Analytics** | Answer business questions | Domain Owner | gcc-groups, aum-reporting |

**Explanation:**
- [GOV-DM-001](../GOV-DM-001-data-mesh-governance.md) Section 7.1 defines three layers
- L1 is owned by CDO, not domain
- L3 typically aggregates L2 data

**Recommendation:**
- Most new DPs are L2 (master data) or L3 (analytics)
- L1 requires CDO approval (enterprise-wide impact)
- Layer determines governance intensity

---

### Q3.2: Composability Pattern

**Question:**
> How does this DP relate to other DPs in the domain?

**Alternatives:**

| Pattern | When | Example |
|---------|------|---------|
| A - REFERENCES (R→) | FK lookup to another DP | gcc-members → gcc-natural-persons |
| B - AGGREGATES (A→) | Summarizes/counts from another DP | gcc-groups → gcc-relations |
| C - STANDALONE | No dependencies within domain | gcc-requests |
| D - EMBEDDED | Data only used by this DP | Helper lookup table |

**Explanation:**
- [GOV-DM-001](../GOV-DM-001-data-mesh-governance.md) Section 7.3 defines dependency rules
- [COMP-5](../GOV-DM-001-data-mesh-governance.md): No circular dependencies
- [COMP-7](../GOV-DM-001-data-mesh-governance.md): Cross-domain requires contract

**Recommendation:**
- Draw dependency graph before implementation
- Prefer STANDALONE when possible (reduces coupling)
- EMBEDDED is OK for truly internal data

---

### Q3.3: Reference Data Decision

**Question:**
> Does this DP contain reference data that could be shared?

**Alternatives:**

| Signal | Reuse Probability | Action |
|--------|-------------------|--------|
| A - Entity/classification | HIGH | Consider separate DP |
| B - Calculation/metric | LOW | Keep embedded |
| C - Someone else already asking | HIGH | Definitely separate |
| D - Changes independently | MEDIUM | Consider separate |

**Explanation:**
- [GOV-DM-001](../GOV-DM-001-data-mesh-governance.md) Section 7.4: Decision tree for embedded vs separate
- "When in doubt, start embedded. First duplicate request = signal to extract."
- Refactoring is cheap, over-engineering is expensive

**Recommendation:**
- Use decision tree: Entity? → Probably separate
- Check if data exists in source as master table
- Ask: "Can I imagine someone else wanting this?"

---

## Section 4: Naming

### Q4.1: Technical ID

**Question:**
> What will be the technical identifier (ID) for this Data Product?

**Alternatives:**

Format: `{entity}:{bu}:{domain}:{concept}`

| Example | Validity |
|---------|----------|
| `rbcz:corporate:gcc:members` | CORRECT |
| `gcc:members` | WRONG - missing full path |
| `RBCZ:Corporate:GCC:Members` | WRONG - must be lowercase |
| `rbcz:corporate:gcc-members` | WRONG - use colon, not hyphen |

**Explanation:**
- [GOV-DM-002](../GOV-DM-002-naming-convention.md) ID rules: lowercase, colon separator, full path
- [ADR-010](../../decisions/ADR-010-domain-path-notation.md) mandates colon notation
- ID must match domain hierarchy exactly

**Recommendation:**
- Always include full path from `rbcz`
- Use colon separator (not slash, not hyphen)
- Validate against domain hierarchy

---

### Q4.2: Slug (Short Name)

**Question:**
> What will be the short name (slug) for URLs and references?

**Alternatives:**

Format: `{domain-prefix}-{purpose-description}`

| Example | Validity | Issue |
|---------|----------|-------|
| `gcc-members` | CORRECT | Domain prefix + purpose |
| `members` | WRONG | Missing domain prefix |
| `gcc_members` | WRONG | Use hyphen, not underscore |
| `ms-paas-gcc-storage` | WRONG | No application names |

**Explanation:**
- [GOV-DM-002](../GOV-DM-002-naming-convention.md) SLUG rules: lowercase, hyphen, domain prefix, max 4 words
- [SLUG-5](../GOV-DM-002-naming-convention.md#42-rules): No application names (EDI, AMS, Siebel)
- Purpose-oriented, not entity-only

**Recommendation:**
- Start with domain prefix: `gcc-`, `investment-`, `mib-`
- Describe purpose, not just entity
- Keep under 4 words

---

### Q4.3: Business Title

**Question:**
> What will be the business name (Title) for the catalog?

**Alternatives:**

| Bad (Entity-Only) | Good (Purpose-Driven) |
|-------------------|----------------------|
| "GCC Members" | "GCC Group Membership Registry" |
| "EDI AUM" | "Investment AUM Performance Reporting" |
| "Customer Master" | "Investment Client Portfolio Overview" |

**Explanation:**
- [GOV-DM-002](../GOV-DM-002-naming-convention.md) [TITLE-1](../GOV-DM-002-naming-convention.md#52-rules): Must state business purpose
- [TITLE-5](../GOV-DM-002-naming-convention.md#52-rules): No technical jargon
- [TITLE-6](../GOV-DM-002-naming-convention.md#52-rules): No application names

**Recommendation:**
- Format: "{Domain} {Business Value/Purpose} [for {Use Case}]"
- Use purpose keywords: Reporting, Overview, Registry, Analysis
- Human readable, Title Case

---

## Section 5: Schema & Concepts

### Q5.1: Aggregation Level

**Question:**
> At what level of granularity/aggregation is the data?

**Alternatives:**

| Level | Description | Examples |
|-------|-------------|----------|
| **Transaction** | Individual events/records | Single order, payment, login |
| **Daily** | Aggregated per day | Daily balances, daily totals |
| **Customer** | Aggregated per customer | Customer profile, portfolio summary |
| **Segment** | Aggregated per segment/group | Segment metrics, cohort analysis |
| **Period** | Monthly/quarterly/yearly snapshots | Monthly closing, annual reports |

**Explanation:**
- Aggregation level determines what questions the DP can answer
- Lower granularity = more flexibility but larger data volume
- Higher aggregation = faster queries but less detail
- Regulatory reporting often requires specific granularity (CNB, BCBS 239)

**Recommendation:**
- Document the grain explicitly in schema
- If multiple levels needed, consider separate DPs (raw vs aggregated)
- Match granularity to consumer use cases
- Consider regulatory requirements (some require transaction-level)

---

### Q5.2: Core Entities

**Question:**
> What core business entities (concepts) does this DP contain?

**Alternatives:**

| Type | Example | CST Section |
|------|---------|-------------|
| A - Business entity | Natural Person, Legal Entity, Order | `# Concepts` |
| B - Relationship | Ownership, Control, Membership | `# Binary Verb Concepts` |
| C - Classification | Country, Currency, Status | Reference DP or `# Property Types` |

**Explanation:**
- [GOV-013](../../policies/GOV-013-data-product-governance.md) Rule DP-001: Property types MUST NOT appear in concepts
- Concepts = business entities/nouns
- Property Types = types of attributes

**Recommendation:**
- List only business entities as concepts
- Relationships go to Binary Verb Concepts
- Classifications may be separate reference DPs

---

### Q5.3: Key Attributes

**Question:**
> What are the key attributes for each concept?

**Alternatives:**

| Attribute Type | Example | FIBO Mapping |
|----------------|---------|--------------|
| Identifier | party_id, member_id | fibo-fnd:PartyIdentifier |
| Name | first_name, company_name | fibo-fnd:GivenName |
| Classification | country_code, status | Reference to codelist |
| Relationship FK | parent_member_id | Reference to other DP |
| Metric | shares_percentage | Domain-specific |

**Explanation:**
- Every attribute needs semantic type ([GOV-010](../../policies/GOV-010-semantic-typing.md))
- Primitives: String, Integer, Number, Boolean, Date, Datetime
- Custom types need definition in Property Types

**Recommendation:**
- Identify primary key for each entity
- Identify foreign keys to other DPs
- Map standard attributes to FIBO where possible

---

### Q5.4: FIBO Alignment

**Question:**
> How do concepts map to FIBO ontology?

**Alternatives:**

| Scenario | FIBO Mapping | Action |
|----------|--------------|--------|
| A - FIBO equivalent exists | fibo-fnd:NaturalPerson | Map directly |
| B - FIBO similar exists | fibo-fnd:Party (broader) | Map to closest + document |
| C - Domain-specific, no FIBO | GCC Membership | Mark as domain-only |
| D - Inherited from parent | Parent already mapped | Mapping inherited |

**Explanation:**
- [ADR-017](../../decisions/ADR-017-domain-first-fibo-aligned.md): Domain-First, FIBO-Aligned
- FIBO provides semantic interoperability
- Not everything maps to FIBO - domain-specific is OK

**Recommendation:**
- Check FIBO-FND first (foundational)
- Check FIBO-BE for business entities
- Document "domain-only" for bank-specific concepts

---

## Section 6: Data Sources & Dependencies

### Q6.1: Data Sources

**Question:**
> Who/what provides the source data for this DP?

**Alternatives:**

| Source Type | Examples | Considerations |
|-------------|----------|----------------|
| **Source System** | Core Banking, CRM, Trading Platform | System stability, data quality at source |
| **Internal Domain** | Another DP within RBCZ | Cross-domain contract needed |
| **External Provider** | Market data, Credit bureau, Regulators | SLA, costs, data format |
| **Manual Input** | Excel uploads, User entry | Quality risks, audit trail |
| **Derived/Calculated** | Aggregations from other DPs | Lineage documentation |

**Explanation:**
- Source identification is critical for data lineage (BCBS 239)
- Source quality directly impacts DP quality
- External sources may have licensing/cost implications
- Multiple sources require reconciliation strategy

**Recommendation:**
- List ALL source systems explicitly
- Document source system owners/contacts
- Identify data extraction method (API, batch, CDC)
- Note any transformation at source vs in DP
- Per [ADR-066](../../decisions/ADR-066-fix-at-source.md): Fix quality issues at source, not downstream

---

### Q6.2: Reference Data Dependencies

**Question:**
> What reference data (L1) does this DP require?

**Alternatives:**

| Reference DP | Usage | Example |
|--------------|-------|---------|
| `rbcz:countries` | Country code validation | `country_code` field |
| `rbcz:currencies` | Currency code validation | `currency` field |
| `rbcz:calendars` | Business day calculation | Date fields |

**Explanation:**
- [COMP-1](../GOV-DM-001-data-mesh-governance.md): Shared reference consumption is always allowed
- Reference DPs owned by CDO
- Standard ISO codelists

**Recommendation:**
- Always validate country/currency against reference DPs
- Reference DPs provide semantic enrichment
- Document dependency in catalog

---

### Q6.3: Domain Dependencies

**Question:**
> What other DPs within the domain does this DP depend on?

**Alternatives:**

| Dependency Type | Notation | Example |
|-----------------|----------|---------|
| R→ REFERENCES | FK lookup | gcc-members → gcc-natural-persons |
| A→ AGGREGATES | Summarizes | gcc-groups → gcc-relations |

**Explanation:**
- [COMP-2](../GOV-DM-001-data-mesh-governance.md): Same domain allowed
- [COMP-3](../GOV-DM-001-data-mesh-governance.md): Parent domain allowed
- [COMP-5](../GOV-DM-001-data-mesh-governance.md): No circular dependencies

**Recommendation:**
- Draw dependency graph
- Verify no cycles exist
- Document each dependency with reason

---

### Q6.4: Cross-Domain Dependencies

**Question:**
> Does this DP need data from another domain?

**Alternatives:**

| Scenario | Rule | Action |
|----------|------|--------|
| A - No cross-domain | OK | Proceed |
| B - Parent domain | [COMP-3](../GOV-DM-001-data-mesh-governance.md) allowed | Document |
| C - Sibling domain | [COMP-4](../GOV-DM-001-data-mesh-governance.md): Requires contract | Escalate to Guild |
| D - Different BU | [COMP-7](../GOV-DM-001-data-mesh-governance.md): Requires DP + Contract | Formal agreement |

**Explanation:**
- Cross-domain is allowed but requires explicit contract
- [COMP-7](../GOV-DM-001-data-mesh-governance.md): Production exchange across domain boundary requires DP + Contract
- Prevents hidden dependencies

**Recommendation:**
- Prefer same-domain or parent-domain dependencies
- If cross-domain needed, create formal contract
- Register as consumer in source DP

---

## Section 7: Outputs & SLA

### Q7.1: Output Ports

**Question:**
> What output ports does this DP provide?

**Alternatives:**

| Port Type | Format | Typical SLA |
|-----------|--------|-------------|
| Batch | Delta Lake, Parquet | T+1 |
| Micro-batch | Delta Lake | T+1h |
| Real-time API | REST, GraphQL | < 100ms |
| Streaming | Kafka | Near real-time |

**Explanation:**
- [GOV-DM-001](../GOV-DM-001-data-mesh-governance.md): Multimodality is mandatory feature
- Different consumers need different formats
- SLA per port, not per DP

**Recommendation:**
- Start with Batch (T+1) - simplest
- Add real-time only if business need proven
- Document SLA for each port

---

### Q7.2: Freshness SLA

**Question:**
> How fresh must the data be?

**Alternatives:**

| SLA | Meaning | Use Case |
|-----|---------|----------|
| T+1 | Data from yesterday | Reporting, analytics |
| T+1h | Data up to 1 hour old | Operational dashboards |
| Real-time | < 5 min delay | Transaction processing |
| Event-driven | Immediate | Notifications, alerts |

**Explanation:**
- [GOV-DM-004](../GOV-DM-004-operating-model.md) Section 7.3: Freshness is SLA metric
- Stricter SLA = higher operational cost
- Mismatch causes consumer disappointment

**Recommendation:**
- Start with T+1 (covers 80% of use cases)
- Real-time only for proven operational need
- Document consumer expectations explicitly

---

### Q7.3: Data Period & Temporality

**Question:**
> What time period does the data cover and how is it structured temporally?

**Alternatives:**

| Period Type | Description | Examples |
|-------------|-------------|----------|
| **Snapshot** | Point-in-time state | Current balances, today's positions |
| **Daily** | Daily records/changes | Daily closing balances, daily transactions |
| **Monthly Closing** | Month-end snapshots | Monthly financial statements, regulatory reports |
| **Quarterly/Annual** | Period-end aggregations | Quarterly results, annual reports |
| **Historical** | Full history preserved | Transaction history, audit trail |
| **Rolling Window** | Last N days/months | Last 12 months, trailing 30 days |

**Explanation:**
- Period type affects storage, query patterns, and retention
- Regulatory reporting often requires specific periods (CNB monthly, annual)
- Historical data needed for trend analysis and audit
- Rolling windows balance storage vs analytical needs

**Recommendation:**
- Document the business calendar (fiscal year, reporting periods)
- Specify retention policy per period type
- Consider regulatory requirements (CNB, BCBS 239)
- If multiple periods needed, document each separately

---

### Q7.4: Quality Expectations

**Question:**
> What are the data quality expectations?

**Alternatives:**

| Dimension | Question | Threshold |
|-----------|----------|-----------|
| Completeness | % non-null values | > 95% |
| Accuracy | % valid values | > 99% |
| Uniqueness | No duplicates | 100% for PK |
| Timeliness | Meets freshness SLA | > 99.5% |

**Explanation:**
- [GOV-DM-004](../GOV-DM-004-operating-model.md) Section 7.1: Three quality layers (Maturity, Data Quality, SLA)
- Quality dimensions from DAMA-DMBOK
- Thresholds enforceable via pipeline

**Recommendation:**
- Define thresholds per dimension
- Critical < 80% = block deployment
- Warning 80-95% = notify owner

---

## Section 8: Security & Compliance

### Q8.1: Data Classification

**Question:**
> What is the data classification for this DP?

**Alternatives:**

| Classification | Examples | Access Control |
|----------------|----------|----------------|
| Public | ISO codes, product catalog | Open |
| Internal | Aggregated metrics | RBCZ employees |
| Confidential | Customer details | Need-to-know |
| Restricted | PII, financial details | Explicit approval |

**Explanation:**
- DATSIS 'S' = Secure (classification assigned) - see [GOV-DM-001](../GOV-DM-001-data-mesh-governance.md) Section 4
- [GOV-DM-004](../GOV-DM-004-operating-model.md): PII/GDPR compliance is Phase 2 enforcement
- Untagged PII is CRITICAL violation

**Recommendation:**
- Default to most restrictive if unsure
- PII requires explicit tagging
- Document GDPR basis if personal data

---

### Q8.2: PII Identification

**Question:**
> Does this DP contain personal data (PII)?

**Alternatives:**

| PII Type | Examples | Requirement |
|----------|----------|-------------|
| Direct identifiers | Name, birth date, address | Must tag, GDPR basis |
| Indirect identifiers | Customer ID, account number | Must tag, access control |
| Sensitive PII | Health, political, religious | Requires DPO approval |
| No PII | Reference data, aggregates | Document as "No PII" |

**Explanation:**
- GDPR requires legal basis for processing
- PII must be tagged in schema
- [GOV-DM-004](../GOV-DM-004-operating-model.md): Untagged PII blocks deployment

**Recommendation:**
- Identify all PII fields explicitly
- Document GDPR legal basis per field
- Consider pseudonymization for analytics

---

## Section 9: Lifecycle

### Q9.1: Initial Maturity

**Question:**
> What lifecycle phase is this DP starting in?

**Alternatives:**

| Phase | Gate | Deliverable |
|-------|------|-------------|
| IDEATE | Sponsor approval | Business case |
| DESIGN | Contract review | Data Contract YAML |
| BUILD | Tests green | Working DP |
| PUBLISH | Maturity ≥ 60% | Catalog entry |

**Explanation:**
- [GOV-DM-004](../GOV-DM-004-operating-model.md) Section 6: Six-phase lifecycle
- Maturity Score determines production readiness
- < 40% = blocked, 40-60% = warning, > 60% = publish

**Recommendation:**
- New DP starts at IDEATE (this session)
- Exit this session with DESIGN deliverable
- Target PUBLISH within sprint cycle

---

### Q9.2: Retirement Planning

**Question:**
> Is there a plan for retiring this DP?

**Alternatives:**

| Scenario | Action |
|----------|--------|
| A - Indefinite | Document as "ongoing" - review annually |
| B - Project-bound | Document end date, migration path |
| C - Replacing existing | Document deprecation of predecessor |

**Explanation:**
- [GOV-DM-004](../GOV-DM-004-operating-model.md) Section 6.3: RETIRE phase often forgotten
- Zombie DPs cost money and create confusion
- Consumers need 3-month deprecation notice

**Recommendation:**
- Even "indefinite" needs annual review
- If replacing existing, plan migration
- Document predecessor DP if applicable

---

## Section 10: Summary & Validation

### Q10.1: DATSIS Checklist

**Question:**
> Does the DP meet all DATSIS characteristics?

| Characteristic | Question | Status |
|----------------|----------|--------|
| **D**iscoverable | Will be in DPCC Catalog? | [ ] |
| **A**ddressable | Has unique ID (domain path)? | [ ] |
| **T**rustworthy | Maturity Score defined? | [ ] |
| **S**elf-describing | Data Contract exists? | [ ] |
| **I**nteroperable | Domain mapping + FIBO? | [ ] |
| **S**ecure | Classification assigned? | [ ] |

**Recommendation:**
- All must be checked before PUBLISH
- Missing = block at gate
- This is minimum for production DP

---

### Q10.2: Naming Validation

**Question:**
> Are all three names consistent and valid?

| Level | Value | Valid? |
|-------|-------|--------|
| ID | `rbcz:...` | [ ] Lowercase, colons, full path |
| Slug | `domain-purpose` | [ ] Lowercase, hyphens, domain prefix |
| Title | "Domain Purpose Description" | [ ] Title Case, purpose-driven |

**Recommendation:**
- All three must refer to same product
- No application names in any
- Use [GOV-DM-002](../GOV-DM-002-naming-convention.md) validation checklist

---

### Q10.3: Dependency Graph Validation

**Question:**
> Is the dependency graph complete and cycle-free?

```
Check:
[ ] All R→ dependencies documented
[ ] All A→ dependencies documented
[ ] No circular dependencies ([COMP-5](../GOV-DM-001-data-mesh-governance.md))
[ ] Cross-domain has contract ([COMP-7](../GOV-DM-001-data-mesh-governance.md))
[ ] All consumers registered ([COMP-6](../GOV-DM-001-data-mesh-governance.md))
```

**Recommendation:**
- Draw graph before implementation
- Validate with Architect
- Update when dependencies change

---

## Appendix A: Quick Reference Card

```
DATA PRODUCT DISCOVERY - QUICK CHECKLIST (31 Questions)

DOMAIN & OWNERSHIP
[ ] Domain path determined (Q1.1)
[ ] Owner assigned (Q1.2)
[ ] Parent concepts checked (Q1.3)

PURPOSE & VALUE
[ ] Business question defined (Q2.1)
[ ] Independent usefulness verified (Q2.2)
[ ] Consumers identified (Q2.3)

CLASSIFICATION
[ ] Layer assigned L1/L2/L3 (Q3.1)
[ ] Composability pattern defined (Q3.2)
[ ] Reference data decision made (Q3.3)

NAMING ([GOV-DM-002](../GOV-DM-002-naming-convention.md))
[ ] ID: rbcz:bu:domain:concept (Q4.1)
[ ] Slug: domain-purpose (Q4.2)
[ ] Title: "Domain Purpose Description" (Q4.3)

SCHEMA
[ ] Aggregation level defined (Q5.1)        ← NEW
[ ] Concepts listed (Q5.2)
[ ] Key attributes defined (Q5.3)
[ ] FIBO mappings identified (Q5.4)

DATA SOURCES & DEPENDENCIES
[ ] Source systems identified (Q6.1)        ← NEW
[ ] Reference DPs listed (Q6.2)
[ ] Domain dependencies mapped (Q6.3)
[ ] Cross-domain validated (Q6.4)

OUTPUTS & SLA
[ ] Output ports defined (Q7.1)
[ ] Freshness SLA set (Q7.2)
[ ] Data period/temporality defined (Q7.3)  ← NEW
[ ] Quality thresholds defined (Q7.4)

SECURITY
[ ] Classification assigned (Q8.1)
[ ] PII fields tagged (Q8.2)

LIFECYCLE
[ ] Initial phase determined (Q9.1)
[ ] Retirement considered (Q9.2)

FINAL VALIDATION
[ ] DATSIS complete (Q10.1)
[ ] Naming valid (Q10.2)
[ ] Dependencies valid (Q10.3)
```

---

## Appendix B: Session Output Template

After completing discovery session, produce:

```markdown
# Data Product: {Title}

## Summary
| Field | Value |
|-------|-------|
| ID | `rbcz:...` |
| Slug | `domain-purpose` |
| Title | "..." |
| Owner | ... |
| Layer | L1/L2/L3 |
| Status | DRAFT |

## Purpose
{Business question this DP answers}

## Business Questions
1. ...
2. ...

## Schema
| Concept | FIBO | Key Attributes |
|---------|------|----------------|
| ... | ... | ... |

**Aggregation Level:** {transaction/daily/customer/segment/period}

## Data Sources
| Source System | Type | Extraction |
|---------------|------|------------|
| ... | ... | API/Batch/CDC |

## Dependencies
- R→ `...` (reason)
- A→ `...` (reason)

## Consumers
| Consumer | Use Case |
|----------|----------|
| ... | ... |

## SLA
| Port | Format | Freshness |
|------|--------|-----------|
| Batch | Delta Lake | T+1 |

**Data Period:** {snapshot/daily/monthly/quarterly/historical/rolling}

## Security
| Classification | PII |
|----------------|-----|
| ... | Yes/No |

## Next Steps
1. [ ] Create Data Contract YAML
2. [ ] Architect review
3. [ ] Implementation
```

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [GOV-DM-001](../GOV-DM-001-data-mesh-governance.md) | Data Mesh principles |
| [GOV-DM-002](../GOV-DM-002-naming-convention.md) | Naming convention |
| [GOV-DM-003](../GOV-DM-003-domain-hierarchy.md) | Domain hierarchy |
| [GOV-DM-004](../GOV-DM-004-operating-model.md) | Operating model |
| [GOV-004](../../policies/GOV-004-data-ownership.md) | Data ownership |
| [GOV-013](../../policies/GOV-013-data-product-governance.md) | DP governance |
| [GCC Catalog](../catalogs/gcc-dp-catalog.md) | Example DP catalog |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Senior Data Mesh Consultant | Initial version |
| 1.1 | 2026-01-08 | Senior Data Mesh Consultant | Translated to English per documentation standards |
| 1.2 | 2026-01-08 | Senior Data Mesh Consultant | Added Table of Contents with navigation links |
| 1.3 | 2026-01-08 | Senior Data Mesh Consultant | Added 3 questions from scan review: Q5.1 Aggregation Level, Q6.1 Data Sources, Q7.3 Data Period & Temporality. Total: 31 questions. |
| 1.4 | 2026-01-08 | Senior Data Mesh Consultant | Added hyperlinks to all referenced governance documents (GOV-DM-*, GOV-*, ADR-*). |
| 1.5 | 2026-01-08 | Senior Data Mesh Consultant | Added hyperlinks to all COMP rules (COMP-1 through COMP-7). |
| 1.6 | 2026-01-08 | Senior Data Mesh Consultant | Fixed missing GOV-DM-002 hyperlinks in validation section. |
| 1.7 | 2026-01-08 | Senior Data Mesh Consultant | Added hyperlinks to naming rules (TITLE-1/5/6, SLUG-5). |
| 1.8 | 2026-01-08 | Senior Data Mesh Consultant | Fixed naming rule anchors: SLUG→#42-rules, TITLE→#52-rules. |
