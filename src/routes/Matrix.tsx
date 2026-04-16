import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQoLWeights, useGlobalAssumptions } from '@/state/hooks';
import { useAppState } from '@/state/AppStateContext';
import { ALL_DESTINATIONS, getDestination } from '@/data/destinations';
import { QOL_DIMENSION_META } from '@/data/qol-dimensions';
import { WEIGHT_PRESETS, getMatchingWeightPresetId } from '@/data/weight-presets';
import { simulate } from '@/engine/simulate';
import {
  calculateQoLScore,
  normalizeFinancialScore,
  calculateCompositeScore,
  rankDestinations,
} from '@/engine/scoring';
import WeightSlider from '@/components/WeightSlider';
import PageGuide from '@/components/PageGuide';
import { MATRIX_GUIDE } from '@/data/page-guides';
import { Printer } from 'lucide-react';
import type { QoLDimension, QualityOfLifeRatings, QoLWeights, Destination } from '@/types';
import { QOL_DIMENSIONS } from '@/types';
import './Matrix.css';

const NON_DC_DESTINATIONS = ALL_DESTINATIONS.filter((d) => d.id !== 'dc-baseline');

interface DestColumn {
  destination: Destination;
  effectiveQoL: QualityOfLifeRatings;
  netWorth: number;
  financialScore: number;
  qolScore: number;
  compositeScore: number;
  rank: number;
}

