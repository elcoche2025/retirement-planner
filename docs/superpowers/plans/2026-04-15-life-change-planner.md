# Life Change Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing DC-vs-Kenya retirement planner into a comprehensive multi-destination life-change planning app with financial modeling, quality-of-life scoring, and move planning.

**Architecture:** Vite + React + TypeScript SPA with HashRouter for GitHub Pages. All state in React Context persisted to localStorage. Financial projection engine as pure functions. ~12 destination data modules. CSS custom properties for theming. No backend.

**Tech Stack:** Vite 5, React 18, TypeScript, react-router-dom 6, Recharts 2, Vitest, @testing-library/react, lucide-react (icons)

**Design spec:** `docs/superpowers/specs/2026-04-15-life-change-planner-design.md`

---

## File Map

```
src/
  main.tsx                          Entry point (renders App)
  App.tsx                           Password gate + HashRouter provider
  styles/
    variables.css                   CSS custom properties (colors, spacing, typography)
    base.css                        Reset, body, global typography
    components.css                  Shared component styles (cards, tables, badges, sliders)
    gate.css                        Password gate styles
  types/
    index.ts                        All TypeScript interfaces (Destination, Scenario, etc.)
  data/
    destinations/
      index.ts                      Exports ALL_DESTINATIONS array
      dc-baseline.ts                DC data
      kenya-nairobi.ts              Kenya data
      nl-the-hague.ts               NL/Hague data
      nl-amsterdam.ts               NL/Amsterdam data
      spain-bilbao.ts               Bilbao data
      spain-barcelona.ts            Barcelona (shallow)
      spain-madrid.ts               Madrid (shallow)
      spain-valencia.ts             Valencia (shallow)
      mexico-cdmx.ts                Mexico City data
      mexico-oaxaca.ts              Oaxaca data
      colombia-medellin.ts          Medellin data
      uruguay-montevideo.ts         Montevideo data
    qol-dimensions.ts               QoL dimension metadata + default weights
    global-defaults.ts              Default GlobalAssumptions values
    weight-presets.ts               "Family First", "Money Maximizer", etc.
  engine/
    simulate.ts                     Core projection: (dest, career, globals, overrides) => YearlyProjection[]
    simulate.test.ts                Unit tests for projection engine
    taxes.ts                        Country-specific tax helpers
    taxes.test.ts                   Tax calculation tests
    housing.ts                      DC home sell/rent/keep logic
    housing.test.ts                 Housing calculation tests
    scoring.ts                      QoL weighted scoring + financial normalization
    scoring.test.ts                 Scoring tests
  state/
    AppStateContext.tsx              React Context + Provider + localStorage persistence
    hooks.ts                        useGlobalAssumptions, useScenario, useQoLWeights, useStore
  components/
    Layout.tsx                      Top nav + Outlet + mobile bottom bar
    Layout.css                      Layout styles
    DestinationCard.tsx             Dashboard card with sparkline + key stats
    DestinationCard.css
    MetricCard.tsx                  Single KPI card
    SliderInput.tsx                 Range slider with tracking value label
    ToggleGroup.tsx                 Radio-style card group
    DataTable.tsx                   Financial table with optional heat-mapping
    WealthChart.tsx                 Recharts AreaChart for wealth projection
    RadarChart.tsx                  Recharts RadarChart for QoL
    ComparisonChart.tsx             Multi-line overlay chart
    BarRanking.tsx                  Horizontal bars for matrix rankings
    TimelineVisual.tsx              Horizontal phase/milestone timeline
    Badge.tsx                       Small status badge
    TabNav.tsx                      Sub-tab navigation
    DestinationSelector.tsx         Dropdown for picking destinations
    NumberInput.tsx                 Currency-formatted input
    WeightSlider.tsx                Matrix weight slider
    SensitivityCard.tsx             "What changes the winner" callout
    AnimatedNumber.tsx              Counter animation (400ms roll)
  routes/
    Dashboard.tsx                   Overview of all scenarios
    Dashboard.css
    ScenarioDetail.tsx              Destination deep-dive shell + sub-tab router
    ScenarioDetail.css
    tabs/
      FinancialsTab.tsx             Wealth chart + cash flow table + metrics
      FinancialsTab.css
      CareerTab.tsx                 Career preset selector
      CareerTab.css
      HousingTab.tsx                DC home decision + destination housing
      LifeTab.tsx                   QoL radar + dimension cards
      LifeTab.css
      VisaTab.tsx                   Visa info + checklist
      TimelineTab.tsx               Move/return year + visual timeline
    Compare.tsx                     Side-by-side comparator
    Compare.css
    Matrix.tsx                      Weighted decision matrix
    Matrix.css
    Plan.tsx                        Move planning with phases + checklists
    Plan.css
    Inputs.tsx                      Global assumptions/settings
    Inputs.css
index.html                          Updated with new fonts + meta
vite.config.ts                      Updated for TypeScript
tsconfig.json                       TypeScript config
tsconfig.node.json                  Node TS config for vite
vitest.config.ts                    Test runner config
```

---

## Task 1: Project Setup — TypeScript, Router, Test Infrastructure

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js` → rename to `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vitest.config.ts`
- Rename: `src/main.jsx` → `src/main.tsx`
- Rename: `src/App.jsx` → `src/App.tsx`
- Rename: `src/RetirementPlanner.jsx` → `src/RetirementPlanner.tsx`
- Modify: `index.html`

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/mekocewalker/Library/CloudStorage/Dropbox/coding-projects/retirement-planner
npm install react-router-dom@^6.23.0 lucide-react@^0.400.0
npm install -D typescript@^5.5.0 @types/react@^18.3.0 @types/react-dom@^18.3.0 vitest@^2.0.0 @testing-library/react@^16.0.0 @testing-library/jest-dom@^6.4.0 jsdom@^24.1.0
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 5: Rename vite.config.js → vite.config.ts and update**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 6: Rename JSX files to TSX**

```bash
mv src/main.jsx src/main.tsx
mv src/App.jsx src/App.tsx
mv src/RetirementPlanner.jsx src/RetirementPlanner.tsx
```

- [ ] **Step 7: Add type annotations to App.tsx**

Update `src/App.tsx` — add minimal type annotations to make TS happy. The password gate logic stays identical, just add types to event handlers and state:

```typescript
// At top of App.tsx, add after imports:
// No changes to logic — just ensure event types compile.
// onChange handlers: (e: React.ChangeEvent<HTMLInputElement>)
// onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>)
```

The existing RetirementPlanner.tsx will have many implicit `any` types. That's fine — we'll replace it entirely in later tasks. For now, add `// @ts-nocheck` as the first line of `src/RetirementPlanner.tsx` so the build succeeds.

- [ ] **Step 8: Update index.html**

Replace the Google Fonts link with the new typography:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Update `<title>` to "Life Change Planner". Keep the `noindex` meta tag.

- [ ] **Step 9: Update package.json scripts**

Add test script:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 10: Verify build**

```bash
npm run build
```

Expected: Build succeeds (RetirementPlanner.tsx has `@ts-nocheck`, rest compiles clean).

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: migrate to TypeScript, add router + test infrastructure"
```

---

## Task 2: Design System — CSS Variables, Fonts, Base Styles

**Files:**
- Create: `src/styles/variables.css`
- Create: `src/styles/base.css`
- Create: `src/styles/components.css`
- Create: `src/styles/gate.css`
- Modify: `src/main.tsx` (import CSS)
- Modify: `src/App.tsx` (use CSS classes instead of inline styles for gate)

- [ ] **Step 1: Create src/styles/variables.css**

```css
:root {
  /* Core palette */
  --color-bg-primary: #1a1a17;
  --color-bg-secondary: #242420;
  --color-bg-tertiary: #2e2e28;
  --color-bg-input: #1f1f1b;

  --color-text-primary: #e8e4dc;
  --color-text-secondary: #a09a8c;
  --color-text-tertiary: #6b6560;

  /* Destination accents */
  --color-accent-dc: #c9a96e;
  --color-accent-kenya: #d4723c;
  --color-accent-netherlands: #4a8fb8;
  --color-accent-bilbao: #8b3a3a;
  --color-accent-cdmx: #2d7d5e;
  --color-accent-oaxaca: #9e6b3a;
  --color-accent-medellin: #c4a035;
  --color-accent-montevideo: #5b7a8a;
  --color-accent-amsterdam: #e07a3a;
  --color-accent-hague: #3a6b8b;

  /* Semantic */
  --color-positive: #6b9e6b;
  --color-negative: #b85a5a;
  --color-neutral: #8a8578;
  --color-highlight: #c9a96e;

  /* Section variants */
  --color-financial-bg: var(--color-bg-secondary);
  --color-life-bg: #262520;

  /* Typography */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'IBM Plex Sans', -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', 'SF Mono', monospace;

  /* Spacing (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-8: 48px;
  --space-10: 64px;

  /* Layout */
  --max-content: 1200px;
  --card-radius: 4px;
  --card-border: 1px solid var(--color-bg-tertiary);
  --card-padding: var(--space-5);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease-out;
  --transition-number: 400ms ease-out;
}
```

- [ ] **Step 2: Create src/styles/base.css**

```css
@import './variables.css';

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  line-height: 1.5;
  min-height: 100vh;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1.2;
}

h1 { font-size: 1.75rem; }
h2 { font-size: 1.35rem; }
h3 { font-size: 1.1rem; }
h4 { font-size: 0.95rem; }

a {
  color: var(--color-highlight);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Tabular numbers for financial data */
.mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.text-secondary { color: var(--color-text-secondary); }
.text-tertiary { color: var(--color-text-tertiary); }
.text-positive { color: var(--color-positive); }
.text-negative { color: var(--color-negative); }

/* Page fade-in */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-enter {
  animation: fadeUp var(--transition-normal) forwards;
}
```

- [ ] **Step 3: Create src/styles/components.css**

```css
/* === Cards === */
.card {
  background: var(--color-bg-secondary);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
}

.card-life {
  background: var(--color-life-bg);
}

/* === Badges === */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 2px;
  border: 1px solid var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
}

.badge-shallow {
  border-style: dashed;
}

/* === Sliders === */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--color-bg-tertiary);
  outline: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-highlight);
  border: 2px solid var(--color-bg-primary);
  box-shadow: 0 0 4px rgba(201, 169, 110, 0.3);
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-highlight);
  border: 2px solid var(--color-bg-primary);
  cursor: pointer;
}

/* === Tables === */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.data-table th {
  text-align: left;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-bg-tertiary);
}

.data-table th.right,
.data-table td.right {
  text-align: right;
}

.data-table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid rgba(46, 46, 40, 0.5);
  color: var(--color-text-primary);
}

.data-table tr:hover td {
  background: rgba(46, 46, 40, 0.3);
}

/* === Buttons === */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--card-radius);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.btn:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-text-tertiary);
}

.btn-active {
  border-color: var(--color-highlight);
  color: var(--color-highlight);
}

/* === Toggle Group === */
.toggle-group {
  display: flex;
  gap: var(--space-2);
}

.toggle-group .btn {
  flex: 1;
  justify-content: center;
  text-align: center;
}

/* === Tab Navigation === */
.tab-nav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-bg-tertiary);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-nav a,
.tab-nav button {
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
  white-space: nowrap;
}

.tab-nav a:hover,
.tab-nav button:hover {
  color: var(--color-text-secondary);
  text-decoration: none;
}

.tab-nav a.active,
.tab-nav button.active {
  color: var(--color-highlight);
  border-bottom-color: var(--color-highlight);
}

/* === Metric Card === */
.metric-card {
  text-align: center;
  padding: var(--space-3) var(--space-2);
}

.metric-card .value {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.metric-card .label {
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.metric-card .sub {
  font-size: 0.65rem;
  color: var(--color-text-tertiary);
}

/* === Scrollable on mobile === */
.scroll-x {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* === Section spacing === */
.section {
  margin-bottom: var(--space-8);
}

.section-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-bg-tertiary);
}
```

- [ ] **Step 4: Create src/styles/gate.css**

```css
.gate {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: var(--space-5);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

.gate-box {
  text-align: center;
  width: 100%;
  max-width: 320px;
}

.gate-box.shake {
  animation: shake 0.45s ease;
}

.gate-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-1);
}

.gate-subtitle {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-highlight);
  letter-spacing: 0.06em;
  margin-bottom: var(--space-6);
}

.gate-input {
  display: block;
  width: 100%;
  padding: 11px 14px;
  background: var(--color-bg-input);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--card-radius);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: var(--space-3);
  transition: border-color var(--transition-fast);
}

.gate-input:focus {
  outline: none;
  border-color: var(--color-highlight);
}

.gate-input.error {
  border-color: var(--color-negative);
}

