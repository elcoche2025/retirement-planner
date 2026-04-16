# Life Change Planner — Design Spec

## Project Context

This is an expansion of an existing retirement planner deployed at `elcoche2025.github.io/retirement-planner`. The current app is a password-gated Vite/React single-page app comparing DC vs Kenya retirement scenarios. We're transforming it into a comprehensive life-change planning tool covering ~10 international relocation destinations with financial modeling, quality-of-life scoring, and move planning.

**Repo**: The existing GitHub Pages repo (same URL, same password gate, same deploy pipeline). We're extending, not replacing.

**Stack**: Vite + React + TypeScript + react-router-dom + Recharts. No backend. State in React Context + localStorage. Styling via CSS files with custom properties (no Tailwind — the design system is too specific for utility classes).

---

## Design Vision: "Cartographic Decision-Making"

### Aesthetic Direction

Think **editorial cartography meets financial planning** — like a beautifully designed atlas crossed with a Bloomberg terminal. The metaphor: you're charting unexplored territory for your family's future. The app should feel like a bespoke instrument built for one specific family's most important decision.

### Design Principles

1. **Warm authority** — Not cold fintech. Not playful startup. Think: a trusted advisor's mahogany desk with maps pinned to the wall. Deep, warm neutrals with strategic color.
2. **Information density without clutter** — Every screen should reward study. Dense data, but hierarchically organized so the eye knows where to go first.
3. **The money is real** — Financial projections should feel serious, precise, and trustworthy. No rounded corners on money. Sharp type, aligned decimals, clear units.
4. **The life is human** — Quality-of-life sections should feel different from financial sections. Softer, more spacious, slightly warmer palette. The contrast between "hard numbers" and "soft life" is itself a design feature.

### Typography

- **Display / Headers**: `"Fraunces"` (Google Fonts) — a variable serif with optical size axis. Warm, literary, confident. Use at heavier weights for page titles.
- **Body / Data**: `"IBM Plex Sans"` — clean, technical, excellent tabular figures for financial data. Slightly industrial, pairs well with Fraunces's warmth.
- **Monospace / Numbers in tables**: `"IBM Plex Mono"` — for dollar amounts, percentages, and data cells where alignment matters.

### Color System

```css
/* Core palette — warm dark with strategic color */
--color-bg-primary: #1a1a17;         /* Near-black with warm undertone */
--color-bg-secondary: #242420;       /* Card backgrounds */
--color-bg-tertiary: #2e2e28;        /* Elevated surfaces */
--color-bg-input: #1f1f1b;           /* Form fields */

--color-text-primary: #e8e4dc;       /* Warm white */
--color-text-secondary: #a09a8c;     /* Muted warm gray */
--color-text-tertiary: #6b6560;      /* Subtle labels */

/* Accent — each destination gets a signature color */
--color-accent-dc: #c9a96e;          /* Gold — baseline, home, stability */
--color-accent-kenya: #d4723c;       /* Burnt orange — warmth, family, earth */
--color-accent-netherlands: #4a8fb8; /* Dutch blue — pragmatic, water, clarity */
--color-accent-bilbao: #8b3a3a;      /* Basque red — deep, cultural, wine */
--color-accent-cdmx: #2d7d5e;        /* Mexican green — life, abundance */
--color-accent-oaxaca: #9e6b3a;      /* Mezcal amber — craft, warmth */
--color-accent-medellin: #c4a035;    /* Colombian gold — spring, possibility */
--color-accent-montevideo: #5b7a8a;  /* Rio de la Plata slate — subtle, literary */
--color-accent-amsterdam: #e07a3a;   /* Dutch orange — energetic variant */
--color-accent-hague: #3a6b8b;       /* Deeper blue — diplomatic, institutional */

/* Semantic */
--color-positive: #6b9e6b;           /* Muted green — gains, advantages */
--color-negative: #b85a5a;           /* Muted red — costs, risks */
--color-neutral: #8a8578;            /* Warm gray — neutral data */
--color-highlight: #c9a96e;          /* Gold — emphasis, selected state */

/* Financial vs Life sections */
--color-financial-bg: var(--color-bg-secondary);
--color-life-bg: #262520;            /* Slightly warmer variant */
```

