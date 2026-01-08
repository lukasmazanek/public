# GOV-DM-002: Data Product Naming Convention

> **Status:** ACTIVE
> **Effective:** 2026-01-08
> **Owner:** CDO - Lukáš Mazánek
> **Parent:** [GOV-DM-001-data-mesh-governance.md](GOV-DM-001-data-mesh-governance.md)

---

## 1. Purpose

Establish consistent naming conventions for Data Products across RBCZ to ensure:
- Discoverability in catalogs
- Clear ownership identification
- Business value communication
- Technical compatibility

---

## 2. Three-Level Naming System

Every Data Product has three names:

| Level | Purpose | Audience | Example |
|-------|---------|----------|---------|
| **ID** | Unique technical identifier | Systems, APIs | `rbcz:mib:investment:aum` |
| **Slug** | Short reference name | Developers, URLs | `investment-aum-reporting` |
| **Title** | Business-friendly name | Business users, Catalog | "Investment AUM Performance Reporting" |

---

## 3. ID (Technical Identifier)

### 3.1 Format

```
{entity}:{bu}:{domain}:{concept}

Examples:
- rbcz:mib:investment:customer
- rbcz:mib:investment:aum
- rbcz:mib:segments
- rbcz:ref:countries
```

### 3.2 Rules

| Rule ID | Rule | Example |
|---------|------|---------|
| **ID-1** | Colon separator (ADR-010 compliant) | `rbcz:mib:investment` ✓ |
| **ID-2** | Lowercase only | `rbcz:mib` ✓, `RBCZ:MIB` ✗ |
| **ID-3** | No spaces | `investment:customer` ✓ |
| **ID-4** | Full domain path | `rbcz:mib:investment:x` ✓, `investment:x` ✗ |
| **ID-5** | Matches domain hierarchy exactly | Must exist in ontology |

### 3.3 Special Prefixes

| Prefix | Meaning | Example |
|--------|---------|---------|
| `rbcz:ref:` | Platform reference data | `rbcz:ref:countries` |
| `rbcz:shared:` | Cross-domain shared | `rbcz:shared:customer` |
| `rbi:` | RBI Group level | `rbi:reporting:consolidated` |

---

## 4. Slug (Short Name)

### 4.1 Format

```
{domain-prefix}-{purpose-description}

Examples:
- investment-aum-reporting
- investment-client-overview
- mib-segmentation
- ref-countries
```

### 4.2 Rules

| Rule ID | Rule | Good Example | Bad Example |
|---------|------|--------------|-------------|
| **SLUG-1** | Lowercase only | `investment-aum` | `Investment-AUM` |
| **SLUG-2** | Hyphen separator | `investment-aum` | `investment_aum` |
| **SLUG-3** | Domain prefix first | `investment-*` | `aum-investment` |
| **SLUG-4** | Max 4 words | `investment-aum-reporting` | `investment-monthly-aum-performance-reporting-summary` |
| **SLUG-5** | No application names | `investment-customer` | `edi-customer` |
| **SLUG-6** | No abbreviations (except domain) | `investment-profitability` | `inv-prof` |
| **SLUG-7** | Purpose-oriented | `investment-aum-reporting` | `investment-aum-table` |

### 4.3 Domain Prefixes

| Domain | Prefix | Example |
|--------|--------|---------|
| Investment | `investment-` | `investment-aum-reporting` |
| MIB (BU level) | `mib-` | `mib-segmentation` |
| Retail | `retail-` | `retail-customer-base` |
| Corporate | `corporate-` | `corporate-client-exposure` |
| Finance | `finance-` | `finance-profitability` |
| Reference | `ref-` | `ref-countries` |
| Shared | `shared-` | `shared-customer-master` |

---

## 5. Title (Business Name)

### 5.1 Format

```
{Domain} {Business Value/Purpose} [for {Use Case}]

Examples:
- "Investment AUM Performance Reporting"
- "Investment Client Portfolio Overview"
- "MIB Client Segmentation for Campaign Targeting"
- "ISO Country Reference for Compliance"
```

### 5.2 Rules

| Rule ID | Rule | Good Example | Bad Example |
|---------|------|--------------|-------------|
| **TITLE-1** | Must state business purpose | "Investment AUM Performance Reporting" | "Investment AUM" |
| **TITLE-2** | Can include target use case | "...for Management Reporting" | - |
| **TITLE-3** | No entity-only names | "Investment Client Overview" | "Investment Customer Master" |
| **TITLE-4** | Human readable (Title Case) | "Investment AUM" | "investment-aum" |
| **TITLE-5** | No technical jargon | "Client Segmentation" | "Customer Dimension Table" |
| **TITLE-6** | No application names | "Investment Client" | "EDI Customer" |

### 5.3 Purpose Keywords

Use these to clarify business value:

| Category | Keywords |
|----------|----------|
| **Reporting** | Reporting, Analysis, Overview, Summary, Dashboard |
| **Operations** | Processing, Tracking, Monitoring, Management |
| **Analytics** | Analytics, Insights, Performance, Trends |
| **Reference** | Reference, Master, Catalog, Registry |
| **Compliance** | Compliance, Regulatory, Audit, Governance |

