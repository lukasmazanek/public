# Data Product Composability Framework

**Role:** Banking Domain Expert
**Date:** 2026-01-08
**Type:** Framework & Governance Guidance
**Status:** APPROVED
**Parent:** [GOV-DM-001-data-mesh-governance.md](../GOV-DM-001-data-mesh-governance.md)

---

## 1. Framework: Kdy Embedded vs. Separate DP vs. Shared

| Kritérium | Embedded (A) | Separate DP (B) | Shared/Platform (C) |
|-----------|--------------|-----------------|---------------------|
| **Reuse** | Žádný | Uvnitř domény | Napříč doménami |
| **Ownership** | Stejný jako parent DP | Domain Owner | Platform/MDM |
| **Lifecycle** | Svázaný s parent | Nezávislý | Centrálně řízený |
| **Změny** | Mění se s parent | Vlastní versioning | Strict change mgmt |
| **Standardizace** | Není potřeba | Doménový standard | Enterprise/ISO standard |

---

## 2. Decision Tree

```
                    Je data použita více DP?
                           │
              ┌────────────┴────────────┐
              │ NE                      │ ANO
              ▼                         ▼
         EMBEDDED               Je použita napříč doménami?
                                       │
                          ┌────────────┴────────────┐
                          │ NE                      │ ANO
                          ▼                         ▼
                    SEPARATE DP              Je ISO/Enterprise standard?
                   (Domain owns)                    │
                                      ┌────────────┴────────────┐
                                      │ NE                      │ ANO
                                      ▼                         ▼
                               SEPARATE DP              SHARED REFERENCE
                              per Domain               (Platform/MDM owns)
```

---

## 3. Classification Criteria

### A) Embedded Pattern
**Použít když:**
- Data jsou pouze kontextuální pro jeden DP
- Žádný potenciál pro reuse
- Těsně svázaný lifecycle s parent DP
- Změny vždy společně s parent

**Příklad:**
- Interní lookup tabulky
- DP-specific transformace
- Temporary/staging data

### B) Separate DP Pattern (Domain owns)
**Použít když:**
- Data jsou použita více DP v JEDNÉ doméně
- Domain-specific business rules
- Vlastní lifecycle (mění se nezávisle)
- Domain Owner má jasnou odpovědnost

**Příklad:**
- `investment-products-catalog` - Investment securities (ID: `rbcz:mib:investment:products`)
- `mib-segmentation` - MIB customer segmentation (ID: `rbcz:mib:segments`)
- `retail-channels` - Retail channel definitions (ID: `rbcz:retail:channels`)

### C) Shared Reference Data Pattern (Platform/MDM owns)
**Použít když:**
- Data jsou použita napříč VÍCE doménami
- ISO nebo enterprise standard
- Velmi stabilní (low change frequency)
- Vyžaduje centrální governance

**Příklad:**
- `ref-countries` - ISO 3166-1 (ID: `rbcz:ref:countries`)
- `ref-currencies` - ISO 4217 (ID: `rbcz:ref:currencies`)
- `ref-calendars` - Business calendars (ID: `rbcz:ref:calendars`)
- `ref-legal-entities` - LEI registry (ID: `rbcz:ref:legal-entities`)

---

## 4. Reasoning: IDM_* Dimensions Analysis

### IDM_COUNTRIES → Shared Reference Data (Platform)

| Faktor | Hodnota | Rozhodnutí |
|--------|---------|------------|
| Použití napříč doménami | ANO (Inv, Retail, Payments, RLCZ) | → Shared |
| ISO standard | ANO (ISO 3166-1) | → Shared |
| Frekvence změn | Velmi nízká | → Shared |
| **Výsledek** | **Platform/MDM owns** | |

### IDM_PRODUCTS → Separate DP (Investment Domain)

| Faktor | Hodnota | Rozhodnutí |
|--------|---------|------------|
| Použití napříč doménami | NE (Investment only) | → Domain |
| Použití více DP v doméně | ANO (AUM, Sales, Positions) | → Separate DP |
| Domain-specific rules | ANO (ISIN, product types) | → Domain owns |
| **Výsledek** | **Investment Domain owns** | |

### IDM_SEGMENTS → Separate DP (MIB Domain)

| Faktor | Hodnota | Rozhodnutí |
|--------|---------|------------|
| Použití napříč doménami | NE (MIB-specific) | → Domain |
| Enterprise-wide standard | NE (MIB má vlastní L0/L1/L2) | → Domain |
| Použití více DP v doméně | ANO (AUM, Clients, Profitability) | → Separate DP |
| **Výsledek** | **MIB Domain owns** | |

---

## 5. Composability Model

