# Group C: Report Page + User Profiles — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user profiles (flexible naming, per-user QoL weights/career selections/overrides) and a shareable report page that summarizes the active profile's ranked destinations with print support.

**Architecture:** Extend AppState with a `profiles` map and `activeProfileId`. Refactor existing hooks to read from the active profile's preferences instead of top-level state. Add a profile switcher dropdown to the Layout. Create a new Report route with print-optimized CSS.

**Tech Stack:** Same — Vite, React, TypeScript, Recharts. No new dependencies.

**Design spec:** `docs/superpowers/specs/2026-04-16-group-c-report-profiles-design.md`

---

## File Map

```
New files:
  src/types/profiles.ts              UserProfile, UserPreferences interfaces
  src/components/ProfileSwitcher.tsx  Dropdown for switching/adding/renaming/deleting profiles
  src/components/ProfileSwitcher.css  Styles
  src/routes/Report.tsx              Shareable report page
  src/routes/Report.css              Report + print styles

Modified files:
  src/types/index.ts                 Import/re-export profile types, update AppState
  src/state/AppStateContext.tsx       Add profiles to state, migration v3→v4, new actions
  src/state/hooks.ts                 Read from active profile instead of top-level state
  src/components/Layout.tsx           Add ProfileSwitcher + Report nav item
  src/components/Layout.css           Styles for profile switcher placement
  src/App.tsx                         Add Report route
```

---

## Task 1: Profile Type Definitions

**Files:**
- Create: `src/types/profiles.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Create profile types**

Create `src/types/profiles.ts`:

```typescript
import type { QoLWeights, QualityOfLifeRatings } from './index';

export interface UserPreferences {
  qolWeights: QoLWeights;
  scenarioOverrides: Record<string, ScenarioPreferenceOverrides>;
  matrixPreset: string;
  compareSelection: string[];
}

export interface ScenarioPreferenceOverrides {
  selectedCareerPreset?: string;
  customQoLRatings?: Partial<QualityOfLifeRatings>;
  dcHomeDecision?: 'sell' | 'rent' | 'keep';
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  preferences: UserPreferences;
}
```

- [ ] **Step 2: Update AppState in index.ts**

In `src/types/index.ts`, add the import and re-export at the top:

```typescript
export type { UserProfile, UserPreferences, ScenarioPreferenceOverrides } from './profiles';
```

Update the `AppState` interface:

```typescript
export interface AppState {
  version: number;
  globalAssumptions: GlobalAssumptions;
  fxRatesMeta: FxRatesMeta;
  profiles: Record<string, UserProfile>;
  activeProfileId: string;
  lastVisited: string;
  // REMOVED: scenarios, qolWeights, matrixPreset, compareSelection
  // These now live in profiles[activeProfileId].preferences
}
```

Also remove or keep the old `ScenarioConfig` interface — it's still useful as the per-destination override shape. But rename the usage: `ScenarioConfig` stays as-is (it's the full scenario config including moveYear/returnYear from globals). The profile stores a subset via `ScenarioPreferenceOverrides`.

- [ ] **Step 3: Verify types compile (expect errors — state context and hooks reference old fields)**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: Errors in AppStateContext.tsx and hooks.ts referencing `state.scenarios`, `state.qolWeights`, etc. This is correct — Tasks 2-3 fix them.

- [ ] **Step 4: Commit**

```bash
git add src/types/profiles.ts src/types/index.ts
git commit -m "feat: add UserProfile and UserPreferences types, update AppState for profiles"
```

---

## Task 2: State Migration + Profile-Aware Reducer

**Files:**
- Modify: `src/state/AppStateContext.tsx`

This is the most complex task. The reducer needs to:
1. Handle new profile-related actions
2. Route existing actions (SET_QOL_WEIGHTS, SET_SCENARIO, SET_QOL_RATING, etc.) through the active profile
3. Migrate v3 state to v4 by extracting existing preferences into a "Mekoce" profile and cloning a "Kara" profile

- [ ] **Step 1: Update STATE_VERSION and add profile helpers**

Change `STATE_VERSION` to 4. Add helper functions:

```typescript
import type { UserProfile, UserPreferences, ScenarioPreferenceOverrides } from '@/types';