.gate-btn {
  display: block;
  width: 100%;
  padding: 11px;
  background: #a08840;
  border: none;
  border-radius: var(--card-radius);
  color: var(--color-bg-primary);
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.gate-btn:hover {
  background: var(--color-highlight);
}

.gate-error {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-negative);
  margin-top: var(--space-3);
}
```

- [ ] **Step 5: Update src/main.tsx to import CSS**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/base.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 6: Rewrite src/App.tsx with CSS classes**

```typescript
import { useState, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './styles/gate.css';

const HASH = '78163a9b32a43d0bf9bf5a80cd700105ddd6e3abe279bb190fa9b97f05c59e77';

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  async function tryAuth() {
    const hash = await sha256(pw);
    if (hash === HASH) {
      sessionStorage.setItem('planner-auth', 'true');
      onAuth();
    } else {
      setError(true);
      setShake(true);
      setPw('');
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="gate">
      <div className={`gate-box ${shake ? 'shake' : ''}`}>
        <h1 className="gate-title">Life Change Planner</h1>
        <p className="gate-subtitle">CHART YOUR NEXT HORIZON</p>
        <input
          className={`gate-input ${error ? 'error' : ''}`}
          type="password"
          placeholder="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') tryAuth(); }}
          autoFocus
        />
        <button className="gate-btn" onClick={tryAuth}>Enter</button>
        {error && <p className="gate-error">incorrect</p>}
      </div>
    </div>
  );
}

function PlaceholderApp() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<div className="page-enter" style={{ padding: 48, textAlign: 'center' }}><h1>Life Change Planner</h1><p className="text-secondary" style={{ marginTop: 12 }}>Dashboard coming soon</p></div>} />
      </Routes>
    </HashRouter>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('planner-auth') === 'true') {
      setAuthed(true);
    }
  }, []);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;
  return <PlaceholderApp />;
}
```

- [ ] **Step 7: Verify dev server works**

```bash
npm run dev
```

Open browser. Verify password gate renders with new Fraunces font and warm dark palette. Enter "lullaby" — see placeholder dashboard.

- [ ] **Step 8: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat: design system — CSS variables, typography, restyled gate"
```

---

## Task 3: Type Definitions

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write all TypeScript interfaces**

Create `src/types/index.ts` with every type from the design spec. This is the contract for all data flowing through the app:

```typescript
// ============================================
// DESTINATION & SCENARIO DATA
// ============================================

export interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  region?: string;
  accentColor: string;
  flag: string;
  timezone: string;
  utcOffset: number;
  usTimezoneGap: number;
  researchDepth: 'deep' | 'moderate' | 'shallow';
  costOfLiving: CostOfLiving;
  taxRegime: TaxRegime;
  housing: HousingMarket;
  careerPresets: CareerPreset[];
  qolDefaults: QualityOfLifeRatings;
  visa: VisaInfo;
  narrative: string;
  pros: string[];
  cons: string[];
  dealbreakers: string[];
}

export interface CostOfLiving {
  monthlyBaseline: number;
  monthlyComfortable: number;
  internationalSchoolAnnual: number;
  healthInsuranceMonthly: number;
  costMultiplierVsDC: number;
  notes: string[];
}

export interface TaxRegime {
  incomeTaxRate: number;
  capitalGainsTax: number;
  socialCharges?: number;
  specialRegime?: string;
  specialRegimeDetails?: string;
  usTaxObligation: string;
  treatyBenefits?: string;
  estimatedEffectiveTotalRate: number;
}

export interface HousingMarket {
  rentMonthly2BR: number;
  rentMonthly3BR: number;
  buyMedianPrice: number;
  mortgageAvailable: boolean;
  foreignOwnershipAllowed: boolean;
  notes: string[];
}

export interface VisaInfo {
  type: string;
  duration: string;
  renewalProcess: string;
  requirements: string[];
  processingTime: string;
  costs: string;
  workRights: string;
  spouseWorkRights: string;
  pathToPR: string;
  gotchas: string[];
}

// ============================================
// CAREER MODEL
// ============================================

export interface CareerPreset {
  id: string;
  name: string;
  description: string;
  yourRole: string;
  karaRole: string;
  yourAnnualIncome: number;
  karaAnnualIncome: number;
  householdAnnualIncome: number;
  incomeGrowthRate: number;
  benefits: string[];
  benefitsMonetaryValue: number;
  visaCompatible: boolean;
  notes: string[];
}

// ============================================
// QUALITY OF LIFE
// ============================================

export type QoLDimension =
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

export const QOL_DIMENSIONS: QoLDimension[] = [
  'familyProximity',
  'childEducation',
  'languageEnvironment',
  'healthcareQuality',
  'safety',
  'climate',
  'culturalFit',
  'careerSatisfaction',
  'communityBuilding',
  'politicalStability',
  'adventureNovelty',
  'returnFlexibility',
];

export interface QoLDimensionMeta {
  id: QoLDimension;
  label: string;
  description: string;
  icon: string;
}

export type QualityOfLifeRatings = Record<QoLDimension, number>;

export interface QoLWeights {
  weights: Record<QoLDimension, number>;
  financialWeight: number;
}

export interface WeightPreset {
  id: string;
  name: string;
  weights: QoLWeights;
}

// ============================================
// FINANCIAL PROJECTION ENGINE
// ============================================

export interface GlobalAssumptions {
  currentAge: number;
  retirementAge: number;
  moveYear: number;
  returnYear: number | null;
  currentSavings: number;
  retirement457b: number;
  otherRetirement: number;
  currentHomeValue: number;
  currentMortgageBalance: number;
  monthlyMortgage: number;
  homeAppreciationRate: number;
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  rentalIncomeMonthly: number;
  propertyMgmtPct: number;
  monthlyInsuranceTax: number;
  monthlyMaintenance: number;
  investmentReturnRate: number;
  inflationRate: number;
  currentHouseholdIncome: number;
  closingCostPct: number;
  convertToRoth: boolean;
  rothConversionTaxRate: number;
  annualRothContribution: number;
}

export interface YearlyProjection {
  year: number;
  age: number;
  location: string;
  grossIncome: number;
  benefitsValue: number;
  totalCompensation: number;
  localTax: number;
  usTax: number;
  totalTax: number;
  livingExpenses: number;
  housingCost: number;
  schooling: number;
  healthInsurance: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsContribution: number;
  investmentBalance: number;
  retirementBalance: number;
  homeEquity: number;
  rentalNetIncome: number;
  totalNetWorth: number;
}

// ============================================
// SCENARIO
// ============================================

export interface ScenarioConfig {
  destinationId: string;
  selectedCareerPreset: string;
  customIncome?: { yours?: number; karas?: number };
  customQoLRatings: Partial<QualityOfLifeRatings>;
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  moveYear: number;
  returnYear: number | null;
}

// ============================================
// DECISION MATRIX
// ============================================

export interface MatrixResult {
  destinationId: string;
  financialScore: number;
  qolScore: number;
  compositeScore: number;
  rank: number;
}

// ============================================
// APP STATE
// ============================================

export interface AppState {
  version: number;
  globalAssumptions: GlobalAssumptions;
  scenarios: Record<string, ScenarioConfig>;
  qolWeights: QoLWeights;
  lastVisited: string;
  compareSelection: string[];
  matrixPreset: string;
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors from `src/types/index.ts`. RetirementPlanner.tsx is `@ts-nocheck` so it's skipped.

- [ ] **Step 3: Commit**

```bash
git add src/types/
git commit -m "feat: add all TypeScript type definitions"
```

---

## Task 4: Destination Data Files (4 Deep + 8 Shallow)

**Files:**
- Create: `src/data/destinations/dc-baseline.ts`
- Create: `src/data/destinations/kenya-nairobi.ts`
- Create: `src/data/destinations/nl-the-hague.ts`
- Create: `src/data/destinations/spain-bilbao.ts`
- Create: `src/data/destinations/nl-amsterdam.ts`
- Create: `src/data/destinations/mexico-cdmx.ts`
- Create: `src/data/destinations/mexico-oaxaca.ts`
- Create: `src/data/destinations/colombia-medellin.ts`
- Create: `src/data/destinations/uruguay-montevideo.ts`
- Create: `src/data/destinations/spain-barcelona.ts`
- Create: `src/data/destinations/spain-madrid.ts`
- Create: `src/data/destinations/spain-valencia.ts`
- Create: `src/data/destinations/index.ts`
- Create: `src/data/qol-dimensions.ts`
- Create: `src/data/global-defaults.ts`
- Create: `src/data/weight-presets.ts`

This is the largest data-entry task. The 4 deeply-researched destinations (DC, Kenya, NL/Hague, Bilbao) should be fully populated from the research documents in `~/Library/CloudStorage/Dropbox/coding-projects/life-change/`. The remaining 8 destinations use best-effort research and are marked `researchDepth: 'shallow'` or `'moderate'`.

- [ ] **Step 1: Create DC baseline destination**

Read the existing retirement planner defaults and the compass artifacts for DC numbers. Create `src/data/destinations/dc-baseline.ts`:

```typescript
import { Destination } from '@/types';

const dcBaseline: Destination = {
  id: 'dc-baseline',
  name: 'Washington, DC',
  country: 'United States',
  city: 'Washington',
  region: 'District of Columbia',
  accentColor: 'var(--color-accent-dc)',
  flag: '🇺🇸',
  timezone: 'America/New_York',
  utcOffset: -5,
  usTimezoneGap: 0,
  researchDepth: 'deep',

  costOfLiving: {
    monthlyBaseline: 6500,
    monthlyComfortable: 9000,
    internationalSchoolAnnual: 0,
    healthInsuranceMonthly: 500,
    costMultiplierVsDC: 1.0,
    notes: ['$4,600/mo mortgage on NW row home', 'Childcare ~$3,000/mo temporarily'],
  },

  taxRegime: {
    incomeTaxRate: 22,
    capitalGainsTax: 15,
    usTaxObligation: 'Full domestic',
    estimatedEffectiveTotalRate: 28,
  },

  housing: {
    rentMonthly2BR: 2500,
    rentMonthly3BR: 3500,
    buyMedianPrice: 750000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: ['Currently own: $1.1M value, $622K mortgage', 'NW DC, 1927 row home, recently remodeled'],
  },

  careerPresets: [
    {
      id: 'dc-current',
      name: 'Current: DCPS + Kara Employed',
      description: 'Status quo — both working in DC',
      yourRole: 'DCPS Special Education Teacher',
      karaRole: 'Current employer ($90K)',
      yourAnnualIncome: 130000,
      karaAnnualIncome: 90000,
      householdAnnualIncome: 220000,
      incomeGrowthRate: 2.5,
      benefits: ['DCPS pension', '457(b) with match', 'Health insurance', 'Summer break'],
      benefitsMonetaryValue: 25000,
      visaCompatible: true,
      notes: ['457(b) balance: $100K', 'Pension vests after 5 years'],
    },
    {
      id: 'dc-independent',
      name: 'DC Independent: SPED Consulting',
      description: 'Leave DCPS, go full-time independent from DC',
      yourRole: 'Independent SPED Consultant + IEP Pulse',
      karaRole: 'Current employer ($90K)',
      yourAnnualIncome: 82000,
      karaAnnualIncome: 90000,
      householdAnnualIncome: 172000,
      incomeGrowthRate: 15,
      benefits: ['Schedule flexibility', 'Unlimited income ceiling', 'Building equity in IEP Pulse'],
      benefitsMonetaryValue: 0,
      visaCompatible: true,
      notes: ['Year 1 estimate. Year 2: $158K. Year 3: $253K.', 'See compass artifact for 5-year projection'],
    },
  ],

  qolDefaults: {
    familyProximity: 3,
    childEducation: 7,
    languageEnvironment: 5,
    healthcareQuality: 7,
    safety: 6,
    climate: 5,
    culturalFit: 7,
    careerSatisfaction: 6,
    communityBuilding: 6,
    politicalStability: 7,
    adventureNovelty: 3,
    returnFlexibility: 10,
  },

  visa: {
    type: 'N/A — US Citizen',
    duration: 'Permanent',
    renewalProcess: 'N/A',
    requirements: [],
    processingTime: 'N/A',
    costs: '$0',
    workRights: 'Full',
    spouseWorkRights: 'Full',
    pathToPR: 'Already permanent resident',
    gotchas: [],
  },

  narrative: 'The baseline. A $220K household income in one of the most expensive metro areas in the US, with strong career infrastructure but limited financial runway for retirement without aggressive saving.',
  pros: ['Dual high income', 'DCPS pension', 'Home equity growing', 'Political/cultural capital', 'No relocation risk'],
  cons: ['$4,600/mo mortgage', 'High cost of living', 'Far from family in Kenya', 'Career ceiling without change', 'Limited adventure'],
  dealbreakers: [],
};

