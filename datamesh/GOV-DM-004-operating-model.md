# GOV-DM-004: Data Mesh Operating Model

> **Status:** ACTIVE
> **Effective:** 2026-01-08
> **Owner:** CDO - Lukáš Mazánek
> **Parent:** [GOV-DM-001-data-mesh-governance.md](GOV-DM-001-data-mesh-governance.md)
> **Source:** QAR Session with Senior Data Mesh Consultant

---

## 1. Executive Summary

This document defines the operating model for Data Mesh at RBCZ, covering:
- Federated Governance and decision-making processes
- Self-Serve Platform and tooling
- Domain Team autonomy and organization
- Consumer Experience
- Data Product Lifecycle
- Quality & SLA enforcement

**Key Principle:**
> *Domains/Tribes are E2E independent. CDO owns architecture and governance, not data or decisions.*

---

## 2. Federated Governance

### 2.1 Decision Model: Hybrid

```
DECISION MATRIX:

┌─────────────────────────────┬─────────────────┬─────────────────┐
│ Decision Type               │ Who Decides     │ Who Reviews     │
├─────────────────────────────┼─────────────────┼─────────────────┤
│ New DP in existing domain   │ Domain Owner    │ Notification    │
│ New DP with cross-domain dep│ Domain Owner    │ Data Mesh Guild │
│ New domain                  │ BU Owner + CDO  │ EA Guild        │
│ Breaking change in DP       │ Domain Owner    │ Consumers+Guild │
└─────────────────────────────┴─────────────────┴─────────────────┘
```

### 2.2 Review Process: Checklist-Based with Escalation

```
DP CREATION FLOW:

  Domain Owner        Automated           Guild Review
  creates DP     →    Checklist     →     (only if FAIL)
                     Validation
                         │
              ┌─────────┴─────────┐
              │                   │
            PASS                FAIL
              │                   │
              ▼                   ▼
         Auto-approve      Escalate to guild
         + notification    (async or meeting)
```

### 2.3 Checklist Criteria

| Criterion | Auto-validation | Manual Review |
|-----------|-----------------|---------------|
| Naming convention (GOV-DM-002) | ✅ Yes | - |
| Domain path exists | ✅ Yes | - |
| Data Contract YAML schema | ✅ Yes | - |
| Owner assigned | ✅ Yes | - |
| Cross-domain dependency | - | ⚠️ Trigger review |
| PII/GDPR classification | - | ⚠️ Trigger review |
| New external authority mapping | - | ⚠️ Trigger review |

### 2.4 Enforcement: Catalog + Pipeline (Shift Left + Gate Right)

```
DEVELOPMENT                    DEPLOYMENT                    RUNTIME
     │                              │                            │
     ▼                              ▼                            ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ Data Contract│              │   CI/CD     │              │    DPCC     │
│    YAML      │──validate───▶│  Pipeline   │──register───▶│   Catalog   │
│   (local)    │              │   Gate      │              │  (runtime)  │
└─────────────┘              └─────────────┘              └─────────────┘
       │                            │                            │
  Schema valid?               All checks pass?            Monitoring OK?
  Naming OK?                  Tests green?                SLA met?
  Owner defined?              No breaking change?         Quality score?
```

| Check | Shift Left (dev) | Gate (deploy) | Runtime (catalog) |
|-------|------------------|---------------|-------------------|
| YAML schema | ✅ | ✅ | - |
| Naming convention | ✅ | ✅ | - |
| Unit tests pass | - | ✅ | - |
| Breaking change detection | - | ✅ | - |
| Maturity score ≥ threshold | - | ✅ | ✅ |
| SLA compliance | - | - | ✅ |
| Consumer notification | - | ✅ | - |

---

## 3. Self-Serve Platform

### 3.1 Maturity Level: L4 (Full Self-Serve)

| Level | Description | RBCZ Status |
|-------|-------------|-------------|
| L1 | Request-based | - |
| L2 | Partial | - |
| L3 | Template-based | - |
| **L4** | **Full self-serve** | ✅ **Current state** |

### 3.2 Domain Team Experience

