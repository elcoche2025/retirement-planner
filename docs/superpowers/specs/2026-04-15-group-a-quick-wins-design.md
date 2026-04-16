# Group A: Quick Wins — Design Spec

## Context

Extends the Life Change Planner v1 (deployed at `elcoche2025.github.io/retirement-planner/`). Three independent enhancements that polish the existing app before building deeper analytical features.

**Stack**: Same — Vite + React + TypeScript + react-router-dom + Recharts. No new dependencies.

---

## Feature 1: URL-based Sharing

### Problem
Compare and Matrix pages store selections only in React state/localStorage. You can't text Kara a link to a specific comparison.

### Solution
Sync page-specific state into URL hash parameters using `useSearchParams` from react-router-dom.

### Pages affected

**Compare (`#/compare`)**
- Read `a` and `b` params on mount: `#/compare?a=spain-bilbao&b=colombia-medellin`
- On selection change: update URL params via `setSearchParams` (replace mode, not push — avoids polluting browser history)
- If params present on mount, override `compareSelection` in state
- If params missing, fall back to current state (existing behavior)

**Matrix (`#/matrix`)**
- Read `preset` param on mount: `#/matrix?preset=family-first`
- On preset button click: update URL param
- If param present on mount, apply that preset's weights

**Scenario Detail (`#/scenario/:id`)**
- Already URL-driven via route params. No changes needed.
- Sub-tabs are already in the URL (`#/scenario/kenya-nairobi/financials`). No changes.

### Implementation details
- Use `useSearchParams()` from react-router-dom (already installed)
- In Compare.tsx: on mount, check `searchParams.get('a')` and `searchParams.get('b')`. If valid destination IDs, call `updateSelection([a, b])`. On selection change, call `setSearchParams({ a: selection[0], b: selection[1] }, { replace: true })`.
- In Matrix.tsx: on mount, check `searchParams.get('preset')`. If valid preset ID, apply it. On preset click, update param.
- Validate IDs against `ALL_DESTINATIONS` and `WEIGHT_PRESETS` — ignore invalid params silently.

### Files
- Modify: `src/routes/Compare.tsx`
- Modify: `src/routes/Matrix.tsx`

---

## Feature 2: Export/Print Matrix

### Problem
The Decision Matrix results can't be shared with Kara or printed for reference.

### Solution
A "Print Results" button on the Matrix page + a print-optimized CSS stylesheet.

### What prints
- Title: "Life Change Planner — Decision Matrix Results"
- Date printed
- Weight configuration summary (which preset or "Custom", list of dimension weights)
- The full matrix table with composite scores and rankings
- Sensitivity analysis findings
- Winner callout

### What gets hidden in print
- Navigation (top bar, bottom bar)
- Weight sliders (show the values as text instead)
- Interactive elements (buttons, toggles)

### Implementation
- Add `@media print` rules to `src/routes/Matrix.css` (or a new `src/styles/print.css`)
- Hide `.top-bar`, `.bottom-bar`, `.tab-nav`, weight slider controls
- Show a `.print-only` summary block (hidden on screen, visible in print) with weight values as text
- Ensure heat-map colors use `print-color-adjust: exact` so they survive printing
- Add a "Print Results" button (Printer icon from lucide-react) in the Matrix page header
- Button calls `window.print()`

### Files
- Modify: `src/routes/Matrix.tsx` (add print button + print-only summary block)
- Modify: `src/routes/Matrix.css` (add @media print rules)
- Optionally create: `src/styles/print.css` (if print rules are extensive enough to warrant a separate file)

---

## Feature 3: Data Accuracy Pass

### Problem
Destination data files were bulk-generated from research. Numbers may be imprecise, inconsistent, or outdated. Before building Monte Carlo projections and deeper analysis on top of this data, it needs to be trustworthy.

### What to verify per destination

1. **Cost of living**: monthlyBaseline and monthlyComfortable should align with research doc. costMultiplierVsDC should be internally consistent (if DC baseline is $6,500/mo and Kenya is $2,925/mo, multiplier should be ~0.45).
2. **Tax regime**: incomeTaxRate should reflect effective rate at expected household income (~$80-150K), not marginal rate. estimatedEffectiveTotalRate should account for US+local after credits. Special regimes (Beckham Law, 30% ruling, DAFT, Uruguay Tax Holiday) correctly described.
3. **Career presets**: householdAnnualIncome should equal yourAnnualIncome + karaAnnualIncome. Income numbers should be realistic for each role in each country. incomeGrowthRate should be sensible (2-3% for salaried, 10-15% for independent/startup year 1).
4. **Housing**: rentMonthly values in USD (not local currency). Check that 2BR < 3BR. buyMedianPrice should be for a comparable family home, not a studio.
5. **QoL ratings**: familyProximity should be 9-10 for Kenya, 2-4 for everywhere else. healthcareQuality should favor Netherlands/Spain (universal) over Kenya/Colombia. safety should reflect reality (not stereotypes). Ratings should feel calibrated relative to each other.
6. **Visa info**: requirements list should be complete. Processing times should be current. Costs should be in USD. Spouse work rights accurately stated.
7. **Narrative, pros, cons**: Should be honest and specific, not generic.

### Source documents
- `docs/destination-data-research.md` — compiled research for all 12 destinations
- `~/Library/CloudStorage/Dropbox/coding-projects/life-change/compass_artifact_wf-0d918e4b-7fe8-4c23-a34c-782bba0e4bfa_text_markdown.md` — Netherlands deep research
- `~/Library/CloudStorage/Dropbox/coding-projects/life-change/compass_artifact_wf-0fd1525e-d263-4954-9b41-99d85ea22b92_text_markdown.md` — Entrepreneurship + 4-location comparison
- `~/Library/CloudStorage/Dropbox/coding-projects/life-change/Bilbao Move Comparison_ Career, Cost, Taxes.docx` — Bilbao deep research

### Implementation
- Research agent reads all source documents + current data files
- Cross-references numbers
- Fixes discrepancies directly in `src/data/destinations/*.ts`
- Reports what changed and why

### Files
- Modify: any of the 12 `src/data/destinations/*.ts` files that have inaccurate data
- Modify: `src/data/global-defaults.ts` if any default assumptions are off

---

## Implementation Order

1. **URL sharing** (Compare + Matrix) — pure logic, no visual changes, quick
2. **Export/print matrix** — CSS + one button, quick
3. **Data accuracy pass** — research-heavy, no code architecture changes

---

## Decisions from brainstorming

- Group A is first of 4 groups (A → B → C → D)
- All three features are independent and can be implemented in any order
- No new dependencies needed
- No new components needed (URL sharing modifies existing pages, print is CSS)
- Data accuracy is a research task, not a code task
