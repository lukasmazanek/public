# GCC Domain - Data Product Catalog

> **Status:** DRAFT
> **Version:** 3.6
> **Created:** 2026-01-08
> **Owner:** Data Mesh Consultant
> **Source:** MVP2: GCC Storage (Vil Shakirov, 07.01.2026)
> **Based on:** GOV-DM-001, GOV-DM-003, QAR session 2026-01-08

---

## 1. Executive Summary

This catalog defines Data Products for **GCC (Group of Connected Clients)** - a subdomain of Corporate BU for identifying and managing connected parties.

### Design Principles

1. **Every DP must have a clear purpose** - no known purpose = no product needed
2. **Single Source of Truth** - identity data at RBCZ level (concepts), instances in domains
3. **Every DP must be independently useful** - makes sense even without others

### Domain Placement

```
RBCZ (Enterprise)
├── countries                          ← Reference (REUSE)
├── currencies                         ← Reference (REUSE)
├── [Concepts: Party, NaturalPerson, LegalEntity, Customer]
│
└── Corporate (BU)
    └── GCC (Subdomain)
        ├── gcc-natural-persons        ← Natural persons in GCC
        ├── gcc-legal-entities         ← Legal entities in GCC
        ├── gcc-members                ← GCC membership (role)
        ├── gcc-relations              ← Ownership & control
        ├── gcc-groups                 ← Aggregated structure
        ├── gcc-requests               ← Request audit trail
        └── gcc-financials             ← Financial indicators
```

### Data Product Summary

| Layer | Count | Owner |
|-------|-------|-------|
| L1 - Shared Reference | 2 | RBCZ (reuse) |
| L2 - Domain Master Data | 5 | GCC Product Owner |
| L3 - Analytics | 2 | GCC Product Owner |
| **Total** | **9** | |

### Relationship Model

```
gcc-natural-persons    gcc-legal-entities
(WHO they are)         (WHO they are)
        │                     │
        └────────┬────────────┘
                 │ REFERENCES (party_id + party_type)
                 ▼
           gcc-members
           (ROLE in GCC)
                 │
                 │ REFERENCES (parent/child member_id)
                 ▼
           gcc-relations
           (HOW they are connected)
                 │
                 │ AGGREGATES
                 ▼
            gcc-groups
            (group STRUCTURE)
```

---

## 2. Reference Data Products (REUSE)

These DPs exist at RBCZ level - GCC consumes them.

### DP-REF-001: countries

| Field | Value |
|-------|-------|
| **ID** | `rbcz:countries` |
| **Purpose** | **What countries exist?** ISO 3166-1 codes for country_code validation. |
| **GCC Usage** | `country_code` in gcc-natural-persons, gcc-legal-entities |

### DP-REF-002: currencies

| Field | Value |
|-------|-------|
| **ID** | `rbcz:currencies` |
| **Purpose** | **What currencies exist?** ISO 4217 codes for ownership deposits. |
| **GCC Usage** | `currency` in gcc-relations (ownership) |

---

## 3. GCC Data Products

**Owner:** GCC Product Owner (under Corporate BU)
**Domain Path:** `RBCZ:Corporate:GCC`

---

### DP-GCC-001: gcc-natural-persons

| Field | Value |
|-------|-------|
| **ID** | `rbcz:corporate:gcc:natural-persons` |
| **Title** | GCC Natural Persons |
| **Owner** | GCC Product Owner |
| **Layer** | L2 - Domain Master Data |
| **FIBO** | fibo-fnd:NaturalPerson |

**Purpose:** **Which natural persons are in GCC groups?**

Contains identification data of natural persons who are GCC group members. Independently useful for natural person reporting.

**Business Questions:**
- Who is this natural person? (name, date of birth)
- Which natural persons are in GCC?
- How many natural persons are in GCC groups?

**Schema:**

| Attribute | Type | Description | FIBO |
|-----------|------|-------------|------|
| natural_person_id | bigint | PK | - |
| party_id | varchar(50) | Business key (unique) | fibo-fnd:PartyIdentifier |
| first_name | varchar(50) | First name | fibo-fnd:GivenName |
| last_name | varchar(50) | Last name | fibo-fnd:FamilyName |
| date_of_birth | date | Date of birth | fibo-fnd:DateOfBirth |
| country_code | varchar(50) | Country (ISO 3166-1) | fibo-fnd:Country |
| address | text | Address | fibo-fnd:Address |
| source_id | varchar(50) | ID in source system | - |
| source_name | varchar(50) | Source name | - |

