# ConceptSpeak Text Language Specification

**Version:** 1.5
**Date:** 2025-12-25
**Status:** Draft
**Related:** ADR-031, ADR-032, ADR-034, ADR-036, ADR-037, ADR-038, ADR-010 Amendment 2, ADR-045, ADR-047

---

## 1. Introduction

### 1.1 Purpose

This document defines the formal specification for **ConceptSpeak Text** (`.cs` files), a textual notation for expressing business concepts, relationships, and structures. ConceptSpeak Text is the serialization format for conceptual models originally created in visual diagram tools.

### 1.2 Scope

This specification covers:
- Lexical structure (tokens, whitespace, comments)
- Syntactic rules (grammar for all constructs)
- Semantic rules (meaning, equivalences, constraints)
- Validation requirements
- **Domain support** (v1.1) - domain directives and cross-domain references
- **Bracket equivalence** (v1.1) - `Concept` ≡ `[Concept]`
- **Metadata annotations** (v1.3) - `@` annotations for provenance, FIBO mapping, quality
- **Property Types** (v1.3) - separate section for identifiers and value types
- **Taxonomy pattern** (v1.3) - hierarchical classification concepts
- **Dotted concept directive** (v1.5) - `#~` prefix for context/dotted concepts

### 1.3 Relationship to Ronald G. Ross

ConceptSpeak Text is based on the notation defined by **Ronald G. Ross** for business knowledge modeling. This implementation is faithful to Ross's original notation with minor adaptations for textual representation:
- Positional syntax for state transitions (instead of keyword-based)
- Flexible whitespace rules for readability
- Block notation for multi-line constructs

### 1.4 Target Audience

- **Parser implementors:** Formal grammar and lexical rules
- **Modelers/Users:** Examples, semantics, and best practices

### 1.5 Conventions

- `MUST` / `MUST NOT` - Absolute requirements
- `SHOULD` / `SHOULD NOT` - Recommendations (violations generate warnings)
- `MAY` - Optional features

---

## 2. Lexical Structure

### 2.1 Character Set

ConceptSpeak Text files MUST be encoded in UTF-8.

### 2.2 Identifiers (Names)

A **Name** identifies concepts, roles, states, and types.

**Rules:**
- MUST start with an uppercase letter (A-Z)
- MAY contain: letters (a-z, A-Z), digits (0-9), spaces, hyphens, apostrophes, parentheses
- Case-sensitive: `Person` ≠ `person`
- No reserved words

**Valid examples:**
```
Person
Active current account
End of day (EOD) balance
Investment account (BIU)
O'Brien
```

**Invalid examples:**
```
person          # starts with lowercase
123Account      # starts with digit
```

### 2.3 Whitespace

- **Spaces around operators:** Optional
  - `Person-<drives>-Car` ≡ `Person -< drives >- Car`
- **Spaces in names:** Significant (part of the name)
  - `Active current account` = single name with spaces
- **Indentation:** Significant only in block constructs
- **Blank lines:** Ignored (for readability)

### 2.4 Comments

Comments start with `#` and extend to end of line.

```
# This is a full-line comment
Person -< drives >- Car  # inline comment
```

**Rules:**
- Comments MAY appear on their own line
- Comments MAY appear after an expression
- Comments MUST NOT appear inside an expression (they terminate the line)

### 2.5 Multi-line Expressions

Expressions MAY span multiple lines when:

| Context | Continuation allowed |
|---------|---------------------|
| Inside `[` ... `]` | Yes |
| Inside `{` ... `}` | Yes |
| Inside `-<` ... `>-` | Yes |
| Inside `--<` ... `>` | Yes |
| Block after `:` + newline | Yes (with indentation and `;`/`.`) |
| Otherwise | No (one expression = one line) |

**Example - Multi-line list:**
```
Income =< kind of Income >= [
    LAMC income,
    Allocated income,
    Core income
]
```

### 2.6 Domain Directive (v1.1, mandatory v1.4)

Domain directives declare the domain context for subsequent concepts.

**Syntax:**
```
#! {domain-path}
```

**Rules:**
- MUST start with `#!` at beginning of line (shebang-style)
- MUST be followed by whitespace and domain path
- Domain path uses colon separator per ADR-010: `RBCZ:MIB:Investment`
- All concepts after directive belong to this domain until next `#!`
- Multiple `#!` directives allowed in single file
- **MANDATORY (v1.4, ADR-045):** Files without `#!` directive produce E008 error

**Example:**
```
#! RBCZ:MIB:Investment

Order: A customer request to buy or sell
Payment -< settles >- Order

#! RBCZ:MIB:Payments

Payment: A financial transaction
```

**Note:** `#!` is distinct from `#` comments. Comments start with `#` followed by space or text; directives start with `#!`.

**Context tracking (v1.2):**

Each concept inherits the domain from the most recent `#!` directive. Parsers MUST track `context_domain` for each concept:

```
#! RBCZ:MIB:Investment
Order: A request        # context_domain = "RBCZ:MIB:Investment"
Payment                 # context_domain = "RBCZ:MIB:Investment"

#! RBCZ:MIB:Payments
Payment: Transaction    # context_domain = "RBCZ:MIB:Payments"
```

If no `#!` directive precedes a concept, `context_domain` is `null`. This triggers warning W201.

### 2.7 Bracket Equivalence (v1.1)

