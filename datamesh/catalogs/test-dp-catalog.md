# Test Domain - Data Product Catalog

> **Status:** DRAFT
> **Created:** 2026-01-08
> **Owner:** Data Mesh Consultant
> **Based on:** GOV-DM-001, GOV-DM-003, Test domain ontology

---

## 1. Executive Summary

This catalog defines Data Products for the **Test** domain hierarchy based on semantic analysis of the ontology. The Test domain serves as a reference implementation demonstrating Data Mesh patterns.

### Domain Structure

```
Test (root)                          5 DPs (3 concepts + 2 ISO ref) - SHARED REFERENCE
├── Test:MIB (BU)                   2 DPs (11 concepts)            - BU MASTER DATA
│   └── Test:MIB:Investment         18 DPs (262 concepts)          - DOMAIN ANALYTICS
└── Test:Retail (BU)                2 DPs (9 concepts)             - BU MASTER DATA
```

### Data Product Summary

| Layer | Count | Owner Level |
|-------|-------|-------------|
| Layer 1: Shared Reference | 5 | Test (root) |
| Layer 2: BU Master Data | 4 | MIB, Retail |
| Layer 3: Domain Analytics | 18 | Investment |
| **Total** | **27** | |

> **GOV-DM-001 Compliance:** All DP names are **purpose-driven** (reflect business value, not just entities).
> **DPCC Alignment:** Catalog aligned with production DPCC (9 Investment DPs mapped).

### DPCC Alignment Table

| DP Slug | DPCC Equivalent | Description |
|---------|-----------------|-------------|
| `investment-aum-reporting` | `DP_EDI_AUM` | AUM performance reporting |
| `investment-client-reporting` | `DP_EDI_AGG_CLIENT` | Client acquisition tracking |
| `investment-sales-reporting` | `DP_EDI_SALES` | Sales volume reporting |
| `investment-profitability` | `DP_EDI_PROFITABILITY` | Fee and income analysis |
| `investment-digital-channels` | `DP_EDI_APP_USAGE` | Mobile app usage analytics |
| `investment-portfolios` | `DP_EDI_PORTFOLIO` | Portfolio status per NWB |
| `investment-edi-customers` | `DP_EDI_CUSTOMER` | EDI customer status per NWB |
| `investment-reconciliation` | `DP_EDI_PORTFOLIO_RI`, `DP_EDI_POSITION_REC` | Portfolio & position reconciliation |
| `investment-agreements` | `DP_AGREEMENT` | Investment agreements for CRM |

### DWH Consumption Mapping

Investment DPs consume enterprise data from DWH (upstream cross-cutting layer):

| Investment DP | Consumes from DWH | Description |
|---------------|-------------------|-------------|
| `investment-suitability-assessment` | `DP_CLIENT_PROFILES` | Customer identity, compliance data |
| `investment-customer-contact` | `DP_CLIENT_ADDRESSES`, `DP_CONTACT_INFROM` | Address, phone, email data |
| `investment-contracts` | `DP_CLIENT_CONTRACT` | Contract master data |
| `investment-accounts` | `DP_ACCOUNTS_AND_C` | Account and card data |
| `investment-positions` | `DP_TRANSACTION_HIS` | Transaction history |
| `investment-transactions` | `DP_DAILY_TRANSACTI` | Daily transaction records |
| `investment-profitability` | `DP_FEE_SERVICE_MAR` | Fee and margin calculations |
| `investment-campaigns` | `DP_CAMP_CLIENT_RES` | Campaign and response data |
| `investment-edi-customers` | `DP_CLIENT_PROFILES` | Customer base data |

---

## 2. Layer 1: Shared Reference Data

**Owner:** Test root (CDO equivalent)
**Consumers:** All BUs and domains

### 2.1 ISO Reference Data

#### DP-REF-001: countries-reference-master

| Field | Value |
|-------|-------|
| **ID** | `test:countries` |
| **Slug** | `countries-reference-master` |
| **Title** | Countries Reference Master |
| **Owner** | Test root |
| **Layer** | 1 - Shared Reference |
| **Standard** | ISO 3166-1 |

**Description:** Master list of countries with ISO codes for all Test domain consumers.

**Ontology Concepts:**
- `Country` (bkb-test-mib-investment:Country)
- `Country Identifier` (Alpha-2 Identifier)
- `Country Name`
- `IDM Country` (reference table)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Consumers:**
- All Investment DPs (country of residence, trading venue)
- Retail DPs (customer address)

---

#### DP-REF-002: currencies-reference-master

| Field | Value |
|-------|-------|
| **ID** | `test:currencies` |
| **Slug** | `currencies-reference-master` |
| **Title** | Currencies Reference Master |
| **Owner** | Test root |
| **Layer** | 1 - Shared Reference |
| **Standard** | ISO 4217 |

**Description:** Master list of currencies for financial calculations and reporting.

**Ontology Concepts:**
- `Currency` (bkb-test-mib-investment:Currency)
- `CZK` (Czech Koruna)
- `EUR`
- `USD`

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Consumers:**
- Investment AUM Reporting (multi-currency)
- All financial DPs

---

### 2.2 Cross-Domain Business Entities

#### DP-REF-003: customer-crossdomain-reporting

| Field | Value |
|-------|-------|
| **ID** | `test:customers` |
| **Slug** | `customer-crossdomain-reporting` |
| **Title** | Customer Base for Cross-Domain Reporting |
| **Owner** | Test root (CDO) |
| **Layer** | 1 - Shared Reference |
| **FIBO** | fibo-fnd:Customer |

**Purpose:** Unified customer identity enabling cross-BU reporting and analytics. Provides golden record for customer across all business units.

**Business Questions Answered:**
- Who is our customer across all BUs?
- How many unique customers do we have enterprise-wide?
- How to link MIB and Retail customer records?

