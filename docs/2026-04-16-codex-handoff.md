# Codex Handoff: 2026-04-16

This document summarizes the changes completed in the current Codex session so the next Claude Code session can pick up with accurate context.

## Scope Completed

- Fixed the signed delta formatting bug in the financial comparison UI.
- Reworked tax outputs to use a more honest effective-rate model tied to destination assumptions.
- Made the top-level `DC Household Income` setting drive the DC baseline simulation directly.
- Fixed housing settings so DC carrying-cost inputs remain visible and editable, including explicit zero values.
- Added automatic FX rate syncing from a single authoritative source, plus manual refresh and sync status.
- Fixed factual FX copy so the app displays USD-to-local rates correctly.
- Fixed matrix preset selection state and restored color-coded matrix cells for quicker scanning.
- Replaced hard-coded `2026` assumptions with a current-year helper shared across the app.
- Reworked Netherlands scenario presets to reflect realistic household role combinations.
- Added reusable per-page explainers so users can inspect assumptions and page meaning in-context.
- Added a small honesty note to the password gate clarifying that it is a light privacy gate, not real authentication.

## New Product Decisions Implemented

- `DC Household Income` remains a top-level override and now affects simulation outputs, not just the banner/UI.
- Tax modeling follows the more conservative "option B" direction:
  - total tax is aligned to destination `estimatedEffectiveTotalRate`
  - US tax still uses a simplified estimate internally
  - the UI now presents these numbers as estimates rather than exact modeled liabilities
- Netherlands scenarios now assume these realistic patterns instead of "Kara teaches at an international school":
  - Kara in a conventional non-teaching role in the Netherlands
  - Kara as DAFT applicant for a small business / consultancy / co-owned project
  - both remote from the Netherlands
  - Mekoce at an international school while Kara is the visa anchor
- Explainers use a small reusable disclosure/accordion pattern on each page.
- Matrix view uses soft row-relative color coding to improve at-a-glance readability.

## Files Added

- `src/components/PageGuide.tsx`
- `src/data/page-guides.ts`
- `src/services/fx.ts`
- `src/utils/date.ts`
- `src/routes/tabs/FinancialsTab.test.ts`
- `docs/2026-04-16-codex-handoff.md`

## Files Updated

- `src/App.tsx`
- `src/data/destinations/kenya-nairobi.ts`
- `src/data/destinations/mexico-cdmx.ts`
- `src/data/destinations/nl-amsterdam.ts`
- `src/data/destinations/nl-the-hague.ts`
- `src/data/weight-presets.ts`
- `src/engine/education.test.ts`
- `src/engine/montecarlo.test.ts`
- `src/engine/simulate.test.ts`
- `src/engine/simulate.ts`
- `src/engine/taxes.test.ts`
- `src/engine/taxes.ts`
- `src/routes/Compare.tsx`
- `src/routes/Dashboard.tsx`
- `src/routes/Inputs.css`
- `src/routes/Inputs.tsx`
- `src/routes/Matrix.css`
- `src/routes/Matrix.tsx`
- `src/routes/Plan.tsx`
- `src/routes/tabs/CareerTab.tsx`
- `src/routes/tabs/FinancialsTab.tsx`
- `src/routes/tabs/HousingTab.tsx`
- `src/routes/tabs/LifeTab.tsx`
- `src/routes/tabs/TimelineTab.tsx`
- `src/routes/tabs/VisaTab.tsx`
- `src/state/AppStateContext.tsx`
- `src/state/hooks.ts`
- `src/styles/components.css`
- `src/styles/gate.css`
- `src/types/index.ts`
- `docs/destination-data-research.md`
- `dist/index.html`
- `dist/assets/index-*.css`
- `dist/assets/index-*.js`

## Detail By Area

### 1. FX Rates

- Added `src/services/fx.ts` to fetch exchange rates from Frankfurter using `USD` as the base currency.
- The app now tracks FX metadata:
  - provider
  - base currency
  - as-of date
  - fetch timestamp
  - status
  - error state
- Automatic behavior:
  - fetch on first load when no prior sync exists
  - refresh daily when the cached sync is stale
