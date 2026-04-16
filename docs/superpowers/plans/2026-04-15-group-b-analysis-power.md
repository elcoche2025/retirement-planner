# Group B: Analysis Power — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Monte Carlo projections with fan charts, currency exchange rate sliders, and age-dependent education cost modeling with timeline annotations and education comparison views.

**Architecture:** Extend existing types, add two new engine modules (montecarlo.ts, education.ts), modify simulate.ts for FX and education, update all 12 destination data files with new fields, and enhance FinancialsTab/Compare/LifeTab/TimelineTab/Inputs UIs.

**Tech Stack:** Same — Vite, React, TypeScript, Recharts, Vitest. No new dependencies.

**Design spec:** `docs/superpowers/specs/2026-04-15-group-b-analysis-power-design.md`

---

## File Map

```
New files:
  src/engine/education.ts           Education cost by daughter's age + scenario
  src/engine/education.test.ts      Tests for education cost
  src/engine/montecarlo.ts          Monte Carlo simulation runner
  src/engine/montecarlo.test.ts     Tests for Monte Carlo

Modified files:
  src/types/index.ts                Extend Destination, CareerPreset, GlobalAssumptions
  src/data/destinations/*.ts        Add currency, educationSystem, publicSchoolFree, childcareMonthly, localCurrencyIncome to all 12
  src/data/global-defaults.ts       Add daughterAge, exchangeRates
  src/engine/simulate.ts            Integrate FX adjustment + getEducationCost()
  src/engine/simulate.test.ts       Update tests for new fields
  src/components/WealthChart.tsx     Add percentileBands prop for fan chart
  src/routes/tabs/FinancialsTab.tsx  Monte Carlo toggle + stats box
  src/routes/Compare.tsx             Monte Carlo toggle + bands
  src/routes/Inputs.tsx              Currency sliders + daughter age
  src/routes/tabs/TimelineTab.tsx    Education milestone annotations
  src/routes/tabs/LifeTab.tsx        Education comparison card
  src/state/AppStateContext.tsx       Handle new GlobalAssumptions fields (migration)
```

---

## Task 1: Extend Types + Update Global Defaults

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/data/global-defaults.ts`

- [ ] **Step 1: Add new fields to Destination interface**

In `src/types/index.ts`, add to the `Destination` interface after the `dealbreakers` field:

```typescript
  currency: string;              // ISO code: 'USD' | 'EUR' | 'KES' | 'MXN' | 'COP' | 'UYU'
  defaultExchangeRate: number;   // local currency units per 1 USD
  educationSystem: EducationSystem;
  publicSchoolFree: boolean;
  childcareMonthly: number;      // USD, pre-school age
```

Add the new `EducationSystem` interface before the `Destination` interface:

```typescript
export interface EducationSystem {
  preschoolAge: number;
  primaryAge: number;
  secondaryAge: number;
  highSchoolAge: number;
  systemName: string;
  languageOfInstruction: string;
  curriculumType: string;
  internationalSchoolOptions: string[];
  transitionNotes: string[];
}
```

- [ ] **Step 2: Add localCurrencyIncome to CareerPreset**

In the `CareerPreset` interface, add after `notes`:

```typescript
  localCurrencyIncome: boolean;  // true if income is denominated in local currency (affected by FX)
```

- [ ] **Step 3: Add new fields to GlobalAssumptions**

Add after `annualRothContribution`:

```typescript
  daughterAge: number;
  exchangeRates: Record<string, number>;  // currency code → units per USD
```

- [ ] **Step 4: Add MonteCarloResult type**

Add a new section after the `MatrixResult` interface:

```typescript
// ============================================
// MONTE CARLO
// ============================================

export interface MonteCarloResult {
  percentiles: {
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
  };
  summary: {
    p10Final: number;
    p25Final: number;
    p50Final: number;
    p75Final: number;
    p90Final: number;
  };
  years: number[];
}
```

- [ ] **Step 5: Bump AppState version**

In the `AppState` interface, the version field stays as-is but the default initial state will use version 2 (handled in state context migration — Task 7).

- [ ] **Step 6: Update global-defaults.ts**

In `src/data/global-defaults.ts`, add to the `GLOBAL_DEFAULTS` object:

```typescript
  daughterAge: 3,
  exchangeRates: {
    EUR: 0.92,
    KES: 130,
    MXN: 17.5,
    COP: 4200,
    UYU: 42,
  },