### Spacing & Layout

- Base unit: 4px. Use multiples: 8, 12, 16, 24, 32, 48, 64.
- Max content width: 1200px on desktop, full-bleed on mobile.
- Cards: 1px border in `--color-bg-tertiary`, no border-radius greater than 4px. Subtle, not bubbly.
- Generous padding inside cards (24px minimum).
- Between sections: 48px vertical rhythm.

### Micro-interactions

- Page transitions: subtle fade + slight upward translate (200ms, ease-out).
- Number changes (when toggling career presets or adjusting weights): animate with a counter effect (numbers roll to new value over 400ms).
- Hover on destination cards: slight warm glow (box-shadow with destination accent color at 15% opacity).
- Slider interactions: value label tracks thumb position.

### Charts & Data Visualization

- Use **Recharts** (already in dependencies).
- Chart style: dark background, thin gridlines in `--color-bg-tertiary`, data lines in destination accent colors.
- Area fills: destination color at 10% opacity.
- Tooltips: dark card with warm text, no border-radius > 2px.
- Always include a "You are here" marker on timeline charts (current age/year).

---

## Information Architecture

### Route Structure

```
#/                           -> Dashboard (overview of all scenarios)
#/scenario/:id               -> Destination deep-dive
#/scenario/:id/financials    -> Financial sub-tab (default)
#/scenario/:id/career        -> Career paths sub-tab
#/scenario/:id/housing       -> Housing & home decision sub-tab
#/scenario/:id/life          -> Quality of life sub-tab
#/scenario/:id/visa          -> Visa & logistics sub-tab
#/scenario/:id/timeline      -> Timeline & planning sub-tab
#/compare                    -> Side-by-side comparator (2-3 scenarios)
#/compare?a=kenya&b=bilbao   -> Pre-selected comparison
#/matrix                     -> Weighted decision matrix
#/plan                       -> Move planning (timelines, checklists, gates)
#/inputs                     -> Global assumptions & settings
```

Uses HashRouter for GitHub Pages compatibility.

### Navigation

- **Top bar**: App title + compact nav: Dashboard | Compare | Matrix | Plan | Settings.
- **On /scenario/:id pages**: Secondary nav below the top bar with sub-tabs: Financials | Career | Housing | Life | Visa | Timeline.
- **Mobile**: Bottom tab bar for primary nav. Sub-tabs become a horizontal scrollable pill bar.
- **Destination quick-switch**: On any /scenario page, a small dropdown or sidebar list to jump between destinations without going back to Dashboard.

---

## Data Architecture

### Type Definitions