**Ontology Concepts:**
- `Customer` (bkb-test:Customer) → fibo-fnd:Customer
- Core attributes: ID, Name, Status

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Consumers:**
- `mib-customers` (extends)
- `retail-customers` (extends)
- Enterprise reporting

---

#### DP-REF-004: account-crossdomain-reporting

| Field | Value |
|-------|-------|
| **ID** | `test:accounts` |
| **Slug** | `account-crossdomain-reporting` |
| **Title** | Account Base for Cross-Domain Reporting |
| **Owner** | Test root (CDO) |
| **Layer** | 1 - Shared Reference |
| **FIBO** | fibo-fbc:Account |

**Purpose:** Unified account identity enabling cross-BU reporting. Foundation for all account-related analytics.

**Business Questions Answered:**
- What accounts exist across all BUs?
- How to aggregate account data for enterprise reporting?

**Ontology Concepts:**
- `Account` (bkb-test:Account) → fibo-fbc:Account
- Core attributes: Account Number, Status, Type

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Consumers:**
- `investment-accounts` (extends)
- Enterprise reporting

---

#### DP-REF-005: transaction-crossdomain-analytics

| Field | Value |
|-------|-------|
| **ID** | `test:transactions` |
| **Slug** | `transaction-crossdomain-analytics` |
| **Title** | Transaction Base for Cross-Domain Analytics |
| **Owner** | Test root (CDO) |
| **Layer** | 1 - Shared Reference |
| **FIBO** | fibo-fbc:Transaction |

**Purpose:** Unified transaction model enabling cross-BU analytics. Foundation for enterprise-wide transaction analysis.

**Business Questions Answered:**
- What is total transaction volume across BUs?
- How to compare transaction patterns between MIB and Retail?

**Ontology Concepts:**
- `Transaction` (bkb-test:Transaction) → fibo-fbc:Transaction
- Core attributes: Transaction ID, Date, Amount, Type

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Consumers:**
- `investment-transactions` (extends)
- Enterprise analytics

---

## 3. Layer 2: BU Master Data

### 3.1 MIB Business Unit

**Owner:** MIB BU Owner

#### DP-MIB-001: mib-customers

| Field | Value |
|-------|-------|
| **ID** | `test:mib:customers` |
| **Slug** | `mib-customers` |
| **Title** | MIB Customer Master |
| **Owner** | MIB BU |
| **Layer** | 2 - BU Master Data |
| **Specializes** | `customer-crossdomain-reporting` |
| **FIBO** | fibo-fnd:Customer |

**Description:** Single source of truth for MIB customer data, extended by Investment domain. Extends enterprise customer identity with MIB-specific attributes.

**Ontology Concepts:**
- `Customer` (bkb-test-mib:Customer) → extends Test:Customer
- Core attributes (inherited): ID, Name, Status
- MIB-specific: Risk Profile, Segment

**Specialization by Domain:**
| Domain | Additional Attributes |
|--------|----------------------|
| Investment | MiFID Class, Risk Profile, Investment Preferences |
| (future) | Segment, Relationship Manager |

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |
| CDC | Kafka | Near real-time |

**Consumers:**
- investment-customers (extends)
- investment-positions
- investment-transactions

---

#### DP-MIB-002: mib-contracts

| Field | Value |
|-------|-------|
| **ID** | `test:mib:contracts` |
| **Slug** | `mib-contracts` |
| **Title** | MIB Contract Master |
| **Owner** | MIB BU |
| **Layer** | 2 - BU Master Data |
| **FIBO** | fibo-fnd:Contract |

**Description:** Master data for all MIB contracts, specialized by Investment domain.

**Ontology Concepts:**
- `Contract` (bkb-test-mib:Contract) → extends FIBO:Contract
- Attributes: Contract Number, Date of Creation, Status

**Consumers:**
- investment-contracts (extends)
- All Investment analytical DPs

---

### 3.2 Retail Business Unit

**Owner:** Retail BU Owner

#### DP-RET-001: retail-products

| Field | Value |
|-------|-------|
| **ID** | `test:retail:products` |
| **Slug** | `retail-products` |
| **Title** | Retail Financial Products Catalog |
| **Owner** | Retail BU |
| **Layer** | 2 - BU Master Data |
| **FIBO** | fibo-fbc:FinancialProduct |

**Description:** Catalog of retail banking products.

**Ontology Concepts:**
- `Financial Product` (bkb-test-retail:Financial Product)
- `Bank Assurance` → fibo:InsuranceService
- `Card`
- `Loan`

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

---

#### DP-RET-002: retail-customers

| Field | Value |
|-------|-------|
| **ID** | `test:retail:customers` |
| **Slug** | `retail-customers` |
| **Title** | Retail Customer Master |
| **Owner** | Retail BU |
| **Layer** | 2 - BU Master Data |
| **Specializes** | `customer-crossdomain-reporting` |
| **FIBO** | fibo-fnd:Customer |

**Description:** Retail customer master with channel preferences. Extends enterprise customer identity with Retail-specific attributes.

**Ontology Concepts:**
- `Customer` (bkb-test-retail:Customer) → extends Test:Customer
- Core attributes (inherited): ID, Name, Status
- Retail-specific: `Application` (product application), Channel preferences

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

---

## 4. Layer 3: Investment Domain Analytics

**Owner:** Investment Domain Owner
**Parent Domain:** Test:MIB

### 4.1 Master Data (Domain-specific)

