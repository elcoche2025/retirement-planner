import { useCallback } from 'react';
import { useAppState } from './AppStateContext';
import type { GlobalAssumptions, ScenarioConfig, QoLWeights, QualityOfLifeRatings } from '@/types';
import { getDestination } from '@/data/destinations';
import { fetchLatestExchangeRates, shouldRefreshFxRates } from '@/services/fx';

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
      const { moveYear, returnYear, destinationId: _destId, ...profileUpdates } = values;
      if (moveYear !== undefined || returnYear !== undefined) {
        dispatch({
          type: 'SET_GLOBAL_ASSUMPTIONS',
          payload: {
            ...(moveYear !== undefined ? { moveYear } : {}),
            ...(returnYear !== undefined ? { returnYear } : {}),
          },
        });
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

  const selectedPreset = destination?.careerPresets.find((p) => p.id === config?.selectedCareerPreset)
    ?? destination?.careerPresets[0];

  return { config, destination, update, setQoLRating, resetQoLRating, effectiveQoL, selectedPreset };
}

export function useQoLWeights() {
  const { state, dispatch } = useAppState();
  const profile = state.profiles[state.activeProfileId];
  const weights = profile?.preferences.qolWeights ?? { weights: {} as Record<string, number>, financialWeight: 5 } as QoLWeights;
  const update = useCallback(
    (w: QoLWeights) => dispatch({ type: 'SET_QOL_WEIGHTS', payload: w }),
    [dispatch],
  );
  return { weights, updateWeights: update };
}

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

export function useExchangeRates() {
  const { state, dispatch } = useAppState();

  const refreshRates = useCallback(async () => {
    dispatch({ type: 'SET_FX_STATUS', payload: { status: 'loading', error: null } });
    try {
      const payload = await fetchLatestExchangeRates();
      dispatch({ type: 'SET_EXCHANGE_RATES', payload });
    } catch (error) {
      dispatch({
        type: 'SET_FX_STATUS',
        payload: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unable to refresh exchange rates',
        },
      });
      throw error;
    }
  }, [dispatch]);

  return {
    fxRatesMeta: state.fxRatesMeta,
    refreshRates,
    ratesAreStale: shouldRefreshFxRates(state.fxRatesMeta),
  };
}
