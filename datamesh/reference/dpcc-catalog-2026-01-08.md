# DPCC Catalog Extract

> **Source:** Scan 8. 1. 2026 at 11.06.pdf + Scan 8. 1. 2026 at 11.14.pdf (full names)
> **Extracted:** 2026-01-08
> **Records:** 87 Data Products

---

## Summary by Domain

| Domain | Count | Description |
|--------|-------|-------------|
| `rbcz:ai` | 7 | AI/ML Data Products |
| `rbcz:it:development:dwh` | ~55 | Cross-cutting Enterprise DPs |
| `rbcz:mib:investment` | 9 | EDI Investment DPs |
| `rbcz:retail` | 3 | Retail general |
| `rbcz:retail:P1%20Segment` | 5 | Retail P1 Segment |
| `rbcz:retail:Digital%20Bank` | 1 | Digital Banking |
| `rbcz:retail:Retail%20Loan` | 1 | Retail Loans |

---

## AI Domain (`rbcz:ai`)

| DataProductTitle | DataProductName | Description |
|------------------|-----------------|-------------|
| Categorization of responses | DP_CAT_RESPONSES | Automatizuje třídění a analýzu reakcí zákazníků pro lepší pochopení jejich potřeb a preferencí. FIBO: Customer Interaction Management |
| Compliance | DP_COMPLIANCE | Monitoruje a vyhodnocuje dodržování regulačních a interních politik s cílem minimalizovat rizika. FIBO: Compliance and Regulatory Reporting |
| Consolidation of client experience data | DP_CONS_CLIENT_EXP_DATA | Umožňuje shromažďování, organizaci a analýzu dat o zákaznické zkušenosti pro optimalizaci interakcí a služeb. FIBO: Customer Data Management |
| Development of sales skills | DP_DEV_SALES_SKILLS | Podporuje identifikaci, sledování a zlepšování klíčových kompetencí obchodních týmů. FIBO: Human Resource Management |
| Enriching data with business signals | DP_ENR_DATA_BUS_SIGNALS | Poskytuje analýzy a poznatky z obchodních signálů pro zlepšení zákaznických vztahů a cílených strategií. FIBO: Customer Relationship Management |
| Facilitation of the customer journey | DP_FAC_CUST_JOURNEY | Mapuje a analyzuje interakce zákazníků s cílem zlepšit jejich celkový zážitek a loajalitu. FIBO: Customer Journey |
| Process efficiency | DP_PROCESS_EFF | Poskytuje metriky a analýzy pro optimalizaci výkonu a efektivity organizačních procesů. FIBO: Business Process Management |

---

## DWH Domain (`rbcz:it:development:dwh`)

### Accounting & Finance

| DataProductTitle | DataProductName | Description | FIBO |
|------------------|-----------------|-------------|------|
| Accounting and General Ledger | DP_ACCOUNTG_GENERAL_LEDGER | Účetní zápisy a konsolidace. DM_FVR | Accounting |
| Accounting and Regulatory Metrics | DP_ACCOUNTING_REGULATORY_METRICS | IFRS metriky, EIR, POCI, interní odpisy. DM_FVR | Accounting, Financial Instrument |
| Annual Tax Reports | DP_ANNUAL_TAX_REPORTS | Výstupy pro daňové úřady, compliance reporty. DM_TAXREG | Compliance |
| CRS Tax Residencies | DP_CRS_TAX_RESIDENCIES | Evidence daňových domicilů podle CRS | Taxonomy |
| FATCA Tax Residencies | DP_FATCA_TAX_RESIDENCIES | Evidence daňových domicilů pro FATCA reporting | Taxonomy |
| Fees and Service Margins | DP_FEE_SERVICE_MARGINS | Výpočty poplatků, servisních marží a jejich evidence. DM_TSSM | Revenue, Financial Instrument |
| Financial Reporting and Accounting | DP_FIN_REP_ACC | Finanční výkazy, IFRS reporting, účetní metriky. DM_FVR, DM_PROMIS | Financial Statements |
| Statements and Reports | DP_STATEMENTS_REPORTS | IFRS a lokální finanční výkazy | Financial Statements |
| Tax Reporting | DP_TAX_REPORTING | CRS, FATCA a další daňové reporty. DM_TAXREG, DM_CR:ESIF, DM_CR:RIAD | Taxonomy, Compliance |

