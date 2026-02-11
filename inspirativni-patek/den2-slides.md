# Den 2: Jak to děláme — Story Spine v2

**Event:** Inspirativní pátek (Den 2)
**Format:** Case study — jeden příběh, Lukáš jako průvodce
**Style:** Hlubší prezentace s detaily, ne TED talk
**Duration:** 90 min (78 min content + 5 min pauza + 7 min Q&A)
**Slides:** 26
**Created:** 2026-02-09

---

## Přehled slidů

1. Jak to děláme — příběh jedné investice v RBCZ.
2. Minule jsme pojmenovali pět strachů. Dnes na každý odpovíme.
3. Tomáš Jelínek potřeboval data pro kampaně a rozhodl se nestat do fronty na DWH — dnes má 13 produktů, 5 v produkci.
4. Aby mohl začít, potřeboval mapu — kde v bance jsou data, která hledá.
5. BKB diagram na jednu A4 ukázal celý byznys: domény, subdomény, kandidátní datové produkty.
6. Tři produkty v subdoméně CRM dostaly vlastníka — Karel Černý ví, co dodává a komu.
7. AI přečetla BKB a za minutu vygenerovala dokumentaci, kterou by analytik psal týden.
8. S mapou v ruce přišel čas navrhnout, co přesně ten produkt obsahuje.
9. DP Canvas na jednu stránku shrnul zdroje, atributy, kvalitu, frekvenci i relační model.
10. Aby si lidé rozuměli napříč doménami, potřebovali společný jazyk — Business Glossary a ontologii FIBO, kde každá definice je podmnožinou vyšší úrovně.
11. Z kanvasu vznikl Data Contract: .yml soubor na GitHubu, smlouva mezi producentem a konzumentem.
12. DPCC katalog umožnil komukoliv v bance vyhledat produkt, přečíst contract a připojit se za 5 minut.
13. Governance přestal být schvalovací proces — stal se smlouvou jako kód s jasným vlastníkem.
14. Návrh byl hotový. Teď ho bylo potřeba postavit a dostat do produkce.
15. Architektura produktu stojí na immutabilitě a bitemporalitě — přirozený důsledek streamového přístupu, kde nikdy nepřepisuješ, jen připojuješ.
16. Enablement tým dodal šablony, CI/CD pipeline a sandbox — Tomáš řešil CO, ne JAK.
17. Databricks Unity Catalog a FinOps reporting ukázaly náklady per produkt — žádné překvapení na konci kvartálu.
18. ☕ Všechno vypadalo krásně. A pak přišel Dušan z Retailu.
19. Dušan chtěl všechny zákazníky Investic — ale produkt obsahoval jen kampaňové kandidáty.
20. DPCC AI self-service mu za 30 sekund ukázal co existuje, co ne a kde hledat dál.
21. Produkt se jmenoval DP_CUSTOMER — Dušan čekal všechny zákazníky, dostal jen kampaňové kandidáty. Subset princip z ontologie vysvětluje proč: obě definice jsou legitimní podmnožiny RBCZ klienta. Dušanův požadavek se stal novým kandidátem v BKB.
22. Data quality kontroly běžely v pipeline automaticky — vlastník odpovídal za kvalitu svých dat.
23. Příběh jednoho produktu se zopakoval 79× napříč bankou — MIB vede s 5 v produkci, Retail startuje, Finance má první.
24. Pět strachů z Den 1 dostalo pět konkrétních odpovědí z jednoho příběhu.
25. Decentralizace není chaos. Je to jiný řád. A vy jste jeho součástí.
26. Otázky a odpovědi — speakeři odpovídají ke svým kapitolám.

---

## O čem je Den 2

Den 1 položil otázku *proč* decentralizovat data. Představil pět nejčastějších obav, pět principů a pět příkladů ze světa (Spotify, JPMorgan, DBS Bank).

Den 2 odpovídá *jak*. Žádná teorie, žádné příklady odjinud. Celá prezentace sleduje jeden skutečný projekt v RBCZ — od prvního požadavku po nasazení do produkce. Všichni speakeři jsou přímí účastníci příběhu.

| | Den 1: PROČ | Den 2: JAK |
|---|---|---|
| **Styl** | TED/Apple — krátké věty, emoce | Case study — detaily, důkazy, vysvětlování |
| **Struktura** | 5 principů, 5 příkladů ze světa | 1 příběh end-to-end z naší banky |
| **Speakeři** | Oddělené vstupy | Postavy v jednom příběhu |
| **World examples** | Spotify, JPMorgan, DBS Bank | Žádné — čistě RBCZ |
| **Rámec** | 5 strachů → 5 principů → 5 příkladů | 5 strachů (recap) → 1 příběh → 5 odpovědí |

---

## Mapování strachů na kapitoly

Pět strachů z Den 1 nejsou jen rétorika — tvoří osnovu celého příběhu. Každá kapitola příběhu explicitně odpovídá na jeden nebo více strachů:

| Strach z Den 1 | Kapitola | Odpověď z příběhu |
|---|---|---|
| Rozdělíme a nedáme dohromady | Kap. 1 — BKB | BKB + ontologie drží celek pohromadě |
| Nikdo nebude zodpovědný | Kap. 2 — Contract + Governance | Vlastník DP = Karel Černý. Contract na GitHubu. |
| Data nejsou včas | Kap. 3 — Platforma | CI/CD, APEX, Databricks. Time-to-market splněn. |
| Nemáme na to lidi | Kap. 3 — Enablement | Enablement tým + šablony + sandbox za 5 min. |
| Bude chaos | Kap. 4 — Realita + Closing (Kanban) | Glossary chrání scope. Kanban řídí 12 projektů. |

---

## SLIDES

---

### OPENING (5 min) — Lukáš

Opening propojuje Den 1 a Den 2. Připomíná pět strachů z minulé prezentace a uvádí hlavní příběh dne — jak Tomáš Jelínek z divize MIB (Management, Investice, Brokerage) potřeboval data a rozhodl se jít novou cestou.

---

#### SLIDE 1 — Title
**Speaker:** Lukáš | **Čas:** 0:30

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                                                            │
│                     JAK TO DĚLÁME                          │
│                                                            │
│           Jeden příběh. Od potřeby po produkci.            │
│                                                            │
│                                                            │
│                    Inspirativní pátek                       │
│                         Den 2                              │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