const STATE_VERSION = 4;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function getDefaultPreferences(): UserPreferences {
  return {
    qolWeights: WEIGHT_PRESETS[0].weights,
    scenarioOverrides: Object.fromEntries(
      ALL_DESTINATIONS.map((d) => [
        d.id,
        {
          selectedCareerPreset: d.careerPresets[0]?.id ?? '',
          customQoLRatings: {},
          dcHomeDecision: d.id === 'dc-baseline' ? 'keep' : 'sell',
        } as ScenarioPreferenceOverrides,
      ]),
    ),
    matrixPreset: 'balanced',
    compareSelection: ['dc-baseline', 'kenya-nairobi'],
  };
}

function createProfile(name: string, preferences?: UserPreferences): UserProfile {
  return {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
    preferences: preferences ? JSON.parse(JSON.stringify(preferences)) : getDefaultPreferences(),
  };
}
```

- [ ] **Step 2: Update getInitialState**

```typescript
function getInitialState(): AppState {
  const mekoce = createProfile('Mekoce');
  const kara = createProfile('Kara');
  return {
    version: STATE_VERSION,
    globalAssumptions: { ...GLOBAL_DEFAULTS },
    fxRatesMeta: getDefaultFxRatesMeta(),
    profiles: { [mekoce.id]: mekoce, [kara.id]: kara },
    activeProfileId: mekoce.id,
    lastVisited: 'dc-baseline',
  };
}
```

- [ ] **Step 3: Add v3→v4 migration in loadState**

After the existing v2→v3 migration block, add:

```typescript
// Migrate v3 → v4: extract per-user preferences into profiles
if (parsed.version === 3) {
  const mekocePrefs: UserPreferences = {
    qolWeights: parsed.qolWeights ?? WEIGHT_PRESETS[0].weights,
    scenarioOverrides: {},
    matrixPreset: parsed.matrixPreset ?? 'balanced',
    compareSelection: parsed.compareSelection ?? ['dc-baseline', 'kenya-nairobi'],
  };

  // Extract per-scenario preferences from old scenarios map
  if (parsed.scenarios) {
    for (const [destId, sc] of Object.entries(parsed.scenarios as Record<string, any>)) {
      mekocePrefs.scenarioOverrides[destId] = {
        selectedCareerPreset: sc.selectedCareerPreset,
        customQoLRatings: sc.customQoLRatings ?? {},
        dcHomeDecision: sc.dcHomeDecision,
      };
    }
  }

  const mekoceId = generateId();
  const karaId = generateId();
  const mekoce: UserProfile = {
    id: mekoceId,
    name: 'Mekoce',
    createdAt: new Date().toISOString(),
    preferences: mekocePrefs,
  };
  const kara: UserProfile = {
    id: karaId,
    name: 'Kara',
    createdAt: new Date().toISOString(),
    preferences: JSON.parse(JSON.stringify(mekocePrefs)),
  };

  parsed.profiles = { [mekoceId]: mekoce, [karaId]: kara };
  parsed.activeProfileId = mekoceId;

  // Remove old top-level fields
  delete parsed.scenarios;
  delete parsed.qolWeights;
  delete parsed.matrixPreset;
  delete parsed.compareSelection;

  parsed.version = 4;
}
```

- [ ] **Step 4: Add new Action types**

Extend the Action union:

```typescript
type Action =
  | { type: 'SET_GLOBAL_ASSUMPTIONS'; payload: Partial<GlobalAssumptions> }
  | { type: 'SET_EXCHANGE_RATES'; payload: { rates: Record<string, number>; provider: string; baseCurrency: string; asOfDate: string; fetchedAt: string } }
  | { type: 'SET_FX_STATUS'; payload: { status: FxRatesMeta['status']; error?: string | null } }
  | { type: 'SET_SCENARIO'; payload: { id: string; config: Partial<ScenarioPreferenceOverrides> } }
  | { type: 'SET_QOL_WEIGHTS'; payload: QoLWeights }
  | { type: 'SET_QOL_RATING'; payload: { destinationId: string; dimension: keyof QualityOfLifeRatings; value: number } }
  | { type: 'RESET_QOL_RATING'; payload: { destinationId: string; dimension: keyof QualityOfLifeRatings } }
  | { type: 'SET_LAST_VISITED'; payload: string }
  | { type: 'SET_COMPARE_SELECTION'; payload: string[] }
  | { type: 'SET_MATRIX_PRESET'; payload: string }
  | { type: 'SWITCH_PROFILE'; payload: string }
  | { type: 'ADD_PROFILE'; payload: { name: string } }
  | { type: 'RENAME_PROFILE'; payload: { id: string; name: string } }
  | { type: 'DELETE_PROFILE'; payload: { id: string } }
  | { type: 'RESET_ALL' };