```
DOMAIN TEAM EXPERIENCE:

1. INIT          2. DEVELOP           3. DEPLOY           4. OPERATE
   │                 │                    │                   │
   ▼                 ▼                    ▼                   ▼
┌────────┐      ┌──────────┐        ┌──────────┐        ┌──────────┐
│ dp init│      │ Edit     │        │ dp deploy│        │ DPCC     │
│ --name │ ──▶  │ contract │  ──▶   │ --env    │  ──▶   │ Dashboard│
│        │      │ + code   │        │ prod     │        │          │
└────────┘      └──────────┘        └──────────┘        └──────────┘
   │                 │                    │                   │
 Template         Local test          Auto-checks         Monitoring
 generated        + validate          + deploy            + alerts

⏱️ Time to first DP: < 1 day
```

### 3.3 Available Tools

| Tool | Status | Description |
|------|--------|-------------|
| DP Template / Scaffold | ✅ | Generator for new DP structure |
| CLI tool | ✅ | `dp init`, `dp validate`, `dp deploy` |
| Data Contract Editor | ✅ | UI/IDE plugin for YAML editing |
| Local testing | ✅ | Ability to test DP locally before deploy |
| Self-service monitoring | ✅ | Domain Team sets up own alerts |

### 3.4 DP Template Structure

```
dp-template/
├── datacontract.yaml      # Schema + metadata
├── src/
│   ├── transformations/   # Business logic
│   └── quality/           # Data quality checks
├── tests/
│   ├── unit/
│   └── integration/
├── infrastructure/
│   └── terraform/         # Self-service infra
├── .github/
│   └── workflows/         # CI/CD pipeline
└── README.md              # Auto-generated docs
```

---

## 4. Domain Team Autonomy

### 4.1 Target State: Tribe E2E Autonomy

```
CDO TARGET OPERATING MODEL:

┌─────────────────────────────────────────────────────────────────┐
│                         CDO ROLE                                 │
│                   "Architect & Enabler"                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DEFINES (rules)             │  DOES NOT (doesn't block)        │
│  ─────────────────           │  ────────────────────            │
│  • Governance policies       │  • Approve every DP              │
│  • Naming conventions        │  • Design review every DP        │
│  • Quality standards         │  • Assign resources              │
│  • Interoperability rules    │  • Prioritize domain backlog     │
│  • Architecture principles   │  • Own domain data               │
│  • Platform capabilities     │                                   │
│                              │                                   │
│  ENABLES (supports)          │  ESCALATION POINT (exceptions)   │
│  ────────────────            │  ─────────────────────           │
│  • Self-serve platform       │  • Cross-domain conflicts        │
│  • Templates & tools         │  • Governance exceptions         │
│  • Training & enablement     │  • Strategic decisions           │
│  • Community of practice     │  • Enterprise-wide standards     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                Federated Governance
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
   ┌─────────┐            ┌─────────┐            ┌─────────┐
   │   MIB   │            │ Retail  │            │Corporate│
   │  Tribe  │            │  Tribe  │            │  Tribe  │
   │         │            │         │            │         │
   │ Domain  │            │ Domain  │            │ Domain  │
   │ Owner   │            │ Owner   │            │ Owner   │
   │ = E2E   │            │ = E2E   │            │ = E2E   │
   │ Account.│            │ Account.│            │ Account.│
   └─────────┘            └─────────┘            └─────────┘
```

### 4.2 Team Transformation

| Aspect | Current State | Target State |
|--------|---------------|--------------|
| Team model | Cross-BU shared | MIB-dedicated |
| Tribe autonomy | Partial | End-to-end |
| CDO role | - | Architect & Enabler |

### 4.3 Transformation Path (6-12 months)

```
CURRENT STATE              TRANSITION              TARGET STATE

Cross-BU Pool    ──────▶   Hybrid Model   ──────▶  BU-Dedicated
     │                          │                       │
     ▼                          ▼                       ▼
• Engineers                • 1 dedicated           • Full team
  jumping between            engineer per BU         per BU
• Priority                 • Pool for overflow     • Clear
  conflicts                • Clear ownership         ownership
• Shallow                  • Knowledge transfer    • Deep
  knowledge                                          expertise
```

