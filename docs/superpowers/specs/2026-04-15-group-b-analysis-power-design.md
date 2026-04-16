# Group B: Analysis Power — Design Spec

## Context

Extends the Life Change Planner v1 (deployed at `elcoche2025.github.io/retirement-planner/`). Three analytical enhancements that make the financial modeling smarter and the education dimension richer.

**Stack**: Same — Vite + React + TypeScript + Recharts. No new dependencies.

**Depends on**: Group A complete (URL sharing, print export, data accuracy pass).

---

## Feature 1: Monte Carlo Projections

### Problem
The engine produces a single deterministic projection line. Real outcomes vary — investment returns fluctuate, income ramp-up is uncertain. A single line gives false precision.

### Solution
Run 500 simulations with randomized assumptions, display percentile bands + summary stats.

### What varies per simulation run
1. **Annual investment return**: Normal distribution centered on `investmentReturnRate` (default 7%) with standard deviation of 12% (historical US stock market volatility). Clamped to [-30%, +40%] to avoid extreme outliers.
2. **Income growth rate**: Normal distribution centered on the career preset's `incomeGrowthRate` with standard deviation of rate/3. So a 12% growth preset (DAFT startup) varies between ~4% and ~20%. A 2.5% salaried preset varies between ~1.7% and ~3.3%. Clamped to [0%, rate*3].

Investment return varies independently each year (simulates market volatility). Income growth rate is drawn once per simulation run and held constant (simulates "your career goes well" vs "your career goes poorly" — not year-to-year fluctuation).

### Engine: `src/engine/montecarlo.ts`

```typescript
interface MonteCarloResult {
  percentiles: {
    p10: number[];   // totalNetWorth at each year, 10th percentile
    p25: number[];
    p50: number[];   // median
    p75: number[];
    p90: number[];
  };
  summary: {
    p10Final: number;   // net worth at retirement, 10th percentile
    p25Final: number;
    p50Final: number;
    p75Final: number;
    p90Final: number;
  };
  years: number[];   // age at each index
}

function runMonteCarlo(
  destination: Destination,
  career: CareerPreset,
  globals: GlobalAssumptions,
  overrides: SimulateOverrides,
  runs?: number,          // default 500
): MonteCarloResult;
```

Implementation: runs `simulate()` N times, each time with a modified `globals` object where `investmentReturnRate` and the career's `incomeGrowthRate` are randomized. Collects all totalNetWorth arrays, computes percentiles at each year index.

Uses a seeded PRNG (simple xorshift) for reproducibility — same inputs produce same bands. Seed derived from hash of destination ID + career preset ID.

### UI changes

**WealthChart component** (`src/components/WealthChart.tsx`):
- New optional prop: `percentileBands?: MonteCarloResult`
- When present, renders two shaded `<Area>` regions behind the median line:
  - p10-p90: destination accent color at 5% opacity
  - p25-p75: destination accent color at 12% opacity
- The existing solid line becomes the p50 (median) instead of the deterministic projection
- DC ghost line stays deterministic (dashed, no bands)

**FinancialsTab** (`src/routes/tabs/FinancialsTab.tsx`):
- New toggle: "Show projection range" (off by default for performance)
- When enabled, runs `runMonteCarlo()` via `useMemo` and passes result to WealthChart
- Stats box below chart (only visible when Monte Carlo enabled):
  ```
  At age 62:  Pessimistic (10th %ile): $1.2M  |  Median: $2.1M  |  Optimistic (90th %ile): $3.4M
  ```
- The existing MetricCard "Net Worth at Retirement" shows median when MC enabled, deterministic when disabled

**Compare page** (`src/routes/Compare.tsx`):
- Same toggle. When enabled, both scenarios get bands on the ComparisonChart.
- Stats row below chart shows median + range for each.

**Dashboard**: No change. Sparklines stay deterministic (too small, too many simulations).

### Performance
500 runs of simulate() per destination. simulate() is pure math — no DOM, no IO. On modern hardware, ~50ms per destination. Acceptable for toggle-on interaction. Use `useMemo` with appropriate dependency array.

---

## Feature 2: Currency Exchange Rates

