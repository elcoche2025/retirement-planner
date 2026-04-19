# Fix Double-Counted Housing in Expense Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the simulation engine from double-counting housing in `totalExpenses`, replace the hardcoded $6,500 magic number with researched per-destination essentials figures, and add regression tests so this can't silently drift again.

**Architecture:** Rename `CostOfLiving.monthlyBaseline` → `monthlyEssentials` to make its semantic explicit ("groceries + utilities + transit + household + activities + clothing — *not* housing, *not* health insurance, *not* tuition"). Update `simulate.ts` and `CalculationBreakdown.tsx` to read `destination.costOfLiving.monthlyEssentials` directly (no `× 6500 × colMultiplier`). Backfill all 13 destination files with researched USD/month values for a family of 3 (two adults + young child). Drop the now-redundant `costMultiplierVsDC` field — each destination carries an absolute value derived from real research, so the multiplier adds no signal. Add tests asserting (a) DC year-1 `totalExpenses` lands within the realistic band Mekoce actually spends, and (b) the engine reads the per-destination field, not a hardcoded constant.

**Tech Stack:** TypeScript, Vite, Vitest. No new deps.

---

## File Structure

**Modified:**
- `src/types/index.ts` — rename `monthlyBaseline` → `monthlyEssentials`, drop `costMultiplierVsDC`, add JSDoc
- `src/engine/simulate.ts:83` — read field, drop hardcoded 6500 and `× colMultiplier`
- `src/components/CalculationBreakdown.tsx:57,189` — same change + update displayed formula text
- `src/data/destinations/*.ts` (13 files) — update `monthlyBaseline` → `monthlyEssentials` with researched values, drop `costMultiplierVsDC`, refresh notes
- `src/engine/simulate.test.ts` — add regression test for DC year-1 expense composition

**No new files.**

---

## Researched Per-Destination Values (USD/mo, family of 3)

This is the data table the destination-update tasks will use. All figures from research dispatched 2026-04-18 — sources are catalogued in the agent transcripts; the high-level rationale per destination lives in the destination file `costOfLiving.notes`.

**Organic / non-GMO food premium baked in.** The household eats organic / non-GMO by preference. Each destination's essentials figure is bumped above the generic-research baseline to reflect this, with the bump sized by the *delta between local conventional food quality and US-organic equivalent*:

- **US:** organic premium ~25–35% on the grocery line → ~+$300/mo bump.
- **EU (NL, Spain):** small bump (~+$50–100/mo). EU bans most GMO cultivation, restricts glyphosate, prohibits ractopamine/chlorine washes, requires GMO labeling. EU "conventional" already meets a meaningfully higher floor than US conventional, so the upcharge for the bio/eco label is smaller and less necessary.
- **Mexico / Colombia / Uruguay:** larger bump (~+$200–300/mo). GMO corn is permitted in Colombia; conventional supply chains use chemicals US-organic households would avoid; organic = specialty/import stores (La Comer Premium, Carulla Wong, La Tienda Inglesa) at heavy markup. Oaxaca has good local organic markets (Pochote) so its bump is smaller.
- **Kenya:** moderate bump (~+$200/mo). Westlands/Karen have organic shops and Karen-area farms; imported organic dairy and grocery items carry high import duties.

| Destination | OLD `monthlyBaseline` | Generic-research essentials | **NEW `monthlyEssentials` (organic-adjusted)** | Organic uplift |
|---|---|---|---|---|
| dc-baseline | 7500 | $3,400 | **3700** | +$300 (US organic premium) |
| nl-amsterdam | 6500 | $2,800 | **2900** | +$100 (EU baseline already cleaner) |
| nl-the-hague | 5500 | $2,300 | **2400** | +$100 (EU) |
| spain-madrid | 4200 | $2,480 | **2580** | +$100 (EU) |
| spain-barcelona | 4500 | $2,350 | **2450** | +$100 (EU) |
| spain-valencia | 3500 | $1,950 | **2050** | +$100 (EU) |
| spain-bilbao | 3800 | $2,050 | **2150** | +$100 (EU) |
| mexico-cdmx | 3200 | $3,000 | **3300** | +$300 (import-heavy organic premium) |
| mexico-oaxaca | 2200 | $2,000 | **2200** | +$200 (Pochote market helps; some imports) |
| colombia-medellin | 2500 | $1,900 | **2150** | +$250 (Carulla Wong / Éxito premium) |
| kenya-nairobi | 3500 | $1,750 | **1950** | +$200 (Karen organic + import duty drag) |
| uruguay-montevideo | 3500 | $2,450 | **2700** | +$250 (La Tienda Inglesa premium, conventional ag is chemical-heavy) |

Where research suggested the existing `healthInsuranceMonthly` or `internationalSchoolAnnual` values are materially off, those updates are also captured in the per-destination tasks below.

---

## Task 1: Rename type field and drop multiplier

**Files:**
- Modify: `src/types/index.ts:53-60`

- [ ] **Step 1: Update the `CostOfLiving` interface**

Replace lines 53-60 of `src/types/index.ts` with:

```typescript
export interface CostOfLiving {
  /**
   * Day-to-day essentials for a family of 3 (two adults + young child), in USD/mo.
   * INCLUDES: groceries, utilities (electric/gas/water/internet/mobile), local transit,
   *           household goods, modest dining out, kid activities, clothing, personal care.
   * EXCLUDES: rent/mortgage, health insurance, school/childcare tuition.
   * These three are modeled as separate line items so they can vary by housing decision,
   * insurance choice, and child age. See plan 2026-04-18-fix-double-counted-housing.md.
   */
  monthlyEssentials: number;
  /** Comfortable lifestyle figure for the same scope as monthlyEssentials. Display-only. */
  monthlyComfortable: number;
  internationalSchoolAnnual: number;
  healthInsuranceMonthly: number;
  notes: string[];
}
```

(Note: `costMultiplierVsDC` is dropped. `monthlyBaseline` is renamed to `monthlyEssentials`.)

- [ ] **Step 2: Run typecheck — expect failures everywhere the renamed/dropped fields are used**