### 5.4 Examples: Bad → Good

| Bad (Entity-Only) | Good (Purpose-Driven) |
|-------------------|----------------------|
| Investment Customer Master | Investment Client Portfolio Overview |
| EDI AUM | Investment AUM Performance Reporting |
| EDI Sales | Investment Transaction Volume Analysis |
| MIB Segments | MIB Client Segmentation for Targeting |
| Countries Table | ISO Country Reference |

---

## 6. Anti-Patterns

### 6.1 Application Names in DP Names

```
❌ FORBIDDEN:
- edi-customer
- ams-account
- siebel-contact
- dp-edi-aum

✓ CORRECT:
- investment-customer
- retail-account
- crm-contact
- investment-aum-reporting
```

**Reason:** Data Products should be source-agnostic. If source system changes, name should remain valid.

### 6.2 Technical Terms in Titles

```
❌ FORBIDDEN:
- "Investment Customer Dimension"
- "AUM Fact Table"
- "Segment SCD Type 2"

✓ CORRECT:
- "Investment Client Overview"
- "Investment AUM Reporting"
- "MIB Segment History"
```

### 6.3 Entity-Only Names

```
❌ FORBIDDEN:
- "Customer Master"
- "Product Catalog"
- "Transaction Data"

✓ CORRECT:
- "Investment Client Portfolio Overview"
- "Investment Securities Catalog for Trading"
- "Investment Transaction Analysis"
```

---

## 7. Complete Examples

| ID | Slug | Title |
|----|------|-------|
| `rbcz:mib:investment:customer` | `investment-client-overview` | Investment Client Portfolio Overview |
| `rbcz:mib:investment:aum` | `investment-aum-reporting` | Investment AUM Performance Reporting |
| `rbcz:mib:investment:profitability` | `investment-profitability` | Investment Gross Income Analysis |
| `rbcz:mib:investment:sales` | `investment-sales-volume` | Investment Transaction Volume Analysis |
| `rbcz:mib:investment:portfolio` | `investment-portfolio-status` | Investment Portfolio Current Status |
| `rbcz:mib:investment:position` | `investment-position-overview` | Investment Position Holdings Overview |
| `rbcz:mib:investment:agreement` | `investment-agreement-registry` | Investment Agreement Registry |
| `rbcz:mib:investment:campaign-candidates` | `investment-campaign-base` | Investment CRM Campaign Candidates |
| `rbcz:mib:segments` | `mib-segmentation` | MIB Client Segmentation for Targeting |
| `rbcz:mib:customer` | `mib-client-base` | MIB Client Base for Analytics |
| `rbcz:ref:countries` | `ref-countries` | ISO Country Reference |
| `rbcz:ref:currencies` | `ref-currencies` | ISO Currency Reference |

---

## 8. Migration from Legacy Names

### 8.1 EDI-Prefixed Products

| Current Name | New ID | New Slug | New Title |
|--------------|--------|----------|-----------|
| DP_EDI_AUM | `rbcz:mib:investment:aum` | `investment-aum-reporting` | Investment AUM Performance Reporting |
| DP_EDI_AGG_CLIENT | `rbcz:mib:investment:client-counts` | `investment-client-counts` | Investment Client Acquisition Tracking |
| DP_EDI_PROFITABILITY | `rbcz:mib:investment:profitability` | `investment-profitability` | Investment Gross Income Analysis |
| DP_EDI_SALES | `rbcz:mib:investment:sales` | `investment-sales-volume` | Investment Transaction Volume Analysis |
| DP_EDI_APP_USAGE | `rbcz:mib:investment:app-usage` | `investment-app-usage` | Investment Mobile App Usage Metrics |
| EDI Customer | `rbcz:mib:investment:customer` | `investment-client-overview` | Investment Client Portfolio Overview |
| EDI Portfolio | `rbcz:mib:investment:portfolio` | `investment-portfolio-status` | Investment Portfolio Current Status |
| EDI Position | `rbcz:mib:investment:position` | `investment-position-overview` | Investment Position Holdings Overview |

### 8.2 Migration Strategy

1. **Add new names** - Keep old names as aliases temporarily
2. **Update catalog** - New names primary, old as "also known as"
3. **Notify consumers** - Communication about name changes
4. **Deprecate old** - Set deprecation date
5. **Remove old** - After transition period

---

## 9. Validation Checklist

Before publishing a Data Product, verify:

- [ ] ID follows domain path format (`entity:bu:domain:concept`)
- [ ] ID is lowercase with colons only
- [ ] Slug is lowercase with hyphens only
- [ ] Slug has domain prefix
- [ ] Slug is max 4 words
- [ ] Slug contains no application names
- [ ] Title states business purpose
- [ ] Title is in Title Case
- [ ] Title contains no technical jargon
- [ ] All three names are consistent (refer to same product)

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Banking Domain Expert | Initial version |