export default dcBaseline;
```

- [ ] **Step 2: Create Kenya/Nairobi destination**

Create `src/data/destinations/kenya-nairobi.ts`. Populate from the Kenya PDF and retirement planner. Key numbers: ISK salary $60K-$90K, COL ~25-45% of DC, 8-hour US time zone gap, parents near Nanyuki.

Follow the same structure as DC. Full career presets:
- "ISK Teaching + Kara at Home" (your: $70K, Kara: $25K part-time/tutoring)
- "ISK Teaching + Kara Teaching" (your: $70K, Kara: $50K)
- "Full Independent from Nairobi" (your: $60K consulting, Kara: $25K)

QoL: familyProximity=10, childEducation=7, safety=5, climate=8, healthcare=5, adventure=9, returnFlexibility=7.

- [ ] **Step 3: Create Netherlands/The Hague destination**

Create `src/data/destinations/nl-the-hague.ts`. Populate from the DAFT visa compass artifact. Key numbers: DAFT visa €4,500, ASH salary €68-80K for Kara, IEP Pulse business for you, The Hague COL ~18% below DC.

Career presets:
- "DAFT Business + Kara at ASH" (your: $45K yr1, Kara: $82K at ASH)
- "DAFT Business + Kara Independent" (your: $45K, Kara: $35K)
- "Both at International Schools" (your: $65K, Kara: $75K)

QoL: familyProximity=2, childEducation=9, healthcare=9, safety=9, climate=5, culturalFit=7, politicalStability=9, returnFlexibility=8.

- [ ] **Step 4: Create Spain/Bilbao destination**

Create `src/data/destinations/spain-bilbao.ts`. Populate from the Bilbao docx. Key: Basque foral tax system, Digital Nomad Visa, COL €3,400-4,500/mo, international schools ~€10K/yr.

Career presets:
- "International School + Kara Part-Time" (your: $55K, Kara: $20K)
- "Remote Tech + SPED Consulting" (your: $80K remote, Kara: $0-20K)
- "DNV: Full Remote US Clients" (your: $100K, Kara: $0)

QoL: familyProximity=2, childEducation=7, healthcare=8, safety=9, climate=7, culturalFit=8, adventure=8, returnFlexibility=7.

- [ ] **Step 5: Create remaining 8 destination files**

For each of: `nl-amsterdam.ts`, `mexico-cdmx.ts`, `mexico-oaxaca.ts`, `colombia-medellin.ts`, `uruguay-montevideo.ts`, `spain-barcelona.ts`, `spain-madrid.ts`, `spain-valencia.ts` — create files following the same Destination interface. Use the research agent's compiled data for numbers. Mark appropriate `researchDepth`.

Amsterdam: `'moderate'` (same visa/tax as Hague, different COL).
Mexico City: `'moderate'` (research available from compass artifact).
Others: `'shallow'`.

- [ ] **Step 6: Create destinations index**

```typescript
// src/data/destinations/index.ts
import dcBaseline from './dc-baseline';
import kenyaNairobi from './kenya-nairobi';
import nlTheHague from './nl-the-hague';
import nlAmsterdam from './nl-amsterdam';
import spainBilbao from './spain-bilbao';
import spainBarcelona from './spain-barcelona';
import spainMadrid from './spain-madrid';
import spainValencia from './spain-valencia';
import mexicoCdmx from './mexico-cdmx';
import mexicoOaxaca from './mexico-oaxaca';
import colombiaMedellin from './colombia-medellin';
import uruguayMontevideo from './uruguay-montevideo';
import { Destination } from '@/types';

export const ALL_DESTINATIONS: Destination[] = [
  dcBaseline,
  kenyaNairobi,
  nlTheHague,
  nlAmsterdam,
  spainBilbao,
  spainBarcelona,
  spainMadrid,
  spainValencia,
  mexicoCdmx,
  mexicoOaxaca,
  colombiaMedellin,
  uruguayMontevideo,
];

export function getDestination(id: string): Destination | undefined {
  return ALL_DESTINATIONS.find((d) => d.id === id);
}

export { dcBaseline, kenyaNairobi, nlTheHague, nlAmsterdam, spainBilbao };
```

- [ ] **Step 7: Create QoL dimensions metadata**

```typescript
// src/data/qol-dimensions.ts
import { QoLDimensionMeta } from '@/types';

export const QOL_DIMENSION_META: QoLDimensionMeta[] = [
  { id: 'familyProximity', label: 'Family Proximity', description: 'How close to parents in Nanyuki, Kenya and extended family', icon: 'Heart' },
  { id: 'childEducation', label: 'Child Education', description: 'Quality of schooling options for daughter (age 3+)', icon: 'GraduationCap' },
  { id: 'languageEnvironment', label: 'Language Environment', description: 'Bilingual/multilingual exposure for daughter and family', icon: 'Languages' },
  { id: 'healthcareQuality', label: 'Healthcare', description: 'Access, quality, and affordability of healthcare', icon: 'Stethoscope' },
  { id: 'safety', label: 'Safety', description: 'Personal safety and security environment', icon: 'Shield' },
  { id: 'climate', label: 'Climate', description: 'Weather, outdoor lifestyle, seasonal comfort', icon: 'Sun' },
  { id: 'culturalFit', label: 'Cultural Fit', description: 'Alignment with family values, diversity, community feel', icon: 'Globe' },
  { id: 'careerSatisfaction', label: 'Career Satisfaction', description: 'Professional fulfillment, growth potential, meaningful work', icon: 'Briefcase' },
  { id: 'communityBuilding', label: 'Community', description: 'Ease of building social connections, expat community, belonging', icon: 'Users' },
  { id: 'politicalStability', label: 'Political Stability', description: 'Government stability, rule of law, institutional reliability', icon: 'Landmark' },
  { id: 'adventureNovelty', label: 'Adventure & Novelty', description: 'New experiences, cultural richness, life-expanding potential', icon: 'Compass' },
  { id: 'returnFlexibility', label: 'Return Flexibility', description: 'How easy to reverse course and return to DC if needed', icon: 'ArrowLeftRight' },
];
```

- [ ] **Step 8: Create global defaults**

```typescript
// src/data/global-defaults.ts
import { GlobalAssumptions } from '@/types';

export const GLOBAL_DEFAULTS: GlobalAssumptions = {
  currentAge: 43,
  retirementAge: 62,
  moveYear: 2027,
  returnYear: null,
  currentSavings: 50000,
  retirement457b: 100000,
  otherRetirement: 0,
  currentHomeValue: 1100000,
  currentMortgageBalance: 622338,
  monthlyMortgage: 4600,
  homeAppreciationRate: 4,
  dcHomeDecision: 'sell',
  rentalIncomeMonthly: 5000,
  propertyMgmtPct: 8,
  monthlyInsuranceTax: 800,
  monthlyMaintenance: 400,
  investmentReturnRate: 7,
  inflationRate: 3,
  currentHouseholdIncome: 220000,
  closingCostPct: 6,
  convertToRoth: true,
  rothConversionTaxRate: 22,
  annualRothContribution: 7000,
};
```

- [ ] **Step 9: Create weight presets**

```typescript
// src/data/weight-presets.ts
import { WeightPreset, QoLDimension } from '@/types';

function makeWeights(overrides: Partial<Record<QoLDimension, number>>, financialWeight: number): WeightPreset['weights'] {
  const base: Record<QoLDimension, number> = {
    familyProximity: 5, childEducation: 5, languageEnvironment: 5,
    healthcareQuality: 5, safety: 5, climate: 5, culturalFit: 5,
    careerSatisfaction: 5, communityBuilding: 5, politicalStability: 5,
    adventureNovelty: 5, returnFlexibility: 5,
  };
  return { weights: { ...base, ...overrides }, financialWeight };
}

export const WEIGHT_PRESETS: WeightPreset[] = [
  {
    id: 'balanced',
    name: 'Balanced',
    weights: makeWeights({}, 5),
  },
  {
    id: 'family-first',
    name: 'Family First',
    weights: makeWeights({ familyProximity: 10, childEducation: 9, safety: 8, healthcareQuality: 8, returnFlexibility: 7 }, 4),
  },
  {
    id: 'money-maximizer',
    name: 'Money Maximizer',
    weights: makeWeights({ careerSatisfaction: 8, returnFlexibility: 7, familyProximity: 3, adventureNovelty: 2, climate: 2 }, 10),
  },
  {
    id: 'adventure-mode',
    name: 'Adventure Mode',
    weights: makeWeights({ adventureNovelty: 10, culturalFit: 8, languageEnvironment: 8, climate: 7, familyProximity: 3, returnFlexibility: 2 }, 3),
  },
];
```

- [ ] **Step 10: Verify all data compiles**

```bash
npx tsc --noEmit
```

Expected: Clean compile. All destination files satisfy the `Destination` interface.

- [ ] **Step 11: Commit**

```bash
git add src/data/
git commit -m "feat: add destination data for 12 locations + QoL dimensions + global defaults"
```

---

## Task 5: State Management — React Context + localStorage

**Files:**
- Create: `src/state/AppStateContext.tsx`
- Create: `src/state/hooks.ts`

- [ ] **Step 1: Create AppStateContext**

```typescript
// src/state/AppStateContext.tsx
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, GlobalAssumptions, ScenarioConfig, QoLWeights, QualityOfLifeRatings } from '@/types';
import { GLOBAL_DEFAULTS } from '@/data/global-defaults';
import { WEIGHT_PRESETS } from '@/data/weight-presets';
import { ALL_DESTINATIONS } from '@/data/destinations';

const STORAGE_KEY = 'life-change-planner-state';
const STATE_VERSION = 1;

function getDefaultScenarios(): Record<string, ScenarioConfig> {
  const scenarios: Record<string, ScenarioConfig> = {};
  for (const dest of ALL_DESTINATIONS) {
    scenarios[dest.id] = {
      destinationId: dest.id,
      selectedCareerPreset: dest.careerPresets[0]?.id ?? '',
      customQoLRatings: {},
      dcHomeDecision: dest.id === 'dc-baseline' ? 'keep' : 'sell',
      moveYear: GLOBAL_DEFAULTS.moveYear,
      returnYear: null,
    };
  }
  return scenarios;
}

function getInitialState(): AppState {
  return {
    version: STATE_VERSION,
    globalAssumptions: { ...GLOBAL_DEFAULTS },
    scenarios: getDefaultScenarios(),
    qolWeights: WEIGHT_PRESETS[0].weights,
    lastVisited: 'dc-baseline',
    compareSelection: ['dc-baseline', 'kenya-nairobi'],
    matrixPreset: 'balanced',
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw);
    if (parsed.version !== STATE_VERSION) return getInitialState();
    return parsed as AppState;
  } catch {
    return getInitialState();
  }
}

type Action =
  | { type: 'SET_GLOBAL_ASSUMPTIONS'; payload: Partial<GlobalAssumptions> }
  | { type: 'SET_SCENARIO'; payload: { id: string; config: Partial<ScenarioConfig> } }
  | { type: 'SET_QOL_WEIGHTS'; payload: QoLWeights }
  | { type: 'SET_QOL_RATING'; payload: { destinationId: string; dimension: keyof QualityOfLifeRatings; value: number } }
  | { type: 'RESET_QOL_RATING'; payload: { destinationId: string; dimension: keyof QualityOfLifeRatings } }
  | { type: 'SET_LAST_VISITED'; payload: string }
  | { type: 'SET_COMPARE_SELECTION'; payload: string[] }
  | { type: 'SET_MATRIX_PRESET'; payload: string }
  | { type: 'RESET_ALL' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_GLOBAL_ASSUMPTIONS':
      return { ...state, globalAssumptions: { ...state.globalAssumptions, ...action.payload } };
    case 'SET_SCENARIO': {
      const existing = state.scenarios[action.payload.id] ?? {};
      return {
        ...state,
        scenarios: {
          ...state.scenarios,
          [action.payload.id]: { ...existing, ...action.payload.config } as ScenarioConfig,
        },
      };
    }
    case 'SET_QOL_WEIGHTS':
      return { ...state, qolWeights: action.payload };
    case 'SET_QOL_RATING': {
      const { destinationId, dimension, value } = action.payload;
      const scenario = state.scenarios[destinationId];
      if (!scenario) return state;
      return {
        ...state,
        scenarios: {
          ...state.scenarios,
          [destinationId]: {
            ...scenario,
            customQoLRatings: { ...scenario.customQoLRatings, [dimension]: value },
          },
        },
      };
    }
    case 'RESET_QOL_RATING': {
      const { destinationId, dimension } = action.payload;
      const scenario = state.scenarios[destinationId];
      if (!scenario) return state;
      const updated = { ...scenario.customQoLRatings };
      delete updated[dimension];
      return {
        ...state,
        scenarios: {
          ...state.scenarios,
          [destinationId]: { ...scenario, customQoLRatings: updated },
        },
      };
    }
    case 'SET_LAST_VISITED':
      return { ...state, lastVisited: action.payload };
    case 'SET_COMPARE_SELECTION':
      return { ...state, compareSelection: action.payload };
    case 'SET_MATRIX_PRESET':
      return { ...state, matrixPreset: action.payload };
    case 'RESET_ALL':
      return getInitialState();
    default:
      return state;
  }
}

interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppStateCtx = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppStateCtx.Provider value={{ state, dispatch }}>
      {children}
    </AppStateCtx.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export type { Action };
```

- [ ] **Step 2: Create convenience hooks**

```typescript
// src/state/hooks.ts
import { useCallback } from 'react';
import { useAppState } from './AppStateContext';
import { GlobalAssumptions, ScenarioConfig, QoLWeights, QualityOfLifeRatings } from '@/types';
import { getDestination } from '@/data/destinations';

export function useGlobalAssumptions() {
  const { state, dispatch } = useAppState();
  const update = useCallback(
    (values: Partial<GlobalAssumptions>) => dispatch({ type: 'SET_GLOBAL_ASSUMPTIONS', payload: values }),
    [dispatch],
  );
  return { globals: state.globalAssumptions, updateGlobals: update };
}

