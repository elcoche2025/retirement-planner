# Group A: Quick Wins — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add URL sharing for Compare/Matrix pages, print-friendly matrix export, and verify all destination data against research documents.

**Architecture:** Modifications to existing pages only. URL sharing uses `useSearchParams` from react-router-dom (already installed). Print export uses `@media print` CSS. Data accuracy is a research/data task.

**Tech Stack:** react-router-dom `useSearchParams`, CSS `@media print`, `window.print()`

**Design spec:** `docs/superpowers/specs/2026-04-15-group-a-quick-wins-design.md`

---

## File Map

```
Modified files:
  src/routes/Compare.tsx          — Add useSearchParams sync
  src/routes/Matrix.tsx           — Add useSearchParams sync + print button + print-only summary
  src/routes/Matrix.css           — Add @media print rules
  src/data/destinations/*.ts      — Any corrections found during data accuracy pass
```

---

## Task 1: URL Sharing — Compare Page

**Files:**
- Modify: `src/routes/Compare.tsx`

- [ ] **Step 1: Add useSearchParams import and read params on mount**

At the top of `src/routes/Compare.tsx`, add the import and a `useEffect` to seed selections from URL params:

```typescript
import { useSearchParams } from 'react-router-dom';
```

Inside the `Compare` component, after the existing hooks:

```typescript
const [searchParams, setSearchParams] = useSearchParams();

// Seed from URL on mount
useEffect(() => {
  const paramA = searchParams.get('a');
  const paramB = searchParams.get('b');
  if (paramA && paramB && getDestination(paramA) && getDestination(paramB) && paramA !== paramB) {
    updateSelection([paramA, paramB]);
  }
}, []); // Run once on mount only
```

Add `useEffect` to the import from `react`:

```typescript
import { useMemo, useEffect } from 'react';
```

- [ ] **Step 2: Sync selection changes back to URL**

Replace the `setA` and `setB` functions:

```typescript
const setA = (id: string) => {
  updateSelection([id, idB]);
  setSearchParams({ a: id, b: idB }, { replace: true });
};
const setB = (id: string) => {
  updateSelection([idA, id]);
  setSearchParams({ a: idA, b: id }, { replace: true });
};
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Open `http://localhost:5173/#/compare?a=spain-bilbao&b=colombia-medellin` — should load with those two destinations pre-selected. Change selections — URL should update. Copy the URL, open in new tab — should load same comparison.

- [ ] **Step 4: Commit**

```bash
git add src/routes/Compare.tsx
git commit -m "feat: URL sharing for Compare page — sync selections to hash params"
```

---

## Task 2: URL Sharing — Matrix Page

**Files:**
- Modify: `src/routes/Matrix.tsx`

- [ ] **Step 1: Add useSearchParams and read preset from URL**

Add import:

```typescript
import { useSearchParams } from 'react-router-dom';
```

Inside `Matrix` component, after existing hooks:

```typescript
const [searchParams, setSearchParams] = useSearchParams();

// Seed preset from URL on mount
useEffect(() => {
  const paramPreset = searchParams.get('preset');
  if (paramPreset) {
    const preset = WEIGHT_PRESETS.find((p) => p.id === paramPreset);
    if (preset) {
      applyPreset(preset.weights);
    }
  }
}, []);
```

Add `useEffect` to the react import:

```typescript
import { useMemo, useEffect } from 'react';
```

- [ ] **Step 2: Sync preset clicks to URL**

In the `applyPreset` function (or where preset buttons call it), after applying the preset, also update the URL. Modify the preset button onClick to also set the param:

Find where presets are rendered (the buttons that call `applyPreset`) and wrap the click handler:

```typescript
const handlePresetClick = (preset: typeof WEIGHT_PRESETS[0]) => {
  applyPreset(preset.weights);
  setSearchParams({ preset: preset.id }, { replace: true });
};
```

Update the preset buttons to use `handlePresetClick` instead of directly calling `applyPreset`.

When individual weight sliders are changed (not a preset), clear the preset param:

```typescript
const setDimensionWeight = (dim: QoLDimension, val: number) => {
  updateWeights({
    ...weights,
    weights: { ...weights.weights, [dim]: val },
  });
  setSearchParams({}, { replace: true }); // Clear preset param on manual change
};

const setFinancialWeight = (val: number) => {
  updateWeights({ ...weights, financialWeight: val });
  setSearchParams({}, { replace: true });
};
```

- [ ] **Step 3: Verify**

Open `http://localhost:5173/#/matrix?preset=family-first` — should load with Family First weights applied. Click a different preset — URL updates. Manually adjust a slider — preset param clears.

- [ ] **Step 4: Commit**

```bash
git add src/routes/Matrix.tsx
git commit -m "feat: URL sharing for Matrix page — sync weight preset to hash params"
```

---

## Task 3: Export/Print Matrix

**Files:**
- Modify: `src/routes/Matrix.tsx`
- Modify: `src/routes/Matrix.css`

- [ ] **Step 1: Add print button and print-only summary block to Matrix.tsx**

Add `Printer` icon import:

```typescript
import { Printer } from 'lucide-react';
```

In the JSX, add a print button next to the page title (in the header area):

```tsx
<div className="matrix-header">
  <h1>Decision Matrix</h1>
  <button className="btn matrix-print-btn" onClick={() => window.print()}>
    <Printer size={16} />
    Print Results
  </button>
</div>
```

Add a print-only summary block (hidden on screen, visible in print) right after the header. This shows the weight configuration as static text instead of interactive sliders:

```tsx
<div className="print-only matrix-print-summary">
  <h2>Weight Configuration</h2>
  <p><strong>Preset:</strong> {WEIGHT_PRESETS.find(p => {
    // Check if current weights match a preset
    return QOL_DIMENSIONS.every(d => p.weights.weights[d] === weights.weights[d]) &&
           p.weights.financialWeight === weights.financialWeight;
  })?.name ?? 'Custom'}</p>
  <p><strong>Financial Weight:</strong> {weights.financialWeight}/10</p>
  <div className="matrix-print-weights">
    {QOL_DIMENSION_META.map(dim => (
      <span key={dim.id} className="matrix-print-weight-item">
        {dim.label}: {weights.weights[dim.id]}/10
      </span>
    ))}
  </div>
  <p className="matrix-print-date">Printed {new Date().toLocaleDateString()}</p>
</div>
```

- [ ] **Step 2: Add @media print rules to Matrix.css**

Append to `src/routes/Matrix.css`:

```css
/* === Print styles === */
.print-only {
  display: none;
}

.matrix-print-btn {
  gap: var(--space-2);
}

@media print {
  /* Hide interactive chrome */
  .top-bar,
  .bottom-bar,
  .matrix-weights-section,
  .matrix-presets,
  .matrix-print-btn {
    display: none !important;
  }

  /* Show print-only summary */
  .print-only {
    display: block !important;
    margin-bottom: var(--space-5);
    page-break-after: avoid;
  }

  .matrix-print-summary h2 {
    font-size: 1rem;
    margin-bottom: var(--space-2);
  }

  .matrix-print-weights {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    margin: var(--space-2) 0;
  }

  .matrix-print-weight-item {
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  .matrix-print-date {
    font-size: 0.7rem;
    color: var(--color-text-tertiary);
    margin-top: var(--space-3);
  }

  /* Make matrix table print-friendly */
  .matrix-page {
    padding: 0;
  }

  .matrix-page h1 {
    font-size: 1.25rem;
  }

  .card {
    border: 1px solid #ccc;
    box-shadow: none;
  }

  /* Ensure heat-map colors print */
  .matrix-cell-best,
  .matrix-cell-worst {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  /* Keep sensitivity section together */
  .matrix-sensitivity {
    page-break-inside: avoid;
  }

  /* Full width in print */
  .main-content {
    max-width: 100%;
    padding: 0;
  }

  body {
    background: white;
    color: black;
  }
}
```