export default function Matrix() {
  const { weights, updateWeights } = useQoLWeights();
  const { globals } = useGlobalAssumptions();
  const { state, dispatch } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();

  // Seed preset from URL on mount
  useEffect(() => {
    const paramPreset = searchParams.get('preset');
    if (paramPreset) {
      const preset = WEIGHT_PRESETS.find((p) => p.id === paramPreset);
      if (preset) {
        applyPreset(preset.weights);
        dispatch({ type: 'SET_MATRIX_PRESET', payload: preset.id });
      }
    }
  }, [dispatch, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const setDimensionWeight = (dim: QoLDimension, val: number) => {
    const nextWeights = {
      ...weights,
      weights: { ...weights.weights, [dim]: val },
    };
    updateWeights(nextWeights);
    dispatch({
      type: 'SET_MATRIX_PRESET',
      payload: getMatchingWeightPresetId(nextWeights) ?? 'custom',
    });
    setSearchParams({}, { replace: true });
  };

  const setFinancialWeight = (val: number) => {
    const nextWeights = { ...weights, financialWeight: val };
    updateWeights(nextWeights);
    dispatch({
      type: 'SET_MATRIX_PRESET',
      payload: getMatchingWeightPresetId(nextWeights) ?? 'custom',
    });
    setSearchParams({}, { replace: true });
  };

  const applyPreset = (preset: QoLWeights) => {
    updateWeights(preset);
  };

  const handlePresetClick = (preset: typeof WEIGHT_PRESETS[0]) => {
    applyPreset(preset.weights);
    dispatch({ type: 'SET_MATRIX_PRESET', payload: preset.id });
    setSearchParams({ preset: preset.id }, { replace: true });
  };

  const currentPresetId = getMatchingWeightPresetId(weights) ?? 'custom';

  const profile = state.profiles[state.activeProfileId];
  const scenarioOverrides = profile?.preferences.scenarioOverrides ?? {};

  // Build columns: simulate each destination, compute scores
  const columns = useMemo<DestColumn[]>(() => {
    // First pass: simulate to get net worths
    const rawCols = NON_DC_DESTINATIONS.map((dest) => {
      const overrides = scenarioOverrides[dest.id];
      const career =
        dest.careerPresets.find((p) => p.id === overrides?.selectedCareerPreset) ??
        dest.careerPresets[0];

      const projections = simulate(dest, career, globals, {
        dcHomeDecision: overrides?.dcHomeDecision ?? 'sell',
        moveYear: globals.moveYear,
        returnYear: globals.returnYear ?? null,
      });

      const lastYear = projections[projections.length - 1];
      const netWorth = lastYear?.totalNetWorth ?? 0;

      const effectiveQoL: QualityOfLifeRatings = {
        ...dest.qolDefaults,
        ...overrides?.customQoLRatings,
      };

      return { destination: dest, effectiveQoL, netWorth };
    });

    // Normalize financial scores
    const netWorths = rawCols.map((c) => c.netWorth);
    const minNW = Math.min(...netWorths);
    const maxNW = Math.max(...netWorths);

    const scored = rawCols.map((col) => {
      const financialScore = normalizeFinancialScore(col.netWorth, minNW, maxNW);
      const qolScore = calculateQoLScore(col.effectiveQoL, weights);
      const compositeScore = calculateCompositeScore(financialScore, qolScore, weights.financialWeight);
      return { ...col, financialScore, qolScore, compositeScore, rank: 0 };
    });

    // Rank and sort
    const ranked = rankDestinations(
      scored.map((s) => ({
        destinationId: s.destination.id,
        financialScore: s.financialScore,
        qolScore: s.qolScore,
        compositeScore: s.compositeScore,
      })),
    );

    // Merge ranks, sort by rank
    const withRank = scored
      .map((s) => {
        const r = ranked.find((rk) => rk.destinationId === s.destination.id);
        return { ...s, rank: r?.rank ?? 99 };
      })
      .sort((a, b) => a.rank - b.rank);

    return withRank;
  }, [globals, scenarioOverrides, weights]);

  // Heat map: per row, determine best/worst
  function cellClass(values: number[], idx: number, higherIsBetter: boolean): string {
    if (values.length < 2) return '';
    const max = Math.max(...values);
    const min = Math.min(...values);
    if (max === min) return '';
    const val = values[idx];
    if (higherIsBetter) {
      if (val === max) return 'matrix-cell-best';
      if (val === min) return 'matrix-cell-worst';
    } else {
      if (val === min) return 'matrix-cell-best';
      if (val === max) return 'matrix-cell-worst';
    }
    return '';
  }

  // Sensitivity analysis
  const sensitivityFlips = useMemo<string[]>(() => {
    if (columns.length < 2) return [];
    const current1 = columns[0];
    const flips: string[] = [];

    for (const dim of QOL_DIMENSIONS) {
      const meta = QOL_DIMENSION_META.find((m) => m.id === dim);
      const currentWeight = weights.weights[dim];
      const testWeight = Math.min(10, currentWeight + 3);
      if (testWeight === currentWeight) continue;

      const testWeights: QoLWeights = {
        ...weights,
        weights: { ...weights.weights, [dim]: testWeight },
      };

      // Recompute scores with modified weight
      const netWorths = columns.map((c) => c.netWorth);
      const minNW = Math.min(...netWorths);
      const maxNW = Math.max(...netWorths);

      const rescored = columns.map((col) => {
        const financialScore = normalizeFinancialScore(col.netWorth, minNW, maxNW);
        const qolScore = calculateQoLScore(col.effectiveQoL, testWeights);
        const compositeScore = calculateCompositeScore(financialScore, qolScore, testWeights.financialWeight);
        return { destinationId: col.destination.id, compositeScore };
      });

      rescored.sort((a, b) => b.compositeScore - a.compositeScore);

      if (rescored[0].destinationId !== current1.destination.id) {
        const newWinner = getDestination(rescored[0].destinationId);
        if (newWinner && meta) {
          flips.push(
            `If ${meta.label} weight goes from ${currentWeight} to ${testWeight}, ${newWinner.name} overtakes ${current1.destination.name}.`,
          );
        }
      }
    }

    // Also test financial weight
    const testFinWeight = Math.min(10, weights.financialWeight + 3);
    if (testFinWeight !== weights.financialWeight) {
      const netWorths = columns.map((c) => c.netWorth);
      const minNW = Math.min(...netWorths);
      const maxNW = Math.max(...netWorths);

      const testWeights: QoLWeights = { ...weights, financialWeight: testFinWeight };
      const rescored = columns.map((col) => {
        const financialScore = normalizeFinancialScore(col.netWorth, minNW, maxNW);
        const qolScore = calculateQoLScore(col.effectiveQoL, testWeights);
        const compositeScore = calculateCompositeScore(financialScore, qolScore, testFinWeight);
        return { destinationId: col.destination.id, compositeScore };
      });
      rescored.sort((a, b) => b.compositeScore - a.compositeScore);

      if (rescored[0].destinationId !== columns[0].destination.id) {
        const newWinner = getDestination(rescored[0].destinationId);
        if (newWinner) {
          flips.push(
            `If Financial weight goes from ${weights.financialWeight} to ${testFinWeight}, ${newWinner.name} overtakes ${columns[0].destination.name}.`,
          );
        }
      }
    }

    return flips;
  }, [columns, weights]);

  const winnerId = columns[0]?.destination.id;

  function getCellTone(values: number[], idx: number, higherIsBetter: boolean): React.CSSProperties | undefined {
    if (values.length < 2) return undefined;

    const max = Math.max(...values);
    const min = Math.min(...values);
    if (max === min) return undefined;

    const rawNormalized = (values[idx] - min) / (max - min);
    const normalized = higherIsBetter ? rawNormalized : 1 - rawNormalized;
    const distanceFromMid = normalized - 0.5;

    if (Math.abs(distanceFromMid) < 0.12) return undefined;

    const alpha = Math.min(0.22, 0.06 + Math.abs(distanceFromMid) * 0.28);
    const rgb = distanceFromMid >= 0 ? '107, 158, 107' : '184, 90, 90';

    return {
      backgroundColor: `rgba(${rgb}, ${alpha.toFixed(3)})`,
    };
  }

  return (
    <div className="page-enter matrix-page">
      <div className="matrix-header">
        <div>
          <h1>Decision Matrix</h1>
          <p className="matrix-subtitle">Weighted scoring across all dimensions.</p>
        </div>
        <button className="btn matrix-print-btn" onClick={() => window.print()}>
          <Printer size={16} />
          Print Results
        </button>
      </div>
      <PageGuide sections={MATRIX_GUIDE} />

      {/* Print-only weight summary (hidden on screen, visible in print) */}
      <div className="print-only matrix-print-summary">
        <h2>Weight Configuration</h2>
        <p><strong>Preset:</strong> {WEIGHT_PRESETS.find((preset) => preset.id === currentPresetId)?.name ?? 'Custom'}</p>
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

      {/* Weight configuration */}
      <section className="matrix-weights-section card">
        <h3 className="section-title">Weights</h3>

        <div className="matrix-presets">
          {WEIGHT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`btn ${currentPresetId === preset.id ? 'btn-active' : ''}`}
              onClick={() => handlePresetClick(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="matrix-weights-grid">
          {QOL_DIMENSION_META.map((meta) => (
            <WeightSlider
              key={meta.id}
              label={meta.label}
              value={weights.weights[meta.id]}
              onChange={(v) => setDimensionWeight(meta.id, v)}
              description={meta.description}
            />
          ))}
        </div>

        <div className="matrix-financial-weight">
          <WeightSlider
            label="Financial Score"
            value={weights.financialWeight}
            onChange={setFinancialWeight}
            description="How much terminal net worth matters vs quality of life"
          />
        </div>
      </section>

      {/* Matrix table */}
      <section className="matrix-table-section card">
        <h3 className="section-title">Ranking</h3>
        <div className="matrix-table-wrapper">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Dimension</th>
                {columns.map((col) => (
                  <th
                    key={col.destination.id}
                    className={col.destination.id === winnerId ? 'matrix-winner-col' : ''}
                  >
                    {col.destination.flag} {col.destination.city}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* QoL dimension rows */}
              {QOL_DIMENSION_META.map((meta) => {
                const dim = meta.id as QoLDimension;
                const values = columns.map((c) => c.effectiveQoL[dim]);
                return (
                  <tr key={dim}>
                    <td>{meta.label}</td>
                    {columns.map((col, i) => (
                      <td
                        key={col.destination.id}
                        className={`${cellClass(values, i, true)} ${col.destination.id === winnerId ? 'matrix-winner-col' : ''}`}
                        style={getCellTone(values, i, true)}
                      >
                        {col.effectiveQoL[dim]}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {/* Financial score row */}
              <tr>
                <td>Financial Score</td>
                {columns.map((col, i) => {
                  const values = columns.map((c) => c.financialScore);
                  return (
                    <td
                      key={col.destination.id}
                      className={`${cellClass(values, i, true)} ${col.destination.id === winnerId ? 'matrix-winner-col' : ''}`}
                      style={getCellTone(values, i, true)}
                    >
                      {col.financialScore.toFixed(0)}
                    </td>
                  );
                })}
              </tr>

              {/* Composite score row */}
              <tr className="matrix-row-composite">
                <td>Composite Score</td>
                {columns.map((col) => (
                  <td
                    key={col.destination.id}
                    className={col.destination.id === winnerId ? 'matrix-winner-col' : ''}
                  >
                    {col.compositeScore.toFixed(1)}
                  </td>
                ))}
              </tr>

              {/* Rank row */}
              <tr className="matrix-row-rank">
                <td>Rank</td>
                {columns.map((col) => (
                  <td
                    key={col.destination.id}
                    className={col.destination.id === winnerId ? 'matrix-winner-col' : ''}
                  >
                    #{col.rank}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Sensitivity analysis */}
      <section className="matrix-sensitivity">
        <h3 className="section-title">Sensitivity Analysis</h3>
        <div
          className={`matrix-sensitivity-card ${sensitivityFlips.length === 0 ? 'matrix-sensitivity-robust' : ''}`}
        >
          <div className="matrix-sensitivity-label">
            {sensitivityFlips.length > 0 ? 'Potential Flips' : 'Robust Result'}
          </div>
          {sensitivityFlips.length === 0 ? (
            <p>
              The current winner is robust. No single weight increase of +3 changes the top ranking.
            </p>
          ) : (
            sensitivityFlips.map((flip, i) => <p key={i}>{flip}</p>)
          )}
        </div>
      </section>
    </div>
  );
}