#### SLIDE 2 — Recap: 5 strachů z Den 1
**Speaker:** Lukáš | **Čas:** 1:30

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                  5 STRACHŮ Z MINULA                        │
│                                                            │
│                                                            │
│       1.  Rozdělíme to a nedáme dohromady                  │
│                                                            │
│       2.  Nikdo nebude zodpovědný                          │
│                                                            │
│       3.  Bude chaos                                       │
│                                                            │
│       4.  Nemáme na to lidi                                │
│                                                            │
│       5.  Data nejsou včas                                 │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Těchto pět obav zaznělo v Den 1 jako nejčastější argumenty proti decentralizaci dat. Každý z nich je legitimní — a právě proto se k nim dnes vracíme. Tentokrát ne s teorií, ale s konkrétním příběhem z banky.

> "Minule jsme mluvili proč. Pět strachů. Pět principů. Pět příkladů ze světa.
> Dnes žádná teorie. Dnes uvidíte jeden skutečný projekt. Z naší banky. Od první schůzky po produkci.
> Všechno skutečné. Všichni lidé v téhle místnosti."

---

#### SLIDE 3 — Hook: Tomášův problém
**Speaker:** Lukáš | **Čas:** 3:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│          TOMÁŠ JELÍNEK, ŠÉF MIB                           │
│                                                            │
│          Potřeboval data pro marketingové                   │
│          kampaně v Investicích.                             │
│                                                            │
│          Měl dvě možnosti:                                 │
│                                                            │
│          ┌─────────────┐    ┌─────────────┐               │
│          │  DWH fronta  │    │  Zkusit to  │               │
│          │  → měsíce    │    │    jinak     │               │
│          └─────────────┘    └──────┬──────┘               │
│                                    │                       │
│                                    ▼                       │
│                            TOHLE JE TEN                    │
│                              PŘÍBĚH                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Tomáš Jelínek řídí divizi MIB (Management, Investice, Brokerage). Jeho tým v Investicích potřeboval datové podklady pro cílené marketingové kampaně — konkrétně Karel Černý, který má na starosti kampaně pro Sales Force v rámci CRM.

Klasická cesta by znamenala zadat požadavek centrálnímu DWH týmu a zařadit se do fronty. Realistický odhad: výsledek ne do konce roku. Navíc dodávka od DWH by nebyla v souladu se strategií divize MIB.

Jelínek se rozhodl zkusit nový přístup — vytvořit datové produkty vlastními silami, ale tentokrát s metodikou, dokumentací a platformou, kterou nabízí DMT (Data Management Team). Z hlediska time-to-market to bylo nejlepší dostupné řešení.

Výsledek předběhl očekávání: v rámci projektu Salesforce v tribu Investice vzniklo za **9 měsíců 5 různých datových řešení**, která agilně reagovala na změny zadání. To je autonomie podpořená platformou — a důkaz, že time-to-market lze splnit i mimo centrální DWH.

Dnes má Tomášova doména MIB **13 datových produktů** — 5 kandidátních, 3 ve vývoji a **5 v produkci**. Je nejdál v celé bance. Tohle je ten příběh.

> "Tomáš Jelínek, šéf MIB. Potřeboval data pro marketingové kampaně v Investicích.
> Měl dvě možnosti: zadat požadavek DWH a čekat měsíce. Nebo to zkusit jinak.
> Zkusil to jinak. Dnes má 13 datových produktů, 5 v produkci. Tohle je ten příběh."

---

### KAPITOLA 1: Od obrázku k architektuře (12 min) — Lukáš

**Odpovídá na strach:** *Rozdělíme a nedáme dohromady*

Prvním krokem v novém přístupu není psaní požadavků ani technická analýza. Je to mapování byznys reality — pochopení, co doména Investice vlastně dělá, jaká data vznikají a kdo je potřebuje. K tomu slouží nástroj zvaný BKB (Business Knowledge Blueprint).

---

#### SLIDE 4 — Chapter divider
**Speaker:** Lukáš | **Čas:** 1:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                                                            │
│                         KAP. 1                             │
│                                                            │
│              OD OBRÁZKU K ARCHITEKTUŘE                     │
│                                                            │
│                                                            │
│     ┌──────────┐          ┌──────────┐                     │
│     │ 📋 Papír │  ─────►  │ 🏗 BKB  │                     │
│     └──────────┘          └──────────┘                     │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

> "Soňa si sedla s Karlem Černým — tím, kdo má v Investicích na starosti kampaně pro Sales Force. A místo stohů dokumentace začala u papíru."

---

#### SLIDE 5 — BKB diagram
**Speaker:** Lukáš | **Čas:** 4:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   BUSINESS KNOWLEDGE BLUEPRINT                             │
│                                                            │
│   ┌──────────────────────────────────────────────────┐     │
│   │                                                  │     │
│   │          [ SCREENSHOT: BKB diagram ]             │     │
│   │                                                  │     │
│   │   Strukturovaný obraz byznysu na jednu A4        │     │
│   │                                                  │     │
│   │   Domény → Subdomény → Kandidátní oblasti        │     │
│   │                                                  │     │
│   └──────────────────────────────────────────────────┘     │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**BKB (Business Knowledge Blueprint)** je strukturovaný diagram, který na jednu A4 zachycuje celý byznys kontext domény. Soňa (business analytička DMT) ho vytvořila společně s Karlem Černým tak, že s ním procházela jeho pracovní realitu: jaké procesy v Investicích běží, jaká data vznikají, kdo je konzumuje a proč.

BKB mapuje hierarchii: doména (Investice) → subdomény (CRM, Trading, Risk...) → kandidátní oblasti pro datové produkty. Není to technický dokument — je to obraz byznysu srozumitelný pro byznys i IT.

Z BKB vypadly jasně definované kandidátní oblasti a konkrétní názvy datových produktů. Karel se stal vlastníkem celé subdomény CRM v rámci Investic.

**Vizuál:** Reálný BKB diagram z Roamu — hierarchický diagram domén, subdomén a kandidátních oblastí.

---

#### SLIDE 6 — Kandidátní datové produkty
**Speaker:** Lukáš | **Čas:** 4:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   SUBDOMÉNA CRM — 3 DATOVÉ PRODUKTY                       │
│                                                            │
│   ┌──────────────────────────────────────────────────┐     │
│   │                                                  │     │
│   │   Marketing Campaign Candidates                  │     │
│   │   ─────────────────────────────                  │     │
│   │   Investment Agreement                           │     │
│   │   ────────────────────                           │     │
│   │   Investment Customer Exposition                 │     │
│   │   ──────────────────────────────                 │     │
│   │                                                  │     │
│   │   Vlastník: Karel Černý                          │     │
│   │                                                  │     │
│   └──────────────────────────────────────────────────┘     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Z BKB byly identifikovány tři kandidátní datové produkty v subdoméně CRM:

- **Marketing Campaign Candidates** — předvybraní klienti vhodní pro marketingové kampaně v Investicích. Toto byl Tomášův primární požadavek.
- **Investment Agreement** — data o investičních smlouvách a jejich parametrech.
- **Investment Customer Exposition** — expozice klientů v investičních produktech.

Klíčové je pojmenování. Ne generický název jako `DP_CUSTOMER`, ale přesný název, který říká co produkt obsahuje — a tím implicitně i co *ne*obsahuje. Tento princip se ukáže jako zásadní v Kapitole 4.

Karel Černý se stal vlastníkem všech tří datových produktů ve své subdoméně. Odpovědnost za data je od začátku jasná — ne nějaká abstraktní governance, ale konkrétní člověk.

---

#### SLIDE 7 — AI generuje dokumentaci
**Speaker:** Lukáš | **Čas:** 3:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   ┌────────────────────┐     ┌─────────────────────────┐   │
│   │                    │     │                         │   │
│   │   [ BKB diagram ]  │ ──► │  [ AI-generated doc ]   │   │
│   │                    │     │                         │   │
│   │                    │     │  Srozumitelná           │   │
│   │                    │     │  dokumentace            │   │
│   │                    │     │  za minutu.             │   │
│   │                    │     │                         │   │
│   │                    │     │  Žádné psaní Wordů.     │   │
│   │                    │     │                         │   │
│   └────────────────────┘     └─────────────────────────┘   │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Vedlejší efekt strukturovaného BKB: protože diagram má jasnou strukturu a sémantiku, AI nástroj z něj dokáže automaticky vygenerovat srozumitelnou textovou dokumentaci. Žádné ruční psaní Wordů — BKB vstoupí do AI a za minutu existuje dokumentace, kterou může číst byznys i IT.

Tím se zároveň odpovídá na strach "nemáme na to lidi" — dokumentace nevzniká manuálně, ale automaticky z artefaktů, které už existují.

> "A pak jsme to BKB dali AI a za minutu jsme měli dokumentaci. Karel si říkal, jestli si děláme srandu."

**Vizuál:** Vlevo BKB diagram, vpravo AI-vygenerovaný textový dokument — reálné screenshoty z projektu.

---

### KAPITOLA 2: Od kanvasu ke smlouvě (15 min) — Lukáš → Michal → Roman

**Odpovídá na strach:** *Nikdo nebude zodpovědný*

BKB dal přehled o doméně a identifikoval kandidátní datové produkty. Teď je potřeba přejít od byznys obrazu k technickému designu — a od designu ke smlouvě, která jasně říká kdo vlastní co, co produkt obsahuje a jak se k němu připojit.

---

#### SLIDE 8 — Chapter divider
**Speaker:** Lukáš | **Čas:** 1:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                                                            │
│                         KAP. 2                             │
│                                                            │
│               OD KANVASU KE SMLOUVĚ                        │
│                                                            │
│                                                            │
│     ┌──────────┐          ┌──────────┐                     │
│     │ 📐 Canvas│  ─────►  │ 📜 .yml  │                     │
│     └──────────┘          └──────────┘                     │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

> "Máme obrázek. Máme oblasti. Ale jak z toho uděláme něco, co vývojář může vzít a postavit?"

**Lukáš předává Michalovi.**

---

#### SLIDE 9 — DP Canvas
**Speaker:** Michal | **Čas:** 4:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   DATA PRODUCT CANVAS                                      │
│                                                            │
│   ┌──────────────────────────────────────────────────┐     │
│   │                                                  │     │
│   │          [ SCREENSHOT: DP Canvas ]               │     │
│   │                                                  │     │
│   │   Analytický dokument na jednu flipchart         │     │
│   │   stránku — vše na jednom místě                  │     │
│   │                                                  │     │
│   └──────────────────────────────────────────────────┘     │
│                                                            │
│   Zdroje · Atributy · Glossary · Kvalita · Frekvence       │
│   Relační model · Sample data · Infrastruktura             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Data Product Canvas** je analytický dokument, který na jednu flipchart stránku shrnuje vše potřebné pro návrh datového produktu:

- **Zdrojová data** — odkud data pocházejí, jaké systémy je generují
- **Atributy a jejich význam** — co jednotlivé sloupce znamenají v byznys kontextu
- **Business Glossary mapping** — každý termín je namapovaný na definici v centrálním glossary
- **Kvalita dat** — známé problémy, pravidla čistoty, akceptační kritéria
- **Aktualizační frekvence** — jak často se data mění (denně, real-time, měsíčně)
- **Relační model** — jak spolu entity souvisí
- **Sample data** — ukázková data pro rychlou orientaci
- **Infrastruktura** — kde produkt poběží, jaké zdroje potřebuje

Canvas je záměrně vizuální a kompaktní — vzniká na workshopu, ne v dokumentu. Každý canvas má navíc mapping na **Business Glossary** a na **ontologii (FIBO)**, což zajišťuje konzistenci pojmů napříč doménami.

**Vizuál:** Reálný DP Canvas z Roamu — existují 3 varianty pro různé datové produkty.

---

#### SLIDE 10 — Business Glossary + Ontologie
**Speaker:** Michal | **Čas:** 3:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   SPOLEČNÝ JAZYK                                           │
│                                                            │
│   ┌─────────────────────┐   ┌─────────────────────────┐   │
│   │  BUSINESS GLOSSARY  │   │   ONTOLOGIE (FIBO)      │   │
│   │                     │   │                         │   │
│   │  "Co to slovo       │◄─►│  "Jak spolu věci       │   │
│   │   znamená?"         │   │   souvisí?"             │   │
│   │                     │   │                         │   │
│   │  [ screenshot ]     │   │  [ screenshot ]         │   │
│   │                     │   │                         │   │
│   └─────────────────────┘   └─────────────────────────┘   │
│                                                            │
│   Glossary + ontologie = základ, aby se domény rozuměly    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Aby decentralizované domény mohly spolupracovat, potřebují společný jazyk. Ten tvoří dvě vrstvy:

**Business Glossary** odpovídá na otázku *"Co to slovo znamená?"* Definuje byznys termíny jednoznačně — co přesně myslíme pod pojmem "klient", "kampaň", "expozice". Bez glossary si každá doména pod stejným slovem představí něco jiného.

**Ontologie (FIBO)** odpovídá na otázku *"Jak spolu věci souvisí?"* FIBO (Financial Industry Business Ontology) je mezinárodní standard, který definuje vztahy mezi koncepty ve finančním sektoru. Klient *má* smlouvu, smlouva *obsahuje* produkty, produkt *generuje* expozici.