```

- [ ] **Step 7: Verify types compile (expect errors — destinations don't have new fields yet)**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: Type errors in destination files (missing `currency`, `educationSystem`, etc.). This is correct — Task 2 fixes them.

- [ ] **Step 8: Commit**

```bash
git add src/types/index.ts src/data/global-defaults.ts
git commit -m "feat: extend types for Monte Carlo, currency, education system"
```

---

## Task 2: Update All 12 Destination Data Files

**Files:**
- Modify: all 12 files in `src/data/destinations/`

Add `currency`, `defaultExchangeRate`, `educationSystem`, `publicSchoolFree`, `childcareMonthly` to each `Destination` object. Add `localCurrencyIncome` to every `CareerPreset` in every destination.

- [ ] **Step 1: Read research documents for education data**

Read `docs/destination-data-research.md` and the design spec `docs/superpowers/specs/2026-04-15-group-b-analysis-power-design.md` for the values to use per destination.

- [ ] **Step 2: Update dc-baseline.ts**

Add to the DC destination object:

```typescript
  currency: 'USD',
  defaultExchangeRate: 1,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 5,
    secondaryAge: 11,
    highSchoolAge: 14,
    systemName: 'US K-12 system',
    languageOfInstruction: 'English',
    curriculumType: 'US Common Core / DCPS',
    internationalSchoolOptions: [],
    transitionNotes: [
      'DCPS provides free public education K-12',
      'Strong SPED services through IEP system',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 2500,
```

Add `localCurrencyIncome: false` to all DC career presets (income is already in USD).

- [ ] **Step 3: Update kenya-nairobi.ts**

```typescript
  currency: 'KES',
  defaultExchangeRate: 130,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 6,
    secondaryAge: 14,
    highSchoolAge: 14,
    systemName: 'Kenyan 8-4-4 / CBC system',
    languageOfInstruction: 'English and Swahili',
    curriculumType: 'Kenyan CBC, British, IB (at international schools)',
    internationalSchoolOptions: ['ISK (International School of Kenya)', 'Braeburn', 'Rosslyn Academy'],
    transitionNotes: [
      'International schools teach in English',
      'ISK follows American curriculum with IB option',
      'Age 3-5 ideal for dual-language immersion (English + Swahili)',
    ],
  },
  publicSchoolFree: false,
  childcareMonthly: 300,
