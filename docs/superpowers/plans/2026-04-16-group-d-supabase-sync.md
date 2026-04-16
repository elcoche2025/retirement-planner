# Group D: Supabase Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the password gate with Supabase email auth and add cloud state sync (local-first, offline-capable).

**Architecture:** Supabase client for auth + one JSONB row per user for state. Local-first: localStorage is primary, cloud sync is background. Debounced push (2s) on state changes. Last-write-wins merge on load.

**Tech Stack:** `@supabase/supabase-js`, existing Vite/React/TypeScript stack.

**Supabase project:** `misjzqiqihdzzajaoyro` (misc free project)
**URL:** `https://misjzqiqihdzzajaoyro.supabase.co`
**Anon key:** `sb_publishable_DuKCGqL5oP5xA9EWoH_wcA_3tCo4SKc`
**Table:** `life_planner_state` (already created with RLS)

**Design spec:** `docs/superpowers/specs/2026-04-16-group-d-supabase-sync-design.md`

---

## File Map

```
New files:
  src/services/supabase.ts          Supabase client instance
  src/services/auth.ts              Sign in, sign up, sign out, session management
  src/services/sync.ts              Push/pull state to Supabase, debounced sync
  src/components/LoginScreen.tsx     Replaces PasswordGate — Supabase email auth
  src/components/LoginScreen.css     Login screen styles
  src/components/SyncStatus.tsx      Sync indicator for Settings
  src/components/SyncStatus.css      Sync indicator styles

Modified files:
  package.json                       Add @supabase/supabase-js
  src/types/index.ts                 Add localUpdatedAt to AppState
  src/App.tsx                        Replace PasswordGate with Supabase auth flow
  src/state/AppStateContext.tsx       Add sync effect, localUpdatedAt, migration v4→v5
  src/routes/Inputs.tsx              Add SyncStatus + sign out section
```

---

## Task 1: Install Supabase + Create Client

**Files:**
- Modify: `package.json`
- Create: `src/services/supabase.ts`

- [ ] **Step 1: Install @supabase/supabase-js**

```bash
cd /Users/mekocewalker/Library/CloudStorage/Dropbox/coding-projects/retirement-planner
npm install @supabase/supabase-js
```

- [ ] **Step 2: Create Supabase client**

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://misjzqiqihdzzajaoyro.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DuKCGqL5oP5xA9EWoH_wcA_3tCo4SKc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/services/supabase.ts
git commit -m "feat: install @supabase/supabase-js and create client for misc project"
```

---

## Task 2: Auth Service

**Files:**
- Create: `src/services/auth.ts`

- [ ] **Step 1: Create auth service**

```typescript
// src/services/auth.ts
import { supabase } from './supabase';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function getUser(): User | null {
  // Synchronous check from cached session
  return supabase.auth.getUser ? null : null; // placeholder — actual implementation below
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/auth.ts
git commit -m "feat: auth service with signIn, signUp, signOut, session management"
```

---

## Task 3: Sync Service

**Files:**
- Create: `src/services/sync.ts`

- [ ] **Step 1: Create sync service**

```typescript
// src/services/sync.ts
import { supabase } from './supabase';
import type { AppState } from '@/types';

const TABLE = 'life_planner_state';

export interface SyncResult {
  action: 'pulled' | 'pushed' | 'created' | 'no-change';
  timestamp: string;
}

export async function pullState(userId: string): Promise<{ state: AppState; updatedAt: string } | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('state, updated_at')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No row found
    throw error;
  }

  return { state: data.state as AppState, updatedAt: data.updated_at };
}

export async function pushState(userId: string, state: AppState): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: userId,
        state: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) throw error;
}