### 4.4 Domain Team Structure

```
DOMAIN TEAM STRUCTURE:

┌─────────────────────────────────────────────────────┐
│                  DOMAIN OWNER                        │
│         (Business accountability)                    │
│                Marek Podrabský                       │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐
   │Data     │  │Data      │  │Domain    │
   │Product  │  │Engineer  │  │SME       │
   │Manager  │  │(1-3)     │  │(Business)│
   └─────────┘  └──────────┘  └──────────┘
        │             │             │
   Prioritization  Build &      Business
   + roadmap       maintain     knowledge
```

### 4.5 CDO Success Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Time-to-DP | How fast domain creates DP | < 2 weeks |
| Governance compliance | % DPs meeting standards | > 95% |
| Cross-domain reuse | Number of shared DPs | Growing trend |
| Domain satisfaction | NPS platform & governance | > 40 |

---

## 5. Consumer Experience

### 5.1 Consumer Journey

```
CONSUMER JOURNEY:

1. DISCOVER          2. EVALUATE           3. ACCESS            4. USE
     │                    │                    │                   │
     ▼                    ▼                    ▼                   ▼
┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
│  Search  │        │  Preview │        │  Request │        │  Query   │
│  Catalog │───────▶│  Sample  │───────▶│  Access  │───────▶│  Data    │
│          │        │  Data    │        │ (auto?)  │        │          │
└──────────┘        └──────────┘        └──────────┘        └──────────┘
     │                    │                    │                   │
 • Semantic          • Schema             • RBAC              • SQL/API
   search            • Lineage            • Auto-approve      • SDK
 • Filters           • Quality score        for public        • Notebook
 • Domain            • Sample rows        • Request for
   browse                                   restricted
```

### 5.2 Catalog Features

| Feature | Status | Priority |
|---------|--------|----------|
| A - Semantic search | ✅ Have | - |
| B - Sample data preview | ✅ Have | - |
| C - Data quality score | ✅ Have | - |
| H - Access workflow | ✅ Have | - |
| D - Lineage visualization | 🔜 Planned | 🔴 High |
| G - Usage examples | 🔜 Planned | 🟡 Medium |
| E - SLA dashboard | 🔜 Planned | 🟡 Medium |
| F - Consumer registry | 🔜 Planned | 🟢 Low |

### 5.3 Consumer Decision Flow

```
"I need AUM data"
         │
         ▼
    [A] Search "AUM"
         │
         ▼
    Find investment-aum-reporting
         │
         ▼
    [B] Preview samples ────────▶ "Yes, this is what I need"
         │
         ▼
    [C] Quality score 85% ──────▶ "I can trust this"
         │
         ▼
    [H] Request access ─────────▶ Auto-approved (public DP)
         │
         ▼
    Using within 10 minutes
```

---

## 6. Data Product Lifecycle

### 6.1 Six-Phase Lifecycle

```
DATA PRODUCT LIFECYCLE:

┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ IDEATE  │──▶│ DESIGN  │──▶│  BUILD  │──▶│ PUBLISH │──▶│ OPERATE │──▶│ RETIRE  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     │             │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼             ▼
  Business     Data          Develop &     Register     Monitor &    Deprecate
  need         Contract      Test          in Catalog   Maintain     & Sunset
  identified   defined

  Gate:        Gate:         Gate:         Gate:        Gate:        Gate:
  Sponsor      Review        Quality       Maturity     SLA met      Consumers
  approval     approved      tests pass   ≥60%                      migrated
```

### 6.2 Phases and Responsibilities

| Phase | Owner | Deliverable | Gate Criterion |
|-------|-------|-------------|----------------|
| **IDEATE** | Domain Owner | Business case | Sponsor sign-off |
| **DESIGN** | DPM + Engineer | Data Contract YAML | Contract review passed |
| **BUILD** | Engineer | Working DP + tests | All tests green |
| **PUBLISH** | DPM | Catalog entry | Maturity ≥ 60% |
| **OPERATE** | Engineer | Running DP | SLA compliance |
| **RETIRE** | Domain Owner | Migration plan | 0 active consumers |