### Client Data

| DataProductTitle | DataProductName | Description | FIBO |
|------------------|-----------------|-------------|------|
| Client Addresses | DP_CLIENT_ADDRESSES | Adresní body, trvalé a doručovací adresy klienta | Person, Customer, Legal Entity, Taxonomy |
| Client Contracts and Products | DP_CLIENT_CONTRACTS_PRODUCTS | Přehled všech smluv a produktů klienta, jejich historie a stav | Contract |
| Client Profiles | DP_CLIENT_PROFILES | Kompletní přehled o klientovi - identita, kontakty, segmentace, daňové informace, GDPR, Souhlasy | Customer Segment |
| Contact Information | DP_CONTACT_INFROMATION | Telefony, emaily, faxové kontakty klienta | Person, Customer, Legal Entity, Taxonomy |
| Personal and Contact Information | DP_PERSONAL_CONTACT_INFORMATION | Základní identifikace, adresy, telefony, emaily | Person, Customer, Legal Entity, Taxonomy |
| Profil klienta | DP_PROFIL_KLIENTA | Daňové domicily, CRS, FATCA, compliance data | Taxonomy, Legal Entity |
| Relationships Between Entities | DP_RELEATIONSHIPS_BETWEEN_ENTITIES | Vztahy mezi klienty, skupiny klientů, organizační vazby (GCC) | Legal Entity |

### Accounts & Transactions

| DataProductTitle | DataProductName | Description | FIBO |
|------------------|-----------------|-------------|------|
| Accounts and Cards | DP_ACCOUNTS_AND_CARDS | Data o účtech a platebních kartách navázaných ke smlouvám | Account, Financial Instrument |
| Accounts and Payment Channels | DP_ACCOUNTS_PAYMENT_CHANNELS | Data o běžných účtech, kontokorentech, kartách a přístupech (včetně TK, TD, spořící, TU, envelope, Overdraft) | Account |
| Daily Transactions | DP_DAILY_TRANSACTIONS | Detailní záznamy transakcí na účtech a kartách | Transaction, Payment |
| Transaction History and Payments | DP_TRANSACTION_HISTORY_PAYMENTS | Kompletní záznamy o všech transakcích a platbách klienta. DM_TSSM, DM_CESOP, Fraud Risk Management | Transaction, Payment |

### Contracts & Products

| DataProductTitle | DataProductName | Description | FIBO |
|------------------|-----------------|-------------|------|
| Complete Business Contract Aggregation | DP_COMPLETE_BUSINESS_CONTRACT_AGGR | Konsolidovaný pohled na smlouvu sjednocující části z různých systémů | Contract, Financial Instrument |
| Contract Lifecycle and Events | DP_CONTRACT_LIFECYCLE_EVENTS | Schválení, čerpání, splátky, změny limitů, prodejní eventy | Contract Event |
| Credit Modules | DP_CREDIT_MODULES | Data o úvěrových částech smluv v MIDAS a TS | Contract |
| Lifecycle Events | DP_LIFECYCLE_EVENTS | Aktivace, čerpání, splátky, refixace úroků apod. | Contract Event |
| Links to Contracts and Clients | DP_LINKS_CONTRACTS_CLIENTS | Propojení zajištění se smlouvami a klienty | Collateral, Contract |
| Product Catalog and Services | DP_PROD_CATALOG_SERVICES | Metadata o produktech, službách a jejich životním cyklu | Financial Instrument, Service |
| Sales Events and Rewards | DP_SALES_EVENTS_AND_REWARDS | Události spojené s prodejem produktů a výpočtem provizí | Contract Event |
| Technical Contracts | DP_TECHNICAL_CONTRACTS | Detailní data o jednotlivých částech smluv v systémech (např. úvěry, účty) | Contract, Financial Instrument |

### Risk & Compliance