export function useScenario(destinationId: string) {
  const { state, dispatch } = useAppState();
  const config = state.scenarios[destinationId];
  const destination = getDestination(destinationId);

  const update = useCallback(
    (values: Partial<ScenarioConfig>) => dispatch({ type: 'SET_SCENARIO', payload: { id: destinationId, config: values } }),
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
    ? { ...destination.qolDefaults, ...config?.customQoLRatings }
    : undefined;

  const selectedPreset = destination?.careerPresets.find((p) => p.id === config?.selectedCareerPreset);

  return { config, destination, update, setQoLRating, resetQoLRating, effectiveQoL, selectedPreset };
}

export function useQoLWeights() {
  const { state, dispatch } = useAppState();
  const update = useCallback(
    (weights: QoLWeights) => dispatch({ type: 'SET_QOL_WEIGHTS', payload: weights }),
    [dispatch],
  );
  return { weights: state.qolWeights, updateWeights: update };
}

export function useCompareSelection() {
  const { state, dispatch } = useAppState();
  const update = useCallback(
    (ids: string[]) => dispatch({ type: 'SET_COMPARE_SELECTION', payload: ids }),
    [dispatch],
  );
  return { selection: state.compareSelection, updateSelection: update };
}
```

- [ ] **Step 3: Verify compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/state/
git commit -m "feat: React Context state management with localStorage persistence"
```

---

## Task 6: Financial Projection Engine + Tests

**Files:**
- Create: `src/engine/simulate.ts`
- Create: `src/engine/simulate.test.ts`
- Create: `src/engine/taxes.ts`
- Create: `src/engine/taxes.test.ts`
- Create: `src/engine/housing.ts`
- Create: `src/engine/housing.test.ts`
- Create: `src/engine/scoring.ts`
- Create: `src/engine/scoring.test.ts`

- [ ] **Step 1: Write failing test for tax helpers**

```typescript
// src/engine/taxes.test.ts
import { describe, it, expect } from 'vitest';
import { estimateUSTax, estimateLocalTax, estimateEffectiveTax } from './taxes';

describe('estimateUSTax', () => {
  it('returns federal tax at domestic rate for DC', () => {
    const tax = estimateUSTax(220000, 'dc-baseline', false);
    expect(tax).toBeGreaterThan(30000);
    expect(tax).toBeLessThan(50000);
  });

  it('applies FEIE for abroad scenarios under exclusion limit', () => {
    const taxAbroad = estimateUSTax(100000, 'kenya-nairobi', true);
    const taxDomestic = estimateUSTax(100000, 'dc-baseline', false);
    expect(taxAbroad).toBeLessThan(taxDomestic);
  });

  it('returns 0 when income is below FEIE', () => {
    const tax = estimateUSTax(80000, 'kenya-nairobi', true);
    expect(tax).toBe(0);
  });
});

describe('estimateLocalTax', () => {
  it('returns 0 for DC baseline', () => {
    expect(estimateLocalTax(220000, 'dc-baseline')).toBe(0);
  });

  it('returns positive tax for Netherlands', () => {
    const tax = estimateLocalTax(100000, 'nl-the-hague');
    expect(tax).toBeGreaterThan(10000);
  });
});

describe('estimateEffectiveTax', () => {
  it('effective is max of US and local, not sum', () => {
    const result = estimateEffectiveTax(100000, 'nl-the-hague');
    expect(result.total).toBeLessThan(result.usTax + result.localTax + 1);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/engine/taxes.test.ts
```

Expected: FAIL — module `./taxes` not found.

- [ ] **Step 3: Implement taxes.ts**

```typescript
// src/engine/taxes.ts
import { getDestination } from '@/data/destinations';

const FEIE_2026 = 130000;
const US_BRACKETS_2026 = [
  { min: 0, max: 23850, rate: 0.10 },
  { min: 23850, max: 96950, rate: 0.12 },
  { min: 96950, max: 206700, rate: 0.22 },
  { min: 206700, max: 394600, rate: 0.24 },
  { min: 394600, max: 501050, rate: 0.32 },
  { min: 501050, max: 751600, rate: 0.35 },
  { min: 751600, max: Infinity, rate: 0.37 },
];

function calcBracketTax(income: number, brackets: { min: number; max: number; rate: number }[]): number {
  let tax = 0;
  for (const bracket of brackets) {
    if (income <= bracket.min) break;
    const taxable = Math.min(income, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }
  return tax;
}

export function estimateUSTax(grossIncome: number, destinationId: string, applyFEIE: boolean = true): number {
  const isAbroad = destinationId !== 'dc-baseline';
  if (isAbroad && applyFEIE) {
    const taxableAfterFEIE = Math.max(0, grossIncome - FEIE_2026);
    if (taxableAfterFEIE <= 0) return 0;
    return calcBracketTax(taxableAfterFEIE, US_BRACKETS_2026);
  }
  return calcBracketTax(grossIncome, US_BRACKETS_2026);
}

export function estimateLocalTax(grossIncome: number, destinationId: string): number {
  if (destinationId === 'dc-baseline') return 0;
  const dest = getDestination(destinationId);
  if (!dest) return 0;
  const effectiveRate = dest.taxRegime.incomeTaxRate / 100;
  return grossIncome * effectiveRate;
}

export interface TaxResult {
  usTax: number;
  localTax: number;
  foreignTaxCredit: number;
  total: number;
}

export function estimateEffectiveTax(grossIncome: number, destinationId: string): TaxResult {
  const usTax = estimateUSTax(grossIncome, destinationId);
  const localTax = estimateLocalTax(grossIncome, destinationId);
  const foreignTaxCredit = Math.min(localTax, usTax);
  const total = Math.max(usTax, localTax);
  return { usTax, localTax, foreignTaxCredit, total };
}
```

- [ ] **Step 4: Run tax tests — verify pass**

```bash
npx vitest run src/engine/taxes.test.ts
```

Expected: All pass.

- [ ] **Step 5: Write failing test for housing helpers**

```typescript
// src/engine/housing.test.ts
import { describe, it, expect } from 'vitest';
import { projectHomeEquity, calculateRentalCashFlow, calculateSaleProceeds } from './housing';

describe('calculateSaleProceeds', () => {
  it('subtracts mortgage and closing costs', () => {
    const proceeds = calculateSaleProceeds(1100000, 622338, 6);
    expect(proceeds).toBeCloseTo(411662, 0);
  });

  it('returns 0 when underwater', () => {
    const proceeds = calculateSaleProceeds(500000, 600000, 6);
    expect(proceeds).toBe(0);
  });
});

describe('projectHomeEquity', () => {
  it('grows home value at appreciation rate', () => {
    const equity = projectHomeEquity(1100000, 622338, 4600, 4, 10);
    expect(equity.homeValue).toBeGreaterThan(1100000);
    expect(equity.equity).toBeGreaterThan(0);
  });
});

describe('calculateRentalCashFlow', () => {
  it('returns annual net rental income', () => {
    const annual = calculateRentalCashFlow(5000, 4600, 800, 400, 8);
    expect(annual).toBeDefined();
    expect(typeof annual).toBe('number');
  });
});
```

- [ ] **Step 6: Implement housing.ts**

```typescript
// src/engine/housing.ts

export function calculateSaleProceeds(homeValue: number, mortgageBalance: number, closingCostPct: number): number {
  const closingCosts = homeValue * (closingCostPct / 100);
  return Math.max(0, homeValue - mortgageBalance - closingCosts);
}

export function projectHomeEquity(
  homeValue: number,
  mortgageBalance: number,
  monthlyMortgage: number,
  appreciationRate: number,
  years: number,
): { homeValue: number; mortgageRemaining: number; equity: number } {
  const futureValue = homeValue * Math.pow(1 + appreciationRate / 100, years);
  const totalPaid = monthlyMortgage * 12 * years;
  const principalPaid = totalPaid * 0.35;
  const mortgageRemaining = Math.max(0, mortgageBalance - principalPaid);
  return { homeValue: futureValue, mortgageRemaining, equity: futureValue - mortgageRemaining };
}

export function calculateRentalCashFlow(
  monthlyRent: number,
  monthlyMortgage: number,
  monthlyInsuranceTax: number,
  monthlyMaintenance: number,
  propertyMgmtPct: number,
): number {
  const annualRent = monthlyRent * 12;
  const mgmtFee = annualRent * (propertyMgmtPct / 100);
  const annualCosts = (monthlyMortgage + monthlyInsuranceTax + monthlyMaintenance) * 12;
  return annualRent - mgmtFee - annualCosts;
}
```

- [ ] **Step 7: Run housing tests**

```bash
npx vitest run src/engine/housing.test.ts
```

Expected: All pass.

- [ ] **Step 8: Write failing test for scoring**

```typescript
// src/engine/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { calculateQoLScore, normalizeFinancialScore, calculateCompositeScore } from './scoring';
import { QualityOfLifeRatings, QoLWeights } from '@/types';

describe('calculateQoLScore', () => {
  it('returns weighted average normalized to 0-100', () => {
    const ratings: QualityOfLifeRatings = {
      familyProximity: 10, childEducation: 5, languageEnvironment: 5,
      healthcareQuality: 5, safety: 5, climate: 5, culturalFit: 5,
      careerSatisfaction: 5, communityBuilding: 5, politicalStability: 5,
      adventureNovelty: 5, returnFlexibility: 5,
    };
    const weights: QoLWeights = {
      weights: {
        familyProximity: 10, childEducation: 5, languageEnvironment: 5,
        healthcareQuality: 5, safety: 5, climate: 5, culturalFit: 5,
        careerSatisfaction: 5, communityBuilding: 5, politicalStability: 5,
        adventureNovelty: 5, returnFlexibility: 5,
      },
      financialWeight: 5,
    };
    const score = calculateQoLScore(ratings, weights);
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns 50 when all ratings are 5 and weights equal', () => {
    const ratings: QualityOfLifeRatings = {
      familyProximity: 5, childEducation: 5, languageEnvironment: 5,
      healthcareQuality: 5, safety: 5, climate: 5, culturalFit: 5,
      careerSatisfaction: 5, communityBuilding: 5, politicalStability: 5,
      adventureNovelty: 5, returnFlexibility: 5,
    };
    const weights: QoLWeights = {
      weights: {
        familyProximity: 5, childEducation: 5, languageEnvironment: 5,
        healthcareQuality: 5, safety: 5, climate: 5, culturalFit: 5,
        careerSatisfaction: 5, communityBuilding: 5, politicalStability: 5,
        adventureNovelty: 5, returnFlexibility: 5,
      },
      financialWeight: 5,
    };
    const score = calculateQoLScore(ratings, weights);
    expect(score).toBeCloseTo(50, 0);
  });
});

describe('normalizeFinancialScore', () => {
  it('returns higher score for higher net worth', () => {
    const scoreHigh = normalizeFinancialScore(3000000, 1000000, 5000000);
    const scoreLow = normalizeFinancialScore(1500000, 1000000, 5000000);
    expect(scoreHigh).toBeGreaterThan(scoreLow);
  });

  it('returns 0-100 range', () => {
    const score = normalizeFinancialScore(2500000, 1000000, 5000000);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
```

- [ ] **Step 9: Implement scoring.ts**

```typescript
// src/engine/scoring.ts
import { QualityOfLifeRatings, QoLWeights, QOL_DIMENSIONS, MatrixResult } from '@/types';

export function calculateQoLScore(ratings: QualityOfLifeRatings, qolWeights: QoLWeights): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const dim of QOL_DIMENSIONS) {
    const weight = qolWeights.weights[dim];
    const rating = ratings[dim];
    weightedSum += rating * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return 50;
  return (weightedSum / totalWeight) * 10;
}

export function normalizeFinancialScore(netWorth: number, minNetWorth: number, maxNetWorth: number): number {
  if (maxNetWorth <= minNetWorth) return 50;
  const normalized = (netWorth - minNetWorth) / (maxNetWorth - minNetWorth);
  return Math.max(0, Math.min(100, normalized * 100));
}

export function calculateCompositeScore(
  financialScore: number,
  qolScore: number,
  financialWeight: number,
): number {
  const totalWeight = financialWeight + 10;
  return (financialScore * financialWeight + qolScore * 10) / totalWeight;
}

export function rankDestinations(results: Omit<MatrixResult, 'rank'>[]): MatrixResult[] {
  const sorted = [...results].sort((a, b) => b.compositeScore - a.compositeScore);
  return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
}
```

- [ ] **Step 10: Run scoring tests**

```bash
npx vitest run src/engine/scoring.test.ts
```

Expected: All pass.

- [ ] **Step 11: Write failing test for simulate**

```typescript
// src/engine/simulate.test.ts
import { describe, it, expect } from 'vitest';
import { simulate } from './simulate';
import { GLOBAL_DEFAULTS } from '@/data/global-defaults';
import { getDestination } from '@/data/destinations';

describe('simulate', () => {
  const globals = GLOBAL_DEFAULTS;

  it('produces projections for each year from moveYear to retirement', () => {
    const dest = getDestination('dc-baseline')!;
    const career = dest.careerPresets[0];
    const result = simulate(dest, career, globals, { dcHomeDecision: 'keep', moveYear: 2027, returnYear: null });
    const expectedYears = globals.retirementAge - globals.currentAge;
    expect(result.length).toBe(expectedYears);
    expect(result[0].age).toBe(globals.currentAge + 1);
    expect(result[result.length - 1].age).toBe(globals.retirementAge);
  });

  it('net worth grows over time for DC baseline', () => {
    const dest = getDestination('dc-baseline')!;
    const career = dest.careerPresets[0];
    const result = simulate(dest, career, globals, { dcHomeDecision: 'keep', moveYear: 2027, returnYear: null });
    const firstYear = result[0].totalNetWorth;
    const lastYear = result[result.length - 1].totalNetWorth;
    expect(lastYear).toBeGreaterThan(firstYear);
  });

  it('Kenya scenario has lower expenses than DC', () => {
    const dcDest = getDestination('dc-baseline')!;
    const dcCareer = dcDest.careerPresets[0];
    const dcResult = simulate(dcDest, dcCareer, globals, { dcHomeDecision: 'keep', moveYear: 2027, returnYear: null });

    const keDest = getDestination('kenya-nairobi')!;
    const keCareer = keDest.careerPresets[0];
    const keResult = simulate(keDest, keCareer, globals, { dcHomeDecision: 'sell', moveYear: 2027, returnYear: null });

    expect(keResult[0].totalExpenses).toBeLessThan(dcResult[0].totalExpenses);
  });

  it('selling DC home adds lump sum to investments', () => {
    const dest = getDestination('kenya-nairobi')!;
    const career = dest.careerPresets[0];
    const sellResult = simulate(dest, career, globals, { dcHomeDecision: 'sell', moveYear: 2027, returnYear: null });
    const keepResult = simulate(dest, career, globals, { dcHomeDecision: 'keep', moveYear: 2027, returnYear: null });
    expect(sellResult[0].investmentBalance).toBeGreaterThan(keepResult[0].investmentBalance);
  });

  it('return-to-DC switches location mid-projection', () => {
    const dest = getDestination('kenya-nairobi')!;
    const career = dest.careerPresets[0];
    const result = simulate(dest, career, globals, { dcHomeDecision: 'rent', moveYear: 2027, returnYear: 2032 });
    const abroadYears = result.filter((y) => y.location === 'kenya-nairobi');
    const dcYears = result.filter((y) => y.location === 'dc-baseline');
    expect(abroadYears.length).toBe(2032 - 2027);
    expect(dcYears.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 12: Implement simulate.ts**

```typescript
// src/engine/simulate.ts
import { Destination, CareerPreset, GlobalAssumptions, YearlyProjection } from '@/types';
import { estimateEffectiveTax } from './taxes';
import { calculateSaleProceeds, calculateRentalCashFlow, projectHomeEquity } from './housing';
import { getDestination } from '@/data/destinations';

interface SimulateOverrides {
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  moveYear: number;
  returnYear: number | null;
  customIncome?: { yours?: number; karas?: number };
}

export function simulate(
  destination: Destination,
  career: CareerPreset,
  globals: GlobalAssumptions,
  overrides: SimulateOverrides,
): YearlyProjection[] {
  const totalYears = globals.retirementAge - globals.currentAge;
  const currentYear = new Date().getFullYear();
  const projections: YearlyProjection[] = [];

  let investmentBalance = globals.currentSavings;
  let retirementBalance = globals.retirement457b;

  if (globals.convertToRoth) {
    retirementBalance = retirementBalance * (1 - globals.rothConversionTaxRate / 100);
  }

  if (overrides.dcHomeDecision === 'sell') {
    const proceeds = calculateSaleProceeds(
      globals.currentHomeValue,
      globals.currentMortgageBalance,
      globals.closingCostPct,
    );
    investmentBalance += proceeds;
  }

  const returnRate = globals.investmentReturnRate / 100;
  const dcDest = getDestination('dc-baseline')!;
  const dcCareer = dcDest.careerPresets[0];

  for (let y = 1; y <= totalYears; y++) {
    const age = globals.currentAge + y;
    const year = currentYear + y;
    const isAbroad = year >= overrides.moveYear && (overrides.returnYear === null || year < overrides.returnYear);
    const activeDest = isAbroad ? destination : dcDest;
    const activeCareer = isAbroad ? career : dcCareer;
    const locationId = activeDest.id;

    const yourIncome = overrides.customIncome?.yours ?? activeCareer.yourAnnualIncome;
    const karasIncome = overrides.customIncome?.karas ?? activeCareer.karaAnnualIncome;
    const yearsInRole = isAbroad ? year - overrides.moveYear : y;
    const growthMultiplier = Math.pow(1 + activeCareer.incomeGrowthRate / 100, yearsInRole);
    const grossIncome = (yourIncome + karasIncome) * growthMultiplier;
    const benefitsValue = activeCareer.benefitsMonetaryValue;
    const totalCompensation = grossIncome + benefitsValue;

    const taxes = estimateEffectiveTax(grossIncome, locationId);

    const colMultiplier = activeDest.costOfLiving.costMultiplierVsDC;
    const livingExpenses = 6500 * 12 * colMultiplier;
    const housingCost = activeDest.id === 'dc-baseline'
      ? globals.monthlyMortgage * 12
      : activeDest.housing.rentMonthly3BR * 12;
    const schooling = activeDest.costOfLiving.internationalSchoolAnnual;
    const healthInsurance = activeDest.costOfLiving.healthInsuranceMonthly * 12;
    const totalExpenses = livingExpenses + housingCost + schooling + healthInsurance;

    let rentalNetIncome = 0;
    if (overrides.dcHomeDecision === 'rent' && isAbroad) {
      rentalNetIncome = calculateRentalCashFlow(
        globals.rentalIncomeMonthly,
        globals.monthlyMortgage,
        globals.monthlyInsuranceTax,
        globals.monthlyMaintenance,
        globals.propertyMgmtPct,
      );
    }

    const netCashFlow = grossIncome - taxes.total - totalExpenses + rentalNetIncome;

    investmentBalance = investmentBalance * (1 + returnRate);
    retirementBalance = retirementBalance * (1 + returnRate) + globals.annualRothContribution;

    if (netCashFlow > 0) {
      investmentBalance += netCashFlow;
    } else {
      investmentBalance += netCashFlow;
    }

    let homeEquity = 0;
    if (overrides.dcHomeDecision !== 'sell') {
      const proj = projectHomeEquity(
        globals.currentHomeValue,
        globals.currentMortgageBalance,
        globals.monthlyMortgage,
        globals.homeAppreciationRate,
        y,
      );
      homeEquity = proj.equity;
    }

    const totalNetWorth = Math.max(0, investmentBalance) + retirementBalance + homeEquity;

    projections.push({
      year,
      age,
      location: locationId,
      grossIncome: Math.round(grossIncome),
      benefitsValue: Math.round(benefitsValue),
      totalCompensation: Math.round(totalCompensation),
      localTax: Math.round(taxes.localTax),
      usTax: Math.round(taxes.usTax),
      totalTax: Math.round(taxes.total),
      livingExpenses: Math.round(livingExpenses),
      housingCost: Math.round(housingCost),
      schooling: Math.round(schooling),
      healthInsurance: Math.round(healthInsurance),
      totalExpenses: Math.round(totalExpenses),
      netCashFlow: Math.round(netCashFlow),
      savingsContribution: Math.round(Math.max(0, netCashFlow)),
      investmentBalance: Math.round(investmentBalance),
      retirementBalance: Math.round(retirementBalance),
      homeEquity: Math.round(homeEquity),
      rentalNetIncome: Math.round(rentalNetIncome),
      totalNetWorth: Math.round(totalNetWorth),
    });
  }

  return projections;
}
```

- [ ] **Step 13: Run all engine tests**

```bash
npx vitest run src/engine/
```

Expected: All tests pass.

- [ ] **Step 14: Commit**

```bash
git add src/engine/
git commit -m "feat: financial projection engine with tax, housing, and scoring calculations"
```

---

## Task 7: Layout + Routing Shell

**Files:**
- Create: `src/components/Layout.tsx`
- Create: `src/components/Layout.css`
- Create: `src/routes/Dashboard.tsx`
- Create: `src/routes/ScenarioDetail.tsx`
- Create: `src/routes/Compare.tsx`
- Create: `src/routes/Matrix.tsx`
- Create: `src/routes/Plan.tsx`
- Create: `src/routes/Inputs.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Layout component**

```typescript
// src/components/Layout.tsx
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, GitCompare, Grid3x3, Map, Settings } from 'lucide-react';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/matrix', label: 'Matrix', icon: Grid3x3 },
  { to: '/plan', label: 'Plan', icon: Map },
  { to: '/inputs', label: 'Settings', icon: Settings },
];

export default function Layout() {
  return (
    <div className="layout">
      <header className="top-bar">
        <NavLink to="/" className="top-bar-title">
          <span className="top-bar-name">Life Change Planner</span>
        </NavLink>
        <nav className="top-nav">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `top-nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-bar">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `bottom-bar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Create Layout.css**

```css
/* src/components/Layout.css */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-bg-tertiary);
  background: var(--color-bg-secondary);
}

.top-bar-title {
  text-decoration: none;
  color: var(--color-text-primary);
}

.top-bar-name {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
}

.top-nav {
  display: flex;
  gap: var(--space-1);
}

.top-nav-link {
  padding: var(--space-2) var(--space-3);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  text-decoration: none;
  border-radius: var(--card-radius);
  transition: color var(--transition-fast), background var(--transition-fast);
}

.top-nav-link:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  text-decoration: none;
}

.top-nav-link.active {
  color: var(--color-highlight);
}

.main-content {
  flex: 1;
  max-width: var(--max-content);
  width: 100%;
  margin: 0 auto;
  padding: var(--space-5);
  padding-bottom: 80px;
}

/* Mobile bottom bar */
.bottom-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-bg-tertiary);
  padding: var(--space-2) 0;
  z-index: 100;
}

.bottom-bar-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 0.6rem;
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.bottom-bar-link.active {
  color: var(--color-highlight);
}

@media (max-width: 768px) {
  .top-nav { display: none; }
  .bottom-bar {
    display: flex;
    justify-content: space-around;
  }
  .main-content {
    padding: var(--space-4);
    padding-bottom: 100px;
  }
}
```

- [ ] **Step 3: Create placeholder route components**

Each route gets a minimal placeholder that proves routing works:

```typescript
// src/routes/Dashboard.tsx
export default function Dashboard() {
  return <div className="page-enter"><h1>Dashboard</h1></div>;
}

// src/routes/ScenarioDetail.tsx
import { useParams } from 'react-router-dom';
export default function ScenarioDetail() {
  const { id } = useParams();
  return <div className="page-enter"><h1>Scenario: {id}</h1></div>;
}

// src/routes/Compare.tsx
export default function Compare() {
  return <div className="page-enter"><h1>Compare</h1></div>;
}

// src/routes/Matrix.tsx
export default function Matrix() {
  return <div className="page-enter"><h1>Decision Matrix</h1></div>;
}

// src/routes/Plan.tsx
export default function Plan() {
  return <div className="page-enter"><h1>Plan</h1></div>;
}

// src/routes/Inputs.tsx
export default function Inputs() {
  return <div className="page-enter"><h1>Settings</h1></div>;
}
```

- [ ] **Step 4: Wire up App.tsx with router + state provider**

Replace the `PlaceholderApp` component in `src/App.tsx`:

```typescript
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppStateProvider } from './state/AppStateContext';
import Layout from './components/Layout';
import Dashboard from './routes/Dashboard';
import ScenarioDetail from './routes/ScenarioDetail';
import Compare from './routes/Compare';
import Matrix from './routes/Matrix';
import Plan from './routes/Plan';
import Inputs from './routes/Inputs';

// ... keep PasswordGate component unchanged ...

function AppRouter() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="scenario/:id/*" element={<ScenarioDetail />} />
            <Route path="compare" element={<Compare />} />
            <Route path="matrix" element={<Matrix />} />
            <Route path="plan" element={<Plan />} />
            <Route path="inputs" element={<Inputs />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  );
}

// In the App component, replace `<PlaceholderApp />` with `<AppRouter />`
```

- [ ] **Step 5: Verify routing works**

```bash
npm run dev
```

Open browser, authenticate, verify: Dashboard renders at `/`, clicking nav items routes correctly, `/scenario/kenya-nairobi` shows the placeholder, mobile bottom bar appears at narrow widths.

- [ ] **Step 6: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat: Layout component with routing shell for all pages"
```

---

## Task 8: Global Inputs Page

**Files:**
- Modify: `src/routes/Inputs.tsx`
- Create: `src/routes/Inputs.css`
- Create: `src/components/SliderInput.tsx`

- [ ] **Step 1: Create SliderInput component**

```typescript
// src/components/SliderInput.tsx
import { useId } from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  suffix?: string;
}