```

- [ ] **Step 5: Rewrite the reducer**

The key change: actions that used to modify `state.scenarios`, `state.qolWeights`, `state.matrixPreset`, `state.compareSelection` now modify `state.profiles[state.activeProfileId].preferences`.

Add a helper to update the active profile's preferences:

```typescript
function updateActivePrefs(state: AppState, updater: (prefs: UserPreferences) => UserPreferences): AppState {
  const profile = state.profiles[state.activeProfileId];
  if (!profile) return state;
  return {
    ...state,
    profiles: {
      ...state.profiles,
      [state.activeProfileId]: {
        ...profile,
        preferences: updater(profile.preferences),
      },
    },
  };
}
```

Then update each case in the reducer:

- `SET_SCENARIO`: `updateActivePrefs(state, prefs => ({ ...prefs, scenarioOverrides: { ...prefs.scenarioOverrides, [id]: { ...prefs.scenarioOverrides[id], ...config } } }))`
- `SET_QOL_WEIGHTS`: `updateActivePrefs(state, prefs => ({ ...prefs, qolWeights: payload }))`
- `SET_QOL_RATING`: update `prefs.scenarioOverrides[destId].customQoLRatings[dim]`
- `RESET_QOL_RATING`: delete from `prefs.scenarioOverrides[destId].customQoLRatings`
- `SET_COMPARE_SELECTION`: `updateActivePrefs(state, prefs => ({ ...prefs, compareSelection: payload }))`
- `SET_MATRIX_PRESET`: `updateActivePrefs(state, prefs => ({ ...prefs, matrixPreset: payload }))`
- `SWITCH_PROFILE`: `{ ...state, activeProfileId: payload }` (validate ID exists)
- `ADD_PROFILE`: create new profile cloning current active profile's preferences, add to profiles map
- `RENAME_PROFILE`: update `profiles[id].name`
- `DELETE_PROFILE`: remove from profiles map; if deleting active, switch to first remaining

Leave `SET_GLOBAL_ASSUMPTIONS`, `SET_EXCHANGE_RATES`, `SET_FX_STATUS`, `SET_LAST_VISITED` unchanged — they operate on shared state.

- [ ] **Step 6: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -20
```

May still have errors in hooks.ts — Task 3 fixes those.

- [ ] **Step 7: Commit**

```bash
git add src/state/AppStateContext.tsx
git commit -m "feat: profile-aware state with v3→v4 migration, profile CRUD actions"
```

---

## Task 3: Refactor Hooks to Read from Active Profile

**Files:**
- Modify: `src/state/hooks.ts`

- [ ] **Step 1: Add useActiveProfile helper**

```typescript
function useActiveProfile() {
  const { state } = useAppState();
  const profile = state.profiles[state.activeProfileId];
  if (!profile) throw new Error('No active profile');
  return profile;
}
```

- [ ] **Step 2: Update useScenario**

The hook currently reads `state.scenarios[destinationId]`. It needs to read from the active profile's `scenarioOverrides` AND merge with global assumptions for moveYear/returnYear (which are shared):

