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