export async function syncState(
  userId: string,
  localState: AppState,
): Promise<SyncResult> {
  const remote = await pullState(userId);
  const now = new Date().toISOString();

  if (!remote) {
    // No cloud row — push local state
    await pushState(userId, localState);
    return { action: 'created', timestamp: now };
  }

  const localTime = localState.localUpdatedAt ?? '1970-01-01T00:00:00Z';
  const remoteTime = remote.updatedAt;

  if (remoteTime > localTime) {
    // Cloud is newer — return cloud state for the caller to apply
    return { action: 'pulled', timestamp: remoteTime };
  }

  if (localTime > remoteTime) {
    // Local is newer — push to cloud
    await pushState(userId, localState);
    return { action: 'pushed', timestamp: now };
  }

  return { action: 'no-change', timestamp: localTime };
}

// Debounce helper
export function createDebouncedSync(delayMs: number = 2000) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function debouncedPush(userId: string, state: AppState) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await pushState(userId, state);
      } catch (err) {
        console.error('Sync push failed:', err);
      }
    }, delayMs);
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/sync.ts
git commit -m "feat: sync service with pull/push/merge and debounced push"
```

---

## Task 4: Login Screen (Replace Password Gate)

**Files:**
- Create: `src/components/LoginScreen.tsx`
- Create: `src/components/LoginScreen.css`

- [ ] **Step 1: Create LoginScreen component**

The login screen replaces the old PasswordGate. Same aesthetic (centered, warm palette, Fraunces title) but with email/password fields instead of a single password field.

States:
- `mode: 'signin' | 'signup'` — toggle between sign-in and create-account
- `email`, `password`, `confirmPassword` (for signup)
- `loading` — disable button during auth call
- `error` — error message from Supabase

Layout:
- "Life Change Planner" title (Fraunces)
- "SIGN IN" or "CREATE ACCOUNT" subtitle
- Email input
- Password input
- Confirm password (signup mode only)
- Submit button
- Toggle link: "Need an account? Create one" / "Already have an account? Sign in"
- Error message area
- Respects light/dark theme (uses CSS variables)

On submit:
- signin: call `signIn(email, password)` from auth service
- signup: validate passwords match, call `signUp(email, password)`
- On success: the parent (App.tsx) will detect the auth state change and show the app
- On error: display Supabase error message

- [ ] **Step 2: Style LoginScreen.css**

Same warm centered design as the old password gate but adapted for the fuller form:
- Max-width 360px
- Inputs full-width
- Uses CSS variables for theming
- Error text in `--color-negative`
- Button uses `--color-highlight`

- [ ] **Step 3: Commit**

```bash
git add src/components/LoginScreen.tsx src/components/LoginScreen.css
git commit -m "feat: LoginScreen component replacing password gate with Supabase auth"
```

---

## Task 5: Wire Auth + Sync into App

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/state/AppStateContext.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add localUpdatedAt to AppState**

In `src/types/index.ts`, add to AppState:

```typescript
localUpdatedAt: string;  // ISO timestamp, updated on every state change
```

- [ ] **Step 2: Migration v4→v5 and sync integration in AppStateContext**

In `src/state/AppStateContext.tsx`:

Bump `STATE_VERSION` to 5.

Add v4→v5 migration:
```typescript
if (parsed.version === 4) {
  parsed.localUpdatedAt = parsed.localUpdatedAt ?? new Date().toISOString();
  parsed.version = 5;
}
```

Update `getInitialState()` to include `localUpdatedAt: new Date().toISOString()`.

In the reducer, update `localUpdatedAt` on every state-changing action (add to each case that modifies state, or add a wrapper):

```typescript
// After the switch statement, for any action that changes state:
if (newState !== state) {
  newState = { ...newState, localUpdatedAt: new Date().toISOString() };
}
return newState;
```

Export a new action type for replacing state from cloud:
```typescript
| { type: 'REPLACE_STATE'; payload: AppState }
```

Handle it in the reducer:
```typescript
case 'REPLACE_STATE':
  return { ...action.payload, localUpdatedAt: action.payload.localUpdatedAt ?? new Date().toISOString() };
