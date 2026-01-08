# Data Product Analysis: DP_EDI_AUM

**Role:** Banking Domain Expert
**Date:** 2026-01-08
**Domain:** `RBCZ:MIB:Investment`
**Type:** Data Product Assessment
**Verdict:** VALID DATA PRODUCT (needs maturation)

---

## 1. Basic Identification

| Attribute | Value |
|-----------|-------|
| **Name** | DP_EDI_AUM |
| **Description** | EDI Application Asset Under Management Reporting |
| **Domain Path** | RBCZ:MIB:Investment |
| **Owner** | Marek Podrabsky (MIB/Investment) |
| **Maturity** | 20% (proposed) |
| **Version** | 1.0.7 |
| **Source** | `conceptspeak/input/datacontract/RBCZ/MIB/Investment/dp_edi_aum.yaml` |

---

## 2. DATSIS Test - Is it a Data Product?

| Criterion | Status | Evidence |
|-----------|--------|----------|
| **D**iscoverable | PASS | In data catalog (datamesh-rbcz url) |
| **A**ddressable | PASS | URN: `urn:businessdomain:rbcz:mib:investment`, Databricks schema |
| **T**rustworthy | PARTIAL | SLA defined, but maturity only 20% |
| **S**elf-describing | PASS | Schema + definitions + FIBO links |
| **I**nteroperable | PARTIAL | FIBO alignment has 3 validation errors |
| **S**ecure | PASS | Classification: General, PII: false |

**Verdict:** YES, this is a Data Product (but needs to mature)

---

## 3. Business Value Analysis

### Value Proposition

| Value | Consumer | Business Impact |
|-------|----------|-----------------|
| **Performance Evaluation** | Management | AUM vs. targets tracking |
| **Digital Strategy Enhancement** | Digital team | Channel optimization insights |
| **Segment Analysis** | Marketing, Sales | Client distribution by segment |

### Use Cases (3 defined)

| UC | Description | Consumer | Frequency |
|----|-------------|----------|-----------|
| **UC1** | AUM performance tracking | Reporting, Risk | Daily |
| **UC2** | Digital channel optimization | Digital Marketing | Ad-hoc |
| **UC3** | Campaign effectiveness | Marketing, Sales | Campaign-based |

**Assessment:** Clear business value, well-defined use cases

---

## 4. Product Structure

```
DP_EDI_AUM
├── EDI_AUM (fact table)
│   ├── DATUM (Calendar Day)
│   ├── COUNTRY_CODE → IDM_COUNTRIES
│   ├── SECINSTR_ISIN_CODE → IDM_PRODUCTS
│   ├── PROFITCENTER_CODE → IDM_SEGMENTS
│   ├── SOURCE_CODE (enum: BIU_ALLOC, BIU_DIP, BIU_EDI, GI_ALLOC, GI_DIP)
│   ├── SOURCE_CODE_DESC
│   ├── AUM_LCY (local currency)
│   └── AUM_EUR (EUR)
│
├── IDM_COUNTRIES (dimension)
│   ├── COUNTRY_CODE (PK)
│   └── COUNTRY_NAME
│
├── IDM_PRODUCTS (dimension)
│   ├── SECINSTR_ISIN_CODE (PK, ISIN)
│   ├── PRODUCT_NAME
│   ├── L0_PRODUCT_TYPE
│   └── L1_PRODUCT_TYPE
│
└── IDM_SEGMENTS (dimension)
    ├── PROFITCENTER_CODE (PK)
    ├── L0_SEGM_DESC
    ├── L1_SEGM_DESC
    └── L2_SEGM_DESC
```

**Pattern:** Star schema (fact + dimensions) - correct pattern for analytics product

---

## 5. Domain Expert Assessment

### What's Good