- [ ] **Step 3: Verify**

Open the Matrix page, click "Print Results". The print preview should show:
- Title "Decision Matrix"
- Weight configuration summary (text, not sliders)
- The full matrix table with heat-map colors
- Sensitivity analysis
- No navigation bars or interactive controls

- [ ] **Step 4: Commit**

```bash
git add src/routes/Matrix.tsx src/routes/Matrix.css
git commit -m "feat: export/print matrix results with print-optimized CSS"
```

---

## Task 4: Data Accuracy Pass

**Files:**
- Modify: Any `src/data/destinations/*.ts` files with inaccurate data

This is a research task. The implementer must:

- [ ] **Step 1: Read all source research documents**

Read these files to establish ground truth:
- `docs/destination-data-research.md` — compiled research for all 12 destinations
- Life-change folder research docs (for the 4 deeply-researched destinations):
  - `/Users/mekocewalker/Library/CloudStorage/Dropbox/coding-projects/life-change/compass_artifact_wf-0d918e4b-7fe8-4c23-a34c-782bba0e4bfa_text_markdown.md` (Netherlands)
  - `/Users/mekocewalker/Library/CloudStorage/Dropbox/coding-projects/life-change/compass_artifact_wf-0fd1525e-d263-4954-9b41-99d85ea22b92_text_markdown.md` (Entrepreneurship + 4-location comparison)
  - `/Users/mekocewalker/Library/CloudStorage/Dropbox/coding-projects/life-change/Bilbao Move Comparison_ Career, Cost, Taxes.docx` (Bilbao — use `python3 -c "from docx import Document; ..."` to extract)

- [ ] **Step 2: Read all current destination data files**

Read each of the 12 destination files in `src/data/destinations/`. For each, verify:

1. **costOfLiving**: monthlyBaseline and monthlyComfortable match research. costMultiplierVsDC is internally consistent (destination baseline / DC baseline of ~$6,500).
2. **taxRegime**: incomeTaxRate is effective (not marginal) at ~$80-150K household income. estimatedEffectiveTotalRate accounts for US+local after credits. Special regimes described correctly.
3. **careerPresets**: householdAnnualIncome = yourAnnualIncome + karaAnnualIncome. Income numbers realistic. incomeGrowthRate sensible (2-3% salaried, 10-15% independent year 1).
4. **housing**: rentMonthly values in USD. 2BR < 3BR. buyMedianPrice for comparable family home.
5. **qolDefaults**: familyProximity 9-10 for Kenya only, 2-4 everywhere else. Ratings calibrated relative to each other (NL/Spain healthcare > Kenya, safety sensible).
6. **visa**: Requirements complete, processing times current, costs in USD, spouse rights accurate.

- [ ] **Step 3: Fix discrepancies**

For each error found, edit the destination file directly. Track what changed and why.

Common things to look for:
- Math errors in householdAnnualIncome not equaling sum of spouse incomes
- costMultiplierVsDC inconsistent with actual monthlyBaseline ratio
- Tax rates using marginal instead of effective rates
- Local currency values not converted to USD
- Missing or placeholder visa details on shallow destinations

- [ ] **Step 4: Verify types still compile**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run
```

Expected: All 20 existing tests still pass (data changes shouldn't break engine logic tests).

- [ ] **Step 6: Commit**

```bash
git add src/data/
git commit -m "fix: data accuracy pass — verify all destination numbers against research"
```

---

## Task 5: Build, Push, Deploy

**Files:** None (just build artifacts)

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: Succeeds.

- [ ] **Step 2: Push**

```bash
git push
```

GitHub Actions auto-deploys to `elcoche2025.github.io/retirement-planner/`.

- [ ] **Step 3: Verify live**

Open `https://elcoche2025.github.io/retirement-planner/`, authenticate, verify:
- Compare page: URL params work (try `#/compare?a=spain-bilbao&b=kenya-nairobi`)
- Matrix page: preset param works (`#/matrix?preset=adventure-mode`), Print button produces clean output
- Data looks reasonable across destinations