#### DP-INV-001: investment-products-catalog

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:products` |
| **Slug** | `investment-products-catalog` |
| **Title** | Investment Products & Securities Catalog |
| **Owner** | Investment Domain |
| **Layer** | 2/3 - Domain Master |
| **FIBO** | fibo-sec:Security |

**Description:** Master catalog of investment products and securities with ISIN codes.

**Ontology Concepts:**
- `Security` (bkb-test-mib-investment:Security) → fibo-sec:Security
- `Product` → fibo-fbc:FinancialProduct
- `ISIN` → fibo:InternationalSecuritiesIdentificationNumber
- `Product Name`
- `Trading Venue` → fibo-sec:Venue

**Product Types (from ontology):**
| Level 0 | Level 1 | FIBO Mapping |
|---------|---------|--------------|
| Funds | Funds (RIS), Funds (RCM), ETF, 3rd Party | fibo-sec:MutualFund, fibo-sec:ExchangeTradedFund |
| Bonds | - | fibo-sec:Bond |
| Equity | - | fibo-sec:Equity |
| Certificates | - | fibo-sec:Certificate |
| Other | IPO, Secondary Market | fibo-sec:InitialPublicOffering |

**Fund Classifications:**
| Type | FIBO |
|------|------|
| Open Ended | fibo-sec:Open-End Investment |
| Close Ended | fibo-sec:Closed-End Investment |

**Reference Data (EMBEDDED):**
- `IDM Product` (internal lookup table)
- `Level 0 Product Type`, `Level 1 Product Type`

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

**Consumers:**
- investment-positions
- investment-aum-reporting
- investment-transactions

---

#### DP-INV-002: investment-suitability-assessment

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:suitability` |
| **Slug** | `investment-suitability-assessment` |
| **Title** | Investment Suitability & Eligibility Assessment |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-sec:MiFIDClassification |

**Purpose:** Enable MiFID compliance decisions - determine whether a customer CAN invest and in WHAT products based on their profile, questionnaire results, and regulatory requirements.

**Business Questions Answered:**
- Is this customer eligible to invest?
- What is the customer's MiFID classification?
- What products can we recommend to this customer?
- Is the customer's investment questionnaire valid?
- What is the customer's risk profile?

**Ontology Concepts:**

**Eligibility & Classification:**
- `Eligibility Status` - can customer invest
- `New To Bank Customer` - first-time bank customer
- `New To Invest Customer` - first-time investor
- `Digital Customer` / `Non-digital Customer` - channel classification
- `Prospect` → fibo:ProspectiveClient

**Investment Questionnaire (MiFID):**
- `Standardized Investment Questionnaire`
- `Standardized Investment Questionnaire Status`
- `Question`, `Question Name`

**Risk & Care:**
- `Watch List` - customers requiring attention
- `Workout Care` - customers in workout
- `Customer Care` - care level assignment

**Customer Identity (from mib-customers):**
- `Customer` → extends mib:Customer
- `Party` → fibo-fnd:Party
- `Party ID`, `Party Key`

**Dependencies:**
- REFERENCES: `mib-customers` (customer identity for suitability assessment)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |
| API | REST | Real-time |

**Consumers:**
- investment-positions (eligibility check)
- investment-transactions (suitability validation)
- Advisory systems (product recommendation)
- Compliance reporting

---

#### DP-INV-002b: investment-customer-contact

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:contact` |
| **Slug** | `investment-customer-contact` |
| **Title** | Investment Customer Contact Management |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fnd:Contact |

**Purpose:** Enable effective communication with investment customers across all channels - provide accurate, up-to-date contact information with preferences.

**Business Questions Answered:**
- How do we reach this customer?
- What is the customer's preferred contact method?
- What is the customer's mailing address for statements?
- Is the contact information valid?

**Ontology Concepts:**

**Contact Details:**
- `Contact` → fibo-fnd:Contact
- `Preferred Contact Details`
- `Other Contact Details`

**Address:**
- `Address` → fibo-fnd:Address
- `Contact Address` - for correspondence
- `Permanent Address` - legal residence
- `Street`, `Street Name`
- `Building Number`, `Orientation Street Number`
- `City` → schema:City
- `Zip Identifier` → fibo:ZipCode
- `Country` → fibo:Country (ref-countries)

**Phone:**
- `Phone Number`
- `Telephone Number` → fibo:TelephoneNumber

**Email:**
- `Electronic Mail Address` → schema:ElectronicMailAddress
- `Email`

**Personal Identity (for matching):**
- `First Name`, `Middle Name`, `Surname`
- `Vocative` → fibo:Name (Czech-specific salutation)
- `Birth Date` → fibo:DateOfBirth
- `Birth Number` → fibo:NationalIdentificationNumber
- `Gender`, `Citizenship`

**Dependencies:**
- REFERENCES: `mib-customers` (customer identity for contact management)
- REFERENCES: `countries-reference-master` (address country validation)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |
| CDC | Kafka | Near real-time |

**Consumers:**
- investment-campaigns (campaign targeting)
- investment-onboarding (welcome communications)
- Statement generation systems
- CRM systems

---

#### DP-INV-003: investment-contracts

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:contracts` |
| **Slug** | `investment-contracts` |
| **Title** | Investment Contracts Master |
| **Owner** | Investment Domain |
| **Layer** | 2/3 - Domain Master |
| **FIBO** | fibo-fnd:Contract |

**Description:** Master of investment contracts (EDI, DIP, Custody, Brokerage).

**Ontology Concepts:**

**Contract Types:**
| Type | FIBO Mapping |
|------|--------------|
| `EDI Contract` | Domain-specific |
| `DIP Contract` | fibo:PensionPlan |
| `Custody Contract` | fibo:CustodyAgreement |
| `DEPO Contract` | fibo:DepositAccount |
| `Brokerage Contract` | Domain-specific |
| `Advisory Investment Contract` | Domain-specific |
| `Asset Management Contract` | Domain-specific |
| `REPO Contract` | fibo:RepurchaseAgreement |
| `GOLD Contract` | Domain-specific |