```typescript
export function useScenario(destinationId: string) {
  const { state, dispatch } = useAppState();
  const profile = state.profiles[state.activeProfileId];
  const overrides = profile?.preferences.scenarioOverrides[destinationId];
  const destination = getDestination(destinationId);

  // Build a ScenarioConfig-compatible object from profile overrides + globals
  const config: ScenarioConfig | undefined = destination ? {
    destinationId,
    selectedCareerPreset: overrides?.selectedCareerPreset ?? destination.careerPresets[0]?.id ?? '',
    customQoLRatings: overrides?.customQoLRatings ?? {},
    dcHomeDecision: overrides?.dcHomeDecision ?? (destinationId === 'dc-baseline' ? 'keep' : 'sell'),
    moveYear: state.globalAssumptions.moveYear,
    returnYear: state.globalAssumptions.returnYear,
  } : undefined;

  const update = useCallback(
    (values: Partial<ScenarioConfig>) => {
      // Split: moveYear/returnYear go to globals, rest go to profile overrides
      const { moveYear, returnYear, ...profileUpdates } = values;
      if (moveYear !== undefined || returnYear !== undefined) {
        dispatch({ type: 'SET_GLOBAL_ASSUMPTIONS', payload: { ...(moveYear !== undefined ? { moveYear } : {}), ...(returnYear !== undefined ? { returnYear } : {}) } });
      }
      if (Object.keys(profileUpdates).length > 0) {
        dispatch({ type: 'SET_SCENARIO', payload: { id: destinationId, config: profileUpdates } });
      }
    },
    [dispatch, destinationId],
  );

  const setQoLRating = useCallback(
    (dimension: keyof QualityOfLifeRatings, value: number) =>
      dispatch({ type: 'SET_QOL_RATING', payload: { destinationId, dimension, value } }),
    [dispatch, destinationId],
  );

  const resetQoLRating = useCallback(
    (dimension: keyof QualityOfLifeRatings) =>
      dispatch({ type: 'RESET_QOL_RATING', payload: { destinationId, dimension } }),
    [dispatch, destinationId],
  );

  const effectiveQoL: QualityOfLifeRatings | undefined = destination
    ? { ...destination.qolDefaults, ...overrides?.customQoLRatings }
    : undefined;

  const selectedPreset = destination?.careerPresets.find((p) => p.id === config?.selectedCareerPreset);

  return { config, destination, update, setQoLRating, resetQoLRating, effectiveQoL, selectedPreset };
}
```

- [ ] **Step 3: Update useQoLWeights**

```typescript
export function useQoLWeights() {
  const { state, dispatch } = useAppState();
  const profile = state.profiles[state.activeProfileId];
  const weights = profile?.preferences.qolWeights ?? WEIGHT_PRESETS[0].weights;
  const update = useCallback(
    (w: QoLWeights) => dispatch({ type: 'SET_QOL_WEIGHTS', payload: w }),
    [dispatch],
  );
  return { weights, updateWeights: update };
}
```

- [ ] **Step 4: Update useCompareSelection**

```typescript
export function useCompareSelection() {
  const { state, dispatch } = useAppState();
  const profile = state.profiles[state.activeProfileId];
  const selection = profile?.preferences.compareSelection ?? ['dc-baseline', 'kenya-nairobi'];
  const update = useCallback(
    (ids: string[]) => dispatch({ type: 'SET_COMPARE_SELECTION', payload: ids }),
    [dispatch],
  );
  return { selection, updateSelection: update };
}
```

- [ ] **Step 5: Add useProfiles hook**

```typescript
export function useProfiles() {
  const { state, dispatch } = useAppState();
  const profiles = Object.values(state.profiles);
  const activeProfile = state.profiles[state.activeProfileId];

  const switchProfile = useCallback(
    (id: string) => dispatch({ type: 'SWITCH_PROFILE', payload: id }),
    [dispatch],
  );
  const addProfile = useCallback(
    (name: string) => dispatch({ type: 'ADD_PROFILE', payload: { name } }),
    [dispatch],
  );
  const renameProfile = useCallback(
    (id: string, name: string) => dispatch({ type: 'RENAME_PROFILE', payload: { id, name } }),
    [dispatch],
  );
  const deleteProfile = useCallback(
    (id: string) => dispatch({ type: 'DELETE_PROFILE', payload: { id } }),
    [dispatch],
  );

  return { profiles, activeProfile, switchProfile, addProfile, renameProfile, deleteProfile };
}
```

- [ ] **Step 6: Fix any remaining type errors from consuming components**