| Aspect | Rating |
|--------|--------|
| **AUM as metric** | Standard wealth management KPI |
| **ISIN identification** | ISO 6166 standard - correct |
| **Country code** | ISO 3166-1 alpha-2 - correct |
| **LCY + EUR** | Dual currency reporting - best practice |
| **Segment hierarchy** | L0/L1/L2 - flexible |
| **Owner defined** | Clear accountability |

### Needs Improvement

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **Maturity 20%** | HIGH | Define path to 80%+ |
| **"To-Do" in definitions** | HIGH | Complete business definitions (AUM_LCY, L0/L1 Product Type) |
| **SOURCE_CODE mapping** | MEDIUM | Source Code → Income is semantically questionable |
| **FIBO validation errors** | MEDIUM | 3 errors to fix (see previous review) |
| **Missing Customer link** | LOW | Aggregated data - OK for reporting |

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Products without ISIN** | Private funds excluded | Extend with alternative identifiers |
| **Segment changes** | Historical data "moves" | SCD Type 2 for segments |
| **Multi-country products** | One record = one country | Redesign or document limitation |

---

## 6. FIBO Alignment Summary

From previous review (2025-12-31, `review/2025-12-31-domain-dp-edi-aum-fibo.md`):

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| FIBO Mapped | 72% | >=50% | PASS |
| Validation Errors | 3 | 0 | FAIL |
| Definition Coverage | 100% | 100% | PASS |

**Top 3 FIBO Issues:**
1. `Country Identifier` → missing external_concept
2. `ISIN` → missing external_concept
3. `Profitcenter Identifier` → missing external_concept

---

## 7. Data Product Scorecard

| Category | Score | Max | Notes |
|----------|-------|-----|-------|
| **Ownership** | 5/5 | 5 | Clear owner with contact |
| **Documentation** | 3/5 | 5 | Some definitions missing |
| **Discoverability** | 4/5 | 5 | In catalog, URL available |
| **Schema Quality** | 4/5 | 5 | Star schema, but FIBO errors |
| **SLA** | 5/5 | 5 | Complete SLA definition |
| **Security** | 4/5 | 5 | Classification OK, PII tagged |
| **Business Value** | 5/5 | 5 | Clear use cases |
| **Interoperability** | 3/5 | 5 | FIBO errors, segment mapping |
| **TOTAL** | **33/40** | 40 | **82% - GOOD** |

---

## 8. Recommendations

### Priority 1: Must fix before production

- [ ] Complete missing business definitions (`AUM_LCY`, `L0/L1_PRODUCT_TYPE`)
- [ ] Fix 3 FIBO validation errors
- [ ] Increase maturity score to min. 60%

### Priority 2: Before expanding consumers

- [ ] Reconsider SOURCE_CODE → Income mapping
- [ ] Document limitations (no ISIN = excluded)
- [ ] Add data quality metrics

### Priority 3: Product evolution

- [ ] Customer link for UC2/UC3 enrichment
- [ ] SCD Type 2 for segments
- [ ] Real-time variant (currently batch only)

---

## 9. Conclusion

**DP_EDI_AUM is a valid Data Product** with clear business value and correct structure.

| Dimension | Verdict |
|-----------|---------|
| **Is it a DP?** | YES |
| **Production ready?** | NO (maturity 20%) |
| **Correct owner?** | YES (MIB/Investment) |
| **FIBO aligned?** | PARTIAL (3 errors) |
| **Business value?** | CLEAR |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [dp_edi_aum.yaml](../../conceptspeak/input/datacontract/RBCZ/MIB/Investment/dp_edi_aum.yaml) | Source Data Contract |
| [2025-12-31-domain-dp-edi-aum-fibo.md](../../review/2025-12-31-domain-dp-edi-aum-fibo.md) | Previous FIBO alignment review |
| [GOV-013](../../policies/GOV-013-data-product-governance.md) | Data Product Governance Policy |

---

**Reviewer:** Banking Domain Expert (/domain)
**Status:** VALID DATA PRODUCT - NEEDS MATURATION