Concepts MAY be enclosed in square brackets for visual emphasis.

**Rule:** `Concept` ≡ `[Concept]` - semantically identical everywhere.

**Examples:**
```
# All equivalent:
Order -< is settled by >- Payment
[Order] -< is settled by >- Payment
[Order] -< is settled by >- [Payment]

# Roles - also equivalent:
Person -< Driver | drives >- Car
Person -< [Driver] | drives >- [Car]

# Objectification - also equivalent:
Settlement: Order -< is settled by >- Payment
[Settlement]: [Order] -< is settled by >- [Payment]
```

**Context determines function:**

| Position | Function | Brackets |
|----------|----------|----------|
| Standalone | Concept | Optional |
| After `-<` before `|` | Role | Optional |
| Before `:` + verb | Objectification | Optional |
| In `=< >= [...]` | List of children | Required (delimiters) |
| After `-- prop` | Type | Required (delimiters) |

**Rationale:** Honors Ronald G. Ross visual notation where concepts and roles appear in brackets in diagrams.

### 2.8 Cross-Domain Reference (v1.1)

Concepts from other domains use fully qualified paths.

**Syntax:**
```
{domain-path}.{Concept}
```

**Rules:**
- Domain path uses colon separator: `RBCZ:MIB:Payments`
- Dot (`.`) separates domain from concept name
- Only full paths allowed - no relative shortcuts
- Qualification is addressing only, doesn't change semantics

**Example:**
```
#! RBCZ:MIB:Investment

# Reference to concept in another domain
Order -< is settled by >- RBCZ:MIB:Payments.Payment

# With brackets (equivalent)
[Order] -< is settled by >- RBCZ:MIB:Payments.[Payment]
```

### 2.9 Dotted Concept Directive (v1.5, ADR-047)

The dotted concept directive marks concepts and relationships as **context** - visual references to elements defined elsewhere. In Ross notation, these appear as dotted lines in diagrams.

**Syntax:**
```
#~Concept
#~Concept: definition
#~ConceptA -< verb >- ConceptB
#~Categorization =< label >= [Children]
```

**Rules:**
- MUST start with `#~` at beginning of line or element
- Whitespace after `#~` is optional: `#~Concept` ≡ `#~ Concept`
- Can prefix any construct: concepts, categorizations, binary verbs, etc.
- Marked elements are parsed normally but flagged as `is_dotted=true`
- Context elements represent external references, not domain-owned concepts

**Examples:**
```
#! RBCZ:MIB:Investment

# Concepts
Order
Payment
#~Position                    # context: defined in another domain
#~Customer                    # context: external reference

# Categorizations
Order =< @ by state >= [Placed, Executed]
#~Payment =< type >= [Card, Cash]    # context categorization

# Binary Verb Concepts
Order -< settles via >- Payment
#~Position -< is sum of >- Transaction    # context relationship
```

**Inline Usage:**

The `#~` prefix can also appear inline within constructs:

```
# Binary verb with context concept on one side
Order -< belongs to >- #~Customer

# Categorization with context children
Order =< type >= [BuyOrder, #~SellOrder, MarketOrder]
```

**Distinction from Comments:**

| Prefix | Meaning | Parsed? |
|--------|---------|---------|
| `#` (space/text) | Comment | No |
| `#!` | Domain directive | Yes |
| `#~` | Dotted/context | Yes |

**Migration from v1.4:**

Previously, context elements used comment prefix `# Concept`. This is now deprecated:

```
# OLD (v1.4 - deprecated)
# Position
# Context (dotted lines)
# Position -< is sum of >- Transaction

# NEW (v1.5)
#~Position
# Binary Verb Concepts
#~Position -< is sum of >- Transaction
```

The `# Context (dotted lines)` section is no longer recognized. All context elements use `#~` prefix inline in their respective sections.

### 2.10 Metadata Annotations (v1.3)

Annotations attach metadata to concepts and properties. Based on ADR-031 Amendment 1.

**Syntax:**
```
Concept: definition
  @key: value
  @another_key: another value
  -- property [Type]
    @property_annotation: value
```

**Rules:**
- Annotations start with `@` followed by key, colon, and value
- Annotations MUST be indented under the element they describe
- Multiple annotations allowed per concept/property
- Annotations are optional (backward compatible)
- Annotation values extend to end of line

**Annotation Categories:**

#### 2.9.1 Provenance Annotations

Track origin of concepts from source systems.

| Annotation | Description | Example |
|------------|-------------|---------|
| `@source` | Source system identifier | `@source: EDI` |
| `@source_entity` | Original entity name | `@source_entity: EDI_AUM` |
| `@data_contract` | Source contract file | `@data_contract: edi-aum.yaml` |

#### 2.9.2 FIBO Mapping Annotations

Track FIBO ontology mappings per GOV-006.

| Annotation | Description | Example |
|------------|-------------|---------|
| `@fibo` | FIBO URI | `@fibo: fibo-ind:AssetsUnderManagement` |
| `@fibo_source` | Mapping origin | `@fibo_source: contract` / `llm` / `override` |
| `@fibo_confidence` | Confidence level | `@fibo_confidence: VERIFIED` / `MAPPED` / `DRAFT` |

#### 2.9.3 Quality Annotations

Track definition quality per GOV-002.

