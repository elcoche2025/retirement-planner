# Group D: Supabase Sync — Design Spec

## Context

Extends the Life Change Planner with cloud sync via Supabase. Replaces the existing "lullaby" password gate with Supabase email/password auth. Local-first architecture — the app works fully offline after first sign-in.

**Supabase project**: Misc free project (`misjzqiqihdzzajaoyro`). NOT the IEP Pulse project.

**Stack**: Same + `@supabase/supabase-js` (new dependency).

---

## Architecture: Local-First with Cloud Sync

The app loads instantly from localStorage (unchanged). When a Supabase session exists, state syncs to the cloud in the background. The app never blocks on network calls after the initial sign-in.

---

## Auth: Supabase Replaces Password Gate

### What changes

The existing `PasswordGate` component (SHA-256 hash check against "lullaby", sessionStorage-based) is removed entirely. Replaced by Supabase Auth.

### Auth flow

**First visit (no cached session):**
1. App renders a login screen (email + password fields + "Sign In" button)
2. User signs in via Supabase Auth
3. Session is cached in localStorage by the Supabase client library
4. App loads, fetches cloud state if available, merges with local

**Subsequent visits (cached session):**
1. Supabase client finds valid session in localStorage
2. App loads immediately — no login screen, no network wait
3. Sync happens in background

**Offline (cached session exists):**
1. Supabase client has cached session — app considers user authenticated
2. App loads from localStorage
3. Sync queues until connectivity returns
4. No degradation — full app functionality

**Offline (no cached session — first visit on new device):**
1. Login screen shown but sign-in will fail (needs network)
2. Show a message: "Internet connection required for first sign-in"
3. After first successful sign-in, device works offline indefinitely

**Sign out:**
1. Clear Supabase session
2. Clear localStorage state (optional — could keep local state for offline use)
3. Return to login screen

### Account creation

Pre-create accounts in the Supabase dashboard for mekoce@gmail.com and Kara's email. The login screen does NOT include a public sign-up form — this is a private family tool. If a new user is needed (e.g., "Mom"), create the account in the Supabase dashboard and share the credentials.

Alternatively: include a "Create Account" flow but gate it behind an invite code or just leave it open since the URL itself is obscure and there's no sensitive data.

Decision: **Include a simple sign-up form** (email + password + confirm password). The URL is obscure, RLS protects data, and it's easier than managing accounts through the dashboard. If Mekoce wants to lock it down later, he can disable sign-ups in Supabase settings.

### Login screen design

Replaces the old password gate. Same aesthetic (centered, warm dark/light theme, Fraunces title). Content:
- "Life Change Planner" title
- "SIGN IN" subtitle
- Email input
- Password input
- "Sign In" button
- "Create Account" toggle that reveals confirm-password field + "Create Account" button
- Error messages (invalid credentials, network error)
- The login screen respects the light/dark theme toggle (theme is stored in separate localStorage key, not tied to auth)

---

## Database Schema

One table in the misc Supabase project:

```sql
create table life_planner_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  state jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id)
);

alter table life_planner_state enable row level security;

-- GRANT permissions to authenticated role
grant select, insert, update on life_planner_state to authenticated;

create policy "Users read own state"
  on life_planner_state for select
  using (auth.uid() = user_id);

create policy "Users insert own state"
  on life_planner_state for insert
  with check (auth.uid() = user_id);

create policy "Users update own state"
  on life_planner_state for update
  using (auth.uid() = user_id);
```

Each authenticated user gets one row. The `state` column stores the full `AppState` as JSON (<50KB). Simple, no normalization.

---

## Sync Logic

### Supabase Client

Initialize once with the misc project URL and anon key:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://misjzqiqihdzzajaoyro.supabase.co',
  '<anon-key>'  // public anon key — RLS protects data
);
```

The anon key is hardcoded (this is a personal tool, the key is public by Supabase design, RLS is the security layer).

### On app load (authenticated)

```
1. Load localStorage state (instant)
2. Render app with local state
3. In background: fetch Supabase row for this user
4. Compare updated_at:
   - Cloud newer → replace local state, save to localStorage
   - Local newer → push local state to cloud
   - No cloud row → create row with local state