**Klíčový princip: podmnožiny.** Každá nižší úroveň je podmnožinou vyšší. Nikdy si neprotiřečí — jen zpřesňuje:

```
FIBO (mezinárodní standard)
  └── RBCZ klient (celá banka)
        ├── MIB klient
        │     └── Investment klient
        │           └── Marketing Campaign Candidate
        └── Retail klient
```

Marketing Campaign Candidate ⊂ Investment ⊂ MIB ⊂ RBCZ ⊂ FIBO. Proto můžeš agregovat nahoru: sečti Marketing Campaign Candidates a dostaneš podmnožinu Investment klientů. Sečti Investment a Retail klienty a dostaneš RBCZ klienty. Matematicky čisté — a právě proto si domény neprotiřečí, i když každá definuje "svého" zákazníka po svém.

Tento princip se ukáže jako zásadní v Kapitole 4, kde Dušan z Retailu hledá "zákazníky Investic".

Společně tvoří základ, díky kterému si domény rozumí — i když pracují nezávisle na sobě.

**Vizuál:** Screenshot Business Glossary (tabulka termínů s definicemi) + diagram ontologie se subset hierarchií (FIBO → RBCZ → MIB → Investment → Marketing Campaign Candidate).

---

#### SLIDE 11 — Data Contract
**Speaker:** Michal | **Čas:** 3:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   DATA CONTRACT                                            │
│                                                            │
│   ┌──────────────────────────────────────────────────┐     │
│   │                                                  │     │
│   │   [ SCREENSHOT: .yml soubor na GitHubu ]         │     │
│   │                                                  │     │
│   │   owner: karel.cerny                             │     │
│   │   domain: investments                            │     │
│   │   product: marketing-campaign-candidates         │     │
│   │   ...                                            │     │
│   │                                                  │     │
│   └──────────────────────────────────────────────────┘     │
│                                                            │
│   Registrovaný v DPCC katalogu · Maturity score · Git      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Z DP Canvasu vzniká **Data Contract** — `.yml` soubor verzovaný na GitHubu. Contract píše ručně datový architekt (Michal) společně s vlastníkem produktu (Karel) — přepisují strukturu z Canvasu do YAML formátu, který je strojově čitelný a verzovatelný. Žádný automat, žádná magie — člověk sedí a píše smlouvu. Data Contract je formalizovaná smlouva mezi producentem a konzumentem dat. Obsahuje:

- **Vlastníka** (owner) — kdo za produkt odpovídá (Karel Černý)
- **Doménu a produkt** — kam produkt patří a jak se jmenuje
- **Schéma** — přesná struktura dat (sloupce, typy, popis)
- **SLA** — aktualizační frekvence, dostupnost, latence
- **Kvalitativní pravidla** — jaké kontroly data musí splnit

Každý Data Contract je registrovaný v **DPCC** (Data Product Catalog & Compliance) — centrálním katalogu, kde si konzument může najít existující produkty, přečíst jejich interface a zjistit, zda mu vyhovují.

Z kontraktu lze automaticky vygenerovat datový produkt přes šablony, nebo si nechat vytvořit sandbox s testovacími daty. Konzument se připojí, přečte interface, a přesune si data k sobě — za pět minut.

Maturity score je zatím malé (jsme na začátku), ale produkt je registrovaný jako kandidátní a prochází standardním procesem zrání.

**Vizuál:** Data Contract `.yml` soubor na GitHubu.

---

#### SLIDE 12 — DPCC katalog
**Speaker:** Michal | **Čas:** 3:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   DPCC — DATA PRODUCT CATALOG & COMPLIANCE                 │
│                                                            │
│   ┌──────────────────────────────────────────────────┐     │
│   │                                                  │     │
│   │   [ SCREENSHOT: DPCC katalog ]                   │     │
│   │                                                  │     │
│   │   Hledej produkt → Přečti contract →             │     │
│   │   → Připoj se → Použij data                      │     │
│   │                                                  │     │
│   │   Maturity: Candidate → Certified → Core         │     │
│   │                                                  │     │
│   └──────────────────────────────────────────────────┘     │
│                                                            │
│   AI self-service · Automatické generování · Sandbox       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**DPCC (Data Product Catalog & Compliance)** je centrální katalog všech datových produktů v bance. Je to místo, kde se producent a konzument potkávají — bez toho, aby se museli osobně znát.

**Co DPCC umožňuje:**
- **Vyhledávání** — konzument si najde existující datové produkty podle domény, názvu nebo obsahu
- **Prozkoumání** — ke každému produktu je přístupný Data Contract s kompletním popisem: schéma, vlastník, SLA, kvalitativní pravidla
- **AI self-service** — konzument může klást otázky v přirozeném jazyce ("jaká data o klientech Investic existují?") a DPCC AI mu odpoví na základě registrovaných contractů
- **Automatické generování** — z registrovaného contractu lze automaticky vygenerovat datový produkt přes šablony, nebo vytvořit sandbox s testovacími daty
- **Připojení** — konzument se připojí k produktu, přečte interface, přesune si data k sobě. Za pět minut.

**Maturity model** — každý datový produkt prochází fázemi zrání:
- **Candidate** — identifikovaný, ale ještě ne plně specifikovaný (Marketing Campaign Candidates je teď tady)
- **Certified** — plně specifikovaný, otestovaný, s produkčním SLA
- **Core** — strategický produkt, na kterém závisí klíčové procesy

DPCC je důvod, proč decentralizace neznamená fragmentaci. I když každá doména vlastní svá data, všechny produkty jsou viditelné na jednom místě se standardizovaným rozhraním.

**Vizuál:** Screenshot DPCC katalogu — seznam produktů, detail contractu, maturity score.

---

#### SLIDE 13 — Governance = Contract
**Speaker:** Roman | **Čas:** 3:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   KDO HLÍDÁ PRAVIDLA?                                      │
│                                                            │
│                                                            │
│              ╔══════════════════════╗                       │
│              ║   DATA CONTRACT      ║                       │
│              ║                      ║                       │
│              ║   = governance       ║                       │
│              ║                      ║                       │
│              ║   Ne proces.         ║                       │
│              ║   Smlouva jako kód.  ║                       │
│              ╚══════════════════════╝                       │
│                                                            │
│   Vlastník: Karel Černý                                    │
│   Odpovědnost: v kontraktu                                 │
│   Porušení: víš hned — a není to tvoje chyba               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Klasická governance funguje jako schvalovací proces — komise, review, razítka. V decentralizovaném modelu governance není proces, ale **smlouva jako kód**.