| Annotation | Description | Example |
|------------|-------------|---------|
| `@status` | Definition status | `@status: VERIFIED` / `DRAFT` |
| `@warning` | Quality warning | `@warning: Definition incomplete` |
| `@warning_rule` | Detection rule code | `@warning_rule: DQD-1` |

#### 2.9.4 Type Annotations

For Property Types (ADR-036) and type detection (GOV-010).

| Annotation | Description | Example |
|------------|-------------|---------|
| `@type` | Type category | `@type: identifier` / `value` / `code` / `taxonomy` |
| `@pattern` | Regex pattern | `@pattern: "[A-Z]{2}"` |
| `@format` | Display format | `@format: ISO8601` |
| `@type_source` | Detection method | `@type_source: contract` / `dictionary` / `heuristic` |
| `@type_pattern` | Matched pattern | `@type_pattern: "*_eur"` |

#### 2.9.5 Value Annotations

For property-level metadata.

| Annotation | Description | Example |
|------------|-------------|---------|
| `@currency` | Currency code | `@currency: EUR` |
| `@unit` | Unit of measure | `@unit: percent` |

#### 2.9.6 Taxonomy Annotations

For hierarchical classifications (ADR-037).

| Annotation | Description | Example |
|------------|-------------|---------|
| `@max_depth` | Maximum hierarchy depth | `@max_depth: 3` |

**Complete Example:**
```
Assets Under Management: Total market value of assets managed on behalf of clients
  @source: EDI
  @source_entity: EDI_AUM
  @fibo: fibo-ind:AssetsUnderManagement
  @fibo_source: contract
  @fibo_confidence: VERIFIED
  @status: VERIFIED
  -- date [Date]
  -- amount eur [Monetary Amount]
    @currency: EUR
    @type_source: heuristic
    @type_pattern: "*_eur"

Calendar Day: ultimo of the month
  @status: DRAFT
  @warning: Definition appears to be business rule, not semantic definition
  @warning_rule: DQD-3
```

---

## 3. Syntactic Rules

### 3.1 Definition

Associates a concept with a textual definition.

**Syntax:**
```
Concept: definition text
```

**Example:**
```
Person: A human being capable of having rights and duties
Order: A customer request to buy or sell a financial instrument
```

**Rules:**
- Definition text extends to end of line
- Definition text MAY contain any characters including `:`, `-<`, `#`
- Disambiguation from objectification: if text after `:` is a valid binary verb expression, it is objectification; otherwise definition

### 3.2 Categorization

Classifies a concept along a dimension into subcategories.

**Syntax:**
```
Parent =< label >= [Child1, Child2, ...]
Parent =<>= [Child1, Child2]           # empty label
```

**Examples:**
```
Car =< kind of Car Size >= [Passenger Car, Utility Car]
Order =< @ by state >= [Placed, Executed, Settled]
Currency =< kind of Currency >= [CZK, EUR, USD]
```

**Rules:**
- Label MAY be empty
- Label MAY contain `@` prefix (indicates segmentation - mutually exclusive values)
- Label MAY contain bracket references like `[ConceptName]` (treated as text)
- Child order is semantically irrelevant
- Children MUST be separated by commas
- Multi-line lists allowed inside `[]`

### 3.3 Binary Verb

Expresses a relationship between two concepts.

**Syntax:**
```
ConceptA -< [RoleA |] [verb] [/] [inverse] [| RoleB] [|] >- ConceptB
```

**Examples:**
```
Person -< drives / is driven by >- Car
Person -< Driver | drives / is driven by | Driven Car >- Car
Account -< has / >- Balance
A -< >- B                                    # unnamed relationship
Person -< [Driver] | drives | [Driven Car] >- Car  # roles in brackets (optional)
```

**Rules:**
- Roles are separated from verbs by `|`
- Roles MUST start with uppercase letter
- Roles MAY be enclosed in `[]` (optional)
- Verb and inverse are separated by `/`
- Verb, inverse, or both MAY be empty
- Trailing `|` before `>-` is optional
- Multi-line allowed inside `-<` ... `>-`

### 3.4 Objectification

Names a binary verb relationship as a concept.

**Syntax:**
```
Name: ConceptA -< ... >- ConceptB
```

**Example:**
```
Driving: Person -< Driver | drives / is driven by | Driven Car >- Car
Settlement: Executed order -< is being settled for / is settled to >- Payment
```

**Rules:**
- Disambiguation from definition: if expression after `:` is valid binary verb, it is objectification
- All binary verb rules apply to the inner expression
- Nested inline objectification is NOT allowed: `A: B: C -< v >- D` is invalid

### 3.5 Block Objectification

Groups multiple binary verbs under a single objectified concept.

**Syntax:**
```
Name:
    ConceptA -< ... >- Name;
    ConceptB -< ... >- Name;
    ConceptC -< ... >- Name.
```

**Example:**
```
Briefing:
    Engineer -< Briefing Engineer | briefs / is briefing party in >- Briefing;
    Sales Agent -< Briefed Agent | is briefed by / briefs for >- Briefing;
    Product -< Subject Product | is subject of / is discussed in >- Briefing.
```

**Rules:**
- Block starts with `Name:` followed by newline
- Subsequent lines MUST be indented (at least one space or tab)
- Lines ending with `;` indicate continuation
- Line ending with `.` terminates the block
- Semicolon and period are REQUIRED

### 3.6 Unary State

