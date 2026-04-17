import { createContext, useContext, useReducer, useEffect, useMemo, useRef, useState, useCallback, ReactNode } from 'react';
import type {
  AppState,
  FxRatesMeta,
  GlobalAssumptions,
  QoLWeights,
  QualityOfLifeRatings,
  UserProfile,
  UserPreferences,
  ScenarioPreferenceOverrides,
} from '@/types';
import { GLOBAL_DEFAULTS } from '@/data/global-defaults';
import { WEIGHT_PRESETS } from '@/data/weight-presets';
import { ALL_DESTINATIONS } from '@/data/destinations';
import {
  fetchLatestExchangeRates,
  getDefaultFxRatesMeta,
  shouldRefreshFxRates,
} from '@/services/fx';
import { pullState, pushState, createDebouncedSync } from '@/services/sync';

const STORAGE_KEY = 'life-change-planner-state';
const STATE_VERSION = 5;

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
    localUpdatedAt: new Date().toISOString(),
  };
}

function normalizeFxRatesMeta(meta: unknown): FxRatesMeta {
  if (!meta || typeof meta !== 'object') return getDefaultFxRatesMeta();
  const candidate = meta as Partial<FxRatesMeta>;
  return {
    provider: candidate.provider ?? getDefaultFxRatesMeta().provider,
    baseCurrency: candidate.baseCurrency ?? getDefaultFxRatesMeta().baseCurrency,
    asOfDate: candidate.asOfDate ?? null,
    fetchedAt: candidate.fetchedAt ?? null,
    status: candidate.status ?? 'idle',
    error: candidate.error ?? null,
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed: any = JSON.parse(raw);

    // Migrate v1 → v2: add daughterAge + exchangeRates
    if (parsed.version === 1) {
      parsed.globalAssumptions.daughterAge = parsed.globalAssumptions.daughterAge ?? 3;
      parsed.globalAssumptions.exchangeRates = parsed.globalAssumptions.exchangeRates ?? {
        EUR: 0.92, KES: 130, MXN: 17.5, COP: 4200, UYU: 42,
      };
      parsed.version = 2;
    }

    // Migrate v2 → v3: add FX sync metadata
    if (parsed.version === 2) {
      parsed.fxRatesMeta = getDefaultFxRatesMeta();
      parsed.version = 3;
    }

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
            selectedCareerPreset: (sc as any).selectedCareerPreset,
            customQoLRatings: (sc as any).customQoLRatings ?? {},
            dcHomeDecision: (sc as any).dcHomeDecision,
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

    // Migrate v4 → v5: add localUpdatedAt for cloud sync
    if (parsed.version === 4) {
      parsed.localUpdatedAt = parsed.localUpdatedAt ?? new Date().toISOString();
      parsed.version = 5;
    }

    if (parsed.version !== STATE_VERSION) return getInitialState();
    return {
      ...parsed,
      fxRatesMeta: normalizeFxRatesMeta(parsed.fxRatesMeta),
    } as AppState;
  } catch {
    return getInitialState();
  }
}

type Action =
  | { type: 'SET_GLOBAL_ASSUMPTIONS'; payload: Partial<GlobalAssumptions> }
  | {
      type: 'SET_EXCHANGE_RATES';
      payload: {
        rates: Record<string, number>;
        provider: string;
        baseCurrency: string;
        asOfDate: string;
        fetchedAt: string;
      };
    }
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
  | { type: 'RESET_ALL' }
  | { type: 'REPLACE_STATE'; payload: AppState };

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

