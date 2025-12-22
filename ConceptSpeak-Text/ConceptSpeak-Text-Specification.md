# ConceptSpeak Text Language Specification

**Version:** 1.0
**Date:** 2025-12-20
**Status:** Draft

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

Concepts and relationships exported as comments represent **context** - references to elements defined elsewhere.

```
# Concepts
Order
Payment
# Position                              # context reference (defined elsewhere)

# Context (dotted lines)
# Order -< relates to >- Position       # context relationship
```

Context elements are syntactically comments but carry semantic meaning as external references.

---

## 5. Validation

### 5.1 Syntactic Errors (Parser MUST reject)

| Error | Example | Reason |
|-------|---------|--------|
| Name starts with lowercase | `person -< drives >- Car` | Invalid identifier |
| Missing block terminator | `Driving:` + lines without `.` | Incomplete block |
| Unclosed delimiter | `Car =< size >= [Sedan, SUV` | Missing `]` |
| Nested inline objectification | `A: B: C -< v >- D` | Not allowed |
| Missing verb in unary state | `Car --< Inactive \| >` | Verb required |

### 5.2 Semantic Warnings (Validator SHOULD report)

| Warning | Example | Reason |
|---------|---------|--------|
| Duplicate definition | Two `Person: ...` definitions | Redefinition |
| Instance in categorization | `CZK =< type >= [...]` where `CZK` is enumeration value | Instances cannot be parents |
| Empty enumeration | `Status := { }` | No values defined |
| Unnamed relationship | `A -< >- B` | Missing verb phrase |
| Segmentation violation | Instance with multiple `@` values | Mutual exclusivity broken |
| Cyclic categorization | `A =< >= [B]` + `B =< >= [A]` | Circular hierarchy |
| Undefined reference | `--< State \| verb \| Unknown >` | Unknown not defined |

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
COMMENT       = "#" , TEXT ;

(* === File Structure === *)
file          = { line } ;
line          = [ expression ] , [ COMMENT ] , NEWLINE
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
definition    = NAME , ":" , TEXT ;
              (* where TEXT is not a valid binary_verb *)

(* === Categorization === *)
categorization = NAME , "=<" , [ label ] , ">=" , "[" , name_list , "]" ;
label          = TEXT ;
name_list      = NAME , { "," , NAME } ;

(* === Binary Verb === *)
binary_verb   = NAME , "-<" , [ inner ] , ">-" , NAME ;
inner         = [ role , "|" ] , [ verbs ] , [ "|" , role ] , [ "|" ] ;
verbs         = verb , "/" , [ inverse ]
              | "/" , inverse ;
role          = NAME
              | "[" , NAME , "]" ;
verb          = TEXT ;    (* excluding | / >- *)
inverse       = TEXT ;    (* excluding | / >- *)

(* === Objectification === *)
objectification = NAME , ":" , binary_verb ;

(* === Block Objectification === *)
block_objectification = NAME , ":" , NEWLINE , block_body ;
block_body    = block_line , { block_line } , final_line ;
block_line    = INDENT , binary_verb , ";" , NEWLINE ;
final_line    = INDENT , binary_verb , "." ;

(* === Unary State === *)
unary_state   = NAME , "--<" , NAME , "|" , verb , ">"
              | NAME , "--<" , NAME , "|" , verb , "|" , NAME , ">" ;

(* === Whole-Part === *)
whole_part    = NAME , "-<" , [ inner ] , ">-" , "[" , name_list , "]" ;

(* === Enumeration === *)
enumeration   = NAME , ":=" , "{" , [ name_list ] , "}" ;

(* === Property === *)
property      = NAME , "--" , prop_names , "[" , NAME , "]" ;
prop_names    = prop_name
              | "[" , prop_name , { "," , prop_name } , "]" ;
prop_name     = TEXT ;    (* typically lowercase *)
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
| `@` | Segmentation prefix | `=< @ state >= [...]` |

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

# Context (external references)
# Account
# Account -< holds / is held in >- Position
```

---

## Appendix D: File Structure Convention

While not syntactically required, the following section order is RECOMMENDED for readability:

```
# Concepts
<definitions and concept declarations>

# Categorizations
<categorization expressions>

# Binary Verbs
<binary verb expressions>

# Objectifications
<objectification expressions>

# Enumerations
<enumeration expressions>

# Properties
<property expressions>

# Unary States
<state transitions>

# Context (dotted lines)
<context references as comments>
```

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-20 | Initial specification |