Expresses a state or condition of a concept.

**Syntax:**
```
Concept --< State | verb >
Concept --< State | verb | PreviousState >
```

**Examples:**
```
Car --< Inactive Car | is inactivated >
Car --< Active Car | is activated | Inactive Car >
Order --< Cancelled Order | is cancelled >
Order --< Shipped Order | is shipped | Packed Order >
```

**Rules:**
- State MUST start with uppercase (it is a concept)
- Verb is REQUIRED (describes the transition action)
- Third position (PreviousState) is optional - indicates conditional transition
- No keyword `from` - purely positional syntax
- Multi-line allowed inside `--<` ... `>`

### 3.7 Whole-Part Structure

Expresses composition - a whole consisting of parts.

**Syntax:**
```
Whole -< [inner] >- [Part1, Part2, ...]
```

**Example:**
```
Electric Car -< | includes / is included in | >- [Electric Engine, Chassis]
Car -< contains / is contained in >- [Engine, Wheels, Body]
```

**Rules:**
- Syntactically a binary verb with list as right-hand side
- List MUST be on right side only (whole on left, parts on right)
- Any verb is allowed (not limited to "includes")
- Roles MAY be specified
- Part order is semantically irrelevant

### 3.8 Enumeration

Declares named individuals (instances) of a concept.

**Syntax:**
```
Concept := { Value1, Value2, ... }
```

**Examples:**
```
Currency := { CZK, EUR, USD }
Market := { BCPP, US, GY }
Person := { John, Jane }
Status := { }                    # empty enumeration (valid but warns)
```

**Rules:**
- Values MUST start with uppercase letter
- Values MAY contain spaces (same rules as concept names)
- Value order is semantically irrelevant
- Empty enumeration `{ }` is syntactically valid
- Multi-line allowed inside `{}`

### 3.9 Property (Close Property Association)

Assigns attributes to a concept.

**Syntax:**
```
Concept -- property [Type]
Concept -- [property1, property2, ...] [Type]
```

**Examples:**
```
Order -- ordered date [Date]
Order -- [ordered date, promised date, shipped date] [Date]
Person -- full name [String]
Order -- customer [Customer]
```

**Rules:**
- Type is REQUIRED
- Type MUST start with uppercase (it is a concept or primitive)
- Property names SHOULD start with lowercase (they are attributes, not concepts)
- Multiple properties of same type can be grouped in `[]`

### 3.10 Property Type (v1.3)

Declares a reusable type for properties, distinct from concepts. Based on ADR-036.

**Syntax:**
```
# Property Types
TypeName: definition
  @type: category
  @pattern: regex
```

**Examples:**
```
# Property Types
Country Code: ISO 3166-1 alpha-2 country code
  @type: identifier
  @pattern: "[A-Z]{2}"

ISIN Code: International Securities Identification Number (ISO 6166)
  @type: identifier
  @pattern: "[A-Z]{2}[A-Z0-9]{10}"

Monetary Amount: A quantity of money in a specific currency
  @type: value
  @fibo: fibo-fnd-acc-cur:MonetaryAmount
```

**Rules:**
- Property Types MUST appear in `# Property Types` section
- `@type` annotation is REQUIRED (values: `identifier`, `value`, `code`, `reference`)
- `@pattern` annotation is OPTIONAL (regex for validation)
- Property Types are referenced in property declarations: `-- field [Property Type]`

**Type Categories:**

| Category | Description | Examples |
|----------|-------------|----------|
| `identifier` | Unique identifier for entities | ISIN, LEI, BIC, Customer ID |
| `value` | Measurable quantity | Monetary Amount, Percentage |
| `code` | Enumerated or constrained code | Country Code, Currency Code |
| `reference` | Reference to another concept | Customer, Account (as FK) |

### 3.11 Taxonomy Concept (v1.3)

Declares a hierarchical classification scheme. Based on ADR-037.

**Syntax:**
```
TaxonomyName: definition
  @type: taxonomy
  @max_depth: N
  -- name [String]
  -- level [Integer]
  -- parent [TaxonomyName]
```

**Examples:**
```
Product Type: Classification of financial products
  @type: taxonomy
  @max_depth: 2
  -- name [String]
  -- level [Integer]
  -- parent [Product Type]

Segment: Financial segmentation category
  @type: taxonomy
  @max_depth: 3
  -- name [String]
  -- level [Integer]
  -- parent [Segment]
```

**Rules:**
- Taxonomy concepts MUST have `@type: taxonomy` annotation
- `@max_depth` annotation is OPTIONAL (default: unlimited)
- Taxonomy concepts MUST have these properties:
  - `name [String]` - display name
  - `level [Integer]` - depth in hierarchy (0 = root)
  - `parent [Self]` - reference to parent node

**Taxonomy Detection (from Data Contract):**

When processing Data Contracts with L0/L1/L2 field patterns, parser consolidates into single taxonomy:

| Pattern | Detection |
|---------|-----------|
| `l0_*`, `l1_*`, `l2_*` | Level-prefixed hierarchy |
| `*_level_0`, `*_level_1` | Level-suffixed hierarchy |
| `parent_*`, `*_parent` | Parent reference field |

---

## 4. Semantics

### 4.1 Equivalences

The following expressions are semantically equivalent:

**4.1.1 Direction equivalence (binary verbs):**
```
A -< verb / inverse >- B  ≡  B -< inverse / verb >- A
```