Run: `cd retirement-planner && npx tsc --noEmit 2>&1 | head -60`
Expected: errors in `simulate.ts`, `CalculationBreakdown.tsx`, and all 13 destination files referring to `monthlyBaseline` and `costMultiplierVsDC`. This proves the rename caught everything.

- [ ] **Step 3: Commit the type change**

```bash
cd retirement-planner
git add src/types/index.ts
git commit -m "refactor(types): rename monthlyBaseline to monthlyEssentials, drop costMultiplierVsDC

monthlyBaseline was ambiguous — the engine treated it as 'everything else'
while data files described it as 'all-in including housing'. Renaming makes
the contract explicit. costMultiplierVsDC was only used to scale a hardcoded
\$6,500 baseline; with per-destination absolute essentials values it is dead.

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 2: Update the simulation engine

**Files:**
- Modify: `src/engine/simulate.ts:80-91`

- [ ] **Step 1: Replace the expense block in `simulate.ts`**

Find lines 80-91 in `src/engine/simulate.ts`:

```typescript
    // Apply inflation compounding to all expenses (year-over-year)
    const inflationMultiplier = Math.pow(1 + inflationRate, y);

    const colMultiplier = activeDest.costOfLiving.costMultiplierVsDC;
    const livingExpenses = 6500 * 12 * colMultiplier * inflationMultiplier;
    // Mortgage is fixed (locked rate), but rent inflates
    const housingCost = activeDest.id === 'dc-baseline'
      ? globals.monthlyMortgage * 12  // fixed mortgage — no inflation
      : activeDest.housing.rentMonthly3BR * 12 * inflationMultiplier;
    const daughterAgeThisYear = (globals.daughterAge ?? 3) + y;
    const schooling = getEducationCost(activeDest, activeCareer, daughterAgeThisYear) * inflationMultiplier;
    const healthInsurance = activeDest.costOfLiving.healthInsuranceMonthly * 12 * inflationMultiplier;
    const totalExpenses = livingExpenses + housingCost + schooling + healthInsurance;
```

Replace with:

```typescript
    // Apply inflation compounding to all expenses (year-over-year)
    const inflationMultiplier = Math.pow(1 + inflationRate, y);

    // Essentials = groceries, utilities, transit, household, activities, clothing.
    // Housing, health insurance, schooling are tracked as separate line items.
    const livingExpenses = activeDest.costOfLiving.monthlyEssentials * 12 * inflationMultiplier;
    // Mortgage is fixed (locked rate), but rent inflates
    const housingCost = activeDest.id === 'dc-baseline'
      ? globals.monthlyMortgage * 12  // fixed mortgage — no inflation
      : activeDest.housing.rentMonthly3BR * 12 * inflationMultiplier;
    const daughterAgeThisYear = (globals.daughterAge ?? 3) + y;
    const schooling = getEducationCost(activeDest, activeCareer, daughterAgeThisYear) * inflationMultiplier;
    const healthInsurance = activeDest.costOfLiving.healthInsuranceMonthly * 12 * inflationMultiplier;
    const totalExpenses = livingExpenses + housingCost + schooling + healthInsurance;
```

- [ ] **Step 2: Verify typecheck passes for simulate.ts**

Run: `cd retirement-planner && npx tsc --noEmit src/engine/simulate.ts 2>&1 | grep -i simulate.ts || echo "simulate.ts clean"`
Expected: `simulate.ts clean` (other files still error — that's fine until Tasks 3+ run).

- [ ] **Step 3: Commit the engine change**

```bash
cd retirement-planner
git add src/engine/simulate.ts
git commit -m "fix(engine): use destination.monthlyEssentials, drop hardcoded \$6,500 × colMultiplier

The hardcoded \$6,500 was a stale magic number from the original implementation
plan that never tracked the actual per-destination data. This change makes the
engine read each destination's researched essentials figure directly.

Pairs with destination data updates in subsequent commits.

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 3: Update the CalculationBreakdown UI

**Files:**
- Modify: `src/components/CalculationBreakdown.tsx:55-62, 187-191`

- [ ] **Step 1: Replace the expense-block computation (lines 55-62)**

Find:

```typescript
  // Expense breakdown
  const colMultiplier = activeDest.costOfLiving.costMultiplierVsDC;
  const baseLiving = 6500 * 12 * colMultiplier;
  const baseHousing = activeDest.id === 'dc-baseline'
    ? globals.monthlyMortgage * 12
    : activeDest.housing.rentMonthly3BR * 12;
  const baseSchooling = getEducationCost(activeDest, activeCareer, daughterAge);
  const baseHealthIns = activeDest.costOfLiving.healthInsuranceMonthly * 12;
```

Replace with:

```typescript
  // Expense breakdown
  const monthlyEssentials = activeDest.costOfLiving.monthlyEssentials;
  const baseLiving = monthlyEssentials * 12;
  const baseHousing = activeDest.id === 'dc-baseline'
    ? globals.monthlyMortgage * 12
    : activeDest.housing.rentMonthly3BR * 12;
  const baseSchooling = getEducationCost(activeDest, activeCareer, daughterAge);
  const baseHealthIns = activeDest.costOfLiving.healthInsuranceMonthly * 12;
```