**Contract Status:**
- `Active Contract`
- `Open Contract`
- `Terminated Contract`

**Attributes:**
- `Contract Number`
- `Date Of Creation`

**Dependencies:**
- SPECIALIZES: `mib-contracts` (Investment Contract IS-A Contract)
- REFERENCES: `mib-customers` (contract owner)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

---

#### DP-INV-004: investment-accounts

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:accounts` |
| **Slug** | `investment-accounts` |
| **Title** | Investment Accounts Master |
| **Owner** | Investment Domain |
| **Layer** | 2/3 - Domain Master |
| **FIBO** | fibo-fbc:Account |

**Description:** Investment and custody accounts.

**Ontology Concepts:**
- `Account` → extends mib:Account → fibo-fbc:Account
- `Investment Account (BIU)` → fibo:InvestmentAccount
- `Current Account` → fibo:DepositAccount
- `Active Current Account`
- `Saving Account`
- `Number Of Active Current Accounts`

**Attributes:**
- `Balance` → fibo:Balance
- `Deposit` → fibo:Deposit
- `End Of Day (EOD) Balance`
- `Currency` (CZK, EUR, USD)

**Dependencies:**
- REFERENCES: `currencies-reference-master` (account currency)
- REFERENCES: `mib-customers` (account owner)
- REFERENCES: `investment-contracts` (account contract)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |

---

### 4.2 Analytical Data Products

#### DP-INV-005: investment-positions

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:positions` |
| **Slug** | `investment-positions` |
| **Title** | Investment Positions & Holdings |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fbc:Position |

**Description:** Customer positions in securities with market valuations.

**Ontology Concepts:**
- `Position` → fibo-fbc:Position
- `Market Value` → fibo:MarketValue
- `Portfolio` → fibo:Portfolio
- `Sold Position`

**Temporal Attributes:**
- `Trade Date` → fibo:SecuritiesTradeDatePositionReporting
- `Settlement Date` → fibo:SettlementDateRule
- `Date`

**Dependencies:**
- REFERENCES: `investment-products-catalog` (security details)
- REFERENCES: `mib-customers` (position owner)
- REFERENCES: `investment-accounts` (custody account)
- REFERENCES: `currencies-reference-master` (valuation currency)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |
| Snapshot | Parquet | EOD |

---

#### DP-INV-006: investment-aum-reporting

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:aum` |
| **Slug** | `investment-aum-reporting` |
| **Title** | Investment AUM Performance Reporting |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fbc:AssetsUnderManagement |

**Description:** Assets Under Management reporting with segmentation.

**Ontology Concepts:**
- `Asset Under Management (AUM)` → fibo:AssetsUnderManagement
- `AUM LCY` (local currency)
- `EDI AUM` (EDI-specific aggregate)
- `Number Of Products`

**Segmentation (EMBEDDED):**
- `IDM Segment` (internal lookup)
- `Level 0 Segment Description`
- `Level 1 Segment Description`
- `Level 2 Segment Description`
- `Segment`

**Profitcenter (EMBEDDED):**
- `Profitcenter Identifier`
- `Profitcenter Name`
- `RBCZ Profitcenter`, `RBHR Profitcenter`, `RBRO Profitcenter`

**Dependencies:**
- AGGREGATES: `investment-positions` (sums position values for AUM)
- REFERENCES: `investment-products-catalog` (product classification)
- REFERENCES: `currencies-reference-master` (currency conversion)
- REFERENCES: `countries-reference-master` (geographic segmentation)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |
| Report | Excel/PDF | Daily 8:00 |

**DPCC Equivalent:** `DP_EDI_AUM`

---

#### DP-INV-007: investment-transactions

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:transactions` |
| **Slug** | `investment-transactions` |
| **Title** | Investment Transactions & Orders |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fbc:Transaction |

**Description:** Investment orders, trades, and payments.

**Ontology Concepts:**

**Transaction Hierarchy:**
- `Transaction` → fibo-fbc:Transaction
  - `Trade` → fibo-fbc:Trade
    - `Repo Trade`
  - `Order` → fibo-fbc:Order
    - `Executed Order`
    - `Placed Order`
    - `Settled Order`
  - `Payment` → fibo-fnd:Payment
    - `Incoming Payment`
    - `Outgoing Payment`

**Order Types:**
- `Buy`
- `Sell`
- `Saving Plan (regular Investment)`

**Frequency:**
- `One-time`
- `Regularly`
- `Weekly`
- `Monthly`

**Execution:**
- `Manual`
- `Automatic`
- `Execution`
- `Execution Register`

**Market:**
- `Market Exchange` → fibo:Exchange
- `Stock Market`
- `Over The Counter (OTC) Market`

**Dependencies:**
- REFERENCES: `investment-positions` (affects position)
- REFERENCES: `investment-products-catalog` (traded security)
- REFERENCES: `mib-customers` (transaction party)
- REFERENCES: `investment-accounts` (settlement account)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |
| Streaming | Kafka | Real-time |

---