**4.1.2 Child order (categorizations):**
```
Car =< size >= [Sedan, SUV, Hatchback]  ≡  Car =< size >= [Hatchback, Sedan, SUV]
```

**4.1.3 Part order (whole-part):**
```
Car -< includes >- [Engine, Wheels]  ≡  Car -< includes >- [Wheels, Engine]
```

**4.1.4 Value order (enumerations):**
```
Status := { Active, Inactive }  ≡  Status := { Inactive, Active }
```

**4.1.5 Trailing pipe:**
```
Person -< Driver | drives | >- Car  ≡  Person -< Driver | drives >- Car
```

### 4.2 Segmentation (@)

Category labels starting with `@` indicate **segmentation**:
- Each instance belongs to exactly ONE value in that dimension
- Multiple values from same `@` category are mutually exclusive

```
Order =< @ by state >= [Placed, Executed, Settled]
# An order cannot be both Placed AND Executed simultaneously
```

### 4.3 Context (Dotted Elements)

Concepts and relationships prefixed with `#~` represent **context** - references to elements defined elsewhere. In visual diagrams, these appear as dotted lines.

```
# Concepts
Order
Payment
#~Position                              # context reference (defined elsewhere)

# Binary Verb Concepts
Order -< settles via >- Payment
#~Order -< relates to >- Position       # context relationship
```

**Rules:**
- Context elements are parsed and validated like normal elements
- Context elements have `is_dotted=true` flag in AST
- Context elements appear inline in their regular sections (no separate `# Context` section)
- Regular elements appear before context elements when serialized

---

## 5. Validation

### 5.1 Validation Strategy

Parsers SHOULD follow **lenient parsing + strict validation**:

1. **Lenient parsing:** Accept input, build AST even with recoverable issues
2. **Strict validation:** Report all errors and warnings on complete AST
3. **`--strict` mode:** Treat warnings as errors (exit code 1)

This approach allows:
- Partial parsing of malformed files
- Complete error reporting (not just first error)
- User choice on warning severity via CLI flags

### 5.2 Syntax Errors (E0xx)

Syntax errors indicate malformed input. Parser MUST reject files with syntax errors.

| Code | Description | Example |
|------|-------------|---------|
| E001 | Invalid token | Unexpected character in expression |
| E002 | Unclosed delimiter | `Car =< size >= [Sedan, SUV` (missing `]`) |
| E003 | Missing required element | `Car --< State \| >` (missing verb) |
| E004 | Invalid domain path format | `#! invalid..path` |
| E005 | Invalid concept name | `person -< drives >- Car` (lowercase) |
| E006 | Nested inline objectification | `A: B: C -< v >- D` |
| E007 | Missing block terminator | `Driving:` + lines without `.` |
| E008 | Missing required domain directive | File without `#!` directive (ADR-045) |
| E009 | Inconsistent domain across files | Multiple files with different `#!` domains |

### 5.3 Semantic Errors (E1xx)

Semantic errors indicate logical inconsistencies. Validator MUST report these as errors.

| Code | Description | Example |
|------|-------------|---------|
| E101 | Reference to undefined concept | `--< State \| verb \| Unknown >` where Unknown not defined |
| E102 | Cyclic categorization detected | `A =< >= [B]` + `B =< >= [A]` |
| E103 | Instance used as categorization parent | `CZK =< type >= [...]` where CZK is enumeration value |

### 5.4 Semantic Warnings (W1xx)

Semantic warnings indicate potential issues. Validator SHOULD report these as warnings.

| Code | Description | Example |
|------|-------------|---------|
| W101 | Duplicate concept definition | Two `Person: ...` definitions |
| W102 | Empty enumeration | `Status := { }` |
| W103 | Unnamed relationship | `A -< >- B` (missing verb phrase) |
| W104 | Segmentation violation | Instance with multiple `@` category values |

### 5.5 Domain Warnings (W2xx)

Domain warnings relate to ADR-010 and ADR-031 compliance.

| Code | Description | Example |
|------|-------------|---------|
| ~~W201~~ | ~~Missing domain directive~~ | Replaced by E008 (ADR-045) |
| W202 | Cross-domain reference to unknown domain | `Unknown:Domain.Concept` |
| W203 | Inconsistent bracket style | Mix of `Concept` and `[Concept]` in same file |

**Note:** W201 was promoted to E008 in CST v1.4 per ADR-045. Missing `#!` is now a syntax error.

---

## Appendix A: Formal Grammar (EBNF)

