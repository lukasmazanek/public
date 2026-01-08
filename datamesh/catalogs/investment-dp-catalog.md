# Investment Domain - Data Product Catalog

> **Domain:** `rbcz:mib:investment`
> **Owner:** Marek Podrabský (RBCZ/MIB/Investment)
> **Last Updated:** 2026-01-08
> **Total DPs:** 14 existing + 4 proposed

---

## 1. Overview

### 1.1 Domain Context

| Attribute | Value |
|-----------|-------|
| **Parent Domain** | `rbcz:mib` (MIB Business Unit) |
| **Business Capabilities** | Trading, Portfolio Management, Reporting, Custody, Advisory |
| **Primary Systems** | EDI (Easy Digital Investment), AMS (Core Banking), Siebel (CRM) |
| **Consumers** | Risk, Finance, Marketing, Compliance, Management, Clients, ČNB, RBI Group |

### 1.2 DP Summary by Layer

| Layer | Count | Purpose |
|-------|-------|---------|
| **L2 - Master** | 4 existing + 4 proposed | Domain entities |
| **L3 - Analytics** | 10 existing | Reporting & analytics |

---

## 2. Data Product Layers

### 2.1 Layer Architecture

```
PLATFORM (L1 - Reference)
├── ref-countries (ISO 3166)
├── ref-currencies (ISO 4217)
└── ref-calendars
         │
         │ consumes
         ▼
MIB (L2 - BU Master)
├── mib-segmentation
├── mib-client-base
└── mib-profitcenter
         │
         │ consumes
         ▼
INVESTMENT (L2 - Domain Master)
├── investment-client-overview
├── investment-products-catalog
├── investment-portfolio-status
├── investment-position-overview
├── investment-agreement-registry
├── investment-orders [PROPOSED]
└── investment-transactions [PROPOSED]
         │
         │ consumes
         ▼
INVESTMENT (L3 - Analytics)
├── investment-aum-reporting
├── investment-client-counts
├── investment-profitability
├── investment-sales-volume
├── investment-app-usage
├── investment-portfolio-recon
├── investment-position-recon
├── investment-customer-exposure
├── investment-campaign-base
└── investment-market-sales
```

---

## 3. L2 - Domain Master Data Products

### 3.1 Existing (Renamed)

| # | Current Name | New ID | New Slug | New Title | Status |
|---|--------------|--------|----------|-----------|--------|
| 1 | EDI Customer | `rbcz:mib:investment:customer` | `investment-client-overview` | Investment Client Portfolio Overview | RENAME |
| 2 | EDI Portfolio | `rbcz:mib:investment:portfolio` | `investment-portfolio-status` | Investment Portfolio Current Status | RENAME |
| 3 | EDI Position | `rbcz:mib:investment:position` | `investment-position-overview` | Investment Position Holdings Overview | RENAME |
| 4 | Investment Agreements | `rbcz:mib:investment:agreement` | `investment-agreement-registry` | Investment Agreement Registry | RENAME |

### 3.2 Proposed (New)

| # | ID | Slug | Title | Justification |
|---|-----|------|-------|---------------|
| 5 | `rbcz:mib:investment:products` | `investment-products-catalog` | Investment Securities Catalog | IDM_PRODUCTS should be separate DP |
| 6 | `rbcz:mib:investment:orders` | `investment-orders-master` | Investment Order Management | Trading capability requires order master |
| 7 | `rbcz:mib:investment:transactions` | `investment-transactions-master` | Investment Transaction Registry | Transaction master for analytics |
| 8 | `rbcz:mib:investment:securities` | `investment-securities-master` | Investment Securities Master | ISIN-based securities for custody |

---

## 4. L3 - Analytics Data Products

### 4.1 Existing (Renamed)

| # | Current Name | New ID | New Slug | New Title |
|---|--------------|--------|----------|-----------|
| 1 | DP_EDI_AUM | `rbcz:mib:investment:aum` | `investment-aum-reporting` | Investment AUM Performance Reporting |
| 2 | DP_EDI_AGG_CLIENT | `rbcz:mib:investment:client-counts` | `investment-client-counts` | Investment Client Acquisition Tracking |
| 3 | DP_EDI_PROFITABILITY | `rbcz:mib:investment:profitability` | `investment-profitability` | Investment Gross Income Analysis |
| 4 | DP_EDI_SALES | `rbcz:mib:investment:sales` | `investment-sales-volume` | Investment Transaction Volume Analysis |
| 5 | DP_EDI_APP_USAGE | `rbcz:mib:investment:app-usage` | `investment-app-usage` | Investment Mobile App Usage Metrics |
| 6 | EDI Portfolio Reconsolidation | `rbcz:mib:investment:portfolio-recon` | `investment-portfolio-recon` | Investment Portfolio Reconciliation Report |
| 7 | EDI Position Reconsolidation | `rbcz:mib:investment:position-recon` | `investment-position-recon` | Investment Position Reconciliation Report |
| 8 | Investment Customer Exposition | `rbcz:mib:investment:customer-exposure` | `investment-customer-exposure` | Investment Client Credit Exposure Analysis |
| 9 | Marketing Campaign Candidates | `rbcz:mib:investment:campaign-candidates` | `investment-campaign-base` | Investment CRM Campaign Candidates |
| 10 | Market Sales | `rbcz:mib:investment:market-sales` | `investment-market-sales` | Investment Market Sales Performance |

---

## 5. Detailed Product Cards

### 5.1 investment-aum-reporting