```typescript
// ============================================
// DESTINATION & SCENARIO DATA
// ============================================

interface Destination {
  id: string;                    // e.g., "kenya-nairobi", "nl-amsterdam"
  name: string;                  // "Nairobi, Kenya"
  country: string;
  city: string;
  region?: string;               // e.g., "Basque Country"
  accentColor: string;           // CSS color from palette
  flag: string;                  // emoji flag
  timezone: string;              // IANA timezone
  utcOffset: number;             // hours from UTC
  usTimezoneGap: number;         // hours from US Eastern
  researchDepth: 'deep' | 'moderate' | 'shallow';

  // Financial defaults
  costOfLiving: CostOfLiving;
  taxRegime: TaxRegime;
  housing: HousingMarket;

  // Career presets
  careerPresets: CareerPreset[];

  // Quality of life defaults (researcher-populated, user-overridable)
  qolDefaults: QualityOfLifeRatings;

  // Visa & logistics
  visa: VisaInfo;

  // Narrative
  narrative: string;             // 2-3 sentence pitch for this destination
  pros: string[];
  cons: string[];
  dealbreakers: string[];
}

interface CostOfLiving {
  monthlyBaseline: number;       // USD, family of 3, moderate lifestyle
  monthlyComfortable: number;    // USD, family of 3, comfortable
  internationalSchoolAnnual: number;
  healthInsuranceMonthly: number;
  costMultiplierVsDC: number;    // e.g., 0.45 for Nairobi = 45% of DC
  notes: string[];
}

interface TaxRegime {
  incomeTaxRate: number;         // effective rate at expected income
  capitalGainsTax: number;
  socialCharges?: number;
  specialRegime?: string;        // e.g., "Basque Impatriate Regime"
  specialRegimeDetails?: string;
  usTaxObligation: string;       // "Full (US citizen)" -- always applies
  treatyBenefits?: string;
  estimatedEffectiveTotalRate: number;
}

interface HousingMarket {
  rentMonthly2BR: number;        // USD
  rentMonthly3BR: number;
  buyMedianPrice: number;
  mortgageAvailable: boolean;
  foreignOwnershipAllowed: boolean;
  notes: string[];
}

// ============================================
// CAREER MODEL
// ============================================

interface CareerPreset {
  id: string;
  name: string;                  // e.g., "ISK Teaching + Consulting"
  description: string;
  yourRole: string;
  karaRole: string;
  yourAnnualIncome: number;      // USD
  karaAnnualIncome: number;      // USD
  householdAnnualIncome: number;
  incomeGrowthRate: number;      // annual %
  benefits: string[];
  benefitsMonetaryValue: number; // annual USD
  visaCompatible: boolean;
  notes: string[];
}

// ============================================
// QUALITY OF LIFE
// ============================================

type QoLDimension =
  | 'familyProximity'
  | 'childEducation'
  | 'languageEnvironment'
  | 'healthcareQuality'
  | 'safety'
  | 'climate'
  | 'culturalFit'
  | 'careerSatisfaction'
  | 'communityBuilding'
  | 'politicalStability'
  | 'adventureNovelty'
  | 'returnFlexibility';

interface QoLDimensionMeta {
  id: QoLDimension;
  label: string;
  description: string;
  icon: string;                  // lucide icon name
}

type QualityOfLifeRatings = Record<QoLDimension, number>;  // 1-10

interface QoLWeights {
  weights: Record<QoLDimension, number>;  // 0-10 importance
}

// ============================================
// FINANCIAL PROJECTION ENGINE
// ============================================

interface GlobalAssumptions {
  currentAge: number;            // default: 43
  retirementAge: number;         // slider: 55-72, default: 62
  moveYear: number;              // slider: 2026-2032, default: 2026
  returnYear?: number;           // optional, for "return to DC" modeling

  // Current financial state
  currentSavings: number;
  retirement457b: number;
  otherRetirement: number;
  currentHomeValue: number;
  currentMortgageBalance: number;
  homeAppreciationRate: number;

  // DC home decision per scenario (global default, overridable)
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  rentalIncomeMonthly?: number;

  // Investment assumptions
  investmentReturnRate: number;  // default: 7%
  inflationRate: number;         // default: 3%

  // Current income (DC baseline)
  currentHouseholdIncome: number;
}

interface YearlyProjection {
  year: number;
  age: number;
  location: string;              // destination id

  // Income
  grossIncome: number;
  benefitsValue: number;
  totalCompensation: number;

  // Taxes
  localTax: number;
  usTax: number;
  totalTax: number;

  // Expenses
  livingExpenses: number;
  housingCost: number;
  schooling: number;
  healthInsurance: number;
  totalExpenses: number;

  // Net
  netCashFlow: number;
  savingsContribution: number;

  // Wealth
  investmentBalance: number;
  retirementBalance: number;
  homeEquity: number;
  rentalNetIncome: number;
  totalNetWorth: number;
}

// ============================================
// SCENARIO (user's configured version of a destination)
// ============================================

interface Scenario {
  destinationId: string;
  selectedCareerPreset: string;  // preset id

  // User overrides
  customIncome?: { yours?: number; karas?: number };
  customQoLRatings?: Partial<QualityOfLifeRatings>;
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  moveYear: number;
  returnYear?: number;           // null = permanent

  // Computed
  projections: YearlyProjection[];
  totalScore?: number;           // weighted QoL + financial composite
}

// ============================================
// DECISION MATRIX
// ============================================

interface MatrixResult {
  destinationId: string;
  financialScore: number;        // normalized 0-100
  qolScore: number;              // weighted, normalized 0-100
  compositeScore: number;        // blended
  rank: number;
}
```