#### DP-INV-008: investment-profitability

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:profitability` |
| **Slug** | `investment-profitability` |
| **Title** | Investment Income & Profitability |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fnd:Income |

**Description:** Fee and income analysis for investment products.

**Ontology Concepts:**

**Income Types:**
- `Income` → fibo-fnd:Income
- `Gross Income`
- `Core Income`
- `Allocated Income`
- `LAMC Income`
- `RIS Group Income`
- `Other Income`
- `LTV (life Time Value) GI (gross Income)`

**Fee Types:**
- `Fee` → fibo-fbc:Fee
- `Entry Fee`
- `Sales Fee`
- `Custody Fee`
- `Trailer Fee`
- `Kickback Fee`
- `Portfolio-based Fee`
- `Other Fee`

**Profitability:**
- `Profitability`
- `Liability Margin` → fibo:Margin
- `First Date Of Deposit`

**Reference (EMBEDDED):**
- `Income Source Type`
- `Source Code Description`

**Dependencies:**
- DERIVES: `investment-transactions` (calculates fees/income from transactions)
- REFERENCES: `investment-positions` (portfolio values)
- REFERENCES: `investment-products-catalog` (product fee schedules)
- REFERENCES: `investment-suitability-assessment` (customer segmentation)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |
| Report | Excel | Monthly |

**DPCC Equivalent:** `DP_EDI_PROFITABILITY`

---

#### DP-INV-008b: investment-client-reporting

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:client-reporting` |
| **Slug** | `investment-client-reporting` |
| **Title** | Investment Client Acquisition & Tracking |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fnd:Customer |

**Purpose:** Track EDI client counts, acquisition performance, and client lifecycle status. Enable performance evaluation against annual targets and digital strategy optimization.

**Business Questions Answered:**
- How many EDI clients do we have?
- How is client acquisition performing vs plan?
- Which channels are most effective for acquisition?
- In which segments are clients concentrated?
- What is the client status distribution (new, lost, DIP)?

**Value Proposition:**
- **Performance Evaluation** - Assessment of client acquisition against annual targets
- **Digital Strategy Enhancement** - Insights into digital channel effectiveness
- **Segment Analysis** - Client distribution across segments for targeted marketing

**Ontology Concepts:**

**Client Counts:**
- `Customer` → fibo-fnd:Customer
- `New To Bank Customer`
- `New To Invest Customer`
- `Digital Customer` / `Non-digital Customer`

**Contract Types:**
- `EDI Contract`
- `DIP Contract`
- `Contract` status (active, terminated)

**Segmentation:**
- `Segment`
- `Profitcenter Identifier`
- `Level 0/1/2 Segment Description`

**Onboarding Status:**
- `Customer Onboarding Completion Status`
- `Onboarding Status`

**Use Cases:**
| UC | Description |
|----|-------------|
| UC1 | EDI client tracking - current counts and trends |
| UC2 | Acquisition analysis - by channel and profitcenter |
| UC3 | Plan vs actual - performance against targets |

**Dependencies:**
- AGGREGATES: `mib-customers` (counts customers by segment)
- REFERENCES: `investment-contracts` (contract status)
- REFERENCES: `investment-onboarding` (onboarding funnel)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | Daily |
| Dashboard | PowerBI | Real-time |

**DPCC Equivalent:** `DP_EDI_AGG_CLIENT`

---

#### DP-INV-008c: investment-sales-reporting

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:sales` |
| **Slug** | `investment-sales-reporting` |
| **Title** | Investment Sales Volume Reporting |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fbc:Sale |

**Purpose:** Track daily sales volume from investment transactions by product, segment, and country. Enable market opportunity identification and product performance analysis.

**Business Questions Answered:**
- What is the daily sales volume per product?
- How do sales differ by segment and country?
- What is the buy/sell/holding distribution?
- How effective is the EDI mobile channel vs other channels?

**Value Proposition:**
- **Market Opportunity Identification** - Insights into investment transactions
- **Product Performance Analysis** - Sales performance per product and segment
- **Digital Channel Optimization** - EDI mobile vs other channel comparison

**Ontology Concepts:**

**Sales Metrics:**
- `Sales` → fibo-fbc:Sale
- `Buy`
- `Sell`
- `Sold Position` (holding)

**Volume & Value:**
- `Market Value` → fibo:MarketValue
- Currency (EUR standard)

**Dimensions:**
- `Product` → fibo:FinancialProduct
- `Segment`
- `Country` → ref-countries
- `Channel` (EDI mobile vs other)

**Temporal:**
- `Date` (daily granularity)
- `Trade Date`

**Use Cases:**
| UC | Description |
|----|-------------|
| UC1 | Digital channel and product portfolio optimization for sales |

**Dependencies:**
- AGGREGATES: `investment-transactions` (sums sales volume)
- REFERENCES: `investment-products-catalog` (product details)
- REFERENCES: `countries-reference-master` (country dimension)
- REFERENCES: `currencies-reference-master` (EUR conversion)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | Daily |
| Dashboard | PowerBI | T+1 |

**DPCC Equivalent:** `DP_EDI_SALES`

---

#### DP-INV-009: investment-campaigns

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:campaigns` |
| **Slug** | `investment-campaigns` |
| **Title** | Investment Marketing Campaigns |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | schema:MarketingAction |

**Description:** Marketing campaigns and customer consent management.

**Ontology Concepts:**

**Campaign:**
- `Campaign`
- `Marketing Campaign` → schema:MarketingAction
- `Communication Campaign`
- `Campaign Response`
- `Campaign Restriction`

**Offers:**
- `Investment Offers`
- `Email Investment Offers`
- `Cross Sell (X-sell)`
- `Up-sell`

**Consent:**
- `Consent` → schema:ConsentAction
- `Explicit Consent`
- `Legitimate Interest`
- `Prohibition Xsell 6M`
- `Global Control Group`

**Channels:**
- `Communication Channel` → schema:ServiceChannel
- `Email` → schema:Message
- `SMS`
- `Push Notification`

**Dependencies:**
- REFERENCES: `investment-suitability-assessment` (eligible campaign targets)
- REFERENCES: `investment-products-catalog` (promoted products)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |
| Real-time | Kafka | Event-driven |

---