| Attribute | Value |
|-----------|-------|
| **ID** | `rbcz:mib:investment:aum` |
| **Slug** | `investment-aum-reporting` |
| **Title** | Investment AUM Performance Reporting |
| **Layer** | L3 - Analytics |
| **Owner** | Marek Podrabský |
| **Maturity** | 20% |
| **Description** | Daily balance of Assets under Management (AUM) per product, segment and contracts |

**Consumes:**
- `rbcz:ref:countries` (Platform)
- `rbcz:mib:segments` (MIB)
- `rbcz:mib:investment:products` (Investment)

**Use Cases:**
1. UC1 - AUM performance tracking
2. UC2 - Digital channel optimization for AUM growth
3. UC3 - Campaign effectiveness by segment

**Data Contract:** `conceptspeak/input/datacontract/RBCZ/MIB/Investment/dp_edi_aum.yaml`

---

### 5.2 investment-client-overview

| Attribute | Value |
|-----------|-------|
| **ID** | `rbcz:mib:investment:customer` |
| **Slug** | `investment-client-overview` |
| **Title** | Investment Client Portfolio Overview |
| **Layer** | L2 - Master |
| **Owner** | Marek Podrabský |
| **Description** | Master data for investment clients including portfolio composition |

**Consumes:**
- `rbcz:mib:customer` (MIB - parent)
- `rbcz:ref:countries` (Platform)

**Consumed By:**
- All L3 Analytics products in Investment domain

**Domain Mapping:**
- extends `rbcz:mib:customer`
- extends (transitive) `fibo-fbc:Customer`
- adds: `mifidClass`, `investmentPreference`, `riskProfile`

---

### 5.3 investment-products-catalog

| Attribute | Value |
|-----------|-------|
| **ID** | `rbcz:mib:investment:products` |
| **Slug** | `investment-products-catalog` |
| **Title** | Investment Securities Catalog |
| **Layer** | L2 - Master |
| **Owner** | Marek Podrabský |
| **Status** | PROPOSED (currently embedded in AUM as IDM_PRODUCTS) |
| **Description** | Master catalog of investment products (securities) with ISIN codes |

**Rationale for Separation:**
- Currently embedded in DP_EDI_AUM as `IDM_PRODUCTS`
- Used by multiple DPs (AUM, Sales, Positions, Portfolio)
- Should be separate L2 Master DP per Composability Framework

**Domain Mapping:**
- maps to `fibo-fnd:Product`
- maps to `fibo-sec:Security`
- ISIN maps to `fibo-sec:InternationalSecuritiesIdentificationNumber`

---

## 6. Dependencies Matrix

### 6.1 L3 → L2 Dependencies

| L3 Analytics DP | Depends On (L2 Master) |
|-----------------|------------------------|
| investment-aum-reporting | products, segments |
| investment-client-counts | customer |
| investment-profitability | customer, products |
| investment-sales-volume | customer, products |
| investment-portfolio-recon | portfolio, position |
| investment-position-recon | position, products |
| investment-customer-exposure | customer |
| investment-campaign-base | customer, segments |
| investment-market-sales | products |

### 6.2 L2 → L1 Dependencies

| L2 Master DP | Depends On (L1 Reference / Parent) |
|--------------|-----------------------------------|
| investment-client-overview | rbcz:mib:customer, ref-countries |
| investment-products-catalog | ref-currencies |
| investment-portfolio-status | ref-currencies |
| investment-agreement-registry | ref-countries |

---

## 7. Migration Plan

### 7.1 Phase 1: Rename (Low Risk)

| Priority | Action | Impact |
|----------|--------|--------|
| 1 | Add new names as aliases | None |
| 2 | Update DPCC Catalog | Catalog only |
| 3 | Update Data Contracts | Metadata only |
| 4 | Notify consumers | Communication |

### 7.2 Phase 2: Restructure (Medium Risk)

| Priority | Action | Impact |
|----------|--------|--------|
| 1 | Extract IDM_PRODUCTS to separate DP | Schema change |
| 2 | Extract IDM_SEGMENTS to MIB level | Cross-domain |
| 3 | Update dependencies | Pipeline changes |

### 7.3 Phase 3: New Products (Planned)

| Priority | New DP | Justification |
|----------|--------|---------------|
| 1 | investment-orders-master | Trading capability |
| 2 | investment-transactions-master | Transaction analytics |
| 3 | investment-securities-master | Custody integration |

---

## 8. Quality Metrics

### 8.1 Current Maturity Scores

| DP | Current | Target | Gap |
|----|---------|--------|-----|
| investment-aum-reporting | 20% | 80% | 60% |
| investment-campaign-base | 80% | 80% | ✓ |
| Others | TBD | 60% | TBD |

### 8.2 Coverage Targets

| Metric | Current | Target |
|--------|---------|--------|
| L2 Master Products | 4 | 8 |
| L3 Analytics Products | 10 | 10 |
| Maturity ≥ 60% | 1 | ALL |
| Domain Mapping Complete | ~70% | 100% |
| External Authority Mapped | ~50% | 80% |

---

## 9. Related Documents

| Document | Purpose |
|----------|---------|
| [GOV-DM-001](../GOV-DM-001-data-mesh-governance.md) | Main governance |
| [GOV-DM-002](../GOV-DM-002-naming-convention.md) | Naming convention |
| [GOV-DM-003](../GOV-DM-003-domain-hierarchy.md) | Domain hierarchy |
| [Composability Framework](../review/2026-01-08-domain-composability-framework.md) | DP layers & dependencies |
| [DP EDI AUM Analysis](../review/2026-01-08-domain-dp-edi-aum-analysis.md) | Detailed AUM review |

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Banking Domain Expert | Initial catalog |