### Destination Data Files

One file per destination under `src/data/destinations/`:

```
src/data/
  destinations/
    index.ts              -> exports all destinations as array
    dc-baseline.ts
    kenya-nairobi.ts
    nl-the-hague.ts
    nl-amsterdam.ts
    spain-bilbao.ts
    spain-barcelona.ts    -> placeholder, shallow research
    spain-madrid.ts       -> placeholder, shallow research
    spain-valencia.ts     -> placeholder, shallow research
    mexico-cdmx.ts
    mexico-oaxaca.ts
    colombia-medellin.ts
    uruguay-montevideo.ts
  career-presets/
    index.ts
    kenya.ts
    netherlands.ts
    spain.ts
    mexico.ts
    colombia.ts
    uruguay.ts
  qol-dimensions.ts      -> dimension metadata, default weights
  global-defaults.ts     -> default GlobalAssumptions
```

For deeply researched destinations (Kenya, NL/Hague, Bilbao), populate full data from the existing research documents. For others, use reasonable estimates and mark `researchDepth: 'shallow'`. The UI shows a subtle badge ("Estimates only") on shallow destinations.

---

## Page Specifications

### 1. Dashboard (`#/`)

**Purpose**: At-a-glance comparison of all destinations. The "map wall" view.

**Layout**:

- **Top section**: Summary banner showing current baseline (DC, household income, net worth trajectory) as context.
- **Grid of destination cards**: 3 columns on desktop, 1 on mobile. Each card:
  - Destination name + flag + accent-color left border
  - Key financial stat: "Net worth at 62: $X.XM" or projected range
  - QoL composite score (if weights are set): "Life Score: 78/100"
  - Mini sparkline chart showing net worth trajectory (tiny, 80px tall)
  - Career preset name currently selected
  - "Research depth" badge if shallow
  - Click navigates to `#/scenario/:id`
- **Below the grid**: Compact "Quick Compare" row — two dropdowns to select destinations, a "Compare" button.
- **Below that**: Weighted composite ranking as a horizontal bar chart (if matrix weights are set). All destinations ranked by composite score.

**Key interaction**: The dashboard should feel like a "war room" — everything visible at once, nothing hidden behind clicks.

### 2. Scenario Detail (`#/scenario/:id`)

**Purpose**: Deep dive into one destination. This is where the user spends most time.

**Layout**: Full-width page. Destination name + flag + accent color as page header. Sub-tab navigation below.

#### 2a. Financials Sub-tab (`#/scenario/:id/financials`)

- **Wealth projection chart** (Recharts AreaChart): X = year (move year to retirement), Y = net worth. Line for THIS scenario plus a ghost line for DC baseline. "You are here" marker at current year.
- **Annual cash flow table**: Scrollable, one row per year, columns for income, taxes, expenses, net cash flow, cumulative wealth. Negative cash flow years highlighted in `--color-negative`.
- **Key metrics cards** (row of 3-4):
  - "Net worth at retirement: $X.XM"
  - "Years to financial independence"
  - "Avg annual savings rate: X%"
  - "Tax burden vs DC: +/-X%"