#### DP-INV-010: investment-onboarding

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:onboarding` |
| **Slug** | `investment-onboarding` |
| **Title** | Investment Customer Onboarding |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | schema:JoinAction |

**Description:** Customer onboarding journey and conversion analytics.

**Ontology Concepts:**

**Onboarding:**
- `Customer Onboarding` → schema:JoinAction
- `Onboarding Status`
- `Onboarding Completion Date`
- `Customer Onboarding Completion Status`
- `Customer Onboarding Completion Status Date`

**Service Models:**
- `EDI Service`
- `Central Onboarding (product As A Service)` (PAAS)
- `Local Onboarding (software As A Service)`

**Status Codes:**
- `CONS`, `CS01`, `CS02`, `CS03`, `CS11`
- `EMPL`, `PAAS`

**Channels:**
- `Digital Onboarding Channel`
- `Non-digital Onboarding Channel`
- `Digital Channel`
- `Digital Channel Event`
- `Login`

**Dependencies:**
- REFERENCES: `mib-customers` (customer journey)
- REFERENCES: `investment-contracts` (contract creation)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | T+1 |
| Funnel | Dashboard | Real-time |

---

#### DP-INV-011: investment-digital-channels

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:digital-channels` |
| **Slug** | `investment-digital-channels` |
| **Title** | Investment Digital Channel & App Usage Analytics |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | schema:ServiceChannel |

**Purpose:** Track EDI mobile application usage statistics. Provide insights into user engagement patterns and support UI/UX strategy decisions.

**Business Questions Answered:**
- How many clients use the EDI mobile app?
- What are the usage patterns (daily, weekly, monthly)?
- What is the unique vs non-unique access distribution?
- Where are the peaks in usage?

**Value Proposition:**
- **User Engagement Insights** - Statistics on unique/non-unique accesses at various granularities
- **Strategic Decision Support** - Supports "state of the art UI/UX" success criterion

**Ontology Concepts:**

**Channels:**
- `Channel` → schema:ServiceChannel
- `Digital Channel`
- `Non-digital Channel`
- `Mobile Banking (SPB)`
- `Raiffeisen Investing (EDI) Mobile App`
- `Siebel CRM`

**Events:**
- `Digital Channel Event`
- `Digital Channel Event Day Time`
- `Digital Channel Event Identifier`
- `Login`
- `Occurrence Kind` → schema:OccurrenceKind

**Devices:**
- `Device`
- `Device Identifier`
- `Platform`

**Interaction Types:**
- `E2E Pure Digital`
- `Human Assisted`
- `Remote Assisted`
- `Branch Employee`
- `CMT`

**Language:**
- `Language` → schema:Language
- `Language Preference`
- `Preferred Language From Siebel`
- `Preferred Language From Raiffeisen Investing (EDI) Mobile App`

**Use Cases:**
| UC | Description |
|----|-------------|
| UC1 | Mobile app usage monitoring - engagement levels and trends |

**Dependencies:**
- REFERENCES: `investment-suitability-assessment` (customer identity for app usage tracking)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | Daily |
| Streaming | Kafka | Real-time |

**DPCC Equivalent:** `DP_EDI_APP_USAGE`

---

#### DP-INV-012: investment-network-banks

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:network` |
| **Slug** | `investment-network-banks` |
| **Title** | Investment Network Banks Reference |
| **Owner** | Investment Domain |
| **Layer** | 2/3 - Domain Reference |
| **FIBO** | fibo:InvestmentBank |

**Description:** Reference data for RBI network banks participating in investment services.

**Ontology Concepts:**
- `Network Bank` → fibo:InvestmentBank
- `RBCZ` → fibo:Bank
- `RBHR`
- `RDB Romania`
- `Blacklist`
- `Registry`

**Dependencies:**
- REFERENCES: `countries-reference-master` (bank country)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | Weekly |

---

#### DP-INV-013: investment-portfolios

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:portfolios` |
| **Slug** | `investment-portfolios` |
| **Title** | Investment Portfolio Status |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fbc:Portfolio |

**Purpose:** Track EDI portfolio status across all EDI customers within network banks. Provide portfolio-level view for operational monitoring and reporting.

**Business Questions Answered:**
- What is the portfolio status for each EDI customer?
- How many portfolios exist per network bank?
- What is the distribution of portfolio types?

**Ontology Concepts:**
- `Portfolio` → fibo-fbc:Portfolio
- `EDI Contract` (portfolio container)
- `Customer` → portfolio owner

**Dependencies:**
- REFERENCES: `mib-customers` (portfolio owner)
- REFERENCES: `investment-contracts` (EDI contracts)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | Daily |

**DPCC Equivalent:** `DP_EDI_PORTFOLIO`

---

#### DP-INV-014: investment-edi-customers

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:edi-customers` |
| **Slug** | `investment-edi-customers` |
| **Title** | EDI Customer Status per Network Bank |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fnd:Customer |

**Purpose:** Track EDI customer status within network banks using EDI in local onboarding mode. Enable cross-NWB customer analytics and status monitoring.

**Business Questions Answered:**
- What is the EDI customer status per network bank?
- Which network banks have active EDI customers?
- What is the customer distribution across NWBs?

**Ontology Concepts:**
- `Customer` → fibo-fnd:Customer
- `Network Bank` → fibo:InvestmentBank
- `Onboarding Status`
- `EDI Service`

**Dependencies:**
- REFERENCES: `mib-customers` (customer base)
- REFERENCES: `investment-network-banks` (NWB reference)
- REFERENCES DWH: `DP_CLIENT_PROFILES` (customer data)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | Daily |

**DPCC Equivalent:** `DP_EDI_CUSTOMER`

---

#### DP-INV-015: investment-reconciliation

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:reconciliation` |
| **Slug** | `investment-reconciliation` |
| **Title** | Portfolio & Position Reconciliation |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fbc:Reconciliation |

**Purpose:** Results of reconciliation jobs between EDI data from NWB core systems and EDI portfolio/position data. Ensure data consistency and identify discrepancies.