```

- [ ] **Step 3: Rewrite App.tsx with Supabase auth flow**

Remove the old PasswordGate component entirely. Remove the `gate.css` import.

New App.tsx structure:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import LoginScreen from './components/LoginScreen';
import { ThemeProvider } from './state/ThemeContext';

// ... AppRouter stays the same (HashRouter with AppStateProvider) ...

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <ThemeProvider>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="text-tertiary">Loading...</p>
        </div>
      </ThemeProvider>
    );
  }

  if (!session) {
    return (
      <ThemeProvider>
        <LoginScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppRouter session={session} />
    </ThemeProvider>
  );
}
```

Pass `session` into AppRouter/AppStateProvider so the sync effect can use `session.user.id`.

- [ ] **Step 4: Add sync effect to AppStateProvider**

In `AppStateContext.tsx`, the AppStateProvider receives the session (or userId) as a prop. Add a sync effect:

```typescript
// On mount: pull cloud state if newer
useEffect(() => {
  if (!userId) return;
  pullState(userId).then((remote) => {
    if (!remote) {
      // No cloud row — push local
      pushState(userId, state);
      return;
    }
    const localTime = state.localUpdatedAt ?? '1970-01-01T00:00:00Z';
    if (remote.updatedAt > localTime) {
      // Cloud is newer — replace local
      dispatch({ type: 'REPLACE_STATE', payload: remote.state });
    } else if (localTime > remote.updatedAt) {
      // Local is newer — push
      pushState(userId, state);
    }
  }).catch(console.error);
}, [userId]); // Only on mount / user change

// On state change: debounced push
const debouncedPush = useMemo(() => createDebouncedSync(2000), []);
useEffect(() => {
  if (!userId) return;
  debouncedPush(userId, state);
}, [state, userId, debouncedPush]);
```

- [ ] **Step 5: Delete old gate.css (optional cleanup)**

Remove `src/styles/gate.css` and any imports of it.

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
npx vitest run
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: replace password gate with Supabase auth, add cloud sync with debounced push"
```

---

## Task 6: Sync Status + Sign Out in Settings

**Files:**
- Create: `src/components/SyncStatus.tsx`
- Create: `src/components/SyncStatus.css`
- Modify: `src/routes/Inputs.tsx`

- [ ] **Step 1: Create SyncStatus component**

Shows:
- Signed-in email
- Last sync timestamp (from `state.localUpdatedAt`)
- Sync status indicator: green dot "Synced", pulsing "Syncing...", gray "Offline", red "Error"
- "Sync Now" button for manual push
- "Sign Out" button

```typescript
// src/components/SyncStatus.tsx
import { useState } from 'react';
import { supabase } from '@/services/supabase';
import { pushState } from '@/services/sync';
import { useAppState } from '@/state/AppStateContext';
import { LogOut, RefreshCw } from 'lucide-react';
import './SyncStatus.css';
```

- [ ] **Step 2: Add to Inputs page**

In `src/routes/Inputs.tsx`, add a new section at the top (before Personal):

```tsx
<section className="card inputs-section">
  <h3 className="section-title">Account & Sync</h3>
  <SyncStatus />
</section>
```

Import SyncStatus and pass necessary props.

- [ ] **Step 3: Commit**

```bash
git add src/components/SyncStatus.tsx src/components/SyncStatus.css src/routes/Inputs.tsx
git commit -m "feat: sync status indicator and sign out in Settings"
```

---

## Task 7: Final Build + Push + Deploy

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

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
- Old password gate is gone — Supabase login screen appears
- Create an account with mekoce@gmail.com
- Sign in — app loads with existing localStorage state
- Change a setting — wait 2 seconds — state syncs to cloud
- Open in a different browser/incognito — sign in — cloud state loads
- Settings page shows email, sync status, sign out button
- Sign out — returns to login screen
- Offline: disconnect wifi, reload — app loads from cached session + localStorage