### Problem
All income is stored in USD, but some career presets represent local-currency salaries (Kara's EUR salary at ASH, local tutoring rates in KES). Exchange rate changes affect real purchasing power and savings.

### Solution
Add exchange rate sliders to Global Inputs. The engine converts locally-earned income through the rate.

### Data changes

Add to `Destination` interface in `src/types/index.ts`:
```typescript
currency: string;              // ISO code: 'USD' | 'EUR' | 'KES' | 'MXN' | 'COP' | 'UYU'
defaultExchangeRate: number;   // local currency units per 1 USD at current rates
```

Add to `GlobalAssumptions` in `src/types/index.ts`:
```typescript
exchangeRates: Record<string, number>;  // currency code → units per USD
```

Default exchange rates (approximate mid-2026):
- EUR: 0.92 (1 USD = 0.92 EUR, i.e., 1 EUR = $1.09)
- KES: 130 (1 USD = 130 KES)
- MXN: 17.5 (1 USD = 17.5 MXN)
- COP: 4200 (1 USD = 4200 COP)
- UYU: 42 (1 USD = 42 UYU)

### Engine changes

In `simulate()`: career preset incomes are stored as USD equivalents at the default exchange rate. When the user adjusts the exchange rate slider, the engine scales locally-earned income proportionally.

Logic: if a destination's currency is EUR and the default rate is 0.92, that means the income was calculated at 1 EUR = $1.087. If the user slides EUR to 1.00 (weaker euro, parity), locally-earned EUR income loses ~8% in USD terms.

```typescript
// In simulate(), for each year:
const fxAdjustment = dest.currency === 'USD' ? 1 :
  (globals.exchangeRates[dest.currency] ?? dest.defaultExchangeRate) /
  dest.defaultExchangeRate;
// fxAdjustment > 1 means local currency weakened (bad for local earners)
// Apply: localIncome = localIncome / fxAdjustment
```

Which income is "local" vs "USD"? Add to `CareerPreset`:
```typescript
localCurrencyIncome: boolean;  // true if income is denominated in local currency
// If true: yourAnnualIncome and karaAnnualIncome are affected by FX
// If false: USD-denominated (remote US work, IEP Pulse SaaS)
```

Most presets: Kara's salaried local job = local currency. Your remote consulting/IEP Pulse = USD. Mixed presets (some local, some USD) can be modeled as: `yourLocalCurrency: boolean; karaLocalCurrency: boolean;` — but this adds complexity. Simpler: mark the whole preset and document the assumption.

Decision: add `localCurrencyIncome: boolean` to CareerPreset. For mixed presets (e.g., "DAFT Business + Kara at ASH" where your income is USD and Kara's is EUR), mark as `true` since the majority earner (Kara at $81K) is in local currency. The FX slider will slightly overcount your exposure but the signal is correct.

### UI changes

**Global Inputs** (`src/routes/Inputs.tsx`):
- New "Currency Assumptions" section with one slider per currency that appears in at least one destination.
- Slider range: ±30% from default rate.
- Label shows what the rate means: "1 EUR = $1.09" format.
- Only show currencies that are relevant (EUR, KES, MXN, COP, UYU — skip USD obviously).

### Destination data updates

Add `currency` and `defaultExchangeRate` to all 12 destination files. Add `localCurrencyIncome` to all career presets.

---

## Feature 3: Daughter's Education Timeline

### Problem
Daughter's school transitions are a major factor in move timing, but the app doesn't model education costs by age or show school system differences across destinations.

### Solution
Three layers: timeline annotations (A), education comparison view (B), age-dependent cost modeling (C).

### A — Timeline Annotations

Add to `Destination` interface:
```typescript
educationSystem: {
  preschoolAge: number;           // age childcare/preschool starts
  primaryAge: number;             // age primary/elementary starts
  secondaryAge: number;           // age secondary/middle school starts
  highSchoolAge: number;          // age upper secondary starts
  systemName: string;             // e.g., "Dutch basisschool (8 years)"
  languageOfInstruction: string;  // e.g., "Dutch (English in international schools)"
  curriculumType: string;         // e.g., "IB, American (at intl schools), Dutch national"
  internationalSchoolOptions: string[];  // e.g., ["ASH (American)", "BSN (British)"]
  transitionNotes: string[];      // e.g., ["Age 3-4 ideal for Dutch immersion"]
}
```

In `TimelineTab.tsx` (`src/routes/tabs/TimelineTab.tsx`): render education milestones on the visual timeline based on daughter's projected age at each year. Show "Preschool", "Primary", "Secondary", "High School" markers at the appropriate years, labeled with the destination's system name.

Daughter's current age: derive from `globalAssumptions.currentAge` (Mekoce is 43, daughter is ~3). Add `daughterAge: number` to GlobalAssumptions (default: 3).

### B — Education Comparison View

New section on the Life sub-tab (`src/routes/tabs/LifeTab.tsx`), below the QoL radar chart. A card titled "Education Path" containing:

- **School system diagram**: Text-based visual showing age ranges for each school level (preschool → primary → secondary → high school) with this destination's ages
- **Language of instruction**: from educationSystem data
- **International school options**: listed with annual cost
- **Curriculum types available**: IB, American, British, local
- **Transition risk assessment**: Based on daughter's age at move year. "Moving at age [X] means entering [level] — [assessment]." Assessments:
  - Age 3-5: "Ideal — full immersion from the start"
  - Age 6-9: "Good — adapts quickly, language acquisition still strong"
  - Age 10-12: "Moderate — social groups forming, may need international school"
  - Age 13+: "Difficult — established social patterns, international school strongly recommended"
- **Key consideration**: Scenario-specific note (e.g., "ASH tuition waiver with Kara employed" or "Free Dutch basisschool from age 4")

DC baseline shows US education system for comparison (ghost/reference, like the DC ghost line on wealth charts).

### C — Age-Dependent School Costs

Replace the flat `internationalSchoolAnnual` in the engine with a function that returns education cost by daughter's age and scenario context.

New function in `src/engine/education.ts`:
```typescript
function getEducationCost(
  destination: Destination,
  career: CareerPreset,
  daughterAge: number,
): number;
```

Logic:
1. If daughter's age < destination's preschoolAge: $0 (too young, or covered by childcare already in COL)
2. If daughter's age < destination's primaryAge: childcare cost (use a fraction of COL, ~$300-800/mo depending on destination)
3. If career has tuition waiver benefit (check `career.benefits` for "tuition waiver"): $0 for school
4. If destination has free public school AND daughter is primary age+: $0 (NL basisschool, Spain public, etc.)
5. Otherwise: destination's `internationalSchoolAnnual`

Add to Destination:
```typescript
publicSchoolFree: boolean;           // is public school free and viable?
childcareMonthly: number;            // monthly childcare cost (pre-school age)
```

The `simulate()` function calls `getEducationCost()` per year instead of using the flat rate.

### Destination data updates

Add `educationSystem`, `publicSchoolFree`, and `childcareMonthly` to all 12 destination files. Research-based values:
- Netherlands: preschool 2.5, primary 4 (basisschool), secondary 12, publicSchoolFree: true, childcare ~$600/mo after subsidies
- Kenya: preschool 3, primary 6, secondary 14, publicSchoolFree: false (international school needed), childcare ~$300/mo
- Spain: preschool 3, primary 6, secondary 12, publicSchoolFree: true, childcare ~$400/mo
- Mexico: preschool 3, primary 6, secondary 12, publicSchoolFree: true (but international school likely preferred), childcare ~$250/mo
- Colombia: similar to Mexico
- Uruguay: similar to Mexico
- DC: preschool 3, primary 5 (kindergarten), secondary 11, publicSchoolFree: true, childcare ~$2500/mo

---

## Implementation Order

1. **Type changes + data updates** — extend interfaces, add currency/education fields to all 12 destinations
2. **Education cost engine** — `education.ts` with age-dependent cost function + tests
3. **Monte Carlo engine** — `montecarlo.ts` with seeded PRNG + percentile computation + tests
4. **Currency in simulate()** — FX adjustment logic + exchange rate in GlobalAssumptions
5. **UI: Monte Carlo on Financials** — toggle, fan chart bands, stats box
6. **UI: Monte Carlo on Compare** — same toggle/bands pattern
7. **UI: Currency sliders in Inputs** — new section
8. **UI: Education on Timeline tab** — milestone annotations
9. **UI: Education comparison on Life tab** — education path card
10. **Data: daughterAge in GlobalAssumptions** — add to Inputs page

---

## Decisions from brainstorming

- Monte Carlo varies: investment returns (σ=12%, per year) + income growth (σ=rate/3, per run)
- Display: fan chart (p10-p90, p25-p75 bands) + summary stats box
- Currency: static rate sliders (not randomized in Monte Carlo)
- Exchange rates stored as units-per-USD, applied as proportional adjustment to locally-earned income
- CareerPreset gets `localCurrencyIncome: boolean` flag
- Education: all three layers (timeline annotations + comparison view + age-dependent engine costs)
- Daughter's age added to GlobalAssumptions (default 3)
- No new dependencies