- Manual behavior:
  - Inputs page now includes a `Refresh Latest Rates` action
  - Inputs page shows sync status/source/date
- Corrected exchange-rate copy so values are shown as `USD -> local` rather than reversing the pair.

### 2. Financial Modeling

- `simulate.ts`
  - DC baseline income now uses `globals.currentHouseholdIncome`
  - retirement balance calculation now includes `otherRetirement`
  - current-year logic now comes from a shared helper instead of hard-coding `2026`
- `taxes.ts`
  - switched the displayed total-tax logic to align with destination `estimatedEffectiveTotalRate`
  - improved FEIE handling with a better stacking approximation
  - updated FEIE constant to `$132,900`
  - marked the method as an effective-rate estimate
- Financials/Compare UI
  - signed deltas now preserve negative signs correctly
  - tax labels were softened to indicate they are estimated values, not exact obligations

### 3. Inputs / Housing

- The app now keeps DC carrying-cost inputs visible even when the effective additional insurance/tax amount is zero.
- `Additional Insurance + Tax (outside mortgage)` is always editable and can be explicitly set to `0`.
- Maintenance minimum was lowered to allow `0`.
- Rental-income settings were separated from the dead global-state gate so they can actually be configured when relevant.
- Inputs copy now explicitly states that `DC Household Income` drives the DC baseline.

### 4. Timeline / Year Logic

- Added `src/utils/date.ts` with a shared planning-year helper.
- Removed hard-coded `2026` assumptions from:
  - `simulate.ts`
  - `Inputs.tsx`
  - `LifeTab.tsx`
  - `TimelineTab.tsx`
- This fixes the drift where age-at-move and timeline milestones would have diverged from simulation outputs in later years.

### 5. Matrix

- Fixed the preset-selection bug:
  - preset buttons now reflect the actual current weights
  - clicking a preset updates both weights and preset state
  - manual weight edits clear or re-derive preset state appropriately
- Restored cell tinting so rows are easier to scan visually.
- The color treatment is soft and row-relative, intended as a UX aid rather than a strict semantic threshold.

### 6. Netherlands Scenario Cleanup

- Replaced unrealistic teaching assumptions for Kara in the Netherlands presets.
- Added more plausible scenario variants centered on:
  - conventional employment
  - DAFT
  - remote work
  - Kara as visa anchor with Mekoce at an international school
- Adjusted associated narrative/pros text to be less overconfident, especially around 30% ruling assumptions.

### 7. Explainers / Transparency

- Added a reusable `PageGuide` disclosure component.
- Inserted explainers into:
  - Dashboard
  - Compare
  - Matrix
  - Plan
  - Inputs
  - Financials
  - Career
  - Housing
  - Life
  - Visa
  - Timeline
- The goal is to make assumptions, page intent, and interpretation easier to understand and easier to challenge when data is wrong.

### 8. Password Gate Copy

- Added a note clarifying that the password screen is only a light privacy gate and not secure authentication.

## Tests and Verification

Local verification completed before deployment:

- `npm test`
  - passed
  - `7` test files
  - `40` tests
- `npm run build`
  - passed

Known non-blocking warning:

- Vite reports a large JS chunk during build (`~758 kB` before gzip). This did not block the build, but bundle size optimization remains a follow-up opportunity.

## Deployment Path

- This repo deploys through GitHub Pages via `.github/workflows/deploy.yml`.
- The workflow runs on pushes to `main`.
- Deployment flow:
  - `npm ci`
  - `npm run build`
  - publish `./dist` using `peaceiris/actions-gh-pages`

## Remaining Caveats / Follow-Up Ideas

- Tax logic is still simplified and should not be treated as legal or tax advice.
- Destination data still depends on manually curated assumptions in several places; the new explainers make that easier to inspect, but they do not yet provide in-app editing of all source assumptions.
- Bundle size is still larger than ideal.
- The password gate remains intentionally lightweight.

## Recommended Next Claude Code Starting Point

If the next session continues from here, a good first instruction would be:

1. Read `docs/2026-04-16-codex-handoff.md`.
2. Confirm the deployed site matches the implemented source changes.
3. Prioritize any remaining factual-data corrections and bundle-size cleanup.