```ebnf
(* ============================================ *)
(* ConceptSpeak Text - Formal Grammar (EBNF)   *)
(* ISO/IEC 14977                                *)
(* ============================================ *)

(* === Character Classes === *)
UPPER         = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I"
              | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R"
              | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" ;

LOWER         = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i"
              | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r"
              | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" ;

DIGIT         = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;

NAME_CHAR     = UPPER | LOWER | DIGIT | " " | "-" | "'" | "(" | ")" ;

(* === Tokens === *)
NAME          = UPPER , { NAME_CHAR } ;
TEXT          = { ? any character except newline ? } ;
NEWLINE       = ? line terminator ? ;
INDENT        = ? one or more spaces or tabs ? ;
COMMENT       = "#" , ? not "!" and not "~" ? , TEXT ;
              (* #! = domain directive, #~ = dotted directive, # = comment *)

(* === Domain Directive (v1.1) === *)
domain_directive = "#!" , WHITESPACE , domain_path , NEWLINE ;
domain_path      = NAME , { ":" , NAME } ;
WHITESPACE       = " " | "\t" , { " " | "\t" } ;

(* === Dotted Directive (v1.5 - ADR-047) === *)
dotted_directive = "#~" , [ WHITESPACE ] , expression , NEWLINE ;
                   (* Marks expression as context/dotted *)

(* === Concept with Bracket Equivalence (v1.1) === *)
concept          = NAME | "[" , NAME , "]" ;
                   (* NAME ≡ [NAME] - semantically identical *)

(* === Qualified Concept (v1.1) === *)
qualified_concept = [ domain_path , "." ] , concept ;
                    (* Cross-domain reference: RBCZ:MIB:Payments.Payment *)

(* === File Structure === *)
file          = { line } ;
line          = domain_directive
              | dotted_directive                     (* v1.5 *)
              | [ expression ] , [ COMMENT ] , NEWLINE
              | COMMENT , NEWLINE
              | NEWLINE ;

(* === Expressions === *)
expression    = definition
              | categorization
              | binary_verb
              | objectification
              | block_objectification
              | unary_state
              | whole_part
              | enumeration
              | property ;

(* === Definition === *)
definition    = concept , ":" , TEXT ;
              (* where TEXT is not a valid binary_verb *)

(* === Categorization === *)
categorization = concept , "=<" , [ label ] , ">=" , "[" , concept_list , "]" ;
label          = TEXT ;
concept_list   = concept , { "," , concept } ;

(* === Binary Verb === *)
binary_verb   = qualified_concept , "-<" , [ inner ] , ">-" , qualified_concept ;
inner         = [ role , "|" ] , [ verbs ] , [ "|" , role ] , [ "|" ] ;
verbs         = verb , "/" , [ inverse ]
              | "/" , inverse ;
role          = concept ;     (* v1.1: role is a concept, brackets optional *)
verb          = TEXT ;    (* excluding | / >- *)
inverse       = TEXT ;    (* excluding | / >- *)

(* === Objectification === *)
objectification = concept , ":" , binary_verb ;
                  (* v1.1: concept can have brackets *)

(* === Block Objectification === *)
block_objectification = concept , ":" , NEWLINE , block_body ;
block_body    = block_line , { block_line } , final_line ;
block_line    = INDENT , binary_verb , ";" , NEWLINE ;
final_line    = INDENT , binary_verb , "." ;

(* === Unary State === *)
unary_state   = concept , "--<" , concept , "|" , verb , ">"
              | concept , "--<" , concept , "|" , verb , "|" , concept , ">" ;

(* === Whole-Part === *)
whole_part    = qualified_concept , "-<" , [ inner ] , ">-" , "[" , concept_list , "]" ;

(* === Enumeration === *)
enumeration   = concept , ":=" , "{" , [ concept_list ] , "}" ;

(* === Property === *)
property      = concept , "--" , prop_names , "[" , concept , "]" , { annotation } ;
prop_names    = prop_name
              | "[" , prop_name , { "," , prop_name } , "]" ;
prop_name     = TEXT ;    (* typically lowercase *)

(* === Annotations (v1.3) === *)
annotation        = INDENT , "@" , annotation_key , ":" , annotation_value , NEWLINE ;
annotation_key    = IDENTIFIER ;
annotation_value  = TEXT ;
IDENTIFIER        = LOWER , { LOWER | DIGIT | "_" } ;

(* === Concept Block with Annotations (v1.3) === *)
concept_block     = definition , { annotation } , { property_block } ;
property_block    = property , { annotation } ;

(* === Property Type (v1.3 - ADR-036) === *)
property_type_section = "# Property Types" , NEWLINE , { property_type_def } ;
property_type_def     = NAME , ":" , TEXT , NEWLINE , { annotation } ;

(* === Taxonomy (v1.3 - ADR-037) === *)
taxonomy_concept  = definition , taxonomy_annotation , [ max_depth_annotation ] , { property } ;
taxonomy_annotation = INDENT , "@type" , ":" , "taxonomy" , NEWLINE ;
max_depth_annotation = INDENT , "@max_depth" , ":" , DIGIT , { DIGIT } , NEWLINE ;
```

---

## Appendix B: Quick Reference

### Operators and Delimiters

| Operator | Construct | Example |
|----------|-----------|---------|
| `:` | Definition / Objectification | `Person: A human` / `Driving: A -< v >- B` |
| `=<` `>=` | Categorization | `Car =< size >= [Small, Large]` |
| `-<` `>-` | Binary verb | `A -< verb / inverse >- B` |
| `--<` `>` | Unary state | `Car --< Inactive \| deactivates >` |
| `:=` `{` `}` | Enumeration | `Status := { Active, Pending }` |
| `--` | Property | `Order -- date [Date]` |
| `\|` | Role/verb separator | `A -< Role \| verb >- B` |
| `/` | Verb/inverse separator | `drives / is driven by` |
| `;` | Block continuation | Line continues in block |
| `.` | Block termination | Last line of block |
| `#` | Comment | `# this is ignored` |
| `#!` | Domain directive | `#! RBCZ:MIB:Investment` |
| `#~` | Dotted/context prefix | `#~Position` (v1.5) |
| `@` | Segmentation prefix / Annotation | `=< @ state >= [...]` / `@source: EDI` |