> **Tool:** Use the [DP Discovery Questionnaire](templates/dp-discovery-questionnaire.md) for IDEATE → DESIGN sessions with Domain Owners. Structured QAR format ensures all governance requirements are captured.

### 6.3 RETIRE Phase (Important!)

> Most organizations forget the RETIRE phase → zombie DPs that nobody uses but still run and cost money.

**RETIRE Checklist:**
- [ ] Identify all consumers
- [ ] Notify consumers about deprecation (min 3 months ahead)
- [ ] Provide migration path to alternative DP
- [ ] Wait for 0 active consumers
- [ ] Archive data (if regulatory requirement)
- [ ] Remove from Catalog
- [ ] Deallocate infrastructure

---

## 7. Quality & SLA

### 7.1 Three Layers of Measurement

```
QUALITY MEASUREMENT LAYERS:

┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: MATURITY SCORE                       │
│                    (Production readiness)                        │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │  Docs    │ │  Data    │ │   SLA    │ │Governance│ │  Tech  ││
│  │  20%     │ │ Quality  │ │   20%    │ │   20%    │ │  20%   ││
│  │          │ │   20%    │ │          │ │          │ │        ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘│
│                           = MATURITY %                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LAYER 2: DATA QUALITY DIMENSIONS                │
│                     (Trustworthiness)                            │
│                                                                  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│  │ Completeness   │ │   Accuracy     │ │  Consistency   │       │
│  │ % non-null     │ │ % valid values │ │ cross-source   │       │
│  └────────────────┘ └────────────────┘ └────────────────┘       │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│  │  Timeliness    │ │   Uniqueness   │ │   Validity     │       │
│  │  freshness     │ │  no duplicates │ │  format OK     │       │
│  └────────────────┘ └────────────────┘ └────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 3: SLA METRICS                         │
│                    (Operational health)                          │
│                                                                  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│  │    Uptime      │ │    Latency     │ │   Freshness    │       │
│  │   99.5%+       │ │   < 5 min      │ │  < 24 hours    │       │
│  └────────────────┘ └────────────────┘ └────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 When to Use Which Layer

| Layer | Question | Who Asks | When |
|-------|----------|----------|------|
| **Maturity** | "Is DP production-ready?" | Platform, CDO | Publish gate |
| **Data Quality** | "Can I trust this data?" | Consumer | Before using |
| **SLA** | "Is DP running correctly?" | Operations, Owner | Runtime |

### 7.3 Enforcement: Tiered Model

```
QUALITY ENFORCEMENT TIERS:

                    ┌─────────────────────────────────────┐
                    │         QUALITY THRESHOLD           │
                    └─────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
   ┌───────────┐              ┌───────────┐              ┌───────────┐
   │  CRITICAL │              │  WARNING  │              │   INFO    │
   │   (RED)   │              │  (YELLOW) │              │  (GREEN)  │
   └───────────┘              └───────────┘              └───────────┘
         │                           │                           │
         ▼                           ▼                           ▼
   ┌───────────┐              ┌───────────┐              ┌───────────┐
   │  BLOCK    │              │  NOTIFY   │              │DASHBOARD  │
   │  Deploy   │              │  Owner +  │              │  Only     │
   │  blocked  │              │  Timeline │              │           │
   └───────────┘              └───────────┘              └───────────┘
```

### 7.4 Enforcement Matrix

| Metric | Critical (Block) | Warning (Notify) | Info (Dashboard) |
|--------|------------------|------------------|------------------|
| **Maturity Score** | < 40% | 40-60% | > 60% |
| **Completeness** | < 80% | 80-95% | > 95% |
| **Freshness SLA** | > 2× SLA | 1-2× SLA | Within SLA |
| **Schema validation** | Failed | - | Passed |
| **PII untagged** | Yes | - | No |

### 7.5 Escalation Timeline

```
DAY 0          DAY 3           DAY 7           DAY 14
  │              │               │                │
  ▼              ▼               ▼                ▼