```

Career presets with international school salaries: `localCurrencyIncome: true` (salaries in KES/local terms even if quoted in USD). Remote US consulting presets: `localCurrencyIncome: false`.

- [ ] **Step 4: Update nl-the-hague.ts**

```typescript
  currency: 'EUR',
  defaultExchangeRate: 0.92,
  educationSystem: {
    preschoolAge: 2,
    primaryAge: 4,
    secondaryAge: 12,
    highSchoolAge: 12,
    systemName: 'Dutch basisschool (8 years, age 4-12)',
    languageOfInstruction: 'Dutch (English at international schools)',
    curriculumType: 'IB, American (ASH), British (BSN), Dutch national',
    internationalSchoolOptions: ['ASH (American School of The Hague)', 'BSN (British School)', 'Lighthouse Special Education'],
    transitionNotes: [
      'Basisschool starts at age 4 — completely free',
      'Age 2-4 ideal for Dutch language immersion via kinderdagverblijf',
      'ASH tuition waiver if Kara is employed there',
      'Childcare subsidized up to 96% at lower incomes',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 600,
```

DAFT presets with Kara at ASH/local school: `localCurrencyIncome: true`. Remote US consulting: `localCurrencyIncome: false`.

- [ ] **Step 5: Update remaining 9 destinations**

Apply the same pattern to: `nl-amsterdam.ts`, `spain-bilbao.ts`, `spain-barcelona.ts`, `spain-madrid.ts`, `spain-valencia.ts`, `mexico-cdmx.ts`, `mexico-oaxaca.ts`, `colombia-medellin.ts`, `uruguay-montevideo.ts`.

Key values per destination:

| Destination | Currency | FX Rate | Preschool | Primary | Secondary | Public Free | Childcare/mo |
|---|---|---|---|---|---|---|---|
| Amsterdam | EUR | 0.92 | 2 | 4 | 12 | true | $700 |
| Bilbao | EUR | 0.92 | 3 | 6 | 12 | true | $400 |
| Barcelona | EUR | 0.92 | 3 | 6 | 12 | true | $450 |
| Madrid | EUR | 0.92 | 3 | 6 | 12 | true | $400 |
| Valencia | EUR | 0.92 | 3 | 6 | 12 | true | $350 |
| CDMX | MXN | 17.5 | 3 | 6 | 12 | true | $250 |
| Oaxaca | MXN | 17.5 | 3 | 6 | 12 | true | $150 |
| Medellin | COP | 4200 | 3 | 6 | 11 | true | $200 |
| Montevideo | UYU | 42 | 3 | 6 | 12 | true | $300 |

For all career presets: mark `localCurrencyIncome: true` if the roles are local employment (international school, local company). Mark `localCurrencyIncome: false` if roles are remote US work, IEP Pulse SaaS, or US consulting.

- [ ] **Step 6: Verify all types compile**

```bash
npx tsc --noEmit
```

Expected: Clean — all destinations now satisfy the extended `Destination` interface.

- [ ] **Step 7: Run existing tests**

```bash
npx vitest run
```

Expected: All 20 tests still pass (new fields don't break existing engine tests).

- [ ] **Step 8: Commit**

```bash
git add src/data/
git commit -m "feat: add currency, education system, and FX fields to all 12 destinations"
```

---

## Task 3: Education Cost Engine + Tests

**Files:**
- Create: `src/engine/education.ts`
- Create: `src/engine/education.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/engine/education.test.ts
import { describe, it, expect } from 'vitest';
import { getEducationCost } from './education';
import { getDestination } from '@/data/destinations';

describe('getEducationCost', () => {
  it('returns 0 for DC baseline (free public school)', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const cost = getEducationCost(dc, career, 6); // age 6, in school
    expect(cost).toBe(0);
  });

  it('returns childcare cost for pre-school age', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const cost = getEducationCost(dc, career, 2); // age 2, needs childcare
    expect(cost).toBe(dc.childcareMonthly * 12);
  });

  it('returns 0 when career has tuition waiver and child is school age', () => {
    const hague = getDestination('nl-the-hague')!;
    // Find the DAFT + ASH preset (has tuition waiver in benefits)
    const ashPreset = hague.careerPresets.find(p => p.benefits.some(b => b.toLowerCase().includes('tuition waiver')));
    expect(ashPreset).toBeDefined();
    const cost = getEducationCost(hague, ashPreset!, 7);
    expect(cost).toBe(0);
  });

  it('returns international school cost when public school not viable', () => {
    const kenya = getDestination('kenya-nairobi')!;
    const career = kenya.careerPresets[0];
    const cost = getEducationCost(kenya, career, 8); // school age, no free public
    expect(cost).toBe(kenya.costOfLiving.internationalSchoolAnnual);
  });

  it('returns 0 for free public school destinations at school age without waiver', () => {
    const hague = getDestination('nl-the-hague')!;
    // Use a preset WITHOUT tuition waiver
    const noWaiverPreset = hague.careerPresets.find(p => !p.benefits.some(b => b.toLowerCase().includes('tuition waiver')));
    if (noWaiverPreset) {
      const cost = getEducationCost(hague, noWaiverPreset, 7);
      expect(cost).toBe(0); // free Dutch basisschool
    }
  });

  it('returns 0 for infant (below preschool age)', () => {
    const kenya = getDestination('kenya-nairobi')!;
    const career = kenya.careerPresets[0];
    const cost = getEducationCost(kenya, career, 1);
    expect(cost).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests — verify fail**

```bash
npx vitest run src/engine/education.test.ts
```

Expected: FAIL — `./education` not found.

- [ ] **Step 3: Implement education.ts**

```typescript
// src/engine/education.ts
import type { Destination, CareerPreset } from '@/types';

export function getEducationCost(
  destination: Destination,
  career: CareerPreset,
  daughterAge: number,
): number {
  // Too young for any care
  if (daughterAge < destination.educationSystem.preschoolAge) {
    return 0;
  }

  // Preschool/childcare age (before primary school)
  if (daughterAge < destination.educationSystem.primaryAge) {
    return destination.childcareMonthly * 12;
  }

  // School age — check for tuition waiver
  const hasTuitionWaiver = career.benefits.some(
    (b) => b.toLowerCase().includes('tuition waiver') || b.toLowerCase().includes('tuition discount'),
  );
  if (hasTuitionWaiver) {
    return 0;
  }

  // Free public school available and viable
  if (destination.publicSchoolFree) {
    return 0;
  }

  // Must pay for international school
  return destination.costOfLiving.internationalSchoolAnnual;
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npx vitest run src/engine/education.test.ts
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/engine/education.ts src/engine/education.test.ts
git commit -m "feat: age-dependent education cost engine with tuition waiver detection"
```

---

## Task 4: Monte Carlo Engine + Tests

**Files:**
- Create: `src/engine/montecarlo.ts`
- Create: `src/engine/montecarlo.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/engine/montecarlo.test.ts
import { describe, it, expect } from 'vitest';
import { runMonteCarlo } from './montecarlo';
import { getDestination } from '@/data/destinations';
import { GLOBAL_DEFAULTS } from '@/data/global-defaults';

describe('runMonteCarlo', () => {
  const globals = GLOBAL_DEFAULTS;

  it('returns percentile arrays of correct length', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = runMonteCarlo(dc, career, globals, {
      dcHomeDecision: 'keep',
      moveYear: 2027,
      returnYear: null,
    }, 50);
    const expectedYears = globals.retirementAge - globals.currentAge;
    expect(result.percentiles.p50.length).toBe(expectedYears);
    expect(result.percentiles.p10.length).toBe(expectedYears);
    expect(result.percentiles.p90.length).toBe(expectedYears);
    expect(result.years.length).toBe(expectedYears);
  });

  it('p10 <= p50 <= p90 at every year', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = runMonteCarlo(dc, career, globals, {
      dcHomeDecision: 'keep',
      moveYear: 2027,
      returnYear: null,
    }, 100);
    for (let i = 0; i < result.percentiles.p50.length; i++) {
      expect(result.percentiles.p10[i]).toBeLessThanOrEqual(result.percentiles.p50[i]);
      expect(result.percentiles.p50[i]).toBeLessThanOrEqual(result.percentiles.p90[i]);
    }
  });

  it('summary final values match last year of percentile arrays', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = runMonteCarlo(dc, career, globals, {
      dcHomeDecision: 'keep',
      moveYear: 2027,
      returnYear: null,
    }, 50);
    const last = result.percentiles.p50.length - 1;
    expect(result.summary.p50Final).toBe(result.percentiles.p50[last]);
    expect(result.summary.p10Final).toBe(result.percentiles.p10[last]);
    expect(result.summary.p90Final).toBe(result.percentiles.p90[last]);
  });

  it('is deterministic (same inputs produce same outputs)', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const overrides = { dcHomeDecision: 'keep' as const, moveYear: 2027, returnYear: null };
    const r1 = runMonteCarlo(dc, career, globals, overrides, 50);
    const r2 = runMonteCarlo(dc, career, globals, overrides, 50);
    expect(r1.summary.p50Final).toBe(r2.summary.p50Final);
  });

  it('p90 spread is wider than p50 for volatile scenarios', () => {
    const kenya = getDestination('kenya-nairobi')!;
    const career = kenya.careerPresets[0];
    const result = runMonteCarlo(kenya, career, globals, {
      dcHomeDecision: 'sell',
      moveYear: 2027,
      returnYear: null,
    }, 200);
    const spread = result.summary.p90Final - result.summary.p10Final;
    expect(spread).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests — verify fail**

```bash
npx vitest run src/engine/montecarlo.test.ts
```

Expected: FAIL — `./montecarlo` not found.

- [ ] **Step 3: Implement montecarlo.ts**

```typescript
// src/engine/montecarlo.ts
import type { Destination, CareerPreset, GlobalAssumptions, MonteCarloResult } from '@/types';
import { simulate } from './simulate';

// Simple seeded PRNG (xorshift32)
function createRng(seed: number) {
  let state = seed;
  return function next(): number {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296; // 0 to 1
  };
}

// Hash string to number for seed
function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

// Box-Muller transform for normal distribution
function normalRandom(rng: () => number, mean: number, stddev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

interface SimulateOverrides {
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  moveYear: number;
  returnYear: number | null;
  customIncome?: { yours?: number; karas?: number };
}

export function runMonteCarlo(
  destination: Destination,
  career: CareerPreset,
  globals: GlobalAssumptions,
  overrides: SimulateOverrides,
  runs: number = 500,
): MonteCarloResult {
  const seed = hashSeed(destination.id + career.id);
  const rng = createRng(seed);
  const totalYears = globals.retirementAge - globals.currentAge;

  // Collect net worth at each year across all runs
  const allNetWorths: number[][] = Array.from({ length: totalYears }, () => []);

  for (let run = 0; run < runs; run++) {
    // Randomize income growth (drawn once per run)
    const incomeGrowthStddev = career.incomeGrowthRate / 3;
    const randomGrowth = normalRandom(rng, career.incomeGrowthRate, incomeGrowthStddev);
    const clampedGrowth = Math.max(0, Math.min(career.incomeGrowthRate * 3, randomGrowth));

    // Randomize return rate per year (drawn each year in simulate)
    // We'll create a modified globals with a random return for each year
    // Since simulate uses a single return rate, we'll run multiple single-year sims
    // Actually, simpler: create N modified globals objects and run simulate() for each
    const randomReturn = normalRandom(rng, globals.investmentReturnRate, 12);
    const clampedReturn = Math.max(-30, Math.min(40, randomReturn));

    const modifiedGlobals: GlobalAssumptions = {
      ...globals,
      investmentReturnRate: clampedReturn,
    };

    const modifiedCareer: CareerPreset = {
      ...career,
      incomeGrowthRate: clampedGrowth,
    };

    const projections = simulate(destination, modifiedCareer, modifiedGlobals, overrides);

    for (let y = 0; y < projections.length && y < totalYears; y++) {
      allNetWorths[y].push(projections[y].totalNetWorth);
    }
  }

  // Compute percentiles at each year
  function percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.max(0, Math.ceil((p / 100) * sorted.length) - 1);
    return sorted[idx];
  }

  const p10: number[] = [];
  const p25: number[] = [];
  const p50: number[] = [];
  const p75: number[] = [];
  const p90: number[] = [];
  const years: number[] = [];

  const currentYear = new Date().getFullYear();

  for (let y = 0; y < totalYears; y++) {
    const data = allNetWorths[y];
    if (data.length === 0) {
      p10.push(0); p25.push(0); p50.push(0); p75.push(0); p90.push(0);
    } else {
      p10.push(Math.round(percentile(data, 10)));
      p25.push(Math.round(percentile(data, 25)));
      p50.push(Math.round(percentile(data, 50)));
      p75.push(Math.round(percentile(data, 75)));
      p90.push(Math.round(percentile(data, 90)));
    }
    years.push(globals.currentAge + y + 1);
  }

  const last = totalYears - 1;

  return {
    percentiles: { p10, p25, p50, p75, p90 },
    summary: {
      p10Final: p10[last] ?? 0,
      p25Final: p25[last] ?? 0,
      p50Final: p50[last] ?? 0,
      p75Final: p75[last] ?? 0,
      p90Final: p90[last] ?? 0,
    },
    years,
  };
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npx vitest run src/engine/montecarlo.test.ts
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/engine/montecarlo.ts src/engine/montecarlo.test.ts
git commit -m "feat: Monte Carlo engine with seeded PRNG and percentile computation"
```

---

## Task 5: Integrate Education + Currency into simulate()

**Files:**
- Modify: `src/engine/simulate.ts`
- Modify: `src/engine/simulate.test.ts`

- [ ] **Step 1: Add new tests for education + FX**

Add to `src/engine/simulate.test.ts`:

```typescript
import { getDestination } from '@/data/destinations';

// ... existing tests ...

describe('simulate — education costs', () => {
  it('charges childcare for young daughter, school for older', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = simulate(dc, career, { ...GLOBAL_DEFAULTS, daughterAge: 2 }, {
      dcHomeDecision: 'keep', moveYear: 2027, returnYear: null,
    });
    // First year daughter is 3 — preschool. Later years she's school age.
    const earlyYear = result[0]; // daughter age 3
    const laterYear = result[5]; // daughter age 8
    // DC has free public school, so school-age cost should be $0
    // But childcare at age 3 should be non-zero for DC
    expect(earlyYear.schooling).toBeGreaterThan(0); // childcare
    expect(laterYear.schooling).toBe(0); // free public school
  });
});

describe('simulate — currency adjustment', () => {
  it('weaker local currency reduces income for local-currency presets', () => {
    const hague = getDestination('nl-the-hague')!;
    const career = hague.careerPresets.find(p => p.localCurrencyIncome)!;

    const normalResult = simulate(hague, career, GLOBAL_DEFAULTS, {
      dcHomeDecision: 'sell', moveYear: 2027, returnYear: null,
    });

    // Weaker EUR (more EUR per USD = local currency lost value)
    const weakEurGlobals = {
      ...GLOBAL_DEFAULTS,
      exchangeRates: { ...GLOBAL_DEFAULTS.exchangeRates, EUR: 1.10 },
    };
    const weakResult = simulate(hague, career, weakEurGlobals, {
      dcHomeDecision: 'sell', moveYear: 2027, returnYear: null,
    });

    // Weaker EUR means less USD income
    expect(weakResult[0].grossIncome).toBeLessThan(normalResult[0].grossIncome);
  });
});
```

- [ ] **Step 2: Run new tests — verify fail**

```bash
npx vitest run src/engine/simulate.test.ts
```

Expected: education test may fail (simulate doesn't use getEducationCost yet). Currency test may fail (no FX logic).

- [ ] **Step 3: Modify simulate.ts to use education cost engine**

In `src/engine/simulate.ts`:

Add import:
```typescript
import { getEducationCost } from './education';
```

Inside the yearly loop, replace the flat schooling cost line:
```typescript
// OLD: const schooling = activeDest.costOfLiving.internationalSchoolAnnual;
// NEW:
const daughterAgeThisYear = (globals.daughterAge ?? 3) + y;
const schooling = getEducationCost(activeDest, activeCareer, daughterAgeThisYear);
```

- [ ] **Step 4: Add currency adjustment to simulate.ts**

Inside the yearly loop, after computing `yourIncome` and `karasIncome`, add FX adjustment:

```typescript
let adjustedYourIncome = yourIncome;
let adjustedKarasIncome = karasIncome;

if (isAbroad && activeCareer.localCurrencyIncome && activeDest.currency !== 'USD') {
  const currentRate = globals.exchangeRates?.[activeDest.currency] ?? activeDest.defaultExchangeRate;
  const fxAdjustment = activeDest.defaultExchangeRate / currentRate;
  // fxAdjustment < 1 means local currency weakened (bad for local earners)
  adjustedYourIncome = yourIncome * fxAdjustment;
  adjustedKarasIncome = karasIncome * fxAdjustment;
}

const grossIncome = (adjustedYourIncome + adjustedKarasIncome) * growthMultiplier;
```

Remove the old `grossIncome` computation line and use this new one.

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass (old + new).

- [ ] **Step 6: Commit**

```bash
git add src/engine/simulate.ts src/engine/simulate.test.ts
git commit -m "feat: integrate education costs + currency FX adjustment into simulation engine"
```

---

## Task 6: Update State Migration for New Fields

**Files:**
- Modify: `src/state/AppStateContext.tsx`

- [ ] **Step 1: Bump state version and add migration**

In `src/state/AppStateContext.tsx`, change `STATE_VERSION` from 1 to 2.

In the `loadState` function, add migration logic:

```typescript
function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw);

    // Migrate v1 → v2: add daughterAge + exchangeRates
    if (parsed.version === 1) {
      parsed.globalAssumptions.daughterAge = parsed.globalAssumptions.daughterAge ?? 3;
      parsed.globalAssumptions.exchangeRates = parsed.globalAssumptions.exchangeRates ?? {
        EUR: 0.92, KES: 130, MXN: 17.5, COP: 4200, UYU: 42,
      };
      parsed.version = 2;
    }

    if (parsed.version !== STATE_VERSION) return getInitialState();
    return parsed as AppState;
  } catch {
    return getInitialState();
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Clean build. Existing localStorage from v1 auto-migrates to v2 on load.

- [ ] **Step 3: Commit**

```bash
git add src/state/AppStateContext.tsx
git commit -m "feat: state migration v1→v2 for daughterAge + exchangeRates"
```

---

## Task 7: UI — Monte Carlo on FinancialsTab

**Files:**
- Modify: `src/components/WealthChart.tsx`
- Modify: `src/routes/tabs/FinancialsTab.tsx`

- [ ] **Step 1: Add percentile band rendering to WealthChart**

In `src/components/WealthChart.tsx`, add a new optional prop:

```typescript
import type { MonteCarloResult } from '@/types';

interface WealthChartProps {
  projections: YearlyProjection[];
  dcProjections?: YearlyProjection[];
  accentColor: string;
  currentYear?: number;
  monteCarlo?: MonteCarloResult;  // NEW
}
```

When `monteCarlo` is provided, transform the chart data to include percentile bands and render two `<Area>` regions:

```tsx
// Build data array including MC bands
const data = projections.map((p, i) => ({
  age: p.age,
  year: p.year,
  netWorth: monteCarlo ? monteCarlo.percentiles.p50[i] : p.totalNetWorth,
  dcNetWorth: dcProjections?.[i]?.totalNetWorth,
  // MC bands
  ...(monteCarlo ? {
    p10_p90: [monteCarlo.percentiles.p10[i], monteCarlo.percentiles.p90[i]],
    p25_p75: [monteCarlo.percentiles.p25[i], monteCarlo.percentiles.p75[i]],
  } : {}),
}));
```

Use Recharts `<Area>` with `type="monotone"` and `dataKey="p10_p90"` as a range area (using the array format `[low, high]` for Recharts range areas). Render p10-p90 band at 5% opacity and p25-p75 at 12% opacity, both in the accent color, behind the main line.

- [ ] **Step 2: Add Monte Carlo toggle and stats box to FinancialsTab**

In `src/routes/tabs/FinancialsTab.tsx`:

Add imports:
```typescript
import { runMonteCarlo } from '@/engine/montecarlo';
import { useState } from 'react';
```

Add state and computation:
```typescript
const [showMC, setShowMC] = useState(false);

const mcResult = useMemo(() => {
  if (!showMC || !destination || !selectedPreset) return undefined;
  return runMonteCarlo(destination, selectedPreset, globals, {
    dcHomeDecision: config?.dcHomeDecision ?? 'sell',
    moveYear: config?.moveYear ?? globals.moveYear,
    returnYear: config?.returnYear ?? null,
  });
}, [showMC, destination, selectedPreset, globals, config]);
```

Add a toggle button above the chart:
```tsx
<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-3)' }}>
  <button className={`btn ${showMC ? 'btn-active' : ''}`} onClick={() => setShowMC(!showMC)}>
    Show Projection Range
  </button>
</div>
```

Pass `monteCarlo={mcResult}` to `<WealthChart>`.

Add a stats box (visible only when MC is enabled):
```tsx
{mcResult && (
  <div className="card" style={{ marginTop: 'var(--space-4)' }}>
    <div className="section-title">At Age {globals.retirementAge}</div>
    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
      <div className="metric-card">
        <div className="value mono text-negative">{fmt(mcResult.summary.p10Final)}</div>
        <div className="label">Pessimistic (10th %ile)</div>
      </div>
      <div className="metric-card">
        <div className="value mono" style={{ color: destination.accentColor }}>{fmt(mcResult.summary.p50Final)}</div>
        <div className="label">Median</div>
      </div>
      <div className="metric-card">
        <div className="value mono text-positive">{fmt(mcResult.summary.p90Final)}</div>
        <div className="label">Optimistic (90th %ile)</div>
      </div>
    </div>
  </div>
)}
```

When MC is enabled, the top MetricCard "Net Worth at Retirement" should show the median instead of deterministic.

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Navigate to any scenario's Financials tab. Toggle "Show Projection Range" — fan chart should appear with p10-p90 and p25-p75 bands. Stats box should show pessimistic/median/optimistic. Toggle off — returns to single line.

- [ ] **Step 4: Commit**

```bash
git add src/components/WealthChart.tsx src/routes/tabs/FinancialsTab.tsx
git commit -m "feat: Monte Carlo fan chart with percentile bands and stats box on Financials tab"
```

---

## Task 8: UI — Monte Carlo on Compare Page

**Files:**
- Modify: `src/routes/Compare.tsx`
- Modify: `src/components/ComparisonChart.tsx`

- [ ] **Step 1: Add MC support to ComparisonChart**

In `src/components/ComparisonChart.tsx`, add optional MC results per dataset:

```typescript
interface ComparisonChartProps {
  datasets: { destination: Destination; projections: YearlyProjection[]; monteCarlo?: MonteCarloResult }[];
  dcProjections: YearlyProjection[];
}
```

When MC data is present for a dataset, render p25-p75 bands behind that dataset's line (using the destination's accent color at 10% opacity). Skip p10-p90 on the comparison chart to avoid visual chaos with multiple overlapping bands.

- [ ] **Step 2: Add MC toggle to Compare page**

In `src/routes/Compare.tsx`, add the same toggle pattern as FinancialsTab:

```typescript
const [showMC, setShowMC] = useState(false);
```

When `showMC` is true, run `runMonteCarlo()` for each selected destination (add to the existing `useMemo` blocks). Pass MC results into the datasets array.

Add stats row below the chart showing median + range for each destination.

- [ ] **Step 3: Verify and commit**

```bash
npm run build
git add src/routes/Compare.tsx src/components/ComparisonChart.tsx
git commit -m "feat: Monte Carlo projection bands on Compare page"
```

---

## Task 9: UI — Currency Sliders + Daughter Age in Inputs

**Files:**
- Modify: `src/routes/Inputs.tsx`

- [ ] **Step 1: Add daughter age slider**

In the "Personal" section of `src/routes/Inputs.tsx`, add after the Move Year slider:

```tsx
<SliderInput
  label="Daughter's Age"
  value={globals.daughterAge}
  onChange={(v) => updateGlobals({ daughterAge: v })}
  min={0} max={10} step={1}
  format={(v) => `${v}`}
  suffix=" yrs"
/>
```

- [ ] **Step 2: Add currency exchange rate section**

Add a new section after "Investment Assumptions":

```tsx
<section className="card inputs-section">
  <h3 className="section-title">Currency Exchange Rates</h3>
  <p className="text-tertiary" style={{ fontSize: '0.75rem', marginBottom: 'var(--space-4)' }}>
    Adjust to model exchange rate changes. Only affects destinations with local-currency income.
  </p>
  <SliderInput
    label="EUR/USD (1 USD = X EUR)"
    value={globals.exchangeRates?.EUR ?? 0.92}
    onChange={(v) => updateGlobals({ exchangeRates: { ...globals.exchangeRates, EUR: v } })}
    min={0.65} max={1.20} step={0.01}
    format={(v) => v.toFixed(2)}
    suffix={` (1€ = $${(1 / (globals.exchangeRates?.EUR ?? 0.92)).toFixed(2)})`}
  />
  <SliderInput
    label="KES/USD (1 USD = X KES)"
    value={globals.exchangeRates?.KES ?? 130}
    onChange={(v) => updateGlobals({ exchangeRates: { ...globals.exchangeRates, KES: v } })}
    min={90} max={180} step={1}
    format={(v) => v.toFixed(0)}
  />
  <SliderInput
    label="MXN/USD (1 USD = X MXN)"
    value={globals.exchangeRates?.MXN ?? 17.5}
    onChange={(v) => updateGlobals({ exchangeRates: { ...globals.exchangeRates, MXN: v } })}
    min={12} max={25} step={0.5}
    format={(v) => v.toFixed(1)}
  />
  <SliderInput
    label="COP/USD (1 USD = X COP)"
    value={globals.exchangeRates?.COP ?? 4200}
    onChange={(v) => updateGlobals({ exchangeRates: { ...globals.exchangeRates, COP: v } })}
    min={3000} max={5500} step={50}
    format={(v) => v.toFixed(0)}
  />
  <SliderInput
    label="UYU/USD (1 USD = X UYU)"
    value={globals.exchangeRates?.UYU ?? 42}
    onChange={(v) => updateGlobals({ exchangeRates: { ...globals.exchangeRates, UYU: v } })}
    min={30} max={60} step={1}
    format={(v) => v.toFixed(0)}
  />
</section>
```

- [ ] **Step 3: Verify and commit**

```bash
npm run build
git add src/routes/Inputs.tsx
git commit -m "feat: daughter age slider + currency exchange rate sliders in Global Inputs"
```

---

## Task 10: UI — Education on Timeline + Life Tabs

**Files:**
- Modify: `src/routes/tabs/TimelineTab.tsx`
- Modify: `src/routes/tabs/LifeTab.tsx`

- [ ] **Step 1: Add education milestones to TimelineTab**

In `src/routes/tabs/TimelineTab.tsx`, read `destination.educationSystem` and `globals.daughterAge` (from `useGlobalAssumptions`). Compute the year each school transition happens:

```typescript
const { globals } = useGlobalAssumptions();
const daughterAge = globals.daughterAge ?? 3;
const currentYear = new Date().getFullYear();

const eduMilestones = destination ? [
  { label: `${destination.educationSystem.systemName.split('(')[0].trim()} starts`, year: currentYear + (destination.educationSystem.primaryAge - daughterAge) },
  { label: 'Secondary school', year: currentYear + (destination.educationSystem.secondaryAge - daughterAge) },
  { label: 'High school', year: currentYear + (destination.educationSystem.highSchoolAge - daughterAge) },
].filter(m => m.year >= currentYear && m.year <= currentYear + 25) : [];
```

Render these as additional milestone dots on the existing timeline visual, with a distinct style (e.g., different color or icon) and labeled with the daughter's age at that point.

- [ ] **Step 2: Add education comparison card to LifeTab**

In `src/routes/tabs/LifeTab.tsx`, below the QoL radar chart and dimension cards, add a new section:

```tsx
{destination && (
  <section className="section">
    <h3 className="section-title">Education Path</h3>
    <div className="card card-life">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div>
          <h4 style={{ fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>{destination.name}</h4>
          <div className="text-secondary" style={{ fontSize: '0.75rem', lineHeight: 1.8 }}>
            <div><strong>System:</strong> {destination.educationSystem.systemName}</div>
            <div><strong>Language:</strong> {destination.educationSystem.languageOfInstruction}</div>
            <div><strong>Curriculum:</strong> {destination.educationSystem.curriculumType}</div>
            <div><strong>Intl schools:</strong> {destination.educationSystem.internationalSchoolOptions.join(', ') || 'N/A'}</div>
            <div><strong>Annual cost:</strong> {destination.publicSchoolFree ? 'Free (public)' : `$${destination.costOfLiving.internationalSchoolAnnual.toLocaleString()}/yr`}</div>
            <div><strong>Childcare:</strong> ${destination.childcareMonthly}/mo</div>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '0.8rem', marginBottom: 'var(--space-2)' }}>DC Baseline</h4>
          <div className="text-secondary" style={{ fontSize: '0.75rem', lineHeight: 1.8 }}>
            <div><strong>System:</strong> US K-12</div>
            <div><strong>Language:</strong> English</div>
            <div><strong>Curriculum:</strong> DCPS / Common Core</div>
            <div><strong>Annual cost:</strong> Free (public)</div>
            <div><strong>Childcare:</strong> $2,500/mo</div>
          </div>
        </div>
      </div>

      {/* Transition risk assessment */}
      <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-bg-tertiary)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Transition Assessment</div>
        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
          {getTransitionAssessment(globals.daughterAge ?? 3, globals.moveYear)}
        </div>
        {destination.educationSystem.transitionNotes.map((note, i) => (
          <div key={i} className="text-tertiary" style={{ fontSize: '0.7rem', marginTop: 'var(--space-1)' }}>• {note}</div>
        ))}
      </div>
    </div>
  </section>
)}
```

Add the transition assessment helper function in the same file:

```typescript
function getTransitionAssessment(currentDaughterAge: number, moveYear: number): string {
  const currentYear = new Date().getFullYear();
  const ageAtMove = currentDaughterAge + (moveYear - currentYear);
  if (ageAtMove <= 5) return `Moving at age ${ageAtMove}: Ideal — full immersion from the start. Language acquisition is effortless at this age.`;
  if (ageAtMove <= 9) return `Moving at age ${ageAtMove}: Good — adapts quickly, language acquisition still strong. Will integrate socially within a year.`;
  if (ageAtMove <= 12) return `Moving at age ${ageAtMove}: Moderate — social groups forming, may need international school initially. Language learning still viable but slower.`;
  return `Moving at age ${ageAtMove}: Difficult — established social patterns and academic expectations. International school strongly recommended.`;
}
```

- [ ] **Step 3: Verify**

Check Timeline tab — education milestones visible on the timeline.
Check Life tab — education comparison card appears below QoL dimensions, shows both destination and DC side by side, transition assessment based on daughter's age at move year.

- [ ] **Step 4: Build and commit**

```bash
npm run build
git add src/routes/tabs/TimelineTab.tsx src/routes/tabs/LifeTab.tsx
git commit -m "feat: education milestones on timeline + education comparison card on Life tab"
```

---

## Task 11: Final Build + Push + Deploy

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass (original 20 + new education tests + Monte Carlo tests).

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Push**

```bash
git push
```

GitHub Actions auto-deploys.

- [ ] **Step 4: Verify live**

Open `https://elcoche2025.github.io/retirement-planner/`, authenticate, verify:
- Financials tab: "Show Projection Range" toggle produces fan chart + stats box
- Compare page: same MC toggle works with bands on both scenarios
- Settings: daughter age slider + 5 currency sliders present
- Adjusting EUR slider changes NL scenario income numbers
- Timeline tab: education milestones visible
- Life tab: education comparison card with transition assessment