Some components may reference `state.scenarios` directly (via `useAppState`). Check for direct `state.scenarios` access outside hooks — these need to read from the active profile instead. Key files to check:
- `src/routes/Dashboard.tsx` — may use `state.scenarios` for per-destination config
- `src/routes/Compare.tsx` — same
- `src/routes/Matrix.tsx` — same
- `src/routes/tabs/FinancialsTab.tsx` — uses `useAppState` for DC config

For any file that accesses `state.scenarios[destId]`, it should instead use `state.profiles[state.activeProfileId].preferences.scenarioOverrides[destId]`. But ideally they should use the `useScenario` hook rather than raw state access. Check each case and fix.

- [ ] **Step 7: Verify all tests pass**

```bash
npx tsc --noEmit
npx vitest run
```

Expected: Clean compile, all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/state/hooks.ts
git commit -m "feat: refactor hooks to read from active profile preferences"
```

---

## Task 4: Profile Switcher Component

**Files:**
- Create: `src/components/ProfileSwitcher.tsx`
- Create: `src/components/ProfileSwitcher.css`
- Modify: `src/components/Layout.tsx`
- Modify: `src/components/Layout.css`

- [ ] **Step 1: Create ProfileSwitcher component**

```typescript
// src/components/ProfileSwitcher.tsx
import { useState, useRef, useEffect } from 'react';
import { useProfiles } from '@/state/hooks';
import { User, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import './ProfileSwitcher.css';
```

The component renders:
- A button showing the active profile name (with User icon). Clicking toggles a dropdown.
- Dropdown lists all profiles. Active profile has a checkmark. Clicking another profile switches.
- Each profile row has a "..." menu (or inline icons) for Rename and Delete.
- Bottom of dropdown: "Add Profile" button.
- Add: shows an inline text input + confirm/cancel buttons. On confirm, dispatches `addProfile(name)`.
- Rename: turns the name into an inline text input. On confirm, dispatches `renameProfile(id, name)`.
- Delete: confirmation step ("Delete [name]?"). Disabled if only one profile.
- Clicking outside the dropdown closes it (useRef + useEffect for click-outside).

- [ ] **Step 2: Create ProfileSwitcher.css**

Style the dropdown to match the design system:
- Dropdown positioned absolutely below the button
- Dark card background (`--color-bg-secondary`), border, subtle shadow
- Profile items with hover state
- Active profile highlighted with `--color-highlight`
- Add/rename input styled like other inputs in the app
- z-index above other content

- [ ] **Step 3: Add ProfileSwitcher to Layout**

In `src/components/Layout.tsx`, import and place `<ProfileSwitcher />` in the top bar between the theme toggle and the nav links:

```tsx
<header className="top-nav">
  <NavLink to="/" className="top-nav-title">Life Change Planner</NavLink>
  <ProfileSwitcher />
  <button className="theme-toggle" ... />
  <nav className="top-nav-links">...</nav>
</header>
```

Also add "Report" to the NAV_ITEMS array:

```typescript
import { LayoutDashboard, GitCompare, Grid3x3, Map, FileText, Settings, Sun, Moon } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/matrix', label: 'Matrix', icon: Grid3x3 },
  { to: '/plan', label: 'Plan', icon: Map },
  { to: '/report', label: 'Report', icon: FileText },
  { to: '/inputs', label: 'Settings', icon: Settings },
];
```

- [ ] **Step 4: Update Layout.css for profile switcher placement**

Add styles for the profile switcher in the top bar: flex gap, alignment, responsive behavior (on mobile, show profile name in bottom bar or as a small icon).

- [ ] **Step 5: Verify profile switching works**

```bash
npm run dev
```

Open app, verify:
- Profile switcher shows "Mekoce" in top bar
- Click to see dropdown with Mekoce (checked) and Kara
- Switch to Kara — QoL weights, career selections reset to Kara's (initially cloned from Mekoce)
- Change a QoL weight as Kara, switch back to Mekoce — his weight is unchanged
- Add a new profile "Mom" — works, clones current preferences
- Rename works, delete works (disabled if last profile)

- [ ] **Step 6: Build and commit**

```bash
npm run build
git add src/components/ProfileSwitcher.tsx src/components/ProfileSwitcher.css src/components/Layout.tsx src/components/Layout.css
git commit -m "feat: profile switcher with add/rename/delete in top bar"
```

---

## Task 5: Report Page

**Files:**
- Create: `src/routes/Report.tsx`
- Create: `src/routes/Report.css`
- Modify: `src/App.tsx` (add route)

- [ ] **Step 1: Create Report.tsx**

The report page renders a clean, scrollable summary. It imports and uses the same engine functions as other pages:

```typescript
import { useMemo } from 'react';
import { useAppState } from '@/state/AppStateContext';
import { useProfiles, useQoLWeights } from '@/state/hooks';
import { ALL_DESTINATIONS, getDestination } from '@/data/destinations';
import { simulate } from '@/engine/simulate';
import { calculateQoLScore, normalizeFinancialScore, calculateCompositeScore, rankDestinations } from '@/engine/scoring';
import { Printer } from 'lucide-react';
import WealthChart from '@/components/WealthChart';
import ProfileSwitcher from '@/components/ProfileSwitcher';
```

Content sections (top to bottom):

1. **Header**: "Life Change Planner — Report for [activeProfile.name]" + `new Date().toLocaleDateString()`
2. **Assumptions block**: Compact 2-column layout showing key globals (household income, home value, mortgage, retirement age, return rate, inflation, move year, daughter's age)
3. **Ranked destinations table**: Run simulate() for all non-DC destinations, compute QoL scores, normalize financial scores, rank by composite. Table with columns: Rank, Flag+Name, Net Worth at 62, QoL Score, Composite, Career Preset, Narrative. Winner row highlighted.
4. **Top 3 cards**: For the top 3 ranked, render expanded cards with: name, accent color border, key metrics (net worth, vs DC delta, year-1 income, expenses, tax rate), mini WealthChart (~120px tall), pros/cons lists.
5. **Matrix summary**: Show active weight preset name (or "Custom"), list all dimension weights compactly, horizontal bar chart of composite scores (reuse BarRanking component or inline simple bars).
6. **Sensitivity**: Recompute sensitivity analysis (same logic as Matrix page) — show which weight changes flip #1 and #2.
7. **DC home decision**: For the #1 destination, show which home decision is selected and its impact.
8. **Move timeline**: For #1 destination, show move year, return year, daughter education milestones.
9. **Footer**: "Generated by [name] on [date]. These are planning estimates, not financial advice."

- [ ] **Step 2: Create Report.css**

Optimize for reading and printing:

```css
.report-page {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-5);
}