Data Contract JE governance. Obsahuje:
- **Kdo vlastní data** — Karel Černý, jasně zapsáno v kontraktu
- **Co data obsahují** — schéma, typy, byznys popis
- **Jaká pravidla musí splnit** — kvalitativní kontroly, SLA
- **Co se stane při porušení** — automatická detekce, notifikace vlastníka

Pokud zdrojová data kontrakt poruší, víš to okamžitě — pipeline spadne na kvalitativní kontrole. A hlavně: víš, že to není tvoje chyba. Odpovědnost je jednoznačně definována v kontraktu.

---

### KAPITOLA 3: Od kódu k produkci (15 min) — Lukáš → Evžen + Anita

**Odpovídá na strach:** *Data nejsou včas* + *Nemáme na to lidi*

Máme BKB (obraz byznysu), Canvas (analytický design), Contract (smlouvu). Teď je potřeba datový produkt skutečně postavit a dostat do produkčního prostředí. Tato kapitola ukazuje, jak enablement tým a automatizovaná platforma umožňují i týmu bez datových inženýrů dodat produkční datový produkt.

---

#### SLIDE 14 — Chapter divider
**Speaker:** Lukáš | **Čas:** 1:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                                                            │
│                         KAP. 3                             │
│                                                            │
│                OD KÓDU K PRODUKCI                          │
│                                                            │
│                                                            │
│     ┌──────────┐          ┌──────────┐                     │
│     │ 💻 Kód   │  ─────►  │ 🚀 PROD │                     │
│     └──────────┘          └──────────┘                     │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

> "Máme kontrakt. Máme design. Teď to musíme postavit a dostat do produkce."

**Lukáš předává Evženovi.**

---

#### SLIDE 15 — Solution Architecture
**Speaker:** Evžen | **Čas:** 4:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   SOLUTION ARCHITEKTURA DATOVÉHO PRODUKTU                  │
│                                                            │
│   ┌──────────────────────────────────────────────────┐     │
│   │                                                  │     │
│   │          [ SCREENSHOT: SA DP diagram ]            │     │
│   │                                                  │     │
│   │   Immutabilita · Bitemporalita                   │     │
│   │   Read-only · Multimodalita                      │     │
│   │                                                  │     │
│   └──────────────────────────────────────────────────┘     │
│                                                            │
│   DMT enablement tým dodal architekturu                    │
│   Datový produkt deployován v prostředí APEX               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

DMT (Data Management Team) dodal **solution architekturu** — standardizovaný design, jak datový produkt vypadá technicky. Klíčové architektonické vlastnosti:

- **Immutabilita** — jednou zapsaná data se nemění, nové verze se přidávají. Žádné přepisování historie.
- **Bitemporalita** — každý záznam má dvě časové osy: kdy událost nastala (business time) a kdy byla zaznamenána (system time). Umožňuje rekonstruovat stav dat k libovolnému okamžiku.
- **Read-only přístup** — konzument čte data, nikdy je nemění. Producent je jediný, kdo data zapisuje.
- **Multimodalita** — data jsou dostupná přes různé přístupy (SQL, API, soubory) podle potřeby konzumenta.

**Konkrétní příklad — proč bitemporalita:** Klient změní adresu 1. března. V klasickém mutable systému přepíšeš starou adresu novou — a stará zmizí. S bitemporalitou víš obojí: adresa platila od ledna do března (business time), a o změně ses dozvěděl 5. března (system time). Když se regulátor zeptá *"jaká data jste měli k 28. únoru?"* — umíš přesně odpovědět. Bez bitemporality ne.

**Streaming jako přirozený důsledek:** Immutabilita a bitemporalita nejsou jen architektonická rozhodnutí — jsou přirozeným důsledkem streamového přístupu k datům. Události přicházejí tak, jak nastávají: klient změnil adresu, vznikla nová smlouva, proběhla transakce. Nikdy nepřepisuješ, vždy jen připojuješ nový záznam s časovým razítkem. Streaming není pátý princip navíc — je to způsob, jakým se immutabilita a bitemporalita realizují v praxi.

Datový produkt byl vyroben a nasazen v prostředí **APEX** — bezpečnostní nástavbě nad Databricks, která řídí přístupy, šifrování a audit trail nad rámec toho, co Databricks poskytuje nativně.

**Vizuál:** DP Definition diagram + Solution Architecture diagram z Roamu — technické schéma vrstev datového produktu.

---

#### SLIDE 16 — CI/CD + Enablement
**Speaker:** Evžen | **Čas:** 5:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   "A KDE VEZMEME LIDI, CO TO POSTAVÍ?"                     │
│                                                            │
│   ┌─────────────────────────────────────────────────┐      │
│   │                                                 │      │
│   │   Enablement tým                                │      │
│   │   ═══════════════                               │      │
│   │                                                 │      │
│   │   ✓ Hotové šablony pro datové produkty          │      │
│   │   ✓ CI/CD pipeline (GitHub Actions)             │      │
│   │   ✓ Automatické nasazení do APEX                │      │
│   │   ✓ Sandbox s testovacími daty za 5 min         │      │
│   │                                                 │      │
│   │   Neřešíš JAK — řešíš CO.                       │      │
│   │                                                 │      │
│   └─────────────────────────────────────────────────┘      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Tady se explicitně odpovídá na strach "Nemáme na to lidi".**

Jelínek nemá v týmu datové inženýry. Ale nepotřebuje je. DMT funguje jako **enablement tým** — nepřebírá práci, ale dává ostatním nástroje, aby ji zvládli sami:

- **Hotové šablony** — standardizované struktury pro datové produkty, stačí vyplnit specifika
- **CI/CD pipeline** — automatizovaný workflow přes GitHub Actions: developer pushne kód, pipeline spustí testy, validace a nasazení
- **Automatické nasazení do APEX** — žádné ruční deployování, žádné tickety na operace
- **Sandbox za 5 minut** — z Data Contractu se automaticky vygeneruje testovací prostředí s ukázkovými daty

Princip je jednoduchý: **neřešíš JAK** (infrastrukturu, pipeline, deployment) — **řešíš CO** (byznys logiku svých dat). Enablement tým řeší JAK za tebe.

> "Jelínek nemá datové inženýry. Ale nepotřebuje je. Enablement tým dodá šablony, pipeline, sandbox. Tvůj kód se do APEXu dostane hladce a bezpečně. Neřešíš jak — řešíš co."

---