| DataProductTitle | DataProductName | Description | FIBO |
|------------------|-----------------|-------------|------|
| AML Detection and Risk Assessment | DP_AML_DETECTION_RISK_ASSESSMENT | Výpočty AML skóre a detekce podezřelých aktivit. DM_AML | Compliance, Anti-Money Laundering |
| Compliance and AML Monitoring | DP_COMPL_AML_MONITORING | Data pro prevenci praní špinavých peněz, regulace a daňové reporty. DM_AML, DM_TAXREG, DM_CR:ESIF, DM_CR:RIAD | Compliance, Anti-Money Laundering |
| Credit and Risk Profile | DP_CREDIT_RISK_PROFILE | Hodnocení rizika, scoring, varovné signály a insolvenční data. DM_RWA, DM_EWSRT | Credit Risk |
| Credit Registries | DP_CREDIT_REGISTRIES | Data z BRKI, CRÚ a dalších externích registrů. DM_BRKI, DM_EXCR | Credit Risk, Registry |
| Defaults and Restructuring | DP_DEFAULTS_RESTRUCTURING | Defaulty, odklady splátek, restrukturalizace | Credit Risk, Contract |
| Early Warning System | DP_EARLY_WARNING_SYSTEM | Včasné varování před riziky. DM_EWSRT | Credit Risk, Risk Assessment |
| Fraud Prevention | DP_FRAUD_PREVENTION | Detekce a evidence podezřelých transakcí. Fraud Risk Management | Compliance, Transaction |
| Insolvency and Defaults | DP_INSOLVENCY_DEFAULTS | Data o insolvenčních řízeních, exekucích, omezeních. DM_IBL, Default box | Credit Risk, Default |
| Insolvency Register and Others | DP_INSOLVENCY_REG | Data o insolvenčních řízeních, exekucích, omezeních | Legal Entity, Registry |
| Ratings and Scoring | DP_RATING_SCORING | Kreditní skóre a hodnocení rizika. sDM služba spravovaná Riskem | Credit Risk, Risk Assessment |

### Collateral

| DataProductTitle | DataProductName | Description | FIBO |
|------------------|-----------------|-------------|------|
| Collateral and Security Interests | DP_COLLATERAL_SECUIRITY_INTERESTS | Informace o zajištěních a jejich ocenění. DM_CM | Collateral, Security Interest |
| Types and Valuation of Collateral | DP_TYPES_VALUATION_COLLATERAL | Detailní informace o kolaterálech. DM_CM | Collateral, Security Interest |

### Segmentation & Behavior

| DataProductTitle | DataProductName | Description | FIBO |
|------------------|-----------------|-------------|------|
| Behavioral Bonus Calculations | DP_BEHAVIORAL_BONUS_CALCULATIONS | Výpočty bonusů za řádné splácení a jiné behaviorální ukazatele | Incentive |
| Behavioral Events and Changes | DP_BEHAVIORAL_EVENTS_CHANGES | Záznamy o významných událostech a změnách u klientů | Customer Segment |
| Bonus Programs | DP_BONUS_PROGRAMS | Bonusové programy | Contract, Incentive |
| Segmentation and Behavior | DP_SEGMENTATION_AND_BEHAVIOR | Segmentační atributy, behaviorální data, události na klientech | Customer Segment |
| Segmentation Attributes | DP_SEGMENTATION_ATTRIBUTES | Kategorizace klientů dle obchodních pravidel | Customer Segment |

### Marketing & Campaigns

| DataProductTitle | DataProductName | Description | FIBO |
|------------------|-----------------|-------------|------|
| Campaigns and Client Responses | DP_CAMP_CLIENT_RESPONSES | Informace o kampaních a odpovědích. DM_OCRM | Marketing Campaign, Customer Engagement |
| Marketing Campaigns and Customer Activities | DP_MRK_CAMP_CUST_ACT | Data o kampaních, reakcích klientů a věrnostních programech. DM_OCRM, Behaviorální bonus | Marketing Campaign, Customer Engagement |

### GDPR & Consent