export default function SliderInput({ label, value, onChange, min, max, step = 1, format, suffix = '' }: SliderInputProps) {
  const id = useId();
  const display = format ? format(value) : `${value}`;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider-input">
      <div className="slider-input-header">
        <label htmlFor={id} className="slider-input-label">{label}</label>
        <span className="slider-input-value mono">{display}{suffix}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--color-highlight) 0%, var(--color-highlight) ${pct}%, var(--color-bg-tertiary) ${pct}%, var(--color-bg-tertiary) 100%)`,
        }}
      />
    </div>
  );
}
```

Add to `src/styles/components.css`:

```css
/* === Slider Input === */
.slider-input {
  margin-bottom: var(--space-4);
}

.slider-input-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--space-1);
}

.slider-input-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}

.slider-input-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-highlight);
}
```

- [ ] **Step 2: Build Inputs page**

```typescript
// src/routes/Inputs.tsx
import { useGlobalAssumptions } from '@/state/hooks';
import SliderInput from '@/components/SliderInput';
import './Inputs.css';

const fmtDollar = (n: number) => `$${Math.round(n).toLocaleString()}`;
const fmtPct = (n: number) => `${n}`;

export default function Inputs() {
  const { globals, updateGlobals } = useGlobalAssumptions();

  return (
    <div className="page-enter inputs-page">
      <h1>Global Assumptions</h1>
      <p className="text-secondary" style={{ marginBottom: 32 }}>
        These values apply across all scenarios. Override per-scenario on each destination page.
      </p>

      <section className="card inputs-section">
        <h3 className="section-title">Personal</h3>
        <SliderInput label="Current Age" value={globals.currentAge} onChange={(v) => updateGlobals({ currentAge: v })} min={30} max={55} format={(v) => `${v}`} suffix=" yrs" />
        <SliderInput label="Retirement Age" value={globals.retirementAge} onChange={(v) => updateGlobals({ retirementAge: v })} min={55} max={72} format={(v) => `${v}`} suffix=" yrs" />
        <SliderInput label="Move Year" value={globals.moveYear} onChange={(v) => updateGlobals({ moveYear: v })} min={2026} max={2032} format={(v) => `${v}`} />
      </section>

      <section className="card inputs-section">
        <h3 className="section-title">Current Financial State</h3>
        <SliderInput label="Current Savings" value={globals.currentSavings} onChange={(v) => updateGlobals({ currentSavings: v })} min={0} max={500000} step={5000} format={fmtDollar} />
        <SliderInput label="457(b) Balance" value={globals.retirement457b} onChange={(v) => updateGlobals({ retirement457b: v })} min={0} max={500000} step={5000} format={fmtDollar} />
        <SliderInput label="DC Household Income" value={globals.currentHouseholdIncome} onChange={(v) => updateGlobals({ currentHouseholdIncome: v })} min={100000} max={400000} step={5000} format={fmtDollar} />
      </section>

      <section className="card inputs-section">
        <h3 className="section-title">DC Home</h3>
        <SliderInput label="Home Value" value={globals.currentHomeValue} onChange={(v) => updateGlobals({ currentHomeValue: v })} min={600000} max={1600000} step={10000} format={fmtDollar} />
        <SliderInput label="Mortgage Balance" value={globals.currentMortgageBalance} onChange={(v) => updateGlobals({ currentMortgageBalance: v })} min={0} max={900000} step={5000} format={fmtDollar} />
        <SliderInput label="Monthly Mortgage" value={globals.monthlyMortgage} onChange={(v) => updateGlobals({ monthlyMortgage: v })} min={2000} max={7000} step={100} format={fmtDollar} />
        <SliderInput label="Appreciation Rate" value={globals.homeAppreciationRate} onChange={(v) => updateGlobals({ homeAppreciationRate: v })} min={1} max={8} step={0.5} format={fmtPct} suffix="%" />
        <SliderInput label="Closing Cost %" value={globals.closingCostPct} onChange={(v) => updateGlobals({ closingCostPct: v })} min={3} max={10} step={0.5} format={fmtPct} suffix="%" />
      </section>

      <section className="card inputs-section">
        <h3 className="section-title">Investment Assumptions</h3>
        <SliderInput label="Annual Return" value={globals.investmentReturnRate} onChange={(v) => updateGlobals({ investmentReturnRate: v })} min={3} max={12} step={0.5} format={fmtPct} suffix="%" />
        <SliderInput label="Inflation" value={globals.inflationRate} onChange={(v) => updateGlobals({ inflationRate: v })} min={1} max={6} step={0.5} format={fmtPct} suffix="%" />
        <SliderInput label="Annual Roth Contribution" value={globals.annualRothContribution} onChange={(v) => updateGlobals({ annualRothContribution: v })} min={0} max={8000} step={500} format={fmtDollar} />
      </section>

      <section className="card inputs-section">
        <h3 className="section-title">Rental (if renting DC home)</h3>
        <SliderInput label="Monthly Rental Income" value={globals.rentalIncomeMonthly} onChange={(v) => updateGlobals({ rentalIncomeMonthly: v })} min={3000} max={8000} step={100} format={fmtDollar} />
        <SliderInput label="Property Mgmt Fee" value={globals.propertyMgmtPct} onChange={(v) => updateGlobals({ propertyMgmtPct: v })} min={5} max={15} step={0.5} format={fmtPct} suffix="%" />
        <SliderInput label="Monthly Insurance + Tax" value={globals.monthlyInsuranceTax} onChange={(v) => updateGlobals({ monthlyInsuranceTax: v })} min={400} max={1500} step={50} format={fmtDollar} />
        <SliderInput label="Monthly Maintenance" value={globals.monthlyMaintenance} onChange={(v) => updateGlobals({ monthlyMaintenance: v })} min={200} max={1000} step={50} format={fmtDollar} />
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Create Inputs.css**

```css
.inputs-page h1 {
  margin-bottom: var(--space-2);
}