### Construct Summary

| Construct | Syntax |
|-----------|--------|
| Definition | `Concept: text` |
| Categorization | `Parent =< label >= [Children]` |
| Binary verb | `A -< [Role\|] verb / inverse [\|Role] >- B` |
| Objectification | `Name: binary_verb` |
| Block objectification | `Name:` + indented lines with `;` and `.` |
| Unary state | `C --< State \| verb [\| PrevState] >` |
| Whole-part | `Whole -< verb >- [Parts]` |
| Enumeration | `Concept := { Values }` |
| Property | `Concept -- prop [Type]` |

---

## Appendix C: Examples

### C.1 Individual Constructs

#### Definition
```
Person: A human being capable of having legal rights and duties
Order: A customer request to buy or sell a financial instrument
```

#### Categorization
```
Car =< kind of Car Size >= [Passenger Car, Utility Car]
Order =< @ by state >= [Placed, Executed, Settled]
Currency =< kind of Currency >= [CZK, EUR, USD]
```

#### Binary Verb
```
# Simple
Person -< drives / is driven by >- Car

# With roles
Person -< Driver | drives / is driven by | Driven Car >- Car

# One-sided
Account -< has / >- Balance

# Unnamed relationship
Entity -< >- Entity
```

#### Objectification
```
Driving: Person -< Driver | drives / is driven by | Driven Car >- Car
Settlement: Executed order -< is being settled for / is settled to >- Payment
```

#### Block Objectification
```
Briefing:
    Engineer -< Briefing Engineer | briefs / is briefing party in >- Briefing;
    Sales Agent -< Briefed Agent | is briefed by / briefs for >- Briefing;
    Product -< Subject Product | is subject of / is discussed in >- Briefing.
```

#### Unary State
```
# Simple transition
Car --< Inactive Car | is inactivated >

# Conditional transition (from previous state)
Car --< Active Car | is activated | Inactive Car >

# Lifecycle
Order --< Received Order | is received >
Order --< Shipped Order | is shipped | Packed Order >
```

#### Whole-Part
```
Electric Car -< | includes / is included in | >- [Electric Engine, Chassis]
Document -< contains / is contained in >- [Header, Body, Footer]
```

#### Enumeration
```
Currency := { CZK, EUR, USD }
Market := { BCPP, US, GY }
Day of Week := { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday }
```

#### Property
```
Order -- ordered date [Date]
Order -- [ordered date, promised date, shipped date, delivered date] [Date]
Person -- full name [String]
```

### C.2 Complete Scenario: Investment Order Domain

```
# Concepts
Order: A customer request to buy or sell a financial instrument
Payment: A financial transaction transferring funds between accounts
Position: Holdings of a specific instrument in a portfolio

# Categorizations
Order =< @ by state >= [Placed order, Executed order, Settled order]
Order =< @ by kind >= [Buy, Sell]
Order =< @ by frequency >= [One-time, Saving plan]

Saving plan =< @ by period >= [Weekly, Monthly]

Payment =< kind of Payment >= [Outgoing Payment, Incoming Payment]
Incoming Payment =< kind of Incoming Payment >= [Deposit, Fee]

# Binary Verbs
Sales -< is sum of / generates >- Order
Executed order -< is being settled for / is settled to >- Payment
Executed order -< predicts / consists of >- Position
Position -< generates / is charged for >- Custody fee

# Objectification
Settlement: Executed order -< is being settled for / is settled to >- Payment

# Enumerations
Currency := { CZK, EUR, USD }
Market := { BCPP, US, GY }

# Properties
Order -- [ordered date, execution date, settlement date] [Date]
Order -- quantity [Number]
#~Account                         # context: external reference
#~Account -< holds / is held in >- Position   # context relationship
```

---

## Appendix D: File Structure Convention

While not syntactically required, the following section order is RECOMMENDED for readability:

```
#! RBCZ:MIB:Investment          # Domain directive (v1.1)

# Concepts
<definitions and concept declarations with @annotations>
#~<context concepts with #~ prefix>      # (v1.5 - ADR-047)

# Categorizations
<categorization expressions>
#~<context categorizations>              # (v1.5)

# Binary Verbs
<binary verb expressions>
#~<context binary verbs>                 # (v1.5)

# Objectifications
<objectification expressions>

# Enumerations
<enumeration expressions>

# Properties
<property expressions>

# Unary States
<state transitions>

# Property Types                 # (v1.3 - ADR-036)
<property type definitions with @type annotations>

#! RBCZ:MIB:Payments             # Switch domain (v1.1)

# Concepts
<concepts for new domain>
```

**Note (v1.5):** The `# Context (dotted lines)` section is deprecated. Context elements now use `#~` prefix and appear inline in their respective sections. When serializing, regular elements appear first, followed by context elements.

### D.1 Complete Example with v1.3 Features