| DataProductTitle | DataProductName | Description | FIBO |
|------------------|-----------------|-------------|------|
| Consent Records | DP_CONSENT_RECORDS | Správa a evidence souhlasů klientů s marketingem a službami | Compliance |
| GDPR and Consents | DP_GDPR_CONSENTS | Evidence souhlasů klientů, práva na informace, GDPR reporty | Compliance |
| GDPR Reports | DP_GDPR_REPORTS | Reporty pro klienty dle zákona o ochraně osobních údajů | Compliance |

### External Registries

| DataProductTitle | DataProductName | Description | FIBO |
|------------------|-----------------|-------------|------|
| Albertina - Register of Economic Entities | DP_ALBERTINA | Registr ekonomických subjektů (Creditinfo) | Legal Entity, Registry |
| Cribis - Register of Business Entities | DP_CRIBIS | Ekonomický registr podnikatelských subjektů a FO/FOP (Crif) | Legal Entity, Registry |
| External Client Registries - Standalone Data | DP_EXT_CLIENT_REG | Data z externích registrů pro doplnění a validaci klientských dat. DM_BRKI, DM_EXCR, Insolvenční rejstřík | Registry |
| RIAD CNB - Debtor Register | DP_RIAD_CNB | Registr identifikovaných aktivních dlužníků | Legal Entity, Registry |
| RUIAN - Address Register | DP_RUIAN | Adresní body evidované v ČR v registru adres RUIAN | Location |

---

## Investment Domain (`rbcz:mib:investment`)

| DataProductTitle | DataProductName | Description |
|------------------|-----------------|-------------|
| EDI Application Asset Under Management Reporting | DP_EDI_AUM | Daily balance of Assets under Management (AUM) per product, segment and contracts (EDI, DIP, other). Assets under Management is the volume of deposits in investment accounts. |
| EDI Customer | DP_EDI_CUSTOMER | EDI customer status within particular network banks that use EDI in local onboarding mode for any particular day. |
| EDI Portfolio | DP_EDI_PORTFOLIO | EDI portfolio status of all EDI customers within particular network banks that use EDI in local onboarding mode. |
| EDI Portfolio Reconsolidation | DP_EDI_PORTFOLIO_REC | Results of reconciliation job that is run every night between EDI Portfolio from NWB core system and EDI Portfolio data. |
| EDI Position | DP_EDI_POSITION | Holding volumes (positions in pieces) aggregated by Network Bank, EDI Portfolio, EDI Customer, their investment instrument (ISIN). |
| EDI Position Reconciliation | DP_EDI_POSITION_REC | Results of reconciliation job that is run every night between EDI Position from NWB core system and EDI Position data. |
| Investment Agreements | DP_AGREEMENT | Active investment agreements of customers for CRM. ~175,000 records for contracts (2025/09). Customer conditions apply. |
| Investment Customer Exposition | DP_TRANSACTION | Aggregated daily balances on BIU investment accounts for EDI and DIP contracts, first date of BIU deposit on DIP contract, number of products. |
| Marketing Campaign Candidates | DP_CUSTOMER | Investment customers for CRM campaigns. Customer must have marketing consent for outreach and meet additional criteria. |

---

## Retail Domain (`rbcz:retail:*`)

### General Retail (`rbcz:retail`)

| DataProductTitle | DataProductName | Description |
|------------------|-----------------|-------------|
| Investments | DP_INVESTMENTS | Owner TBD (candidate: Marek Podrabsky). DP Consumers: mariia.komissarova@rbinternational.com, antonio.costa@rbinternational.com |
| Service Products | DP_SERVICE_PRODUCTS | Owner TBD. DP Consumers: mariia.komissarova@rbinternational.com, antonio.costa@rbinternational.com |
| Transactions | DP_TRANSACTIONS | Owner TBD. DP Consumers: mariia.komissarova@rbinternational.com, antonio.costa@rbinternational.com |

### P1 Segment (`rbcz:retail:P1%20Segment`)