**Output Ports:**

| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Dependencies:**
- R→ `rbcz:countries` (country_code validation)

**Consumers:**
- `gcc-members` (REFERENCES)
- MS PaaS Application

---

### DP-GCC-002: gcc-legal-entities

| Field | Value |
|-------|-------|
| **ID** | `rbcz:corporate:gcc:legal-entities` |
| **Title** | GCC Legal Entities |
| **Owner** | GCC Product Owner |
| **Layer** | L2 - Domain Master Data |
| **FIBO** | fibo-fnd:LegalEntity |

**Purpose:** **Which legal entities are in GCC groups?**

Contains identification data of companies that are GCC group members. Independently useful for legal entity reporting.

**Business Questions:**
- Who is this company? (business ID, tax ID, name)
- Which companies are in GCC?
- How many legal entities are in GCC groups?

**Schema:**

| Attribute | Type | Description | FIBO |
|-----------|------|-------------|------|
| legal_entity_id | bigint | PK | - |
| party_id | varchar(50) | Business key (unique) | fibo-fnd:PartyIdentifier |
| name | varchar(50) | Company name | fibo-fnd:Name |
| business_id_number | varchar(50) | Business ID (unique) | fibo-fnd:BusinessIdentifier |
| tax_id_number | varchar(50) | Tax ID (unique) | fibo-fnd:TaxIdentificationNumber |
| country_code | varchar(50) | Country (ISO 3166-1) | fibo-fnd:Country |
| address | text | Registered address | fibo-fnd:Address |
| source_id | varchar(50) | ID in source system | - |
| source_name | varchar(50) | Source name | - |

**Unique Constraints:**
- `party_id` (UNIQUE)
- `business_id_number` (UNIQUE)
- `tax_id_number` (UNIQUE)

**Output Ports:**

| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Dependencies:**
- R→ `rbcz:countries` (country_code validation)

**Consumers:**
- `gcc-members` (REFERENCES)
- MS PaaS Application

---

### DP-GCC-003: gcc-members

| Field | Value |
|-------|-------|
| **ID** | `rbcz:corporate:gcc:members` |
| **Title** | GCC Members |
| **Owner** | GCC Product Owner |
| **Layer** | L2 - Domain Master Data |
| **FIBO** | - (GCC-specific) |

**Purpose:** **Who is member of which GCC group and what role do they have?**

Links identities (natural-persons, legal-entities) with GCC groups. Contains GCC-specific attributes (is_head, cribis_id). Unified reference for gcc-relations.

**Business Questions:**
- Who is a member of GCC group X?
- Who is the head of the GCC group?
- Who are all GCC members? (UC2: External Account Income Calculator)

**Schema:**

| Attribute | Type | Description |
|-----------|------|-------------|
| member_id | bigint | PK |
| party_id | varchar(50) | FK → natural-persons OR legal-entities |
| party_type | varchar(20) | 'natural' / 'legal' (discriminator) |
| is_head_of_gcc | boolean | Is head of GCC group? |
| cribis_id | varchar(50) | CRIBIS identifier |
| source_id | varchar(50) | ID in source system |
| source_name | varchar(50) | Source name |

**API Operations:**

| Operation | Method | SLA |
|-----------|--------|-----|
| `POST /subject` | upsert_member | Real-time |

**Output Ports:**

| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Dependencies:**
- R→ `gcc-natural-persons` (party_id WHERE party_type = 'natural')
- R→ `gcc-legal-entities` (party_id WHERE party_type = 'legal')

**Consumers:**
- `gcc-relations` (REFERENCES as parent/child)
- `gcc-groups` (AGGREGATES)
- External Account Income Calculator (UC2)
- MS PaaS Application

---

### DP-GCC-004: gcc-relations

| Field | Value |
|-------|-------|
| **ID** | `rbcz:corporate:gcc:relations` |
| **Title** | GCC Relations |
| **Owner** | GCC Product Owner |
| **Layer** | L2 - Domain Master Data |
| **FIBO** | fibo-be:Ownership, fibo-be:Control |

**Purpose:** **What are ownership and control relations between GCC members?**

Ownership (who owns whom, what %) and Control (who controls whom) relations. Foundation for GCC group calculation.