- **Home decision toggle**: sell / rent / keep DC home. Changing this recalculates projections in real-time.
- **Income comparison mini-chart**: Bar chart showing this destination's household income vs DC baseline.

#### 2b. Career Sub-tab (`#/scenario/:id/career`)

- **Career preset selector**: Radio-style cards. Each shows:
  - Preset name
  - Your role + Kara's role
  - Combined income
  - Benefits list
  - Visa compatibility badge
- Selecting a preset recalculates financials.
- **Custom override section**: Expandable panel to manually set income numbers.

#### 2c. Housing Sub-tab (`#/scenario/:id/housing`)

- **DC home decision** (prominent): Sell / Rent Out / Keep Empty — with financial impact summary for each option.
- **Destination housing overview**: Rent vs buy comparison. Monthly costs. Neighborhood suggestions.
- **Home equity projection**: If selling DC home, show lump sum and reinvestment impact. If renting, show rental income stream and management costs.

#### 2d. Quality of Life Sub-tab (`#/scenario/:id/life`)

**This page should feel noticeably different from the financial pages.** Warmer, more spacious, slightly different background tone.

- **Radar chart**: Spider/radar chart showing QoL ratings across all 12 dimensions. DC baseline shown as ghost polygon.
- **Dimension cards**: Below the radar chart, card per QoL dimension:
  - Dimension name + icon
  - Current rating (1-10) as slider — user can override research defaults
  - Brief rationale text from research
  - If overridden: "You: 8 | Research: 6" with reset button
- **Composite QoL score**: Large number at top, calculated from ratings x weights.

#### 2e. Visa Sub-tab (`#/scenario/:id/visa`)

- Visa type, duration, renewal process.
- Requirements checklist (checkable for planning).
- Estimated processing timeline.
- Gotchas & risks.
- Cost: application fees, legal fees, ongoing.

#### 2f. Timeline Sub-tab (`#/scenario/:id/timeline`)

- **Move year selector**: Slider from 2026-2032, recalculates projections.
- **Return year selector** (optional): Toggle "permanent" vs "return to DC after X years."
- **Visual timeline**: Horizontal timeline showing current year, move year, milestones (daughter's school transitions, parents' ages, retirement), return year, retirement.
- **Decision gates**: Checklist of prerequisites (visa approved, home sold/rented, job secured). Checkable.

### 3. Compare Page (`#/compare`)

**Purpose**: Side-by-side view of 2-3 destinations.

- **Destination selectors** at top: 2-3 dropdowns.
- **Stacked comparison sections**:
  - Financial overlay chart (multi-line, accent colors, DC dashed baseline)
  - Key metrics table (rows = metrics, columns = destinations, best value highlighted)
  - QoL radar overlay (all selected destinations)
  - QoL dimension table
  - Pros/Cons side-by-side

### 4. Decision Matrix (`#/matrix`)

**Purpose**: The weighted scoring engine. The app's intellectual core.

- **Top: Weight sliders** — one per QoL dimension (0-10 importance) + "Financial weight" slider.
  - **Preset weight profiles**: "Family First" / "Money Maximizer" / "Adventure Mode" / "Balanced"
  - Weights persist to localStorage.
- **Middle: The Matrix** — big table. Rows = QoL dimensions + Financial Score. Columns = all destinations.
  - Each cell shows rating. Row labels show weight.
  - Bottom row: Composite Score, sorted. Winner highlighted.
  - Cells heat-mapped (green high, red low) within each row.
- **Bottom: Sensitivity analysis** — "What changes the winner?" Auto-detects which weight changes flip #1 and #2 ranking. E.g., "If Family Proximity goes from 5 to 8, Kenya overtakes Bilbao." Visually prominent callout card.

### 5. Plan Page (`#/plan`)

- **Destination selector**: Pick scenario to plan for.
- **Phase timeline**: Visual phases:
  - Phase 0: Research & Decision (now)
  - Phase 1: Preparation (visa, financial, housing)
  - Phase 2: Transition (move logistics)
  - Phase 3: Settling (first 6 months)
  - Phase 4: Evaluation (stay or return?)