**Business Questions Answered:**
- Are portfolios in sync between NWB core and EDI?
- Are positions in sync between NWB core and EDI?
- What discrepancies exist and need resolution?

**Ontology Concepts:**
- `Portfolio` → fibo-fbc:Portfolio (reconciliation target)
- `Position` → fibo-fbc:Position (reconciliation target)
- Reconciliation status, discrepancy records

**Dependencies:**
- DERIVES: `investment-portfolios` (compares/reconciles EDI portfolio data)
- DERIVES: `investment-positions` (compares/reconciles EDI position data)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | Daily |
| Alert | Kafka | On discrepancy |

**DPCC Equivalent:** `DP_EDI_PORTFOLIO_RI`, `DP_EDI_POSITION_REC`

---

#### DP-INV-016: investment-agreements

| Field | Value |
|-------|-------|
| **ID** | `test:mib:investment:agreements` |
| **Slug** | `investment-agreements` |
| **Title** | Investment Agreements for CRM |
| **Owner** | Investment Domain |
| **Layer** | 3 - Analytics |
| **FIBO** | fibo-fnd:Agreement |

**Purpose:** Active investment agreements of customers for CRM integration. Enable sales and relationship management activities.

**Business Questions Answered:**
- Which customers have active investment agreements?
- What type of agreements exist per customer?
- What is the agreement distribution for CRM targeting?

**Ontology Concepts:**
- `Contract` → fibo-fnd:Contract
- `EDI Contract`, `DIP Contract`
- `Active Contract`
- Customer-contract relationship

**Dependencies:**
- REFERENCES: `investment-contracts` (contract master)
- REFERENCES: `investment-suitability-assessment` (customer eligibility)

**Output Ports:**
| Port | Format | SLA |
|------|--------|-----|
| Batch | Delta Lake | Daily |
| API | REST | Real-time (CRM integration) |

**DPCC Equivalent:** `DP_AGREEMENT`

---

## 5. Dependency Graph

### 5.1 Legend

| Symbol | Relationship | Meaning |
|--------|--------------|---------|
| **S→** | SPECIALIZES | Output IS-A input + new attributes |
| **R→** | REFERENCES | Lookup/FK relationship |
| **A→** | AGGREGATES | Summarizes/counts data |
| **D→** | DERIVES | Transforms/calculates new data |

### 5.2 Layer 1 → Layer 2

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LAYER 1: SHARED REFERENCE                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────┐ │
│  │countries-ref-mstr│  │currencies-ref-mstr│  │customer-crossdomain│ │
│  └────────┬─────────┘  └────────┬─────────┘  └─────────┬──────────┘ │
│           │                     │                      │            │
│           │ R→                  │ R→                   │ S→         │
└───────────┼─────────────────────┼──────────────────────┼────────────┘
            │                     │                      │
            ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         LAYER 2: BU MASTER DATA                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────┐ │
│  │   mib-customers  │  │   mib-contracts  │  │  retail-customers  │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────────────────┘ │
└───────────┼─────────────────────┼───────────────────────────────────┘
            │                     │
            │ R→                  │ S→
            ▼                     ▼
