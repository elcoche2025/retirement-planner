import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type {
  AppState,
  FxRatesMeta,
  GlobalAssumptions,
  ScenarioConfig,
  QoLWeights,
  QualityOfLifeRatings,
} from '@/types';
import { GLOBAL_DEFAULTS } from '@/data/global-defaults';
import { WEIGHT_PRESETS } from '@/data/weight-presets';
import { ALL_DESTINATIONS } from '@/data/destinations';
import {
  fetchLatestExchangeRates,
  getDefaultFxRatesMeta,
  shouldRefreshFxRates,
} from '@/services/fx';

const STORAGE_KEY = 'life-change-planner-state';
const STATE_VERSION = 3;

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
    fxRatesMeta: getDefaultFxRatesMeta(),
    scenarios: getDefaultScenarios(),
    qolWeights: WEIGHT_PRESETS[0].weights,
    lastVisited: 'dc-baseline',
    compareSelection: ['dc-baseline', 'kenya-nairobi'],
    matrixPreset: 'balanced',
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
    const parsed = JSON.parse(raw);

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
    case 'SET_EXCHANGE_RATES':
      return {
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
    case 'SET_FX_STATUS':
      return {
        ...state,
        fxRatesMeta: {
          ...state.fxRatesMeta,
          status: action.payload.status,
          error: action.payload.error ?? null,
        },
      };
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