function reducer(state: AppState, action: Action): AppState {
  if (action.type === 'REPLACE_STATE') {
    return { ...action.payload, localUpdatedAt: action.payload.localUpdatedAt ?? new Date().toISOString() };
  }

  let newState: AppState;
  switch (action.type) {
    case 'SET_GLOBAL_ASSUMPTIONS':
      newState = { ...state, globalAssumptions: { ...state.globalAssumptions, ...action.payload } };
      break;
    case 'SET_EXCHANGE_RATES':
      newState = {
        ...state,
        globalAssumptions: {
          ...state.globalAssumptions,
          exchangeRates: {
            ...state.globalAssumptions.exchangeRates,
            ...action.payload.rates,
          },
        },
        fxRatesMeta: {
          provider: action.payload.provider,
          baseCurrency: action.payload.baseCurrency,
          asOfDate: action.payload.asOfDate,
          fetchedAt: action.payload.fetchedAt,
          status: 'success',
          error: null,
        },
      };
      break;
    case 'SET_FX_STATUS':
      newState = {
        ...state,
        fxRatesMeta: {
          ...state.fxRatesMeta,
          status: action.payload.status,
          error: action.payload.error ?? null,
        },
      };
      break;
    case 'SET_SCENARIO': {
      const { id, config } = action.payload;
      newState = updateActivePrefs(state, (prefs) => ({
        ...prefs,
        scenarioOverrides: {
          ...prefs.scenarioOverrides,
          [id]: { ...prefs.scenarioOverrides[id], ...config },
        },
      }));
      break;
    }
    case 'SET_QOL_WEIGHTS':
      newState = updateActivePrefs(state, (prefs) => ({ ...prefs, qolWeights: action.payload }));
      break;
    case 'SET_QOL_RATING': {
      const { destinationId, dimension, value } = action.payload;
      newState = updateActivePrefs(state, (prefs) => {
        const existing = prefs.scenarioOverrides[destinationId] ?? {};
        return {
          ...prefs,
          scenarioOverrides: {
            ...prefs.scenarioOverrides,
            [destinationId]: {
              ...existing,
              customQoLRatings: { ...existing.customQoLRatings, [dimension]: value },
            },
          },
        };
      });
      break;
    }
    case 'RESET_QOL_RATING': {
      const { destinationId, dimension } = action.payload;
      newState = updateActivePrefs(state, (prefs) => {
        const existing = prefs.scenarioOverrides[destinationId];
        if (!existing?.customQoLRatings) return prefs;
        const updated = { ...existing.customQoLRatings };
        delete updated[dimension];
        return {
          ...prefs,
          scenarioOverrides: {
            ...prefs.scenarioOverrides,
            [destinationId]: { ...existing, customQoLRatings: updated },
          },
        };
      });
      break;
    }
    case 'SET_LAST_VISITED':
      newState = { ...state, lastVisited: action.payload };
      break;
    case 'SET_COMPARE_SELECTION':
      newState = updateActivePrefs(state, (prefs) => ({ ...prefs, compareSelection: action.payload }));
      break;
    case 'SET_MATRIX_PRESET':
      newState = updateActivePrefs(state, (prefs) => ({ ...prefs, matrixPreset: action.payload }));
      break;
    case 'SWITCH_PROFILE': {
      if (!state.profiles[action.payload]) {
        newState = state;
      } else {
        newState = { ...state, activeProfileId: action.payload };
      }
      break;
    }
    case 'ADD_PROFILE': {
      const activeProfile = state.profiles[state.activeProfileId];
      const newProfile = createProfile(action.payload.name, activeProfile?.preferences);
      newState = {
        ...state,
        profiles: { ...state.profiles, [newProfile.id]: newProfile },
        activeProfileId: newProfile.id,
      };
      break;
    }
    case 'RENAME_PROFILE': {
      const { id, name } = action.payload;
      const profile = state.profiles[id];
      if (!profile) {
        newState = state;
      } else {
        newState = {
          ...state,
          profiles: {
            ...state.profiles,
            [id]: { ...profile, name },
          },
        };
      }
      break;
    }
    case 'DELETE_PROFILE': {
      const { id } = action.payload;
      const profileIds = Object.keys(state.profiles);
      if (profileIds.length <= 1) {
        newState = state; // Can't delete last profile
      } else {
        const { [id]: _removed, ...remaining } = state.profiles;
        const newActiveId = id === state.activeProfileId
          ? Object.keys(remaining)[0]
          : state.activeProfileId;
        newState = {
          ...state,
          profiles: remaining,
          activeProfileId: newActiveId,
        };
      }
      break;
    }
    case 'RESET_ALL':
      newState = getInitialState();
      break;
    default:
      newState = state;
  }

  // Auto-update localUpdatedAt on any state-changing action
  if (newState !== state) {
    newState = { ...newState, localUpdatedAt: new Date().toISOString() };
  }
  return newState;
}

interface SyncStatus {
  syncing: boolean;
  error: string | null;
}

interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  syncStatus: SyncStatus;
  syncNow: () => Promise<void>;
}

const AppStateCtx = createContext<AppStateContextValue | null>(null);

function toSyncErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Sync failed';
}

export function AppStateProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ syncing: false, error: null });
  const initialSyncDone = useRef(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // FX rate auto-refresh
  useEffect(() => {
    const shouldAutoRefresh =
      state.fxRatesMeta.status === 'idle' ||
      (state.fxRatesMeta.status === 'success' && shouldRefreshFxRates(state.fxRatesMeta));

    if (!shouldAutoRefresh) {
      return;
    }

    let cancelled = false;
    dispatch({ type: 'SET_FX_STATUS', payload: { status: 'loading', error: null } });

    fetchLatestExchangeRates()
      .then((payload) => {
        if (cancelled) return;
        dispatch({ type: 'SET_EXCHANGE_RATES', payload });
      })
      .catch((error) => {
        if (cancelled) return;
        dispatch({
          type: 'SET_FX_STATUS',
          payload: {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unable to refresh exchange rates',
          },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [state.fxRatesMeta]);

  // Initial cloud sync on mount (when userId is present)
  useEffect(() => {
    if (!userId || initialSyncDone.current) return;
    initialSyncDone.current = true;

    setSyncStatus({ syncing: true, error: null });
    pullState(userId)
      .then((remote) => {
        if (!remote) {
          // No cloud row — push local state
          return pushState(userId, state);
        }
        const localTime = state.localUpdatedAt ?? '1970-01-01T00:00:00Z';
        if (remote.updatedAt > localTime) {
          // Cloud is newer — replace local
          dispatch({ type: 'REPLACE_STATE', payload: remote.state });
          return;
        }
        if (localTime > remote.updatedAt) {
          // Local is newer — push
          return pushState(userId, state);
        }
      })
      .then(() => setSyncStatus({ syncing: false, error: null }))
      .catch((err) => {
        console.error('Initial sync failed:', err);
        setSyncStatus({ syncing: false, error: toSyncErrorMessage(err) });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Debounced push on state change
  const debouncedPush = useMemo(
    () =>
      createDebouncedSync(2000, (err) => {
        setSyncStatus({ syncing: false, error: toSyncErrorMessage(err) });
      }),
    [],
  );
  useEffect(() => {
    if (!userId || !initialSyncDone.current) return;
    debouncedPush(userId, state);
  }, [state, userId, debouncedPush]);

  const syncNow = useCallback(async () => {
    if (!userId) return;
    setSyncStatus({ syncing: true, error: null });
    try {
      await pushState(userId, state);
      setSyncStatus({ syncing: false, error: null });
    } catch (err) {
      console.error('Manual sync failed:', err);
      setSyncStatus({ syncing: false, error: toSyncErrorMessage(err) });
      throw err;
    }
  }, [userId, state]);

  return (
    <AppStateCtx.Provider value={{ state, dispatch, syncStatus, syncNow }}>
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