#### SLIDE 17 — Databricks + FinOps
**Speaker:** Anita | **Čas:** 5:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   PLATFORMA A NÁKLADY                                      │
│                                                            │
│   ┌──────────────────────┐  ┌─────────────────────────┐   │
│   │  DATABRICKS          │  │   FINOPS                │   │
│   │  Unity Catalog       │  │                         │   │
│   │                      │  │   [ dashboard ]         │   │
│   │  Konfigurace         │  │                         │   │
│   │  pro datové          │  │   Marek (vlastník       │   │
│   │  produkty            │  │   domény) vidí          │   │
│   │                      │  │   náklady per DP        │   │
│   └──────────────────────┘  └─────────────────────────┘   │
│                                                            │
│   Žádné překvapení na konci kvartálu.                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Datové produkty běží na platformě **Databricks** s **Unity Catalog** — centrálním katalogem, který řídí přístupy, verzování a metadata. Unity Catalog zajišťuje, že datový produkt je přístupný přes standardní rozhraní a že přístupy jsou řízeny podle politik.

Klíčový aspekt je **FinOps** — transparentní přehled nákladů. Cíl je reportovat náklady per datový produkt, ne per infrastrukturní komponenta. Vlastník domény (v tomto případě Marek jako vlastník nadřazené domény) přesně vidí, kolik ho jeho datové produkty stojí na compute, storage a přenosech.

Tím se mění dynamika: vlastník domény má motivaci optimalizovat, protože vidí přímý dopad na svůj rozpočet. Žádné překvapení na konci kvartálu.

**Vizuál:** Screenshot APEX serverů + FinOps dashboard s náklady per datový produkt.

---

### ☕ PAUZA (5 min)

V tuto chvíli je datový produkt Marketing Campaign Candidates v produkci. BKB zmapoval doménu, Canvas nadesignoval produkt, Contract formalizoval smlouvu, platforma nasadila kód. Všechno funguje.

Po pauze přichází moment, kdy se ukáže, zda celý systém vydrží střet s realitou — když se o produkt začne zajímat někdo z úplně jiné domény.

> **Cliffhanger před pauzou (Lukáš):**
> "Produkt je v produkci. Kontrakt podepsaný. Platforma běží. Všechno vypadá krásně.
> Po pauze uvidíte, co se stane, když přijde někdo z Retailu."

---

### KAPITOLA 4: Střet s realitou (10 min) — Lukáš → Dušan + Bára

**Odpovídá na strach:** *Bude chaos*

Toto je narativní twist celého příběhu. Vše dosud vypadalo hladce — od návrhu po produkci. Ale opravdový test decentralizace přichází ve chvíli, kdy datový produkt chce použít někdo, kdo nebyl u jeho vzniku. Dušan Psotný z Retailu přináší požadavek, který na první pohled odpovídá existujícímu produktu — ale ve skutečnosti ne.

---

#### SLIDE 18 — Chapter divider / Dušan přichází
**Speaker:** Lukáš | **Čas:** 1:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                                                            │
│                         KAP. 4                             │
│                                                            │
│                  STŘET S REALITOU                           │
│                                                            │
│                                                            │
│                                                            │
│               "A pak přijde Dušan Psotný                   │
│                       z Retailu."                          │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

> "Všechno vypadá krásně. A pak přijde Dušan Psotný z Retailu."

---

#### SLIDE 19 — Dušanův problém
**Speaker:** Lukáš (hraje Dušana) nebo Dušan live | **Čas:** 3:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   "CHCI VŠECHNY ZÁKAZNÍKY INVESTIC"                        │
│                                                            │
│                                                            │
│   Dušan čte Data Contract v DPCC:                          │
│                                                            │
│   ┌──────────────┐                                         │
│   │ DP_CUSTOMER  │  ← generický název                      │
│   └──────┬───────┘                                         │
│          │                                                 │
│          ▼                                                 │
│   "Ne. My potřebujeme VŠECHNY zákazníky Investic,          │
│    ne jen předvybrané pro kampaně."                         │
│                                                            │
│   Každý si pod DP_CUSTOMER představí něco jiného.          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Dušan Psotný pracuje v Retailu. Potřebuje data o zákaznících Investic pro své vlastní účely. Najde datový produkt v DPCC katalogu, přečte si Data Contract — a řekne: *"Ne. My potřebujeme VŠECHNY zákazníky Investic, ne jen předvybrané pro kampaně."*

Problém: kdyby se datový produkt jmenoval genericky `DP_CUSTOMER`, Dušan by předpokládal, že obsahuje všechny zákazníky. Stáhnul by si data, postavil na nich něco — a pak zjistil, že mu chybí 70 % klientů. Finance by udělaly totéž. Každý si pod `DP_CUSTOMER` představí něco jiného.

Toto je přesně ten scénář, kterého se lidé bojí při decentralizaci: chaos. Každý si dělá své produkty, nikdo neví co kde je, a všichni si kupují něco, co neodpovídá jejich představě.

---

#### SLIDE 20 — DPCC AI self-service
**Speaker:** Lukáš | **Čas:** 2:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   DPCC AI: "JAKÁ DATA O KLIENTECH INVESTIC EXISTUJÍ?"      │
│                                                            │
│   ┌──────────────────────────────────────────────────┐     │
│   │                                                  │     │
│   │   [ SCREENSHOT: DPCC AI self-service ]           │     │
│   │                                                  │     │
│   │   Otázka: "klienti Investic"                     │     │
│   │                                                  │     │
│   │   → Marketing Campaign Candidates  (MIB/CRM)    │     │
│   │     Scope: předvybraní pro kampaně               │     │
│   │     Owner: Karel Černý                           │     │
│   │                                                  │     │
│   │   → ⚠️ Žádný produkt "všichni klienti"           │     │
│   │     → Nový kandidát v BKB                        │     │
│   │                                                  │     │
│   └──────────────────────────────────────────────────┘     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Ale Dušan nemusí hádat. Otevře **DPCC AI self-service** a zeptá se přirozeným jazykem: *"Jaká data o klientech Investic existují?"*

AI mu odpoví na základě registrovaných Data Contractů: existuje produkt **Marketing Campaign Candidates** v subdoméně CRM, vlastník Karel Černý, scope: předvybraní klienti pro kampaně. Produkt "všichni klienti Investic" neexistuje.

Dušan okamžitě vidí:
- Co existuje a co ne
- Přesný scope každého produktu (díky pojmenování a Glossary)
- Kdo je vlastník, na koho se obrátit
- Že jeho požadavek je nový kandidát — ne rozšíření existujícího produktu

Bez DPCC AI by Dušan musel obvolávat kolegy, ptát se "kdo má data o klientech", dostávat protichůdné odpovědi. S DPCC AI má odpověď za 30 sekund.

**Vizuál:** Screenshot DPCC AI self-service — dotaz v přirozeném jazyce a strukturovaná odpověď s odkazy na contracty.