| DataProductTitle | DataProductName | Description |
|------------------|-----------------|-------------|
| Account | DP_ACCOUNT | Owner TBD (candidate: Vladimir Bures). DP Consumers: mariia.komissarova@rbinternational.com, antonio.costa@rbinternational.com |
| Bank Assurance | DP_BANK_ASSURANCE | Owner TBD (candidate: Jana Flajsarova/Spacilova). DP Consumers: mariia.komissarova@rbinternational.com, antonio.costa@rbinternational.com |
| Cards | DP_CARDS | Owner TBD (candidate: Roman Preucil). DP Consumers: mariia.komissarova@rbinternational.com, antonio.costa@rbinternational.com |
| CRM Interactions | DP_CRM_INTERACTIONS | Poskytuje veškerou CRM komunikaci s klienty a interakce klientů s danými kampaněmi. Řeší jak odeslané kampaně všemi kanály, tak jednotlivé interakce klientů. |
| Customer | DP_CUSTOMER | Owner TBD (candidate: Jan Figlovsky/Tomas Nemcik). DP Consumers: mariia.komissarova@rbinternational.com, antonio.costa@rbinternational.com |

### Digital Banking (`rbcz:retail:Digital%20Banking`)

| DataProductTitle | DataProductName | Description |
|------------------|-----------------|-------------|
| Digital Channel Events | DP_DIGITAL_CHANNEL_EVENT | Data for monitoring user activity by tracking user logins across individual digital channels. Specifically captures retail user logins to digital banking. |

### Retail Loan (`rbcz:retail:Retail%20Loan`)

| DataProductTitle | DataProductName | Description |
|------------------|-----------------|-------------|
| Application | DP_APPLICATION | Owner TBD (candidate: Ondrej Hak). DP Consumers: mariia.komissarova@rbinternational.com, antonio.costa@rbinternational.com |

---

## Key Insights

### 1. DWH as Enterprise Data Layer

The `rbcz:it:development:dwh` domain serves as a **cross-cutting enterprise data layer** providing:
- Client 360 data (profiles, addresses, contacts)
- Contract master data
- Transaction history
- Risk and compliance data
- External registry integrations

### 2. Domain Consumption Pattern

```
DWH (Enterprise Layer)
    │
    ├── rbcz:mib:investment (consumes client, contract, transaction data)
    ├── rbcz:retail:* (consumes client, product, transaction data)
    └── rbcz:ai (consumes behavioral, campaign data)
```

### 3. Investment Domain - Complete DP List

| DP | Purpose | Status |
|----|---------|--------|
| DP_EDI_AUM | AUM reporting (daily balance per product/segment/contract) | Production |
| DP_EDI_CUSTOMER | Customer status per NWB (local onboarding mode) | Production |
| DP_EDI_PORTFOLIO | Portfolio status per NWB | Production |
| DP_EDI_PORTFOLIO_REC | Portfolio reconciliation (NWB core vs EDI) | Production |
| DP_EDI_POSITION | Position volumes (by NWB, portfolio, customer, ISIN) | Production |
| DP_EDI_POSITION_REC | Position reconciliation (NWB core vs EDI) | Production |
| DP_AGREEMENT | Investment agreements for CRM (~175k records) | Production |
| DP_TRANSACTION | BIU balances (EDI/DIP contracts) | Production |
| DP_CUSTOMER | Campaign candidates (marketing consent required) | Production |

**Note:** DP_EDI_AGG_CLIENT, DP_EDI_PROFITABILITY, DP_EDI_SALES, DP_EDI_APP_USAGE were referenced in previous scan but not visible in current extract - may be planned or renamed.

### 4. FIBO Alignment

Most DWH DPs have explicit FIBO mappings documented:
- Accounting → FIBO Accounting
- Compliance → FIBO Compliance
- Customer → FIBO Customer, Person, Legal Entity
- Contracts → FIBO Contract, Financial Instrument
- Risk → FIBO Credit Risk, Risk Assessment
- Collateral → FIBO Collateral, Security Interest

---

## Usage Notes

This extract serves as reference for:
1. Mapping Test domain DPs to production DPCC
2. Understanding DWH as upstream data provider
3. Identifying FIBO alignments across enterprise
4. Planning Investment domain DP coverage