Warning      Reminder      Escalate to      Escalate to
to Owner     to Owner      BU Manager       CDO + Block
```

### 7.6 Enforcement Roadmap

```
ENFORCEMENT ROADMAP:

Q1                  Q2                  Q3                  Q4
│                   │                   │                   │
▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ PHASE 1     │    │ PHASE 2     │    │ PHASE 3     │    │ PHASE 4     │
│             │    │             │    │             │    │             │
│ Schema      │───▶│ PII/GDPR    │───▶│ Maturity    │───▶│ SLA         │
│ Validation  │    │ Compliance  │    │ Score       │    │ Enforcement │
│             │    │             │    │             │    │             │
│ • Block     │    │ • Block     │    │ • Block     │    │ • Auto-     │
│   invalid   │    │   untagged  │    │   < 40%     │    │   notify    │
│   YAML      │    │   PII       │    │ • Warn      │    │ • Escalate  │
│             │    │             │    │   < 60%     │    │   on breach │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
   Quick win         Regulatory         Trust            Operations
   Low risk          Must-have          building         maturity
```

| Phase | Why | Risk | Effort |
|-------|-----|------|--------|
| **Phase 1: Schema** | Objective, automatable | Low | Low |
| **Phase 2: PII/GDPR** | Regulatory requirement | Medium | Medium |
| **Phase 3: Maturity** | Trust building | Medium | Medium |
| **Phase 4: SLA** | Operations maturity | High | High |

---

## 8. Gap Analysis & Roadmap

### 8.1 Current State vs. Target State

| Area | Current State | Target State | Gap | Priority |
|------|---------------|--------------|-----|----------|
| Federated Governance | ✅ Hybrid + Checklist | ✅ | Documentation | 🟢 Low |
| Self-Serve Platform | ✅ L4 Full + All tools | ✅ | None | - |
| Domain Team Autonomy | Cross-BU shared | BU-dedicated, E2E | Organizational change | 🔴 High |
| Consumer Experience | ABCH | ABCDEFGH | Lineage, examples | 🟡 Medium |
| DP Lifecycle | ✅ Formal | ✅ | RETIRE emphasis | 🟢 Low |
| Quality Enforcement | Dashboard only | Tiered enforcement | 4-phase roadmap | 🔴 High |

### 8.2 Prioritized Roadmap

| Quarter | Area | Action |
|---------|------|--------|
| **Q1** | Quality | Phase 1: Schema validation enforcement |
| **Q1** | Consumer | Lineage visualization |
| **Q2** | Quality | Phase 2: PII/GDPR compliance enforcement |
| **Q2** | Consumer | Usage examples |
| **Q2** | Team | Start dedicated engineer per BU |
| **Q3** | Quality | Phase 3: Maturity score enforcement |
| **Q3** | Consumer | SLA dashboard |
| **Q3** | Team | Full BU-dedicated teams |
| **Q4** | Quality | Phase 4: SLA enforcement |
| **Q4** | Consumer | Consumer registry |

---

## 9. Related Documents

| Document | Purpose |
|----------|---------|
| [GOV-DM-001](GOV-DM-001-data-mesh-governance.md) | Main Data Mesh Governance |
| [GOV-DM-002](GOV-DM-002-naming-convention.md) | Naming Convention |
| [GOV-DM-003](GOV-DM-003-domain-hierarchy.md) | Domain Hierarchy & Ownership |
| [DP Discovery Questionnaire](templates/dp-discovery-questionnaire.md) | QAR interview guide for Domain Owner sessions |
| [Investment DP Catalog](catalogs/investment-dp-catalog.md) | Investment Domain Products |
| [Composability Framework](review/2026-01-08-domain-composability-framework.md) | DP Layer Classification |

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Senior Data Mesh Consultant | Initial version from QAR session |

---

**Source:** QAR Session with Senior Data Mesh Consultant (15+ years banking experience)
**Method:** Questions → Answers → Recommendations
**Validated by:** RBCZ CDO