```

### 5.3 Layer 2 → Layer 3 (Investment Domain)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER 3: INVESTMENT DOMAIN                        │
│                                                                      │
│  ┌─────────────────────────── MASTER DATA ───────────────────────┐  │
│  │                                                                │  │
│  │  mib-customers ──R→─┬─→ inv-suitability    inv-products-catalog│  │
│  │                     ├─→ inv-customer-contact         │        │  │
│  │                     ├─→ inv-onboarding               │        │  │
│  │                     └─→ inv-client-reporting (A→)    │        │  │
│  │                                                      │        │  │
│  │  mib-contracts ──S→──→ inv-contracts ◄───────────────┘        │  │
│  │                              │                                 │  │
│  │                              │ R→                              │  │
│  │                              ▼                                 │  │
│  │                        inv-accounts                            │  │
│  │                              │                                 │  │
│  └──────────────────────────────┼─────────────────────────────────┘  │
│                                 │ R→                                 │
│  ┌─────────────────────── ANALYTICAL ────────────────────────────┐  │
│  │                              ▼                                 │  │
│  │  inv-products ──R→──→ inv-positions ◄──R── inv-accounts       │  │
│  │                              │                                 │  │
│  │              ┌───────────────┼───────────────┐                 │  │
│  │              │ A→            │ R→            │ R→              │  │
│  │              ▼               ▼               ▼                 │  │
│  │       inv-aum-reporting  inv-transactions  inv-reconciliation │  │
│  │                              │               (D→ portfolios)   │  │
│  │              ┌───────────────┼───────────────┐                 │  │
│  │              │ A→            │ D→            │ A→              │  │
│  │              ▼               ▼               ▼                 │  │
│  │    inv-sales-reporting  inv-profitability  inv-client-report  │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────── ENGAGEMENT ────────────────────────────┐  │
│  │                                                                │  │
│  │  inv-suitability ──R→──→ inv-campaigns                        │  │
│  │                     └──→ inv-digital-channels                 │  │
│  │                     └──→ inv-agreements                       │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────── EDI NETWORK ───────────────────────────┐  │
│  │                                                                │  │
│  │  inv-network-banks ──R→──→ inv-edi-customers                  │  │
│  │  mib-customers ─────R→────┘       │                           │  │
│  │                                   │ R→                        │  │
│  │                                   ▼                           │  │
│  │                           inv-portfolios                      │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.4 Dependency Summary

| Typ | Počet | DPs |
|-----|-------|-----|
| **SPECIALIZES** | 3 | mib-customers, retail-customers, inv-contracts |
| **REFERENCES** | 14 | inv-suitability, inv-contact, inv-accounts, inv-positions, ... |
| **AGGREGATES** | 3 | inv-aum-reporting, inv-client-reporting, inv-sales-reporting |
| **DERIVES** | 2 | inv-profitability, inv-reconciliation |

---

## 6. Governance Compliance

### 6.1 DATSIS Checklist

| DP | D | A | T | S | I | S | DPCC |
|----|---|---|---|---|---|---|------|
| ref-countries | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| ref-currencies | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| mib-customers | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| mib-contracts | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| inv-products | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| inv-suitability | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| inv-contact | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| inv-positions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| inv-aum | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `DP_EDI_AUM` |
| inv-transactions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| inv-client-reporting | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `DP_EDI_AGG_CLIENT` |
| inv-sales-reporting | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `DP_EDI_SALES` |
| inv-profitability | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `DP_EDI_PROFITABILITY` |
| inv-campaigns | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| inv-onboarding | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| inv-digital-channels | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `DP_EDI_APP_USAGE` |
| inv-portfolios | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `DP_EDI_PORTFOLIO` |
| inv-edi-customers | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `DP_EDI_CUSTOMER` |
| inv-reconciliation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `DP_EDI_PORTFOLIO_RI` |
| inv-agreements | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `DP_AGREEMENT` |

### 6.2 Composability Rules

| Rule | Status | Notes |
|------|--------|-------|
| COMP-1 (Shared Reference) | ✓ | All DPs can use ref-* |
| COMP-2 (Same Domain) | ✓ | Investment DPs interconnected |
| COMP-3 (Parent Domain) | ✓ | Investment extends MIB |
| COMP-4 (Sibling Contract) | N/A | No cross-BU dependencies |
| COMP-5 (No Circular) | ✓ | DAG verified |
| COMP-6 (Consumer Registration) | ✓ | All consumers listed |
| COMP-7 (Cross-Domain via DP) | ✓ | All cross-domain via DP |

### 6.3 Ownership Alignment

| Level | Domain | Owner |
|-------|--------|-------|
| 0 | External (FIBO) | EDMC |
| 1 | Test (root) | CDO |
| 2 | Test:MIB | MIB BU Owner |
| 2 | Test:Retail | Retail BU Owner |
| 3 | Test:MIB:Investment | Investment Domain Owner |

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] ref-countries
- [ ] ref-currencies
- [ ] mib-customers
- [ ] mib-contracts

### Phase 2: Investment Master (Week 3-4)
- [ ] investment-products-catalog
- [ ] investment-suitability-assessment *(MiFID compliance)*
- [ ] investment-customer-contact *(communication)*
- [ ] investment-contracts
- [ ] investment-accounts

### Phase 3: Core Analytics - DPCC Aligned (Week 5-8)
- [ ] investment-positions
- [ ] investment-aum-reporting *(DPCC: DP_EDI_AUM)*
- [ ] investment-transactions
- [ ] investment-client-reporting *(DPCC: DP_EDI_AGG_CLIENT)* **NEW**
- [ ] investment-sales-reporting *(DPCC: DP_EDI_SALES)* **NEW**
- [ ] investment-profitability *(DPCC: DP_EDI_PROFITABILITY)*

### Phase 4: EDI Network (Week 9-10)
- [ ] investment-portfolios *(DPCC: DP_EDI_PORTFOLIO)* **NEW**
- [ ] investment-edi-customers *(DPCC: DP_EDI_CUSTOMER)* **NEW**
- [ ] investment-reconciliation *(DPCC: DP_EDI_PORTFOLIO_RI, DP_EDI_POSITION_REC)* **NEW**
- [ ] investment-agreements *(DPCC: DP_AGREEMENT)* **NEW**
- [ ] investment-network-banks

### Phase 5: Engagement (Week 11-12)
- [ ] investment-campaigns
- [ ] investment-onboarding
- [ ] investment-digital-channels *(DPCC: DP_EDI_APP_USAGE)*

---

## 8. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Data Mesh Consultant | Initial catalog based on ontology |
| 1.1 | 2026-01-08 | Data Mesh Consultant | GOV-DM-001 compliance: Split `investment-customers` into purpose-driven DPs: `investment-suitability-assessment` (MiFID) + `investment-customer-contact` (communication) |
| 1.2 | 2026-01-08 | Data Mesh Consultant | DPCC alignment: Added `investment-client-reporting` (DP_EDI_AGG_CLIENT) + `investment-sales-reporting` (DP_EDI_SALES). Added DPCC equivalent tags to all matching DPs. |
| 1.3 | 2026-01-08 | Data Mesh Consultant | Fixed reference DP IDs: `test:ref:*` → `test:*` (ref subdomain doesn't exist). Fixed total count: 17 → 21. |
| 1.4 | 2026-01-08 | Data Mesh Consultant | Full DPCC alignment: Added 4 new DPs (`investment-portfolios`, `investment-edi-customers`, `investment-reconciliation`, `investment-agreements`). Added DWH consumption mapping. Total: 21 → 24. |
| 1.5 | 2026-01-08 | Data Mesh Consultant | Added cross-domain business entities at Layer 1: `customer-crossdomain-reporting`, `account-crossdomain-reporting`, `transaction-crossdomain-analytics`. Renamed reference DPs: `ref-*` → `*-reference-master`. Total: 24 → 27. |
| 1.6 | 2026-01-08 | Data Mesh Consultant | Typed dependencies: SPECIALIZES (IS-A), REFERENCES (FK), AGGREGATES (sums), DERIVES (transforms). Replaced generic CONSUMES with specific types across all DPs. |
| 1.7 | 2026-01-08 | Data Mesh Consultant | Updated dependency graph with typed relationships (S→, R→, A→, D→). Organized by layers and functional areas (Master Data, Analytical, Engagement, EDI Network). |