**Business Questions:**
- Who owns this company and what %?
- Who controls this person/company?
- What is the ownership chain from head to member?
- Is this relation historical or current?

**Schema:**

| Attribute | Type | Description |
|-----------|------|-------------|
| relation_id | bigint | PK |
| parent_member_id | bigint | FK → gcc-members (owner/controller) |
| child_member_id | bigint | FK → gcc-members (owned/controlled) |
| relation_type | varchar(20) | 'ownership' / 'control' |
| relation_name | varchar(50) | Relation description |
| relation_start_date | date | Relation start date |
| historic | boolean | Is historical record? |
| shares_percentage | numeric | Ownership share % (only ownership) |
| deposit | numeric | Deposit (only ownership) |
| currency | varchar(3) | Deposit currency ISO 4217 (only ownership) |
| reliability_id | varchar(2) | Data quality indicator |
| request_id | bigint | FK → gcc-requests (audit trail) |
| source_relation_id | varchar(50) | Relation ID in source |
| source_name | varchar(50) | Source name |

**API Operations:**

| Operation | Method | SLA |
|-----------|--------|-----|
| `POST /relation` | upsert_relation | Real-time |

**Output Ports:**

| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Dependencies:**
- R→ `gcc-members` (parent_member_id)
- R→ `gcc-members` (child_member_id)
- R→ `rbcz:currencies` (currency)
- R→ `gcc-requests` (request_id - audit trail)

**Consumers:**
- `gcc-groups` (AGGREGATES)
- MS PaaS Application

---

### DP-GCC-005: gcc-groups

| Field | Value |
|-------|-------|
| **ID** | `rbcz:corporate:gcc:groups` |
| **Title** | GCC Groups |
| **Owner** | GCC Product Owner |
| **Layer** | L3 - Analytics |
| **FIBO** | - (GCC-specific) |

**Purpose:** **What is the complete GCC group structure?**

Aggregated view of GCC groups - head, members, depth, total ownership. Derived from gcc-members and gcc-relations.

**Business Questions:**
- What is the structure of company X's GCC group?
- Who is the ultimate beneficial owner (head)?
- How many members does the group have?
- What is the ownership chain depth?

**Derived Schema:**

| Attribute | Type | Calculation |
|-----------|------|-------------|
| group_id | bigint | PK (derived from head) |
| head_member_id | bigint | Member with is_head_of_gcc = true |
| member_count | integer | COUNT(DISTINCT members in group) |
| natural_person_count | integer | COUNT(members WHERE party_type = 'natural') |
| legal_entity_count | integer | COUNT(members WHERE party_type = 'legal') |
| total_ownership_pct | numeric | SUM(shares_percentage) from root |
| group_depth | integer | MAX(path length from head) |

**Output Ports:**

| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Dependencies:**
- A→ `gcc-members` (counts, head identification)
- A→ `gcc-relations` (traverses graph, calculates depth)

**Consumers:**
- MS PaaS Application
- External Account Income Calculator (UC2)

---

### DP-GCC-006: gcc-requests

| Field | Value |
|-------|-------|
| **ID** | `rbcz:corporate:gcc:requests` |
| **Title** | GCC Requests |
| **Owner** | GCC Product Owner |
| **Layer** | L2 - Domain Master Data |
| **FIBO** | - (GCC-specific) |

**Purpose:** **What GCC requests were submitted and what is their status?**

Audit trail of all GCC requests from MS PaaS. Enables payment verification per request and change traceability.

**Business Questions:**
- When was this GCC request submitted?
- Which application created the request?
- What changes occurred within this request?
- Was the payment processed correctly for this request?

**Schema:**

| Attribute | Type | Description |
|-----------|------|-------------|
| request_id | bigint | PK |
| application_id | varchar(50) | Source application |
| party_id | varchar(50) | Requesting party |
| source_name | varchar(50) | Source name |
| source_id | varchar(50) | Request ID in source |
| request_date | date | Request date |
| status | varchar(20) | Request status |

**API Operations:**

| Operation | Method | SLA |
|-----------|--------|-----|
| `POST /request` | upsert_request | Real-time |

**Output Ports:**

| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Dependencies:**
- (none)

**Consumers:**
- `gcc-relations` (REFERENCES via request_id)
- MS PaaS Application
- Audit / Compliance

---

### DP-GCC-007: gcc-financials