```
┌─────────────────────────────────────────────────────────────────┐
│              PLATFORM / SHARED REFERENCE DATA (L1)               │
│                     (Platform/MDM owns)                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ref-countries │  │ref-currencies│  │ref-calendars │           │
│  │(ISO 3166)    │  │(ISO 4217)    │  │(Business cal)│           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                    │
└─────────┼─────────────────┼─────────────────┼────────────────────┘
          │                 │                 │
          │    consumes     │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MIB DOMAIN (L2 - BU Master)                   │
│                      (MIB Domain owns)                           │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │mib-segmentation  │  │mib-client-base   │ ← Domain Master Data│
│  │(Profitcenter L0-2)│  │(MIB client base) │                     │
│  └────────┬─────────┘  └────────┬─────────┘                     │
│           │                     │                                │
└───────────┼─────────────────────┼────────────────────────────────┘
            │                     │
            │    consumes         │
            ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│               INVESTMENT DOMAIN (L2/L3 - Domain)                 │
│                  (Investment Domain owns)                        │
│                                                                  │
│  ┌────────────────────────┐                                     │
│  │investment-products-    │ ← L2 Domain Master Data             │
│  │catalog (Securities)    │                                     │
│  └────────┬───────────────┘                                     │
│           │                                                      │
│           │ consumes                                             │
│           ▼                                                      │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │investment-aum-      │ │investment-sales-    │ ← L3 Analytics │
│  │reporting            │ │volume               │                │
│  └─────────────────────┘ └─────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Dependency Rules

| Pravidlo | Popis |
|----------|-------|
| **COMP-1** | DP MŮŽE konzumovat Shared Reference Data |
| **COMP-2** | DP MŮŽE konzumovat Domain Master Data ze STEJNÉ domény |
| **COMP-3** | DP MŮŽE konzumovat Domain Master Data z PARENT domény |
| **COMP-4** | DP NESMÍ konzumovat data ze SIBLING domény bez explicitní smlouvy |
| **COMP-5** | Circular dependencies jsou ZAKÁZÁNY |
| **COMP-6** | Consumer MUSÍ být registrován v Consumers Catalog |

### Povolené Dependency Patterns

```
✅ investment-aum-reporting → ref-countries          (Shared Reference)
✅ investment-aum-reporting → mib-segmentation       (Parent Domain)
✅ investment-aum-reporting → investment-products-catalog (Same Domain)

❌ investment-aum-reporting → retail-channels        (Sibling - needs contract)
❌ investment-X → investment-Y → investment-X        (Circular)
```

---

## 7. Data Product Layers

```
LAYER 3: Analytics/Reporting DPs
         ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
         │investment-aum-   │ │investment-sales- │ │investment-       │
         │reporting         │ │volume            │ │profitability     │
         └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
                  │                    │                    │
                  │   consumes         │                    │
                  ▼                    ▼                    ▼
LAYER 2: Domain Master Data DPs
         ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
         │investment-       │ │mib-segmentation  │ │mib-client-base   │
         │products-catalog  │ │                  │ │                  │
         └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
                  │                    │                    │
                  │   consumes         │                    │
                  ▼                    ▼                    ▼
LAYER 1: Shared Reference Data DPs
         ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
         │ref-countries     │ │ref-currencies    │ │ref-calendars     │
         └──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 8. Summary Table: RBCZ Data Products by Layer

| Layer | Slug | ID | Owner | Type |
|-------|------|-----|-------|------|
| **L1 - Shared** | ref-countries | `rbcz:ref:countries` | Platform | Reference |
| **L1 - Shared** | ref-currencies | `rbcz:ref:currencies` | Platform | Reference |
| **L1 - Shared** | ref-calendars | `rbcz:ref:calendars` | Platform | Reference |
| **L2 - MIB** | mib-segmentation | `rbcz:mib:segments` | MIB Domain | Master |
| **L2 - MIB** | mib-client-base | `rbcz:mib:customer` | MIB Domain | Master |
| **L2 - Investment** | investment-products-catalog | `rbcz:mib:investment:products` | Investment Domain | Master |
| **L2 - Investment** | investment-client-overview | `rbcz:mib:investment:customer` | Investment Domain | Master |
| **L3 - Investment** | investment-aum-reporting | `rbcz:mib:investment:aum` | Investment Domain | Analytics |
| **L3 - Investment** | investment-sales-volume | `rbcz:mib:investment:sales` | Investment Domain | Analytics |
| **L3 - Investment** | investment-position-overview | `rbcz:mib:investment:position` | Investment Domain | Analytics |
| **L3 - Investment** | investment-profitability | `rbcz:mib:investment:profitability` | Investment Domain | Analytics |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [GOV-DM-001](../GOV-DM-001-data-mesh-governance.md) | Main Data Mesh Governance |
| [GOV-DM-002](../GOV-DM-002-naming-convention.md) | Naming Convention |
| [GOV-DM-003](../GOV-DM-003-domain-hierarchy.md) | Domain Hierarchy & Ownership |
| [Investment DP Catalog](../catalogs/investment-dp-catalog.md) | Investment Domain Products |
| [2026-01-08-domain-dp-edi-aum-analysis.md](2026-01-08-domain-dp-edi-aum-analysis.md) | DP EDI AUM detailed analysis |

---

**Author:** Banking Domain Expert (/domain)
**Approved by:** User (2026-01-08)