---

#### SLIDE 21 — Glossary chrání
**Speaker:** Lukáš | **Čas:** 3:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   PROČ JMÉNA ROZHODUJÍ                                     │
│                                                            │
│                                                            │
│     DP_CUSTOMER              Marketing Campaign            │
│     ═══════════              Candidates                    │
│                              ═════════════════             │
│     ❌ Generické             ✓ Přesné                      │
│     ❌ Každý si myslí        ✓ Říká co obsahuje            │
│        něco jiného           ✓ Říká co NEobsahuje          │
│     ❌ Scope creep           ✓ Chráníš kód                 │
│                                i architekturu              │
│                                                            │
│   Díky BKB a Glossary přesně víme,                         │
│   co produkt obsahuje a co ne.                             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Odpověď: právě proto existuje BKB a Business Glossary. Produkt se nejmenuje `DP_CUSTOMER` — jmenuje se **Marketing Campaign Candidates**. Název explicitně říká: toto jsou kandidáti na marketingové kampaně, ne všichni zákazníci Investic.

Vzpomeňte na subset princip z ontologie (slide 10): Marketing Campaign Candidate ⊂ Investment klient ⊂ MIB klient ⊂ RBCZ klient. Dušan v Retailu má svou definici zákazníka — Retail klient. Obě definice jsou legitimní, obě jsou podmnožiny RBCZ klienta. Neprotiřečí si — jen pokrývají jiný výřez reality. Ontologie umožňuje domluvit se na společné definici na úrovni celé RBCZ, aniž by kdokoliv musel měnit svou.

Dušanův požadavek se proto nestane rozšířením existujícího produktu, ale **novým kandidátem v BKB** — tentokrát v subdoméně Retail. Za měsíc má první Canvas, za dva vlastní Data Contract. Systém funguje.

Tím se chrání čistota kódu, architektury i zodpovědnosti. BKB a Glossary fungují jako ochranný štít proti scope creepu.

---

#### SLIDE 22 — Data Quality
**Speaker:** Bára | **Čas:** 3:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   KVALITA DAT V PIPELINE                                   │
│                                                            │
│                                                            │
│   ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐            │
│   │ Data │───►│  DQ  │───►│Build │───►│Publish│            │
│   │source│    │checks│    │  DP  │    │      │            │
│   └──────┘    └──┬───┘    └──────┘    └──────┘            │
│                  │                                         │
│                  ▼                                         │
│            ❌ Fail = stop                                   │
│            Vlastník notifikován                            │
│                                                            │
│   Ne ruční review.                                         │
│   Automatické kontroly při každém publishu.                │
│   Vlastník dat = zodpovědný za kvalitu svých dat.          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Dušanův případ ukazuje důležitost scope. Ale co kvalita dat uvnitř toho scope? Jak konzument pozná, že data v produktu jsou spolehlivá?

Odpověď: **Data Quality kontroly jsou součástí pipeline**, ne samostatný manuální proces. Při každém publishu datového produktu proběhnou automatické kontroly definované v Data Contractu:

- Validace datových typů a formátů
- Kontrola completeness (chybějící hodnoty)
- Business pravidla (např. "expozice nesmí být záporná")
- Referenční integrita mezi entitami

Pokud kontrola selže, pipeline se zastaví a vlastník je notifikován. Konzument nikdy nedostane data, která nesplnila kvalitativní pravidla.

Princip: **vlastník dat = zodpovědný za kvalitu svých dat**. Není to QA tým, není to governance komise — je to Karel Černý, jehož jméno stojí v kontraktu.

---

### CLOSING (12 min) — Lukáš + Marek Boháč

Příběh jednoho projektu je u konce. Ale Tomášova doména není jediná — v bance běží desítky podobných iniciativ. Closing ukazuje, jak se celý přístup škáluje, a vrací se k pěti strachům z Den 1 s konkrétními odpověďmi.

---

#### SLIDE 23 — 12 projektů → Kanban
**Speaker:** Marek Boháč | **Čas:** 4:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   JEDEN PROJEKT? ZVLÁDNUTELNÉ.                             │
│   ALE BĚŽÍ JICH 12.                                        │
│                                                            │
│   ┌──────────────────────────────────────────────────┐     │
│   │  KANBAN                                          │     │
│   │                                                  │     │
│   │  Backlog │ Analysis │ Build │ Deploy │ Done       │     │
│   │  ────────┼──────────┼───────┼────────┼──────     │     │
│   │  ██      │ ██  ██   │ ██    │ ██     │ ██ ██     │     │
│   │  ██      │ ██       │ ██    │        │ ██ ██     │     │
│   │          │          │       │        │ ██        │     │
│   │                                                  │     │
│   │  12 projektů · 1 tým · disciplína + transparence │     │
│   └──────────────────────────────────────────────────┘     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

> "Jeden projekt? Zvládnutelné. Ale Tomášova doména není jediná. Běží 12 projektů paralelně. Nad jedním týmem."

Marek Boháč řídí realizaci datových produktů napříč doménami. V jednu chvíli běží **12 paralelních projektů** nad jedním realizačním týmem. Bez řídicího nástroje by to byl chaos — přesně ten strach z Den 1.

A tady je celkový obraz: v RBCZ je dnes **79 datových produktů** v 7 subdoménách. 68 kandidátních, 5 ve vývoji, **6 v produkci**. MIB vede s 5 produkty v produkci. Retail startuje s 10 produkty, 2 ve vývoji. Finance má první produkt v produkci. Příběh, který jste právě viděli, se opakuje napříč celou bankou.

Řešení: společný **Kanban board** s jasně definovanými fázemi (Backlog → Analysis → Build → Deploy → Done). Každý projekt je karta, každá karta má vlastníka, termín a stav. Pravidla:

- **WIP limit** — maximální počet projektů v jedné fázi, aby se tým nepřetěžoval
- **Transparence** — každý vidí, co kde je, kdo na čem pracuje
- **Disciplína** — pravidelné standupy, aktualizace stavů, eskalace blokerů

Výsledek: kontrola bez micro managementu. Marek nemusí chodit za každým a ptát se "jak jsi daleko" — stačí se podívat na board.

---