.inputs-section {
  margin-bottom: var(--space-5);
}

.inputs-section .section-title {
  margin-top: 0;
}
```

- [ ] **Step 4: Verify inputs page works**

```bash
npm run dev
```

Navigate to Settings. Verify sliders render, changing values persists (refresh page, values stay). Verify mobile layout.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Global Inputs page with all financial assumption sliders"
```

---

## Task 9: Dashboard Page

**Files:**
- Create: `src/components/DestinationCard.tsx`
- Create: `src/components/DestinationCard.css`
- Create: `src/components/MetricCard.tsx`
- Modify: `src/routes/Dashboard.tsx`
- Create: `src/routes/Dashboard.css`

- [ ] **Step 1: Create MetricCard component**

```typescript
// src/components/MetricCard.tsx
interface MetricCardProps {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}

export default function MetricCard({ label, value, color, sub }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="value mono" style={color ? { color } : undefined}>{value}</div>
      <div className="label">{label}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Create DestinationCard component**

```typescript
// src/components/DestinationCard.tsx
import { Link } from 'react-router-dom';
import { Destination, YearlyProjection } from '@/types';
import './DestinationCard.css';

const fmt = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

interface DestinationCardProps {
  destination: Destination;
  projections: YearlyProjection[];
  careerPresetName: string;
  qolScore?: number;
}

export default function DestinationCard({ destination, projections, careerPresetName, qolScore }: DestinationCardProps) {
  const finalNetWorth = projections.length > 0 ? projections[projections.length - 1].totalNetWorth : 0;
  const retirementAge = projections.length > 0 ? projections[projections.length - 1].age : 62;

  return (
    <Link to={`/scenario/${destination.id}`} className="destination-card" style={{ '--accent': destination.accentColor } as React.CSSProperties}>
      <div className="destination-card-header">
        <span className="destination-card-flag">{destination.flag}</span>
        <span className="destination-card-name">{destination.name}</span>
        {destination.researchDepth === 'shallow' && <span className="badge badge-shallow">Estimates</span>}
      </div>

      <div className="destination-card-stat">
        <span className="mono destination-card-value">{fmt(finalNetWorth)}</span>
        <span className="destination-card-label">net worth at {retirementAge}</span>
      </div>

      {qolScore !== undefined && (
        <div className="destination-card-qol">
          Life Score: <span className="mono">{Math.round(qolScore)}</span>/100
        </div>
      )}

      <div className="destination-card-sparkline">
        <svg viewBox={`0 0 ${projections.length} 50`} preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            points={projections.map((p, i) => {
              const maxNW = Math.max(...projections.map((pp) => pp.totalNetWorth), 1);
              const y = 50 - (p.totalNetWorth / maxNW) * 45;
              return `${i},${y}`;
            }).join(' ')}
          />
        </svg>
      </div>

      <div className="destination-card-career">{careerPresetName}</div>
    </Link>
  );
}
```

- [ ] **Step 3: Create DestinationCard.css**

```css
.destination-card {
  display: block;
  background: var(--color-bg-secondary);
  border: var(--card-border);
  border-left: 3px solid var(--accent, var(--color-highlight));
  border-radius: var(--card-radius);
  padding: var(--space-4) var(--space-5);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}

.destination-card:hover {
  border-color: var(--accent, var(--color-highlight));
  box-shadow: 0 2px 12px color-mix(in srgb, var(--accent) 15%, transparent);
  transform: translateY(-1px);
  text-decoration: none;
}

.destination-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.destination-card-flag {
  font-size: 1.1rem;
}

.destination-card-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.destination-card-stat {
  margin-bottom: var(--space-2);
}

.destination-card-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--accent, var(--color-highlight));
}

.destination-card-label {
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
  margin-left: var(--space-2);
}