| Field | Value |
|-------|-------|
| **ID** | `rbcz:corporate:gcc:financials` |
| **Title** | GCC Financials |
| **Owner** | GCC Product Owner |
| **Layer** | L3 - Analytics |
| **FIBO** | fibo-fnd:FinancialStatement |

**Purpose:** **What are the financial indicators of GCC members?**

Key financial data of legal entities in GCC for client outreach, campaigns, and segmentation.

**Business Questions:**
- What is this company's revenue?
- What is the GCC member's profit/loss?
- How to segment GCC members by financial indicators?
- Which companies in GCC are suitable for campaign X?

**Schema:**

| Attribute | Type | Description |
|-----------|------|-------------|
| fin_id | bigint | PK |
| member_id | bigint | FK → gcc-members (legal entities only) |
| to_date | date | Report date |
| period | varchar(50) | Period (Q1, H1, Y) |
| parameter_name | varchar(50) | Indicator name (revenue, profit, ...) |
| parameter_amount | numeric | Value |

**Output Ports:**

| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Dependencies:**
- R→ `gcc-members` (member_id, party_type = 'legal' only)

**Consumers:**
- Corporate Marketing (campaigns, outreach)
- Segmentation Engine
- MS PaaS Application

---

## 4. Dependency Graph

### Legend

| Symbol | Relationship | Meaning |
|--------|--------------|---------|
| **R→** | REFERENCES | FK lookup |
| **A→** | AGGREGATES | Summarizes/counts |

### Complete Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RBCZ REFERENCE                                   │
│  ┌──────────────────┐  ┌──────────────────┐                         │
│  │ rbcz:countries   │  │ rbcz:currencies  │                         │
│  └────────┬─────────┘  └────────┬─────────┘                         │
│           │ R→                  │ R→                                 │
└───────────┼─────────────────────┼────────────────────────────────────┘
            │                     │
            ▼                     │
┌─────────────────────────────────────────────────────────────────────┐
│                     GCC DOMAIN (RBCZ:Corporate:GCC)                  │
│                                                                      │
│  ┌─────────────────────── IDENTITY ────────────────────────────┐    │
│  │                                                              │    │
│  │  gcc-natural-persons          gcc-legal-entities            │    │
│  │  (natural persons)            (legal entities)              │    │
│  │         │                            │                       │    │
│  │         └────────────┬───────────────┘                       │    │
│  │                      │ R→ (party_id + party_type)            │    │
│  │                      ▼                                       │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────── MEMBERSHIP ──────────────────────────┐    │
│  │                                                              │    │
│  │                    gcc-members                               │    │
│  │                    (membership + role)                       │    │
│  │           ┌─────────────┴─────────────┐                      │    │
│  │           │ R→                        │ R→                   │    │
│  │           ▼                           ▼                      │    │
│  │   gcc-relations              gcc-financials                  │    │
│  │   (ownership & control)      (financial indicators)          │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────── RELATIONS ───────────────────────────┐    │
│  │                                                              │    │
│  │     gcc-requests ◄──R── gcc-relations ──R→ rbcz:currencies   │    │
│  │     (audit trail)       (ownership & control)                │    │
│  │                              │                               │    │
│  │                              │ A→                            │    │
│  │                              ▼                               │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────── ANALYTICS ───────────────────────────┐    │
│  │                                                              │    │
│  │                     gcc-groups                               │    │
│  │                     (group structure)                      │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Summary Table

| # | DP ID | Name | Purpose | Contained Concepts | Referenced Concepts |
|---|-------|------|---------|-------------------|------------------------|
| 1 | `rbcz:countries` | Countries | What countries exist? | `Country` | — |
| 2 | `rbcz:currencies` | Currencies | What currencies exist? | `Currency` | — |
| 3 | `rbcz:corporate:gcc:natural-persons` | GCC Natural Persons | Which natural persons are in GCC? | `Natural Person`, `Address` | `Country` |
| 4 | `rbcz:corporate:gcc:legal-entities` | GCC Legal Entities | Which legal entities are in GCC? | `Legal Entity`, `Address` | `Country` |
| 5 | `rbcz:corporate:gcc:members` | GCC Members | Who is member of which GCC group? | `GCC Membership` | `Natural Person`, `Legal Entity` |
| 6 | `rbcz:corporate:gcc:relations` | GCC Relations | What are ownership/control relations? | `Ownership`, `Control Relation` | `GCC Membership`, `Currency`, `GCC Request` |
| 7 | `rbcz:corporate:gcc:requests` | GCC Requests | What GCC requests were submitted? | `GCC Request` | — |
| 8 | `rbcz:corporate:gcc:groups` | GCC Groups | What is the GCC group structure? | `GCC Group` | `GCC Membership`, `Ownership`, `Control Relation` |
| 9 | `rbcz:corporate:gcc:financials` | GCC Financials | What are member financial indicators? | `Financial Statement` | `GCC Membership` |