(Note: `baseLiving` is no longer used in the JSX below — it was only used in inline math display. We're keeping it computed in case future panels reference it; if a typecheck flags it as unused, delete the assignment.)

- [ ] **Step 2: Replace the displayed expense formula (lines 187-191)**

Find:

```tsx
      <div className="calc-section">
        <div className="calc-section-title">Expenses (inflating at {globals.inflationRate}%/yr — year {yearIndex} multiplier: {inflationMultiplier.toFixed(3)})</div>
        <div className="calc-row">
          <span>Living: $6,500/mo × {colMultiplier.toFixed(2)} COL × 12 × {inflationMultiplier.toFixed(3)}</span>
          <span className="mono text-negative">−{$(year.livingExpenses)}</span>
        </div>
```

Replace with:

```tsx
      <div className="calc-section">
        <div className="calc-section-title">Expenses (inflating at {globals.inflationRate}%/yr — year {yearIndex} multiplier: {inflationMultiplier.toFixed(3)})</div>
        <div className="calc-row">
          <span>Essentials (groceries, utilities, transit, household, activities): ${monthlyEssentials.toLocaleString()}/mo × 12 × {inflationMultiplier.toFixed(3)}</span>
          <span className="mono text-negative">−{$(year.livingExpenses)}</span>
        </div>
```

- [ ] **Step 3: If `baseLiving` is now unused, drop it**

Run: `cd retirement-planner && npx tsc --noEmit 2>&1 | grep CalculationBreakdown`

If it complains about `baseLiving` being unused, delete the line `const baseLiving = monthlyEssentials * 12;` and any other unused locals. Otherwise leave it.

- [ ] **Step 4: Commit**

```bash
cd retirement-planner
git add src/components/CalculationBreakdown.tsx
git commit -m "fix(ui): show per-destination essentials in calculation breakdown

The displayed formula was \"\$6,500/mo × 0.88 COL × 12 × 1.030\" — confusing
and based on a stale constant. Now it shows the destination's actual
essentials figure with a one-line gloss explaining what 'essentials' covers.

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 4: Update DC baseline destination

**Files:**
- Modify: `src/data/destinations/dc-baseline.ts:16-27`

- [ ] **Step 1: Replace the `costOfLiving` block**

Find lines 16-27:

```typescript
  costOfLiving: {
    monthlyBaseline: 7500,
    monthlyComfortable: 10500,
    internationalSchoolAnnual: 0,
    healthInsuranceMonthly: 600,
    costMultiplierVsDC: 1.0,
    notes: [
      'Public school for daughter (no tuition)',
      'Employer-subsidized family health plan',
      'High baseline driven by housing, childcare, and transportation',
    ],
  },
```

Replace with:

```typescript
  costOfLiving: {
    monthlyEssentials: 3700,
    monthlyComfortable: 4900,
    internationalSchoolAnnual: 0,
    healthInsuranceMonthly: 570,
    notes: [
      'Essentials = groceries (~$1,250 organic-leaning) + utilities (~$410) + Metro/rideshare (~$300) + dining (~$400) + kid activities (~$300) + household & personal care (~$450) + buffer.',
      'Organic/non-GMO premium: ~25\u201335% bump on grocery line (~+$300/mo vs conventional). Household preference.',
      'Mortgage is tracked separately via globals.monthlyMortgage (~$4,600/mo).',
      'Health insurance: KFF 2025 family-coverage employee share (~$571/mo at ~26% of $26,993 total).',
      'Public school for daughter (no tuition); childcare for under-5 tracked via childcareMonthly.',
      'Sources: CityCost.org, BLS CEX, KFF 2025 Employer Benefits, WMATA, Pepco rate updates.',
    ],
  },
```

- [ ] **Step 2: Run typecheck — expect this file to be clean**

Run: `cd retirement-planner && npx tsc --noEmit 2>&1 | grep dc-baseline.ts || echo "dc-baseline clean"`
Expected: `dc-baseline clean`.

- [ ] **Step 3: Commit**

```bash
cd retirement-planner
git add src/data/destinations/dc-baseline.ts
git commit -m "data(dc): set monthlyEssentials=\$3,700 (organic-adjusted) from research

Was \$7,500 monthlyBaseline (all-in); engine treated as 'essentials only',
so housing was double-counted. Now \$3,700 covers groceries (organic-leaning,
+\$300 vs conventional), utilities,
transit, household, dining, kid activities, clothing — housing tracked
separately via globals.monthlyMortgage. Health insurance updated to
\$570/mo per KFF 2025 employer-family employee share.

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 5: Update Amsterdam destination

**Files:**
- Modify: `src/data/destinations/nl-amsterdam.ts:16-28`

- [ ] **Step 1: Replace the `costOfLiving` block**

Find:

```typescript
  costOfLiving: {
    monthlyBaseline: 6500,
    monthlyComfortable: 9000,
    internationalSchoolAnnual: 23000,
    healthInsuranceMonthly: 425,
    costMultiplierVsDC: 0.88,
    notes: [
      'International schools $18K-$28K/yr',
      'Mandatory health insurance: basic ~\u20AC120/person + supplemental',
      'Housing costs approaching DC levels',
      'Nearly as expensive as DC overall',
    ],
  },
```

Replace with:

```typescript
  costOfLiving: {
    monthlyEssentials: 2900,
    monthlyComfortable: 3900,
    internationalSchoolAnnual: 24000,
    healthInsuranceMonthly: 425,
    notes: [
      'Essentials (~\u20AC2,660/mo) = groceries (~\u20AC500 with light bio-label premium) + utilities/internet/mobile (~\u20AC350) + 2 OV-chipkaart + bike (~\u20AC220) + household (~\u20AC150) + dining (~\u20AC200) + kid extras (~\u20AC150) + clothing/personal (~\u20AC150).',
      'Organic/non-GMO premium: only ~+$100/mo bump. EU bans most GMO cultivation, restricts glyphosate, prohibits ractopamine \u2014 conventional EU food already meets a higher floor than US conventional, so the bio/eco upcharge is smaller.',
      'Rent tracked separately via housing.rentMonthly3BR; AMS 3BR clusters \u20AC3,200\u20134,200/mo in family neighborhoods.',
      'Health insurance: \u20AC159/adult basic in 2026 + supplemental, kids under 18 free \u2192 ~\u20AC380\u2013420/mo for two adults.',
      'International school: ISA Pre-K \u20AC23,915/yr, K \u20AC24,285/yr, G1\u20135 \u20AC26,645/yr (2025\u201326).',
      'Sources: Numbeo Apr 2026, IamExpat 2026 health premiums, ISA fees page.',
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
cd retirement-planner
git add src/data/destinations/nl-amsterdam.ts
git commit -m "data(amsterdam): essentials=\$2,900 (organic-adjusted), school=\$24K

Was \$6,500 (double-counted housing). Real day-to-day burn for a family of
3 in Amsterdam (excluding rent, health, school) is ~€2,500\u20132,900 with
small organic uplift (EU baseline already excludes most things US-organic
buyers care about). School bumped from \$23K to \$24K to match ISA 2025\u201326.

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 6: Update The Hague destination

**Files:**
- Modify: `src/data/destinations/nl-the-hague.ts` (find the `costOfLiving` block)

- [ ] **Step 1: Read the file to confirm current state**

Run: `cd retirement-planner && grep -n -A 12 "costOfLiving:" src/data/destinations/nl-the-hague.ts`

Confirm current values: `monthlyBaseline: 5500`, `monthlyComfortable: 7500`, `internationalSchoolAnnual: 21500`, `healthInsuranceMonthly: 425`, `costMultiplierVsDC: 0.75`.

- [ ] **Step 2: Replace the block**

Replace the `costOfLiving` object with:

```typescript
  costOfLiving: {
    monthlyEssentials: 2400,
    monthlyComfortable: 3300,
    internationalSchoolAnnual: 22000,
    healthInsuranceMonthly: 420,
    notes: [
      'Essentials (~\u20AC2,200/mo) = groceries (~\u20AC500 with light bio premium) + utilities (~\u20AC257) + 2 OV-chipkaart + bike (~\u20AC240) + household (~\u20AC130) + dining (~\u20AC180) + kid extras (~\u20AC120) + clothing/personal (~\u20AC130). About 5\u201310% cheaper than Amsterdam day-to-day.',
      'Organic/non-GMO premium: only ~+$100/mo bump (same EU regulatory baseline as Amsterdam).',
      'Rent tracked separately via housing.rentMonthly3BR; The Hague 3BR runs \u20AC2,400\u20133,200/mo in expat-preferred zones (Statenkwartier, Benoordenhout).',
      'Health insurance: same Dutch national system as Amsterdam (~\u20AC380\u2013420/mo two adults + free kids).',
      'International school: ASH Pre-K \u20AC20,325/yr, K\u2013G4 \u20AC23,910/yr (2026\u201327). British School / ISH similar range.',
      'Sources: Numbeo Apr 2026, IamExpat 2026 health premiums, ASH fees page.',
    ],
  },
```

- [ ] **Step 3: Commit**

```bash
cd retirement-planner
git add src/data/destinations/nl-the-hague.ts
git commit -m "data(the-hague): essentials=\$2,400 (organic-adjusted), school=\$22K

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 7: Update Madrid destination

**Files:**
- Modify: `src/data/destinations/spain-madrid.ts` (the `costOfLiving` block)

- [ ] **Step 1: Replace the `costOfLiving` block**

Replace the existing block (currently `monthlyBaseline: 4200`, `internationalSchoolAnnual: 11500`, `healthInsuranceMonthly: 275`, `costMultiplierVsDC: 0.57`) with:

```typescript
  costOfLiving: {
    monthlyEssentials: 2580,
    monthlyComfortable: 3500,
    internationalSchoolAnnual: 13000,
    healthInsuranceMonthly: 200,
    notes: [
      'Essentials (~\u20AC2,365/mo) = groceries (~\u20AC735 with light bio premium) + utilities (~\u20AC177) + internet/mobile (~\u20AC46) + Metro pass (~\u20AC35) + household (~\u20AC150) + dining (~\u20AC250) + kid extras (~\u20AC180) + clothing/personal (~\u20AC150). Madrid Metro is unusually cheap due to subsidized passes.',
      'Organic/non-GMO premium: only ~+$100/mo bump (EU regulatory baseline already cleaner than US conventional).',
      'Rent tracked separately via housing.rentMonthly3BR; Chamber\u00ed/Chamart\u00edn 3BR runs \u20AC2,800\u20133,500/mo.',
      'Family private health insurance (Sanitas/Adeslas) \u20AC150\u2013220/mo for couple + child on mid-tier plan.',
      'International school: ASM K1\u2013K3 \u20AC11,593\u201312,050/yr; G1\u20132 \u20AC16,267/yr; G3\u20134 \u20AC18,263/yr.',
      'Sources: Numbeo Apr 2026, ASM fees page, Sanitas/Adeslas published rates.',
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
cd retirement-planner
git add src/data/destinations/spain-madrid.ts
git commit -m "data(madrid): essentials=\$2,580 (organic-adjusted), school=\$13K, insurance=\$200

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 8: Update Barcelona destination

**Files:**
- Modify: `src/data/destinations/spain-barcelona.ts`

- [ ] **Step 1: Replace the `costOfLiving` block**

Replace the existing block (currently `monthlyBaseline: 4500`, `internationalSchoolAnnual: 12500`, `healthInsuranceMonthly: 300`, `costMultiplierVsDC: 0.60`) with:

```typescript
  costOfLiving: {
    monthlyEssentials: 2450,
    monthlyComfortable: 3300,
    internationalSchoolAnnual: 14000,
    healthInsuranceMonthly: 200,
    notes: [
      'Essentials (~\u20AC2,250/mo) = groceries (~\u20AC720 with light bio premium) + utilities (~\u20AC157) + internet/mobile (~\u20AC49) + T-Casual transit (~\u20AC22) + household (~\u20AC150) + dining (~\u20AC240) + kid extras (~\u20AC180) + clothing/personal (~\u20AC150).',
      'Organic/non-GMO premium: only ~+$100/mo bump (EU baseline).',
      'Rent tracked separately; BCN 3BR runs \u20AC2,800\u20133,800/mo in central/family neighborhoods (Eixample, Gr\u00e0cia, Sarri\u00e0).',
      'Family private health insurance (Sanitas/Adeslas) \u20AC150\u2013220/mo, similar to Madrid.',
      'International school: BFIS primary \u20AC12,100\u201315,000/yr; first-year ~\u20AC19,930 with entrance fee.',
      'Ownership market is the most expensive of the four Spanish cities (\u20AC6,300/m\u00b2+ in Eixample).',
      'Sources: Numbeo Apr 2026, BFIS fees, Sanitas/Adeslas published rates.',
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
cd retirement-planner
git add src/data/destinations/spain-barcelona.ts
git commit -m "data(barcelona): essentials=\$2,450 (organic-adjusted), school=\$14K, insurance=\$200

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 9: Update Valencia destination

**Files:**
- Modify: `src/data/destinations/spain-valencia.ts`

- [ ] **Step 1: Replace the `costOfLiving` block**

Replace the existing block (currently `monthlyBaseline: 3500`, `internationalSchoolAnnual: 9000`, `healthInsuranceMonthly: 250`, `costMultiplierVsDC: 0.48`) with:

```typescript
  costOfLiving: {
    monthlyEssentials: 2050,
    monthlyComfortable: 2800,
    internationalSchoolAnnual: 8000,
    healthInsuranceMonthly: 180,
    notes: [
      'Essentials (~\u20AC1,880/mo) = groceries (~\u20AC620 with light bio premium) + utilities (~\u20AC142) + internet/mobile (~\u20AC49) + transit pass (~\u20AC30) + household (~\u20AC120) + dining (~\u20AC215) + kid extras (~\u20AC150) + clothing/personal (~\u20AC130). 15\u201320% cheaper than Madrid on day-to-day.',
      'Organic/non-GMO premium: only ~+$100/mo bump (EU baseline).',
      'Rent tracked separately; Valencia 3BR runs \u20AC1,600\u20132,200/mo in central/Ruzafa.',
      'Family private health insurance \u20AC140\u2013200/mo (slightly cheaper than Madrid/BCN).',
      'International school: ASV K1\u2013K3 \u20AC7,246/yr; G1\u20135 \u20AC7,687/yr. Notably cheaper than Madrid/BCN; first-year extras \u20AC5,325.',
      'Sources: Numbeo Apr 2026, ASV admissions page.',
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
cd retirement-planner
git add src/data/destinations/spain-valencia.ts
git commit -m "data(valencia): essentials=\$2,050 (organic-adjusted), school=\$8K, insurance=\$180

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 10: Update Bilbao destination

**Files:**
- Modify: `src/data/destinations/spain-bilbao.ts`

- [ ] **Step 1: Replace the `costOfLiving` block**

Replace the existing block (currently `monthlyBaseline: 3800`, `internationalSchoolAnnual: 11000`, `healthInsuranceMonthly: 275`, `costMultiplierVsDC: 0.52`) with:

```typescript
  costOfLiving: {
    monthlyEssentials: 2150,
    monthlyComfortable: 2900,
    internationalSchoolAnnual: 8800,
    healthInsuranceMonthly: 180,
    notes: [
      'Essentials (~\u20AC1,975/mo) = groceries (~\u20AC640 with light bio premium) + utilities (~\u20AC128) + internet/mobile (~\u20AC45) + transit pass (~\u20AC45) + household (~\u20AC120) + dining (~\u20AC230, pintxos culture) + kid extras (~\u20AC150) + clothing/personal (~\u20AC130).',
      'Organic/non-GMO premium: only ~+$100/mo bump (EU baseline; Basque Country has good local farm-to-table supply that helps).',
      'Rent tracked separately; Bilbao 3BR runs \u20AC1,500\u20132,200/mo (Indautxu/Abando premium).',
      'Family private health insurance \u20AC140\u2013200/mo (Basque region not premium-priced).',
      'International school: ASOB nursery\u2013K \u20AC7,087\u20137,813/yr; G1\u20136 \u20AC8,619\u20139,777/yr. Smaller IB program than ASM/BFIS.',
      'Per-sqm ownership is high relative to city size (\u20AC3,889/m\u00b2 citywide, \u20AC5,000+ in Indautxu).',
      'Sources: Numbeo Apr 2026, ASOB fees, Idealista listings.',
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
cd retirement-planner
git add src/data/destinations/spain-bilbao.ts
git commit -m "data(bilbao): essentials=\$2,150 (organic-adjusted), school=\$8.8K, insurance=\$180

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 11: Update CDMX destination

**Files:**
- Modify: `src/data/destinations/mexico-cdmx.ts`

- [ ] **Step 1: Replace the `costOfLiving` block**

Replace the existing block (currently `monthlyBaseline: 3200`, `internationalSchoolAnnual: 13000`, `healthInsuranceMonthly: 225`, `costMultiplierVsDC: 0.45`) with:

```typescript
  costOfLiving: {
    monthlyEssentials: 3300,
    monthlyComfortable: 4100,
    internationalSchoolAnnual: 22000,
    healthInsuranceMonthly: 450,
    notes: [
      'Essentials (~MXN 57,750/mo) = groceries (~\\$1,000 organic-leaning, La Comer Premium / Costco / Wholefoods-style stores; conventional MX food chain has GMO corn + heavy chemical use, so US-organic-equivalent shop is import-heavy) + utilities (~\\$150) + Uber-heavy transport (~\\$200) + part-time cleaner 2x/week (~\\$200) + dining (~\\$400) + kid extras (~\\$200) + household (~\\$150) + clothing/personal (~\\$200) + buffer.',
      'Organic/non-GMO premium: ~+$300/mo. Premium tier of essentials. Conventional MX supply chain uses chemicals + GMO corn that US-organic households would avoid; organic = specialty/import stores at heavy markup.',
      'Rent tracked separately; Roma/Condesa/Polanco 3BR runs MXN 38,000\u201355,000/mo (~\\$2,170\u20133,140).',
      'Health insurance: AXA/GNP family major-medical MXN 7,000\u201310,000/mo (~\\$400\u2013570). 2026 premiums up 20\u201340% YoY due to Mexico medical inflation.',
      'International school: ASF first-year ~MXN 415,000 (~\\$23,700); ongoing primary ~MXN 330,000\u2013380,000/yr (~\\$19,000\u201321,700). Greengates similar range.',
      'Sources: Numbeo Apr 2026, ASF tuition page, Mexico News Daily 2026 health insurance reporting.',
    ],
  },
```

(Note: school bumped from $13K to $22K and health insurance from $225 to $450 — original numbers materially understated for top-tier expat options.)

- [ ] **Step 2: Commit**

```bash
cd retirement-planner
git add src/data/destinations/mexico-cdmx.ts
git commit -m "data(cdmx): essentials=\$3,300 (organic-adjusted), school=\$22K, insurance=\$450

Essentials bumped \$300 over generic-research baseline because conventional
MX supply chain uses GMO corn + chemicals US-organic households would avoid;
organic = La Comer Premium / specialty / imports at heavy markup. School
bumped from \$13K (was way under ASF/Greengates real tuition) and insurance
from \$225 (was under AXA/GNP family rates, esp. after MX's 20\u201340% 2026 hike).

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 12: Update Oaxaca destination

**Files:**
- Modify: `src/data/destinations/mexico-oaxaca.ts`

- [ ] **Step 1: Replace the `costOfLiving` block**

Replace the existing block (currently `monthlyBaseline: 2200`, `internationalSchoolAnnual: 4500`, `healthInsuranceMonthly: 150`, `costMultiplierVsDC: 0.32`) with:

```typescript
  costOfLiving: {
    monthlyEssentials: 2200,
    monthlyComfortable: 2900,
    internationalSchoolAnnual: 4200,
    healthInsuranceMonthly: 380,
    notes: [
      'Essentials (~MXN 38,500/mo) = groceries (~\\$650, supplemented by Pochote organic market + local sustainable farms) + utilities (~\\$120, mild climate, low A/C) + transit (~\\$120, taxis or modest car) + household help (~\\$130) + dining (~\\$300, lots of street food) + kid extras (~\\$150) + household (~\\$130) + clothing/personal (~\\$100) + buffer.',
      'Organic/non-GMO premium: ~+$200/mo. Pochote organic market and Etla-area farms make local organic accessible at lower premium than CDMX; some imports still needed for specialty items.',
      'Rent tracked separately; Centro/Reforma 3BR runs MXN 18,000\u201330,000/mo (~\\$1,030\u20131,715).',
      'Health insurance: same national AXA/GNP product as CDMX (~\\$300\u2013480/mo); Oaxaca network is thinner so some expats pick plans with CDMX/Guadalajara hospital access.',
      'No true international school: best private bilingual options (Colegio La Paz, etc.) MXN 36,000\u201396,000/yr (~\\$2,000\u20135,500). English-instruction quality and accreditation noticeably below ASF.',
      'Sources: Expatistan Mar 2026, Real Estate Oaxaca, ExpatExchange schools guide.',
    ],
  },
```

(Note: insurance bumped $150 → $380 — Mexican private major-medical is national, doesn't get cheaper in Oaxaca; school slightly trimmed from $4,500 → $4,200 to match Colegio La Paz mid-range.)

- [ ] **Step 2: Commit**

```bash
cd retirement-planner
git add src/data/destinations/mexico-oaxaca.ts
git commit -m "data(oaxaca): essentials=\$2,200 (organic-adjusted), school=\$4.2K, insurance=\$380

Insurance was \$150 \u2014 unrealistically low; Mexican private health is
priced nationally, not by city. Oaxaca-specific note added re: thin
hospital network and bilingual-school quality vs CDMX.

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 13: Update Medellín destination

**Files:**
- Modify: `src/data/destinations/colombia-medellin.ts`

- [ ] **Step 1: Replace the `costOfLiving` block**

Replace the existing block (currently `monthlyBaseline: 2500`, `internationalSchoolAnnual: 11250`, `healthInsuranceMonthly: 225`, `costMultiplierVsDC: 0.40`) with:

```typescript
  costOfLiving: {
    monthlyEssentials: 2150,
    monthlyComfortable: 2850,
    internationalSchoolAnnual: 9000,
    healthInsuranceMonthly: 280,
    notes: [
      'Essentials (~COP 9M/mo) = groceries (~\\$700 organic-leaning, Carulla Wong / \u00c9xito Premium / specialty stores; mainstream Colombian supply chain includes GMO Mon810 corn) + utilities (~\\$140) + Metro+Uber mix (~\\$160) + part-time cleaner (~\\$250) + dining (~\\$250) + kid extras (~\\$100) + household (~\\$100) + clothing/personal (~\\$150) + buffer. Higher with full-time nanny (~+\\$250).',
      'Organic/non-GMO premium: ~+$250/mo. Colombia permits GMO corn (Mon810) and uses chemicals US-organic households would avoid; organic = Carulla Wong / specialty / farmer\u2019s markets at heavy markup.',
      'Rent tracked separately; Poblado 3BR runs \\$1,500\u20132,000 furnished, Laureles \\$1,100\u20131,600 unfurnished.',
      'Health insurance: EPS contributory + Plan Complementario \\$200\u2013350/mo for family of 3; full prepagada (ColSanitas/SURA premium) \\$300\u2013400/mo.',
      'International school: TCS (Columbus School, Envigado, IB-accredited) ~\\$6,000\u20139,000/yr primary; Vermont/Canadian School \\$5,000\u201310,000/yr. Top-tier secondary trends higher.',
      'Sources: Numbeo Apr 2026, Medell\u00edn Advisors COL guide, Medell\u00edn Guru insurance overview.',
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
cd retirement-planner
git add src/data/destinations/colombia-medellin.ts
git commit -m "data(medellin): essentials=\$2,150 (organic-adjusted), school=\$9K, insurance=\$280

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 14: Update Nairobi destination

**Files:**
- Modify: `src/data/destinations/kenya-nairobi.ts`

- [ ] **Step 1: Replace the `costOfLiving` block**

Replace the existing block (currently `monthlyBaseline: 3500`, `internationalSchoolAnnual: 20000`, `healthInsuranceMonthly: 325`, `costMultiplierVsDC: 0.45`) with:

```typescript
  costOfLiving: {
    monthlyEssentials: 1950,
    monthlyComfortable: 2700,
    internationalSchoolAnnual: 22000,
    healthInsuranceMonthly: 550,
    notes: [
      'Essentials (~KES 250,000/mo) = groceries (~\\$600 organic-leaning, Karen organic markets + Westgate/Carrefour Junction premium produce + small farms in Karen/Tigoni) + utilities (~\\$100) + Uber/Bolt (~\\$170) + live-in nanny/housekeeper (~\\$220) + dining (~\\$240) + kid extras (~\\$110) + household (~\\$100) + clothing/personal (~\\$120) + buffer.',
      'Organic/non-GMO premium: ~+$200/mo. Karen-area organic farms and weekend markets (Karen, Spring Valley) make local organic produce accessible; imported organic dairy + specialty items carry heavy import duties.',
      'Rent tracked separately; Karen 3BR (gated, garden) \\$1,300\u20131,540, Lavington 3BR \\$845\u20131,540, Westlands 3BR \\$1,150\u20131,925 furnished.',
      'Health insurance: international IPMI (Cigna/Allianz/AXA) \\$500\u2013700/mo for family of 3 \u2014 standard for expat families due to repatriation coverage. Local-only (Jubilee/AAR) cheaper at \\$200\u2013350/mo but limited international scope.',
      'International school: ISK (top-tier US curriculum) KG2 \\$20,420/yr, KG3 \\$32,350/yr, G1\u20135 \\$34,090/yr + \\$1,550 capital levy. Braeburn/Hillcrest (British) ~\\$7,000\u201310,000/yr early years, \\$18,000+ G3\u20135.',
      'Family in Kenya \u2014 logistical reason this destination matters; school cost cliff is the biggest financial concern.',
      'Sources: Numbeo Apr 2026, ISK fees page, Pacific Prime Kenya insurance, BuyRentKenya listings.',
    ],
  },
```

(Note: school $20K → $22K matches ISK lower-grade band; insurance $325 → $550 to reflect IPMI reality for family with international coverage needs.)

- [ ] **Step 2: Commit**

```bash
cd retirement-planner
git add src/data/destinations/kenya-nairobi.ts
git commit -m "data(nairobi): essentials=\$1,950 (organic-adjusted), school=\$22K, insurance=\$550

Insurance bumped to reflect international IPMI (Cigna/Allianz/AXA) cost
for a family wanting repatriation coverage, which is the standard expat
choice in Nairobi. ISK fees confirmed at \$20K\u2013\$34K depending on grade.

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 15: Update Montevideo destination

**Files:**
- Modify: `src/data/destinations/uruguay-montevideo.ts`

- [ ] **Step 1: Replace the `costOfLiving` block**

Replace the existing block (currently `monthlyBaseline: 3500`, `internationalSchoolAnnual: 14000`, `healthInsuranceMonthly: 300`, `costMultiplierVsDC: 0.52`) with:

```typescript
  costOfLiving: {
    monthlyEssentials: 2700,
    monthlyComfortable: 3550,
    internationalSchoolAnnual: 13000,
    healthInsuranceMonthly: 380,
    notes: [
      'Essentials (~UYU 113,400/mo) = groceries (~\\$950 organic-leaning, La Tienda Inglesa premium + Mercado Agr\u00edcola farmer\u2019s markets + Disco Premium; conventional UY ag is chemical-heavy and Uruguay grows GMO soy/corn) + utilities (~\\$380) + transit (~\\$150) + household help (~\\$400 with BPS compliance) + dining (~\\$350) + kid extras (~\\$120) + household (~\\$120) + clothing/personal (~\\$200).',
      'Organic/non-GMO premium: ~+$250/mo. Uruguay grows GMO soy and corn at scale, conventional ag uses heavy agrochemicals; organic = La Tienda Inglesa premium + farmer\u2019s markets at notable markup, plus utility costs and labor-compliance burden are already structurally high.',
      'Rent tracked separately; Pocitos/Punta Carretas 3BR \\$1,550\u20132,260, Carrasco \\$1,785\u20132,860.',
      'Health insurance: mutualista (Hospital Brit\u00e1nico/M\u00e9dica Uruguaya) \\$325\u2013400/mo family of 3; international (Cigna/Allianz) \\$500\u2013800/mo if global coverage needed. Hospital Brit\u00e1nico new-member cutoff age 60.',
      'International school: UAS Pre-K/K \\$10,520/yr; G1\u20135 \\$16,980/yr (charged in USD). British Schools \\$12,000\u201315,000/yr. \\$13K midpoint reflects mix of school-stage years.',
      'Sources: Numbeo Apr 2026, US State Dept UAS fact sheet, Jarniascyril Uruguay healthcare guide.',
    ],
  },
```

- [ ] **Step 2: Commit**

```bash
cd retirement-planner
git add src/data/destinations/uruguay-montevideo.ts
git commit -m "data(montevideo): essentials=\$2,700 (organic-adjusted), school=\$13K, insurance=\$380

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 16: Add regression tests

**Files:**
- Modify: `src/engine/simulate.test.ts` (append new describe block)

- [ ] **Step 1: Append the regression tests**

Add this `describe` block to the end of `src/engine/simulate.test.ts`:

```typescript
describe('simulate — expense composition (regression for double-counted housing bug)', () => {
  it('reads monthlyEssentials per destination, not a hardcoded constant', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = simulate(dc, career, GLOBAL_DEFAULTS, {
      dcHomeDecision: 'keep', moveYear: NEXT_YEAR, returnYear: null,
    });
    // Year 1 living expenses should be DC's monthlyEssentials × 12 × inflationMultiplier(1).
    const inflation = 1 + GLOBAL_DEFAULTS.inflationRate / 100;
    const expected = Math.round(dc.costOfLiving.monthlyEssentials * 12 * inflation);
    expect(result[0].livingExpenses).toBe(expected);
  });

  it('does not double-count housing inside livingExpenses', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = simulate(dc, career, GLOBAL_DEFAULTS, {
      dcHomeDecision: 'keep', moveYear: NEXT_YEAR, returnYear: null,
    });
    // year-1 livingExpenses must be < monthlyMortgage × 12 (proves housing is not folded in twice).
    expect(result[0].livingExpenses).toBeLessThan(GLOBAL_DEFAULTS.monthlyMortgage * 12);
  });

  it('DC year-1 totalExpenses lands in the realistic family-of-3 band (\\$100K\u2013\\$150K/yr)', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = simulate(dc, career, GLOBAL_DEFAULTS, {
      dcHomeDecision: 'keep', moveYear: NEXT_YEAR, returnYear: null,
    });
    // ~\$3,700 essentials (organic-adjusted) + \$4,600 mortgage + \$570 health
    // + DC childcare \$2,500/mo for daughter age 3 (under primaryAge 5)
    // \u2192 ~\$11,370/mo \u2192 ~\$140K/yr year 1. Band is wide to accommodate
    // childcare phase-out as daughter ages.
    expect(result[0].totalExpenses).toBeGreaterThan(100_000);
    expect(result[0].totalExpenses).toBeLessThan(150_000);
  });

  it('Amsterdam year-1 totalExpenses is reasonable for an expat family (\\$80K\u2013\\$125K/yr)', () => {
    const ams = getDestination('nl-amsterdam')!;
    const career = ams.careerPresets[0];
    const result = simulate(ams, career, GLOBAL_DEFAULTS, {
      dcHomeDecision: 'sell', moveYear: NEXT_YEAR, returnYear: null,
    });
    // ~\$2,900 essentials (organic-adjusted) + ~\$3,650 rent + ~\$425 health
    // + AMS childcare \$700/mo at age 3 (under primaryAge 4) or ISA tuition once
    // age \u2265 4 \u2192 \$80K\u2013\$125K/yr depending on schooling stage.
    expect(result[0].totalExpenses).toBeGreaterThan(80_000);
    expect(result[0].totalExpenses).toBeLessThan(125_000);
  });
});
```

- [ ] **Step 2: Run the new tests — they should pass against the updated engine + data**

Run: `cd retirement-planner && npx vitest run src/engine/simulate.test.ts -t "expense composition"`
Expected: 4 passing tests under "expense composition (regression for double-counted housing bug)".

If any fail, **stop** — investigate before tweaking thresholds. Likely causes:
- A destination file wasn't updated (Tasks 4–15)
- The engine still reads the old field name (Task 2)
- The Amsterdam school cost makes year 1 land outside the band (check daughter age + tuition-waiver logic in `getEducationCost`)

- [ ] **Step 3: Run the full test suite**

Run: `cd retirement-planner && npx vitest run`
Expected: all tests pass (40+ existing + 4 new = 44+).

- [ ] **Step 4: Run typecheck and build**

Run: `cd retirement-planner && npx tsc --noEmit && npm run build`
Expected: typecheck clean, build succeeds.

- [ ] **Step 5: Commit**

```bash
cd retirement-planner
git add src/engine/simulate.test.ts
git commit -m "test(engine): regression tests for double-counted housing bug

Pin DC and Amsterdam year-1 totalExpenses into realistic bands and
assert the engine reads each destination's monthlyEssentials field
rather than a hardcoded constant. Prevents silent regression of the
April 2026 double-count bug.

Refs: docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md"
```

---

## Task 17: Manual verification + Codex review

**Files:** none

- [ ] **Step 1: Visual smoke test in dev**

Run: `cd retirement-planner && npm run dev`

In a browser:
1. Visit `/scenario/dc-baseline/financials` — confirm year-1 `Expenses` column ≈ \$100K–\$150K (not the old ~\$200K).
2. Click year 1 to expand the calculation breakdown — confirm the "Essentials" line says `$3,700/mo × 12 × 1.030` (not `$6,500/mo × 1.00 COL × ...`).
3. Visit `/scenario/nl-amsterdam/financials` — confirm year-1 expenses ≈ \$80K–\$125K (not the old ~\$120K+ which was a different number entirely due to the bug).
4. Click year 1 — confirm essentials line shows `$2,900/mo`.
5. Visit `/dashboard` — confirm wealth-at-62 numbers shifted upward (less expense → more savings → higher net worth).

If any of those don't match, return to the relevant Task and re-check the destination file.

- [ ] **Step 2: Hand off to Codex for review**

Per Mekoce's standing rule (Plan→Build→Review→Deploy, never skip review), invoke the codex rescue/review subagent:

Run the `codex:rescue` skill with this prompt:

> Review the changes in this branch against `docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md`. Focus areas:
> 1. Engine math: confirm `simulate.ts` uses `monthlyEssentials` and that `totalExpenses` is no longer double-counting housing.
> 2. Type safety: any leftover references to `monthlyBaseline` or `costMultiplierVsDC`?
> 3. Per-destination data: are the 13 `costOfLiving` blocks internally consistent (essentials reasonable vs rent, health, school)?
> 4. Test coverage: do the regression tests actually pin the bug, or are the bands too loose?
>
> Flag anything that looks like a stale magic number, an inconsistent unit, or a place where the rename missed something.

- [ ] **Step 3: Address Codex findings, commit fixes, re-run tests**

For each finding from Codex, decide: fix, defer (with explicit reason), or push back. Loop until Codex returns clean.

- [ ] **Step 4: Final pre-deploy gate**

Run: `cd retirement-planner && npx tsc --noEmit && npx vitest run && npm run build`
Expected: all three clean.

- [ ] **Step 5: Deploy**

Per Mekoce's rule: deploy to prod by default. Push to `main`; GitHub Actions deploys automatically.

```bash
cd retirement-planner
git push origin main
```

Then watch the Actions run and verify the deploy:

```bash
gh run list --limit 1
gh run watch
```

Once green, smoke-test https://life.mekoce.com — repeat the visual checks from Step 1 in production.

- [ ] **Step 6: Update memory**

Update `~/.claude/projects/-Users-mekocewalker-Library-CloudStorage-Dropbox-coding-projects/memory/retirement_planner.md` to note:
- monthlyBaseline was renamed to monthlyEssentials
- costMultiplierVsDC was dropped
- All 13 destinations now have researched per-destination essentials values (sourced April 2026)
- Date and brief summary of the fix in the session log

---

## Self-Review Checklist

- **Spec coverage:**
  - Engine reads per-destination field ✓ (Task 2)
  - UI updated to match ✓ (Task 3)
  - All 13 destinations updated ✓ (Tasks 4–15)
  - Regression tests added ✓ (Task 16)
  - Manual verification + review + deploy ✓ (Task 17)

- **Placeholder scan:** All "Replace with:" blocks contain full code; no TBDs; all field values are specific numbers.

- **Type consistency:** `monthlyEssentials` (camelCase, singular noun) used consistently across type, engine, UI, all 13 data files, and tests. `costMultiplierVsDC` removed everywhere.

- **Risk:** The DC year-1 expense band (\$95K–\$135K) deliberately wide because childcare cost depends on `globals.daughterAge` and `childcareMonthly`. If the band fails, it's likely because daughter ages out of childcare during year 1 in some scenarios — adjust the band rather than hide a real bug.