```
#! RBCZ:EDI:AUM

# Concepts
Assets Under Management: Total market value of assets managed on behalf of clients
  @source: EDI
  @source_entity: EDI_AUM
  @fibo: fibo-ind:AssetsUnderManagement
  @fibo_source: contract
  @fibo_confidence: VERIFIED
  @status: VERIFIED
  -- date [Date]
  -- country [Country]
  -- amount eur [Monetary Amount]
    @currency: EUR

Country: A nation with its own government and territory
  @source: IDM
  @fibo: fibo-fnd-plc-ctr:Country
  -- code [Country Code]
  -- name [String]

Product Type: Classification of financial products
  @source: IDM
  @type: taxonomy
  @max_depth: 2
  -- name [String]
  -- level [Integer]
  -- parent [Product Type]

Calendar Day: ultimo of the month
  @status: DRAFT
  @warning: Definition appears to be business rule, not semantic definition
  @warning_rule: DQD-3

# Enumerations
Currency := { CZK, EUR, USD }

# Property Types
Country Code: ISO 3166-1 alpha-2 country code
  @type: identifier
  @pattern: "[A-Z]{2}"
  @fibo: fibo-fnd-plc-cty:CountryIdentifier

ISIN Code: International Securities Identification Number (ISO 6166)
  @type: identifier
  @pattern: "[A-Z]{2}[A-Z0-9]{10}"
  @fibo: fibo-sec-sec-id:InternationalSecuritiesIdentificationNumber

Monetary Amount: A quantity of money in a specific currency
  @type: value
  @fibo: fibo-fnd-acc-cur:MonetaryAmount
```

---

## Appendix E: CLI Reference

### E.1 Subcommand Pattern (ADR-034)

The `conceptspeak` CLI follows a subcommand pattern:

```bash
python -m conceptspeak <subcommand> [options] [arguments]
```

### E.2 Validate Subcommand

Validates `.cs` files against the CST specification.

```bash
python -m conceptspeak validate <file.cs> [options]

Options:
  --format {text,json}  Output format (default: text)
  --strict              Treat warnings as errors
  --quiet               Suppress output on success

Examples:
  python -m conceptspeak validate order.cs
  python -m conceptspeak validate order.cs --format json
  python -m conceptspeak validate order.cs --strict
```

**Exit codes:**
| Code | Meaning |
|------|---------|
| 0 | Valid (or warnings only without `--strict`) |
| 1 | Validation errors found |
| 2 | File not found / IO error |

### E.3 Parse Subcommand

Parses Miro JSON or Data Contract YAML to ConceptSpeak.

```bash
python -m conceptspeak parse <input> [output] [options]

Options:
  --input-type {auto,miro,datacontract}  Input format (default: auto)
  --domain-path PATH                      Override domain path
  --auto-dedupe                           Remove duplicate context copies (Miro)
  --analyze                               Show object inventory only (Miro)
  --reference FILE                        Reference file for enrichment (Miro)

Examples:
  python -m conceptspeak parse frame.json output.cs
  python -m conceptspeak parse contract.yaml --domain-path RBCZ:MIB:Investment
  python -m conceptspeak parse frame.json --auto-dedupe --analyze
```

### E.4 Build Subcommand (v1.4, ADR-045)

Builds domain output from ConceptSpeak files. Source files passed as positional arguments.

```bash
python -m conceptspeak build <file.cs> [file2.cs ...] [options]

Options:
  -o, --output DIR    Output directory (default: ./output)
  --format {json,cs}  Output format (default: json)

Examples:
  # Single file
  python -m conceptspeak build order.cs -o output/

  # Multiple files (must have same #! domain)
  python -m conceptspeak build order.cs transaction.cs position.cs -o output/

  # Glob expansion (shell)
  python -m conceptspeak build domains/Investment/*.cs -o output/
```

**Validation:**
- All input files MUST have `#!` directive (E008 if missing)
- All input files MUST have identical `#!` domain (E009 if inconsistent)
- Domain path extracted from `#!` directive, no config.json needed

### E.5 JSON Output Schema (ValidationResult)

```json
{
  "file": "order.cs",
  "valid": true,
  "error_count": 0,
  "warning_count": 1,
  "errors": [
    {
      "line": 5,
      "column": 1,
      "code": "W101",
      "message": "Duplicate definition for 'Order'",
      "severity": "warning",
      "source": "order.cs"
    }
  ]
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | string | Source file path |
| `valid` | boolean | `true` if no errors (warnings allowed) |
| `error_count` | integer | Number of errors |
| `warning_count` | integer | Number of warnings |
| `errors` | array | List of validation issues |

**Error object fields:**
| Field | Type | Description |
|-------|------|-------------|
| `line` | integer | 1-based line number |
| `column` | integer | 1-based column number |
| `code` | string | Error code (E0xx, E1xx, W1xx, W2xx) |
| `message` | string | Human-readable description |
| `severity` | string | `"error"` or `"warning"` |
| `source` | string | Source file (optional) |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-20 | Initial specification |
| 1.1 | 2025-12-23 | Added domain directive (`#!`), bracket equivalence, cross-domain references (ADR-031) |
| 1.2 | 2025-12-23 | Validation error codes (ADR-032), CLI reference (ADR-034), context tracking |
| 1.3 | 2025-12-24 | Metadata annotations `@` (ADR-031 Amendment 1), Property Types section (ADR-036), Taxonomy pattern (ADR-037), EBNF updates |
| 1.4 | 2025-12-25 | Mandatory domain directive (ADR-045), E008/E009 errors, W201 deprecated, CLI positional args |
| 1.5 | 2025-12-25 | Dotted concept directive `#~` (ADR-047), deprecated `# Context` section, inline context syntax |