#### SLIDE 24 — 5 strachů → 5 odpovědí
**Speaker:** Lukáš | **Čas:** 3:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   5 STRACHŮ → 5 ODPOVĚDÍ                                  │
│                                                            │
│                                                            │
│   Rozdělíme a nedáme     →   BKB + ontologie drží celek   │
│   dohromady                                                │
│                                                            │
│   Nikdo nebude           →   Karel Černý. Data Contract.   │
│   zodpovědný                 GitHub.                       │
│                                                            │
│   Data nejsou včas       →   CI/CD. APEX. Databricks.     │
│                                                            │
│   Nemáme na to lidi      →   Enablement tým. Šablony.     │
│                              Sandbox za 5 min.             │
│                                                            │
│   Bude chaos             →   Glossary chrání scope.        │
│                              Kanban řídí 12 projektů.      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Návrat k pěti strachům z Den 1 — tentokrát s konkrétními odpověďmi z příběhu, který právě viděli:

| Strach | Odpověď |
|--------|---------|
| Rozdělíme a nedáme dohromady | BKB mapuje celou doménu. Ontologie a glossary drží společný jazyk napříč doménami. |
| Nikdo nebude zodpovědný | Karel Černý je vlastník. Data Contract na GitHubu definuje odpovědnost jako kód. |
| Data nejsou včas | CI/CD pipeline automatizuje nasazení. APEX a Databricks zajišťují produkční provoz. |
| Nemáme na to lidi | Enablement tým dodá šablony a pipeline. Sandbox za 5 minut. Neřešíš JAK, řešíš CO. |
| Bude chaos | Business Glossary chrání scope. Kanban řídí 12 projektů nad jedním týmem. |

> "Viděli jste jeden příběh. Od Tomášovy potřeby přes BKB, kanvas, kontrakt, platformu, střet s realitou, až po řízení dvanácti projektů.
> Pět strachů. Pět odpovědí. Všechny z jednoho příběhu."

---

#### SLIDE 25 — Core message
**Speaker:** Lukáš | **Čas:** 2:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│            DECENTRALIZACE NENÍ CHAOS.                       │
│                                                            │
│            JE TO JINÝ ŘÁD.                                 │
│                                                            │
│            A VY JSTE JEHO SOUČÁSTÍ.                         │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Hlavní myšlenka celého dvoudenního cyklu. Den 1 ji vyslovil jako teorii. Den 2 ji dokázal na konkrétním příběhu.

Decentralizace dat není absence řádu — je to jiný typ řádu. Místo jednoho centrálního týmu, který dělá vše, má každá doména odpovědnost za svá data, společné nástroje a jazyk, a transparentní řízení.

> "Decentralizace není chaos. Je to jiný řád. A vy jste jeho součástí.
> Minule jsem to řekl jako teorii. Dnes jste viděli důkaz."

---

#### SLIDE 26 — Q&A
**Speaker:** Lukáš + všichni | **Čas:** 7:00

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                       OTÁZKY?                              │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Otázky z publika a chatu. Speakeři odpovídají na otázky ke svým kapitolám — Lukáš na BKB, Michal na Canvas/Contract, Roman na governance, Evžen na platformu, Anita na FinOps, Bára na kvalitu, Marek na řízení.

---

## TIMING SUMMARY

| # | Slide(s) | Kapitola | Speaker(s) | Čas |
|---|----------|----------|------------|-----|
| 0 | 1-3 | Opening: Recap + Tomášův problém | Lukáš | 5 min |
| 1 | 4-7 | Od obrázku k architektuře (BKB) | Lukáš | 12 min |
| 2 | 8-13 | Od kanvasu ke smlouvě + DPCC + governance | Lukáš → Michal → Roman | 16 min |
| 3 | 14-17 | Od kódu k produkci + enablement | Lukáš → Evžen + Anita | 15 min |
| — | — | ☕ Pauza (cliffhanger) | — | 5 min |
| 4 | 18-22 | Střet s realitou + DPCC AI + kvalita | Lukáš → (Dušan) + Bára | 12 min |
| C | 23-26 | Closing: Kanban + 5→5 + Core + Q&A | Lukáš + Marek + všichni | 10+ min |
| | | **CELKEM** | | **~82 min + 5 pauza + 3 Q&A = 90 min** |

---

## SPEAKER ROLES

| Speaker | Kde | Role | Čas |
|---------|-----|------|-----|
| **Lukáš** | Všude | Průvodce příběhem, přechody, kontext + BKB (za Soňu) | ~30 min |
| ~~Soňa~~ | ~~Kap. 1~~ | ~~BKB — obrázek byznysu~~ | ~~nepřítomna, Lukáš přebírá~~ |
| **Michal** | Kap. 2 | DP Canvas, Data Contract, AI/self-service | ~10 min |
| **Roman** | Kap. 2 | Governance — smlouva jako kód | ~4 min |
| **Evžen** | Kap. 3 | CI/CD, APEX deployment, solution architektura | ~8 min |
| **Anita** | Kap. 3 | Databricks, FinOps | ~5 min |
| **Bára** | Kap. 4 | Data quality v pipeline | ~3 min |
| **Dušan** | Kap. 4 | "Chci všechny zákazníky" (live nebo Lukáš hraje) | ~3 min |
| **Marek Boháč** | Closing | Kanban, řízení 12 projektů | ~4 min |

---

## VISUAL ASSETS NEEDED

| Slide | Vizuál | Zdroj |
|-------|--------|-------|
| 5 | BKB diagram | Roam — BKB image |
| 6 | Kandidátní oblasti (3 DP) | Roam — Marketing, Agreement, Exposition |
| 7 | AI-generated summary | Roam — AI screenshot |
| 9 | DP Canvas (3 varianty) | Roam — Canvas images |
| 10 | Business Glossary | Roam — Glossary image |
| 10 | Ontologie diagram | Roam — FIBO/ontologie |
| 11 | Data Contract na GitHubu | Roam — GitHub screenshot |
| 12 | DPCC katalog (seznam produktů, maturity) | Roam — DPCC screenshot |
| 15 | Solution Architecture | Roam — SA DP image |
| 15 | APEX servery | Roam — Servers image |
| 17 | FinOps dashboard | Roam — BDomain FinOps |
| 19 | Data Contract (Dušanův pohled) | Roam — Contract screenshot |
| 20 | DPCC AI self-service (dotaz + odpověď) | Roam — DPCC AI ukázka |

---

## RISKS

1. **Technická hloubka** — Data Contract YAML, CI/CD pipeline mohou být pro neIT publikum těžké. Lukáš musí překládat.
2. **Bára/DQI** — zatím nemá konkrétní příklad z tohoto projektu. Může mluvit obecněji o DQ v pipeline.
3. **Dušan** — ideálně live vstup (autentičtější), ale musí být připravený a odsouhlasený.
4. **Tempo** — 15 min na kapitolu je dost, nesmí se zaseknout na detailech. Lukáš řídí tempo.
5. **Obrazový materiál** — hodně screenshotů z Roamu. Potřeba ověřit čitelnost na projektoru.