- **Checklist per phase**: Expandable, items from visa requirements + housing + logistics.
- **Key dates**: Calendar-style milestones (editable).

### 6. Global Inputs (`#/inputs`)

- **Personal**: Current age (43), retirement target age.
- **Financial State**: Current savings, 457b balance, other retirement, home value, mortgage balance.
- **Income**: Current DC household income (baseline).
- **Assumptions**: Investment return rate, inflation rate, home appreciation rate.
- **DC Home**: Default home decision (overridable per scenario).

All inputs persist to localStorage. Changes trigger recalculation across all scenarios.

---

## Implementation Order

### Phase 1: Foundation

1. Set up react-router-dom routing structure with all routes defined (placeholder pages).
2. Implement design system: CSS variables, typography imports, base component styles.
3. Build `<Layout>` component with navigation (top bar + mobile bottom bar).
4. Build data layer: all TypeScript types, destination data files (start with 4 well-researched: DC, Kenya, NL/Hague, Bilbao).
5. Build Global Inputs page and React Context for global assumptions.
6. Build financial projection engine: `(destination, careerPreset, globalAssumptions, scenarioOverrides) => YearlyProjection[]`.

### Phase 2: Core Views

1. Dashboard with destination cards (sparklines placeholder initially).
2. Scenario detail: Financials sub-tab (wealth chart, cash flow table, key metrics).
3. Scenario detail: Career sub-tab with preset selector.
4. Compare page with financial overlay chart and metrics table.

### Phase 3: Quality of Life & Matrix

1. QoL dimension data and default ratings per destination.
2. Scenario detail: Life sub-tab with radar chart and editable sliders.
3. Decision Matrix page with weight sliders, matrix table, composite scoring.
4. Sensitivity analysis on Matrix page.

### Phase 4: Planning & Polish

1. Housing sub-tab.
2. Visa sub-tab.
3. Timeline sub-tab.
4. Plan page with phase timeline and checklists.
5. Add remaining destinations (Amsterdam, Oaxaca, Medellin, Montevideo, other Spanish cities).
6. Dashboard sparklines, micro-interactions, final polish.

### Phase 5: Enhancements

1. URL-based sharing (encode key params for comparison links).
2. Export/print view for matrix result.
3. "Kara's view" — simplified mode showing bottom line, fewer knobs.

---

## Component Library

```
src/components/
  Layout.tsx                -> Top nav + outlet + mobile bottom bar
  DestinationCard.tsx       -> Dashboard card with sparkline
  MetricCard.tsx            -> Single KPI (value, label, trend)
  SliderInput.tsx           -> Range input with value label
  ToggleGroup.tsx           -> Radio-style card group (career presets, home decisions)
  DataTable.tsx             -> Styled table with optional heat-mapping
  WealthChart.tsx           -> Recharts area chart for wealth projection
  RadarChart.tsx            -> Recharts radar chart for QoL
  ComparisonChart.tsx       -> Multi-line overlay chart
  BarRanking.tsx            -> Horizontal bar chart for matrix rankings
  TimelineVisual.tsx        -> Horizontal phase/milestone timeline
  Badge.tsx                 -> Status badge (research depth, visa status)
  TabNav.tsx                -> Secondary nav for scenario sub-pages
  DestinationSelector.tsx   -> Dropdown/combobox for picking destinations
  NumberInput.tsx           -> Currency-formatted input field
  WeightSlider.tsx          -> Matrix weight slider (with importance label)
  SensitivityCard.tsx       -> "What changes the winner" insight card
  AnimatedNumber.tsx        -> Number counter animation (400ms roll)
```

---

## Design Details

### Things That Make It Feel Premium