.destination-card-qol {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

.destination-card-sparkline {
  height: 32px;
  margin-bottom: var(--space-2);
  color: var(--accent, var(--color-highlight));
  opacity: 0.6;
}

.destination-card-sparkline svg {
  width: 100%;
  height: 100%;
}

.destination-card-career {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  color: var(--color-text-tertiary);
  letter-spacing: 0.02em;
}
```

- [ ] **Step 4: Build Dashboard page**

```typescript
// src/routes/Dashboard.tsx
import { useMemo } from 'react';
import { useAppState } from '@/state/AppStateContext';
import { ALL_DESTINATIONS, getDestination } from '@/data/destinations';
import { simulate } from '@/engine/simulate';
import { calculateQoLScore } from '@/engine/scoring';
import DestinationCard from '@/components/DestinationCard';
import MetricCard from '@/components/MetricCard';
import './Dashboard.css';

const fmt = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

export default function Dashboard() {
  const { state } = useAppState();
  const { globalAssumptions, scenarios, qolWeights } = state;

  const results = useMemo(() => {
    return ALL_DESTINATIONS.map((dest) => {
      const config = scenarios[dest.id];
      const career = dest.careerPresets.find((p) => p.id === config?.selectedCareerPreset) ?? dest.careerPresets[0];
      const projections = simulate(dest, career, globalAssumptions, {
        dcHomeDecision: config?.dcHomeDecision ?? 'sell',
        moveYear: config?.moveYear ?? globalAssumptions.moveYear,
        returnYear: config?.returnYear ?? null,
      });
      const effectiveQoL = { ...dest.qolDefaults, ...config?.customQoLRatings };
      const qolScore = calculateQoLScore(effectiveQoL, qolWeights);
      return { dest, projections, career, qolScore };
    });
  }, [globalAssumptions, scenarios, qolWeights]);

  const dcResult = results.find((r) => r.dest.id === 'dc-baseline');
  const dcFinalNW = dcResult?.projections[dcResult.projections.length - 1]?.totalNetWorth ?? 0;

  return (
    <div className="page-enter dashboard">
      <div className="dashboard-header">
        <h1>Life Change Planner</h1>
        <p className="text-secondary">
          {ALL_DESTINATIONS.length} destinations. {globalAssumptions.retirementAge - globalAssumptions.currentAge} years to retirement.
        </p>
      </div>

      <div className="dashboard-baseline card">
        <div className="dashboard-baseline-label text-tertiary">DC Baseline</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
          <MetricCard label="Household Income" value={fmt(globalAssumptions.currentHouseholdIncome)} color="var(--color-accent-dc)" />
          <MetricCard label="Net Worth at 62" value={fmt(dcFinalNW)} color="var(--color-accent-dc)" />
          <MetricCard label="Home Equity" value={fmt(globalAssumptions.currentHomeValue - globalAssumptions.currentMortgageBalance)} color="var(--color-accent-dc)" />
        </div>
      </div>

      <div className="dashboard-grid">
        {results.filter((r) => r.dest.id !== 'dc-baseline').map(({ dest, projections, career, qolScore }) => (
          <DestinationCard
            key={dest.id}
            destination={dest}
            projections={projections}
            careerPresetName={career.name}
            qolScore={qolScore}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create Dashboard.css**

```css
.dashboard-header {
  margin-bottom: var(--space-5);
}

.dashboard-header h1 {
  margin-bottom: var(--space-1);
}

.dashboard-baseline {
  margin-bottom: var(--space-6);
  text-align: center;
  padding: var(--space-4) var(--space-5);
}

.dashboard-baseline-label {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: var(--space-2);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Verify dashboard renders**

```bash
npm run dev
```

Verify: Dashboard shows DC baseline banner, grid of destination cards with financial stats, sparklines, QoL scores, and career preset names. Cards are clickable (route to placeholder ScenarioDetail). Mobile responsive — 1-column on phone.

- [ ] **Step 7: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat: Dashboard with destination cards, sparklines, and baseline banner"
```

---

## Task 10: Scenario Detail — Financials Sub-tab

**Files:**
- Create: `src/components/WealthChart.tsx`
- Create: `src/components/TabNav.tsx`
- Create: `src/routes/tabs/FinancialsTab.tsx`
- Create: `src/routes/tabs/FinancialsTab.css`
- Modify: `src/routes/ScenarioDetail.tsx`
- Create: `src/routes/ScenarioDetail.css`

- [ ] **Step 1: Create TabNav component**

```typescript
// src/components/TabNav.tsx
import { NavLink } from 'react-router-dom';

interface Tab {
  to: string;
  label: string;
}

export default function TabNav({ tabs }: { tabs: Tab[] }) {
  return (
    <div className="tab-nav">
      {tabs.map(({ to, label }) => (
        <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'active' : ''}>
          {label}
        </NavLink>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create WealthChart component**

```typescript
// src/components/WealthChart.tsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { YearlyProjection } from '@/types';

const fmt = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
};

interface WealthChartProps {
  projections: YearlyProjection[];
  dcProjections?: YearlyProjection[];
  accentColor: string;
  currentYear?: number;
}

export default function WealthChart({ projections, dcProjections, accentColor, currentYear }: WealthChartProps) {
  const data = projections.map((p, i) => ({
    age: p.age,
    year: p.year,
    netWorth: p.totalNetWorth,
    dcNetWorth: dcProjections?.[i]?.totalNetWorth,
  }));

  return (
    <div style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
          <XAxis
            dataKey="age"
            tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-bg-tertiary)' }}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, '']}
            labelFormatter={(l) => `Age ${l}`}
            contentStyle={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-bg-tertiary)',
              borderRadius: 2,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
          />
          {dcProjections && (
            <Area
              type="monotone"
              dataKey="dcNetWorth"
              stroke="var(--color-accent-dc)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
              name="DC Baseline"
            />
          )}
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke={accentColor}
            strokeWidth={2}
            fill={accentColor}
            fillOpacity={0.08}
            name="This Scenario"
          />
          {currentYear && (
            <ReferenceLine
              x={data.find((d) => d.year >= currentYear)?.age}
              stroke="var(--color-text-tertiary)"
              strokeDasharray="2 2"
              label={{ value: 'Now', fill: 'var(--color-text-tertiary)', fontSize: 10 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Create FinancialsTab**

```typescript
// src/routes/tabs/FinancialsTab.tsx
import { useMemo } from 'react';
import { useScenario, useGlobalAssumptions } from '@/state/hooks';
import { simulate } from '@/engine/simulate';
import { getDestination } from '@/data/destinations';
import WealthChart from '@/components/WealthChart';
import MetricCard from '@/components/MetricCard';
import './FinancialsTab.css';

const fmt = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
};

export default function FinancialsTab({ destinationId }: { destinationId: string }) {
  const { config, destination, selectedPreset } = useScenario(destinationId);
  const { globals } = useGlobalAssumptions();

  const projections = useMemo(() => {
    if (!destination || !selectedPreset) return [];
    return simulate(destination, selectedPreset, globals, {
      dcHomeDecision: config?.dcHomeDecision ?? 'sell',
      moveYear: config?.moveYear ?? globals.moveYear,
      returnYear: config?.returnYear ?? null,
    });
  }, [destination, selectedPreset, globals, config]);

  const dcDest = getDestination('dc-baseline')!;
  const dcCareer = dcDest.careerPresets[0];
  const dcProjections = useMemo(() => {
    return simulate(dcDest, dcCareer, globals, { dcHomeDecision: 'keep', moveYear: globals.moveYear, returnYear: null });
  }, [globals]);

  if (!destination || projections.length === 0) return <div>No data</div>;

  const final = projections[projections.length - 1];
  const dcFinal = dcProjections[dcProjections.length - 1];
  const avgSavingsRate = projections.reduce((sum, p) => sum + (p.netCashFlow > 0 ? p.netCashFlow / p.grossIncome : 0), 0) / projections.length * 100;

  return (
    <div className="page-enter financials-tab">
      <div className="financials-metrics">
        <MetricCard label="Net Worth at Retirement" value={fmt(final.totalNetWorth)} color={destination.accentColor} sub={`age ${final.age}`} />
        <MetricCard label="vs DC Baseline" value={`${final.totalNetWorth > dcFinal.totalNetWorth ? '+' : ''}${fmt(final.totalNetWorth - dcFinal.totalNetWorth)}`} color={final.totalNetWorth >= dcFinal.totalNetWorth ? 'var(--color-positive)' : 'var(--color-negative)'} />
        <MetricCard label="Avg Savings Rate" value={`${Math.round(avgSavingsRate)}%`} color="var(--color-text-secondary)" />
        <MetricCard label="Tax Rate" value={`${Math.round((final.totalTax / final.grossIncome) * 100)}%`} color="var(--color-text-secondary)" />
      </div>

      <section className="section">
        <h3 className="section-title">Wealth Projection</h3>
        <div className="card">
          <WealthChart
            projections={projections}
            dcProjections={dcProjections}
            accentColor={destination.accentColor}
            currentYear={new Date().getFullYear()}
          />
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Annual Cash Flow</h3>
        <div className="card scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>Age</th>
                <th className="right">Income</th>
                <th className="right">Tax</th>
                <th className="right">Expenses</th>
                <th className="right">Net Cash</th>
                <th className="right">Net Worth</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => (
                <tr key={p.year}>
                  <td>{p.age}</td>
                  <td className="right">{fmt(p.grossIncome)}</td>
                  <td className="right">{fmt(p.totalTax)}</td>
                  <td className="right">{fmt(p.totalExpenses)}</td>
                  <td className="right" style={{ color: p.netCashFlow >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                    {fmt(p.netCashFlow)}
                  </td>
                  <td className="right">{fmt(p.totalNetWorth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Create FinancialsTab.css**

```css
.financials-tab { }

.financials-metrics {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border: var(--card-border);
  border-radius: var(--card-radius);
}

@media (max-width: 600px) {
  .financials-metrics {
    flex-wrap: wrap;
  }
  .financials-metrics .metric-card {
    flex: 1 1 45%;
  }
}
```

- [ ] **Step 5: Build ScenarioDetail shell with sub-tab routing**

```typescript
// src/routes/ScenarioDetail.tsx
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { useScenario } from '@/state/hooks';
import { useAppState } from '@/state/AppStateContext';
import { useEffect } from 'react';
import TabNav from '@/components/TabNav';
import FinancialsTab from './tabs/FinancialsTab';
import './ScenarioDetail.css';

export default function ScenarioDetail() {
  const { id } = useParams<{ id: string }>();
  const { destination } = useScenario(id ?? '');
  const { dispatch } = useAppState();

  useEffect(() => {
    if (id) dispatch({ type: 'SET_LAST_VISITED', payload: id });
  }, [id, dispatch]);

  if (!id || !destination) {
    return <div className="page-enter"><h2>Destination not found</h2></div>;
  }

  const tabs = [
    { to: `/scenario/${id}/financials`, label: 'Financials' },
    { to: `/scenario/${id}/career`, label: 'Career' },
    { to: `/scenario/${id}/housing`, label: 'Housing' },
    { to: `/scenario/${id}/life`, label: 'Life' },
    { to: `/scenario/${id}/visa`, label: 'Visa' },
    { to: `/scenario/${id}/timeline`, label: 'Timeline' },
  ];

  return (
    <div className="page-enter scenario-detail">
      <div className="scenario-header" style={{ '--accent': destination.accentColor } as React.CSSProperties}>
        <span className="scenario-flag">{destination.flag}</span>
        <h1 className="scenario-name">{destination.name}</h1>
        {destination.researchDepth === 'shallow' && <span className="badge badge-shallow">Estimates Only</span>}
      </div>
      <p className="scenario-narrative text-secondary">{destination.narrative}</p>

      <TabNav tabs={tabs} />

      <div className="scenario-content">
        <Routes>
          <Route index element={<Navigate to="financials" replace />} />
          <Route path="financials" element={<FinancialsTab destinationId={id} />} />
          <Route path="career" element={<div className="page-enter">Career tab coming soon</div>} />
          <Route path="housing" element={<div className="page-enter">Housing tab coming soon</div>} />
          <Route path="life" element={<div className="page-enter">Life tab coming soon</div>} />
          <Route path="visa" element={<div className="page-enter">Visa tab coming soon</div>} />
          <Route path="timeline" element={<div className="page-enter">Timeline tab coming soon</div>} />
        </Routes>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create ScenarioDetail.css**

```css
.scenario-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
  padding: var(--space-4) 0;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 5%, transparent), transparent);
  border-radius: var(--card-radius);
  padding-left: var(--space-4);
}

.scenario-flag {
  font-size: 1.75rem;
}

.scenario-name {
  font-size: 1.5rem;
  color: var(--color-text-primary);
}

.scenario-narrative {
  font-size: 0.85rem;
  line-height: 1.6;
  margin-bottom: var(--space-5);
  max-width: 720px;
}

.scenario-content {
  margin-top: var(--space-5);
}
```

- [ ] **Step 7: Verify scenario detail renders**

```bash
npm run dev
```

Navigate from Dashboard to a destination. Verify: header with flag + name, narrative text, sub-tab navigation, Financials tab showing wealth chart, cash flow table, and metrics. DC ghost line visible on chart. Mobile responsive.

- [ ] **Step 8: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat: Scenario Detail page with Financials tab, wealth chart, cash flow table"
```

---

## Task 11: Career Sub-tab

**Files:**
- Create: `src/components/ToggleGroup.tsx`
- Create: `src/routes/tabs/CareerTab.tsx`
- Create: `src/routes/tabs/CareerTab.css`
- Modify: `src/routes/ScenarioDetail.tsx` (replace placeholder route)

- [ ] **Step 1: Create ToggleGroup component**

A radio-style card selector. Each card shows a career preset with its details.

```typescript
// src/components/ToggleGroup.tsx
interface ToggleOption {
  id: string;
  label: string;
  sublabel?: string;
  content?: React.ReactNode;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  selected: string;
  onChange: (id: string) => void;
  accentColor?: string;
}

export default function ToggleGroup({ options, selected, onChange, accentColor }: ToggleGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {options.map((opt) => (
        <button
          key={opt.id}
          className={`card ${selected === opt.id ? 'btn-active' : ''}`}
          onClick={() => onChange(opt.id)}
          style={{
            cursor: 'pointer',
            textAlign: 'left',
            borderColor: selected === opt.id ? (accentColor ?? 'var(--color-highlight)') : undefined,
            background: selected === opt.id ? 'var(--color-bg-tertiary)' : undefined,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{opt.label}</div>
          {opt.sublabel && <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{opt.sublabel}</div>}
          {opt.content}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create CareerTab**

```typescript
// src/routes/tabs/CareerTab.tsx
import { useScenario } from '@/state/hooks';
import ToggleGroup from '@/components/ToggleGroup';
import './CareerTab.css';

const fmtK = (n: number) => `$${Math.round(n / 1000)}K`;

export default function CareerTab({ destinationId }: { destinationId: string }) {
  const { config, destination, update, selectedPreset } = useScenario(destinationId);
  if (!destination) return null;

  const options = destination.careerPresets.map((preset) => ({
    id: preset.id,
    label: preset.name,
    sublabel: `${fmtK(preset.householdAnnualIncome)}/yr combined`,
    content: (
      <div className="career-preset-detail">
        <div className="career-roles">
          <div><span className="text-tertiary">You:</span> {preset.yourRole} ({fmtK(preset.yourAnnualIncome)})</div>
          <div><span className="text-tertiary">Kara:</span> {preset.karaRole} ({fmtK(preset.karaAnnualIncome)})</div>
        </div>
        {preset.benefits.length > 0 && (
          <div className="career-benefits">
            {preset.benefits.map((b, i) => <span key={i} className="badge">{b}</span>)}
          </div>
        )}
        {!preset.visaCompatible && <div className="text-negative" style={{ fontSize: '0.7rem', marginTop: 4 }}>Not compatible with visa</div>}
        {preset.notes.length > 0 && (
          <div className="text-tertiary" style={{ fontSize: '0.7rem', marginTop: 6 }}>
            {preset.notes.join(' ')}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div className="page-enter career-tab">
      <h3 className="section-title">Career Path</h3>
      <ToggleGroup
        options={options}
        selected={config?.selectedCareerPreset ?? destination.careerPresets[0].id}
        onChange={(id) => update({ selectedCareerPreset: id })}
        accentColor={destination.accentColor}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create CareerTab.css**

```css
.career-preset-detail {
  margin-top: var(--space-2);
  font-size: 0.8rem;
}

.career-roles {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}

.career-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
```

- [ ] **Step 4: Wire CareerTab into ScenarioDetail routes**

In `src/routes/ScenarioDetail.tsx`, replace the career placeholder route:

```typescript
import CareerTab from './tabs/CareerTab';
// ...
<Route path="career" element={<CareerTab destinationId={id} />} />
```

- [ ] **Step 5: Verify and commit**

```bash
npm run dev
```

Navigate to a scenario, click Career tab. Verify preset cards render, clicking switches the active preset, financial numbers update when returning to Financials tab.

```bash
npm run build
git add -A
git commit -m "feat: Career sub-tab with preset selector"
```

---

## Task 12: Compare Page

**Files:**
- Create: `src/components/ComparisonChart.tsx`
- Create: `src/components/DestinationSelector.tsx`
- Modify: `src/routes/Compare.tsx`
- Create: `src/routes/Compare.css`

- [ ] **Step 1: Create DestinationSelector**

A dropdown/select component that picks from all destinations.

```typescript
// src/components/DestinationSelector.tsx
import { ALL_DESTINATIONS } from '@/data/destinations';

interface DestinationSelectorProps {
  value: string;
  onChange: (id: string) => void;
  exclude?: string[];
}

export default function DestinationSelector({ value, onChange, exclude = [] }: DestinationSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="destination-selector"
      style={{
        padding: '8px 12px',
        background: 'var(--color-bg-input)',
        border: '1px solid var(--color-bg-tertiary)',
        borderRadius: 'var(--card-radius)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.85rem',
      }}
    >
      {ALL_DESTINATIONS.filter((d) => !exclude.includes(d.id) || d.id === value).map((d) => (
        <option key={d.id} value={d.id}>{d.flag} {d.name}</option>
      ))}
    </select>
  );
}
```

- [ ] **Step 2: Create ComparisonChart**

```typescript
// src/components/ComparisonChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { YearlyProjection, Destination } from '@/types';

const fmt = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
};

interface ComparisonChartProps {
  datasets: { destination: Destination; projections: YearlyProjection[] }[];
  dcProjections: YearlyProjection[];
}

export default function ComparisonChart({ datasets, dcProjections }: ComparisonChartProps) {
  const maxLen = Math.max(...datasets.map((d) => d.projections.length), dcProjections.length);
  const data = Array.from({ length: maxLen }, (_, i) => {
    const entry: Record<string, number> = { age: dcProjections[i]?.age ?? i + 44 };
    entry['dc'] = dcProjections[i]?.totalNetWorth ?? 0;
    for (const ds of datasets) {
      entry[ds.destination.id] = ds.projections[i]?.totalNetWorth ?? 0;
    }
    return entry;
  });

  return (
    <div style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
          <XAxis dataKey="age" tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
          <YAxis tickFormatter={fmt} tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }} width={60} />
          <Tooltip formatter={(v: number) => `$${Math.round(v).toLocaleString()}`} labelFormatter={(l) => `Age ${l}`} contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="dc" stroke="var(--color-accent-dc)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="DC Baseline" />
          {datasets.map((ds) => (
            <Line key={ds.destination.id} type="monotone" dataKey={ds.destination.id} stroke={ds.destination.accentColor} strokeWidth={2} dot={false} name={ds.destination.name} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Build Compare page**

Build `src/routes/Compare.tsx` using `useCompareSelection` hook, `DestinationSelector` for the two dropdowns, `ComparisonChart` for the financial overlay, and a metrics comparison table. Use `useMemo` to run `simulate()` for each selected destination + DC baseline.

The metrics table should compare: Net Worth at 62, Annual Income (Year 1), Annual Expenses, Tax Burden, COL Multiplier, QoL Score. Highlight the winner in each row with `--color-positive`.

- [ ] **Step 4: Create Compare.css and verify**

```bash
npm run dev
```

Navigate to Compare, select two destinations from dropdowns. Verify chart shows both lines + DC baseline dashed. Metrics table highlights winner per row. Mobile responsive.

- [ ] **Step 5: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat: Compare page with financial overlay chart and metrics table"
```

---

## Task 13: QoL — Life Sub-tab + RadarChart

**Files:**
- Create: `src/components/RadarChart.tsx`
- Create: `src/routes/tabs/LifeTab.tsx`
- Create: `src/routes/tabs/LifeTab.css`
- Modify: `src/routes/ScenarioDetail.tsx`

- [ ] **Step 1: Create RadarChart component**

Use Recharts `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Radar`. Show the destination's QoL ratings as a filled polygon and DC baseline as a ghost polygon. Axis labels from `QOL_DIMENSION_META`.

- [ ] **Step 2: Create LifeTab**

The Life tab uses `var(--color-life-bg)` for a warmer feel. Shows the RadarChart at top, then a grid of dimension cards below. Each card has:
- Dimension label + icon (from lucide-react)
- SliderInput for the rating (1-10)
- If user has overridden: "You: X | Research: Y" with a reset button
- Research rationale text (hardcode brief notes per dimension per destination in the data files)

Use `useScenario(destinationId)` to get `effectiveQoL`, `setQoLRating`, `resetQoLRating`.

Display the composite QoL score prominently at top: large number, styled with the destination's accent color.

- [ ] **Step 3: Wire LifeTab into ScenarioDetail**

```typescript
import LifeTab from './tabs/LifeTab';
// ...
<Route path="life" element={<LifeTab destinationId={id} />} />
```

- [ ] **Step 4: Verify and commit**

Navigate to a scenario's Life tab. Verify radar chart renders, sliders adjust ratings, composite score updates, DC ghost polygon visible.

```bash
npm run build
git add -A
git commit -m "feat: Quality of Life sub-tab with radar chart and editable dimension sliders"
```

---

## Task 14: Decision Matrix Page

**Files:**
- Create: `src/components/WeightSlider.tsx`
- Create: `src/components/BarRanking.tsx`
- Create: `src/components/SensitivityCard.tsx`
- Modify: `src/routes/Matrix.tsx`
- Create: `src/routes/Matrix.css`

- [ ] **Step 1: Build weight sliders section**

Create `WeightSlider` — a specialized slider that shows the dimension label, current weight (0-10), and an importance descriptor ("Low" / "Medium" / "High" / "Critical"). Use `useQoLWeights` hook.

Add preset buttons at top: "Balanced", "Family First", "Money Maximizer", "Adventure Mode". Clicking a preset fills all weight sliders from `WEIGHT_PRESETS`.

Include a "Financial Weight" slider that controls how much the financial score matters relative to QoL in the composite.

- [ ] **Step 2: Build the matrix table**

The core table: rows = 12 QoL dimensions + "Financial Score" row. Columns = all destinations. Each cell shows the rating (1-10 for QoL, 0-100 for financial). Bottom row = Composite Score, sorted by highest.

Apply heat-mapping within each row: highest value in the row gets `--color-positive`, lowest gets `--color-negative`, others interpolate.

Use `calculateQoLScore` and `normalizeFinancialScore` from `src/engine/scoring.ts`. For financial normalization, compute min/max net worth across all destinations, then normalize each to 0-100.

- [ ] **Step 3: Build sensitivity analysis**

Create `SensitivityCard`. Logic: for each QoL dimension, compute what happens to the #1 and #2 ranking if that dimension's weight changes by +3. If #1 and #2 swap, report it: "If {dimension} weight goes from {current} to {current+3}, {dest2} overtakes {dest1}."

Style as a prominent callout card with a lightbulb icon (from lucide-react). Place below the matrix table.

- [ ] **Step 4: Build BarRanking**

Horizontal bar chart showing all destinations ranked by composite score. Bars use destination accent colors. Place below sensitivity analysis.

- [ ] **Step 5: Verify and commit**

```bash
npm run dev
```

Navigate to Matrix. Verify weight sliders work, preset buttons fill weights, matrix table updates in real-time, heat mapping applies, sensitivity callout shows useful insights, bar ranking reflects current scores.

```bash
npm run build
git add -A
git commit -m "feat: Decision Matrix with weighted scoring, sensitivity analysis, and rankings"
```

---

## Task 15: Housing, Visa, Timeline Sub-tabs

**Files:**
- Create: `src/routes/tabs/HousingTab.tsx`
- Create: `src/routes/tabs/VisaTab.tsx`
- Create: `src/routes/tabs/TimelineTab.tsx`
- Create: `src/components/TimelineVisual.tsx`
- Modify: `src/routes/ScenarioDetail.tsx`

- [ ] **Step 1: Build HousingTab**

Three-option toggle for DC home decision (sell / rent / keep). For each option, show a card with financial impact summary:
- **Sell**: Lump sum proceeds (calculated), reinvestment growth over time
- **Rent**: Monthly cash flow breakdown (rent - mortgage - mgmt - insurance - maint), annual net, equity growth
- **Keep**: Equity growth, no income, carrying costs

Below the DC section: destination housing overview from `destination.housing` (rent ranges, buy prices, neighborhood notes).

Wire the toggle to `update({ dcHomeDecision: ... })`.

- [ ] **Step 2: Build VisaTab**

Render `destination.visa` fields: type, duration, requirements (as checklist — `<input type="checkbox" />`), processing time, costs, work rights, spouse work rights, path to PR, gotchas (styled with `--color-negative`).

- [ ] **Step 3: Build TimelineTab**

Move year slider (2026-2032), return year toggle (permanent / return after N years with a slider for return year).

`TimelineVisual` component: horizontal timeline SVG/CSS showing key milestones:
- Current year (now marker)
- Move year
- Daughter enters school (age 5 = moveYear + 2ish)
- Daughter middle school (age 11)
- Daughter high school (age 14)
- Parents' approximate ages (if Kenya: show proximity)
- Return year (if set)
- Retirement

Wire move/return year changes to `update()`.

Below timeline: decision gates checklist (editable). Default items:
- [ ] Visa application submitted
- [ ] DC home decision finalized
- [ ] Job/income secured
- [ ] Housing secured in destination
- [ ] School enrollment confirmed
- [ ] Health insurance arranged
- [ ] Financial advisor consulted

- [ ] **Step 4: Wire all tabs into ScenarioDetail**

```typescript
import HousingTab from './tabs/HousingTab';
import VisaTab from './tabs/VisaTab';
import TimelineTab from './tabs/TimelineTab';
// ...
<Route path="housing" element={<HousingTab destinationId={id} />} />
<Route path="visa" element={<VisaTab destinationId={id} />} />
<Route path="timeline" element={<TimelineTab destinationId={id} />} />
```

- [ ] **Step 5: Verify and commit**

Test all three tabs across multiple destinations. Verify housing toggle recalculates financials, visa checklist is interactive, timeline shows correct milestones, move/return year sliders work.

```bash
npm run build
git add -A
git commit -m "feat: Housing, Visa, and Timeline sub-tabs"
```

---

## Task 16: Plan Page

**Files:**
- Modify: `src/routes/Plan.tsx`
- Create: `src/routes/Plan.css`

- [ ] **Step 1: Build Plan page**

Destination selector at top (dropdown). Below it, a phase timeline and checklists.

Phases (displayed as expandable accordion sections):

1. **Phase 0: Research & Decision** — items: "Narrow to 2-3 finalists", "Share matrix results with Kara", "Consult cross-border tax specialist", "Visit top destinations (scouting trip)"
2. **Phase 1: Preparation** — items from visa requirements + "Begin Roth conversion", "List DC home / find property manager", "Start international school applications"
3. **Phase 2: Transition** — items: "Ship belongings", "Close/transfer DC accounts", "Activate international health insurance", "Final DC home handoff"
4. **Phase 3: Settling** — items: "Register with local government", "Open local bank account", "Enroll in healthcare", "Start school/daycare", "Set up business (if self-employed)"
5. **Phase 4: Evaluation** — items: "6-month financial check-in", "Family happiness assessment", "Career trajectory review", "Go/stay/adjust decision"

Each item is a checkbox that persists to localStorage. The visual timeline at top shows phases as connected nodes.

- [ ] **Step 2: Add key dates section**

Below the phases: a simple list of key dates (editable text inputs). Pre-populate based on the selected destination's visa processing time and the global moveYear.

- [ ] **Step 3: Verify and commit**

```bash
npm run build
git add -A
git commit -m "feat: Plan page with phase timeline and checklists"
```

---

## Task 17: Final Polish + Deploy

**Files:** Various

- [ ] **Step 1: Add remaining destinations with research data**

Fill in data for the 8 non-deep destinations using compiled research. Update `researchDepth` to `'moderate'` for any that now have solid numbers (Amsterdam, CDMX should be moderate after research).

- [ ] **Step 2: AnimatedNumber component**

Create `src/components/AnimatedNumber.tsx` — uses `requestAnimationFrame` to smoothly transition between number values over 400ms. Replace raw number displays in MetricCard, DestinationCard, and Matrix composite scores.

- [ ] **Step 3: Mobile polish pass**

- Verify all pages at 375px width
- Ensure tab-nav horizontal scrolls on mobile
- Ensure data tables are scrollable or card-ified
- Bottom bar active states clear
- Touch targets at least 44px

- [ ] **Step 4: Delete old RetirementPlanner.tsx**

The old retirement planner component is fully superseded. Remove `src/RetirementPlanner.tsx` and the original `retirement-planner.jsx`.

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```

Expected: All engine tests pass.

- [ ] **Step 6: Build, push, and deploy**

```bash
npm run build
git add -A
git commit -m "feat: Life Change Planner v1 — 12 destinations, financial modeling, QoL matrix, move planning"
git push
```

GitHub Actions will auto-deploy to `elcoche2025.github.io/retirement-planner/`.

Verify live site: password gate renders with new design, dashboard shows all destinations, scenario detail pages work, matrix produces rankings, plan page has checklists.

---

## Post-MVP: Phase 5 Tasks (Future)

These are documented but not planned in detail. Build after v1 is stable:

1. **URL-based sharing**: Encode compare selections in URL params so you can text Kara a link like `#/compare?a=bilbao&b=medellin`.
2. **Export/print matrix**: Button to render the matrix result as a clean printable view.
3. **"Kara's view"**: Simplified mode — fewer knobs, bottom-line summaries, same data. Toggle in settings.
