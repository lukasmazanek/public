# GCC Storage MVP2 - Data Model Analysis

> **Source:** Scan 8. 1. 2026 at 13.05.pdf (Vil Shakirov, 07.01.2026)
> **Captured:** 2026-01-08
> **Domain:** MIB (likely Credit/Risk subdomain)

---

## Business Requirements

1. Store GCC group generated in MS PaaS application process
2. Read names of GCC members for external account incomes calculation
3. Data model able to store for advanced GCC 2.0
4. Data model usable for separate GCC component in the future

---

## Conceptual Data Model (ERD)

### Core Entities

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| **Request** | API request entry point | request_id, application_id, subject_id, cribis_moc_request_id, request_datetime |
| **Relation** | Relationship between subjects | relation_name, relation_type, relation_start_date, parent_id, child_id, cribis_relation_id, historic |
| **Subject** | Party/entity in GCC | party_id, name, cocunut_id, country_code, address, cribis_id, gcc_head_flag |

### Relation Subtypes (Disjoint)

| Subtype | Description | Key Attributes |
|---------|-------------|----------------|
| **Ownership** | Ownership relation | shares_percentage, deposit, currency |
| **Control Relation** | Control without ownership | (marker only) |

### Subject Subtypes (Disjoint)

| Subtype | Description | Key Attributes |
|---------|-------------|----------------|
| **Natural Person** | Individual | first_name, last_name, date_of_birth |
| **Commercial Subject** | Legal entity | business_id_number, tax_id_number |

### Related Entities

| Entity | Description | Cardinality |
|--------|-------------|-------------|
| **Financials** | Financial parameters | 0..* per Commercial Subject |

---

## Logical Data Model (Physical Schema)

### Tables

#### `requests`
```
PK  request_id: bigint
    application_id: varchar(50)
    party_id: varchar(50)
    source_name: varchar(50)
    source_id: varchar(50)
    request_date: date
```

#### `relations`
```
PK  relation_id: bigint
FK  request_id: bigint
    reliability_id: varchar(2)
    historic: boolean = false
FK  parent_subject_id: bigint
FK  child_subject_id: bigint
    source_relation_id: varchar(50)
    source_name: varchar(50)
    relation_type: varchar(50)
    relation_name: varchar(50)
    relation_start_date: date
    parent_party_id: varchar(50)
    child_party_id: varchar(50)
```

#### `subjects`
```
PK  subject_id: bigint
    party_id: varchar(50) [UNIQUE]
    source_id: varchar(50)
    source_name: varchar(50)
    type: varchar(50)
    cocunut_id: varchar(50)
    country_code: varchar(50)
    address: text
    name: varchar(50)
    is_head_of_gcc: boolean = false
```

#### `ownerships` (extends relations)
```
FK  relation_id: bigint
    shares_percentage: numeric
    deposit: numeric
    currency: varchar(3)
```

#### `control_relations` (extends relations)
```
FK  relation_id: bigint
```

#### `individuals` (extends subjects)
```
FK  subject_id: bigint
    first_name: varchar(50)
    last_name: varchar(50)
    date_of_birth: date
```

#### `commercials` (extends subjects)
```
FK  subject_id: bigint
    business_id_number: varchar(50) [UNIQUE]
    tax_id_number: varchar(50) [UNIQUE]
```

#### `financials`
```
PK  fin_id: bigint
FK  subject_id: bigint
    to_date: date
    period: varchar(50)
    parameter_name: varchar(50)
    parameter_amount: numeric
```

### Junction Table

#### `application_subjects`
Links requests to subjects (used by GET request)

---

## API Operations

| Operation | Tables Used |
|-----------|-------------|
| `POST request` | requests |
| `upsert_request` | requests |
| `upsert_relation` | relations |
| `upsert_subject` | subjects |
| `GET request` | application_subjects → subjects |

---

## Cardinalities

```
Request 1 ←──────── 0..* Relation
Relation 0..* ────→ 1 Subject (parent)
Relation 0..* ────→ 1 Subject (child)
Subject 1 ←──────── 0..1 Individual
Subject 1 ←──────── 0..1 Commercial
Subject 1 ←──────── 0..* Financials
Relation 1 ←─────── 0..1 Ownership
Relation 1 ←─────── 0..1 Control Relation
```

---

## Data Mesh Analysis Notes

### Potential Data Products

| DP Candidate | Layer | Description |
|--------------|-------|-------------|
| `dp-gcc-group` | L2 Aggregate | GCC group structure with members and relations |
| `dp-gcc-member` | L1 Core | Individual GCC member (subject) |
| `dp-gcc-ownership` | L2 Derived | Ownership chain analysis |

### Domain Ownership

- **Suggested Domain:** `RBCZ:MIB:Credit` or `RBCZ:MIB:Risk`
- **GCC** = Group of Connected Clients (regulatory/risk concept)
- Cross-references: Party (enterprise), Country (reference)

### FIBO Alignment Candidates

| Concept | FIBO Candidate |
|---------|----------------|
| Subject | fibo-fnd:Party |
| Natural Person | fibo-fnd:NaturalPerson |
| Commercial Subject | fibo-fnd:LegalEntity |
| Ownership | fibo-be:Ownership |
| Control Relation | fibo-be:Control |

### Quality Observations

1. **Good:** Clear separation of concerns (request, relation, subject)
2. **Good:** Subtype pattern for polymorphic entities
3. **Note:** `reliability_id` varchar(2) - should be reference data
4. **Note:** `type` in subjects - should align with subtype tables
5. **Note:** Multiple `source_*` fields - lineage tracking

---

## Next Steps

- [ ] Confirm domain placement (Credit vs Risk)
- [ ] Create Data Contract YAML
- [ ] Map to FIBO ontology
- [ ] Define DP boundaries and consumers