/* Print-friendly: wider line lengths, more whitespace */
.report-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.report-assumptions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2) var(--space-6);
  font-size: 0.78rem;
  margin-bottom: var(--space-8);
}

/* ... more styles for each section ... */

@media print {
  .top-nav,
  .bottom-bar,
  .report-print-btn,
  .report-profile-selector {
    display: none !important;
  }

  .report-page {
    max-width: 100%;
    padding: 0;
  }

  body {
    background: white;
    color: black;
  }

  .card {
    border: 1px solid #ccc;
    box-shadow: none;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
```

- [ ] **Step 3: Add Report route to App.tsx**

In `src/App.tsx`, import Report and add the route:

```typescript
import Report from './routes/Report';
// Inside Routes:
<Route path="report" element={<Report />} />
```

- [ ] **Step 4: Verify report renders**

```bash
npm run dev
```

Navigate to `#/report`. Verify all sections render, destinations are ranked, top 3 cards show mini charts, print button produces clean output.

- [ ] **Step 5: Build and commit**

```bash
npm run build
git add src/routes/Report.tsx src/routes/Report.css src/App.tsx
git commit -m "feat: shareable report page with ranked destinations, top 3 spotlight, and print support"
```

---

## Task 6: Final Build + Push + Deploy

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass (existing tests should work since hooks interface didn't change).

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Push**

```bash
git push
```

- [ ] **Step 4: Verify live**

Open `https://elcoche2025.github.io/retirement-planner/`:
- Profile switcher in top bar shows "Mekoce"
- Switch to "Kara" — change a QoL weight — switch back to "Mekoce" — weight unchanged
- Add "Mom" profile — works
- Report page shows ranked destinations for active profile
- Switch profile on report page — rankings change if weights differ
- Print button produces clean output
- Mobile: profile switcher accessible, report page readable