5. Update sync status indicator
```

### On state change (authenticated)

```
1. Save to localStorage immediately (existing behavior — unchanged)
2. Debounce 2 seconds
3. Upsert to Supabase: { user_id, state: JSON, updated_at: now() }
4. Update sync status
```

### Debounce

Use a simple debounce: each state change resets a 2-second timer. When the timer fires, push to Supabase. This prevents hammering the API when dragging sliders.

### Conflict resolution

Last-write-wins using `updated_at`. The full state object replaces — no field-level merge. This is fine because:
- Only one device is typically active at a time
- The state object is small
- This is a planning tool, not a collaboration tool

### What syncs

The full `AppState` object: `globalAssumptions`, `profiles`, `activeProfileId`, `lastVisited`.

### What doesn't sync

- `fxRatesMeta` — each device fetches its own rates
- Theme preference — per-device, stored in separate localStorage key
- Supabase session — managed by Supabase client library independently

### AppState changes for sync

Add to `AppState`:
```typescript
localUpdatedAt: string;  // ISO timestamp, updated on every state change
```

This is compared against the cloud row's `updated_at` to determine merge direction.

---

## Sync Status UI

A small indicator in the Settings page (and optionally in the top bar):

- "Synced just now" / "Synced 5 min ago" — green dot
- "Syncing..." — pulsing dot
- "Offline — changes saved locally" — gray dot
- "Sync error: [message]" — red dot, with "Retry" button
- "Not signed in" — no dot (sync section hidden)

Also a "Sync Now" button for manual push/pull.

---

## Implementation Order

1. **Install @supabase/supabase-js, create Supabase client**
2. **Run SQL to create table + RLS in Supabase dashboard** (manual step, documented)
3. **Create auth service** (sign in, sign up, sign out, session listener)
4. **Replace password gate with Supabase auth screen**
5. **Create sync service** (push, pull, merge logic with debounce)
6. **Wire sync into AppStateContext** (push on state change, pull on load)
7. **Add sync status + auth section to Settings page**
8. **Add `localUpdatedAt` to AppState, migration v4→v5**
9. **Deploy + create initial accounts**

---

## Files

**New:**
- `src/services/supabase.ts` — Supabase client instance
- `src/services/auth.ts` — sign in, sign up, sign out, getSession, onAuthStateChange
- `src/services/sync.ts` — pushState, pullState, mergeState, debounced sync effect
- `src/components/LoginScreen.tsx` — replaces PasswordGate
- `src/components/LoginScreen.css`
- `src/components/SyncStatus.tsx` — sync indicator for Settings
- `src/components/SyncStatus.css`

**Modified:**
- `package.json` — add `@supabase/supabase-js`
- `src/App.tsx` — replace PasswordGate with Supabase auth check, render LoginScreen or AppRouter
- `src/state/AppStateContext.tsx` — add sync effect, `localUpdatedAt` field, migration v4→v5
- `src/routes/Inputs.tsx` — add SyncStatus + sign out button
- `src/types/index.ts` — add `localUpdatedAt` to AppState

**Deleted:**
- `src/styles/gate.css` — no longer needed (LoginScreen has its own styles)
- Remove PasswordGate component from App.tsx

---

## Security Notes

- Supabase anon key is public (by design) — hardcoded in source is fine
- RLS ensures users can only access their own row
- GRANT to authenticated role is required (learned from IEP Pulse: RLS alone isn't enough)
- No sensitive data in the state (planning estimates, not real financial accounts)
- Sign-up is open but the URL is obscure and `noindex` meta prevents discovery

---

## Decisions from brainstorming

- Supabase email/password auth replaces the "lullaby" password gate
- Local-first: app works fully offline after first sign-in
- One table, one row per user, full state as JSON
- Last-write-wins conflict resolution (no merge)
- Sign-up form included (not dashboard-only account creation)
- Sync debounced at 2 seconds
- Misc Supabase project, NOT IEP Pulse
- fxRatesMeta and theme don't sync (per-device)