### Concept Summary

**Total concepts:** 12

| Layer | Concepts |
|-------|----------|
| L1 - Shared Reference | `Country`, `Currency` |
| L2 - Domain Master Data | `Natural Person`, `Legal Entity`, `Address`, `GCC Membership`, `Ownership`, `Control Relation`, `GCC Request` |
| L3 - Analytics | `GCC Group`, `Financial Statement` |

---

## 6. Consumers

| Consumer | Use Case | DPs Used |
|----------|----------|----------|
| **MS PaaS Application** | UC1: Store GCC groups | All (write + read) |
| **External Account Income Calculator** | UC2: Read member names | gcc-members, gcc-groups |

---

## 7. Governance Compliance

### GOV-DM-001 Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| Domain Ownership | ✓ | GCC Product Owner under Corporate BU |
| Data as Product | ✓ | 9 DPs, each with clear purpose |
| Self-Serve Platform | ✓ | API for writes, Delta Lake for reads |
| Federated Governance | ✓ | Uses RBCZ reference data |

### FIBO Alignment

| DP | FIBO Mapping |
|----|--------------|
| gcc-natural-persons | fibo-fnd:NaturalPerson |
| gcc-legal-entities | fibo-fnd:LegalEntity |
| gcc-members | GCC-specific (membership role) |
| gcc-relations | fibo-be:Ownership, fibo-be:Control |
| gcc-groups | GCC-specific (aggregation) |
| gcc-requests | GCC-specific (audit trail) |
| gcc-financials | fibo-fnd:FinancialStatement |

---

## 8. Implementation Roadmap

### Phase 1: Identity
- [ ] gcc-natural-persons
- [ ] gcc-legal-entities

### Phase 2: Membership
- [ ] gcc-members

### Phase 3: Relations
- [ ] gcc-relations
- [ ] gcc-groups

### Phase 4: Integration
- [ ] API endpoints
- [ ] MS PaaS integration
- [ ] External Account Income Calculator integration

---

## 9. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Data Mesh Consultant | Initial catalog based on MVP2 GCC Storage |
| 2.0 | 2026-01-08 | Data Mesh Consultant | QAR refinement: Domain path, Party REFERENCES (not SPECIALIZES), T+1 batch, limited consumers |
| 2.1 | 2026-01-08 | Data Mesh Consultant | Fixed reference IDs: `rbcz:ref:*` → `rbcz:*` |
| 3.0 | 2026-01-08 | Data Mesh Consultant | **Major refactoring:** Removed party-master. Added gcc-natural-persons, gcc-legal-entities under GCC. Clear purpose for each DP. gcc-members = membership role (not identity). |
| 3.1 | 2026-01-08 | Data Mesh Consultant | **Restored gcc-requests and gcc-financials:** gcc-requests = audit trail, payment verification; gcc-financials = financial indicators for campaigns and segmentation. Total: 7 → 9 DPs. |
| 3.2 | 2026-01-08 | Data Mesh Consultant | **Aligned Layer terminology with GOV-DM-001 Section 7.1:** L1 (Shared Reference), L2 (Domain Master Data), L3 (Analytics). |
| 3.3 | 2026-01-08 | Data Mesh Consultant | **Added Concept mapping:** Summary table now includes Contained Concepts and Referenced Concepts. Added Concept Summary (12 concepts total). Renamed GCC Member → GCC Membership, Financial Parameter → Financial Statement. |
| 3.4 | 2026-01-08 | Data Mesh Consultant | **Translated to English:** Full document translation per GOV documentation standards. |
| 3.5 | 2026-01-08 | Data Mesh Consultant | **Review fixes:** Removed remaining Czech text (5 occurrences), fixed DP count (7→9). |
| 3.6 | 2026-01-08 | Principal Architect | **Architect review fixes:** (1) Translated "STRUKTURA skupiny", (2) Removed week estimates from roadmap, (3) Added `request_id` FK to gcc-relations for audit trail, (4) Fixed dependency graph direction. |