1. **Decimal alignment**: `font-variant-numeric: tabular-nums`, right-align currency columns. Dollar signs left-aligned within column.
2. **DC ghost line**: On every financial chart, DC baseline as dashed transparent line. Constant visual anchor.
3. **Destination accent colors in context**: Left border on cards, chart line color, radar fill, page header wash (5% opacity). NOT as: background fills, button colors, body text.
4. **Number animation**: Switching presets or toggling home decisions animates key numbers (count up/down, 400ms).
5. **Research depth honesty**: Shallow destinations get dashed border and "Estimates only" label.
6. **Sensitivity callouts**: Prominent on Matrix page. Lightbulb icon callout card.
7. **Mobile financial tables**: Transform to card-per-year or horizontal scroll with fixed year column.
8. **Empty states**: Shallow destinations show structure with muted placeholder values and "Needs more research" CTA.

### Things to Avoid

- No purple gradients, glassmorphism, excessive border-radius, floating orbs.
- No bouncy transitions. Functional only: fade, slide.
- No stock imagery or decorative illustrations.
- Don't center-align data tables.
- Don't use percentage widths for financial columns. Fixed widths.
- Password gate same design language as app.

---

## Financial Engine

### Net Worth Projection

```
For each year from moveYear to retirementAge:
  1. Calculate income (from career preset, with growth rate)
  2. Add benefits monetary value
  3. Subtract taxes (local + US, with treaty credits)
  4. Subtract living expenses (COL-adjusted)
  5. Subtract housing costs (rent or mortgage)
  6. Subtract international school tuition
  7. Subtract health insurance
  8. Net cash flow = income - all costs
  9. If positive, add to investment balance (growing at return rate)
  10. If negative, draw from savings
  11. Calculate home equity (if DC home retained): value * (1+appreciation)^years - mortgage
  12. If renting DC home: add rental income, subtract management (10%), subtract maintenance
  13. Retirement accounts grow at return rate regardless
  14. Total net worth = investments + retirement + home equity
```

### Return-to-DC Modeling

```
If returnYear is set:
  - Years moveYear to returnYear: abroad scenario calculations
  - Years returnYear to retirement: DC baseline calculations, BUT:
    - Savings/investments carry forward from abroad stint
    - Must re-establish DC housing (buy at projected price or rent)
    - Career may reset (income penalty configurable)
    - DC home equity only if "keep" was chosen
```

### Tax Handling (Simplified)

- US citizens owe US tax on worldwide income always.
- Foreign Earned Income Exclusion (~$126K in 2025, inflation-adjusted).
- Foreign Tax Credit for taxes paid locally.
- Effective rate = max(local rate, US rate) for most scenarios, not additive.
- Special regimes (Basque impatriate, NL 30% ruling) reduce local taxable income.

---

## localStorage Schema

```typescript
interface AppState {
  version: number;
  globalAssumptions: GlobalAssumptions;
  scenarios: Record<string, Scenario>;   // keyed by destination id
  qolWeights: QoLWeights;
  lastVisited: string;                    // destination id
  compareSelection: string[];             // destination ids
  matrixPreset: string;                   // active weight preset name
}

// Key: "life-change-planner-state"
// On load, if version doesn't match current, migrate or reset
```

---

## Decisions Made During Brainstorming

- **Scope**: Comparator + simulator + planner (all three in one app)
- **Destinations**: ~10 (DC, Kenya/Nairobi, NL/Hague, NL/Amsterdam, Spain/Bilbao, Spain/Barcelona+Madrid+Valencia, Mexico/CDMX, Mexico/Oaxaca, Colombia/Medellin, Uruguay/Montevideo)
- **Career model**: Named presets per scenario bundling both spouses (B with D's spirit)
- **QoL**: Weighted decision matrix with editable ratings and weights (option D)
- **Time model**: Single move + optional return to DC (option B)
- **Relationship to retirement planner**: Extend the existing repo (option B)
- **Architecture**: Router-based multi-page (Approach 2)
- **Styling**: CSS custom properties, not Tailwind
