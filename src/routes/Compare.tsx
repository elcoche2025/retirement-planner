import { useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCompareSelection, useGlobalAssumptions, useScenario } from '@/state/hooks';
import { useAppState } from '@/state/AppStateContext';
import { getDestination } from '@/data/destinations';
import { simulate } from '@/engine/simulate';
import { runMonteCarlo } from '@/engine/montecarlo';
import { calculateQoLScore } from '@/engine/scoring';
import ComparisonChart from '@/components/ComparisonChart';
import DestinationSelector from '@/components/DestinationSelector';
import PageGuide from '@/components/PageGuide';
import { COMPARE_GUIDE } from '@/data/page-guides';
import type { YearlyProjection, Destination, CareerPreset, MonteCarloResult } from '@/types';
import './Compare.css';

const fmt = (n: number) =>
  n >= 1e6
    ? `$${(n / 1e6).toFixed(2)}M`
    : n >= 1e3
      ? `$${(n / 1e3).toFixed(0)}K`
      : `$${n}`;

function getSimulation(
  dest: Destination,
  career: CareerPreset,
  globals: ReturnType<typeof useGlobalAssumptions>['globals'],
  scenarioConfig: ReturnType<typeof useScenario>['config'],
): YearlyProjection[] {
  return simulate(dest, career, globals, {
    dcHomeDecision: scenarioConfig?.dcHomeDecision ?? 'sell',
    moveYear: scenarioConfig?.moveYear ?? globals.moveYear,
    returnYear: scenarioConfig?.returnYear ?? null,
    customIncome: scenarioConfig?.customIncome,
  });
}

interface MetricRow {
  label: string;
  values: (string | number)[];
  raw: number[];
  higherIsBetter: boolean;
}

export default function Compare() {
  const { selection, updateSelection } = useCompareSelection();
  const { globals } = useGlobalAssumptions();
  const { state } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMC, setShowMC] = useState(false);

  const idA = selection[0] || '';
  const idB = selection[1] || '';

  // Seed from URL on mount
  useEffect(() => {
    const paramA = searchParams.get('a');
    const paramB = searchParams.get('b');
    if (paramA && paramB && getDestination(paramA) && getDestination(paramB) && paramA !== paramB) {
      updateSelection([paramA, paramB]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const destA = getDestination(idA);
  const destB = getDestination(idB);
  const dc = getDestination('dc-baseline')!;

  const setA = (id: string) => {
    updateSelection([id, idB]);
    setSearchParams({ a: id, b: idB }, { replace: true });
  };
  const setB = (id: string) => {
    updateSelection([idA, id]);
    setSearchParams({ a: idA, b: id }, { replace: true });
  };

  const dcCareer = dc.careerPresets[0];
  const dcConfig = state.scenarios['dc-baseline'];

  const dcProjections = useMemo<YearlyProjection[]>(() => {
    return simulate(dc, dcCareer, globals, {
      dcHomeDecision: dcConfig?.dcHomeDecision ?? 'keep',
      moveYear: dcConfig?.moveYear ?? globals.moveYear,
      returnYear: dcConfig?.returnYear ?? null,
    });
  }, [dc, dcCareer, globals, dcConfig]);

  const projA = useMemo<YearlyProjection[]>(() => {
    if (!destA) return [];
    const configA = state.scenarios[destA.id];
    const career = destA.careerPresets.find(
      (p) => p.id === configA?.selectedCareerPreset,
    ) ?? destA.careerPresets[0];
    return getSimulation(destA, career, globals, configA);
  }, [destA, globals, state.scenarios]);

  const projB = useMemo<YearlyProjection[]>(() => {
    if (!destB) return [];
    const configB = state.scenarios[destB.id];
    const career = destB.careerPresets.find(
      (p) => p.id === configB?.selectedCareerPreset,
    ) ?? destB.careerPresets[0];
    return getSimulation(destB, career, globals, configB);
  }, [destB, globals, state.scenarios]);

  const mcA = useMemo<MonteCarloResult | undefined>(() => {
    if (!showMC || !destA) return undefined;
    const configA = state.scenarios[destA.id];
    const career = destA.careerPresets.find(
      (p) => p.id === configA?.selectedCareerPreset,
    ) ?? destA.careerPresets[0];
    return runMonteCarlo(destA, career, globals, {
      dcHomeDecision: configA?.dcHomeDecision ?? 'sell',
      moveYear: configA?.moveYear ?? globals.moveYear,
      returnYear: configA?.returnYear ?? null,
      customIncome: configA?.customIncome,
    });
  }, [showMC, destA, globals, state.scenarios]);

  const mcB = useMemo<MonteCarloResult | undefined>(() => {
    if (!showMC || !destB) return undefined;
    const configB = state.scenarios[destB.id];
    const career = destB.careerPresets.find(
      (p) => p.id === configB?.selectedCareerPreset,
    ) ?? destB.careerPresets[0];
    return runMonteCarlo(destB, career, globals, {
      dcHomeDecision: configB?.dcHomeDecision ?? 'sell',
      moveYear: configB?.moveYear ?? globals.moveYear,
      returnYear: configB?.returnYear ?? null,
      customIncome: configB?.customIncome,
    });
  }, [showMC, destB, globals, state.scenarios]);

  const datasets = useMemo(() => {
    const ds: { destination: Destination; projections: YearlyProjection[]; monteCarlo?: MonteCarloResult }[] = [];
    if (destA && projA.length) ds.push({ destination: destA, projections: projA, monteCarlo: mcA });
    if (destB && projB.length) ds.push({ destination: destB, projections: projB, monteCarlo: mcB });
    return ds;
  }, [destA, destB, projA, projB, mcA, mcB]);

  const metricsRows = useMemo<MetricRow[]>(() => {
    if (!destA || !destB || !projA.length || !projB.length) return [];

    const lastA = projA[projA.length - 1];
    const lastB = projB[projB.length - 1];
    const firstA = projA[0];
    const firstB = projB[0];

    const qolA = { ...destA.qolDefaults, ...state.scenarios[destA.id]?.customQoLRatings };
    const qolB = { ...destB.qolDefaults, ...state.scenarios[destB.id]?.customQoLRatings };
    const qolScoreA = calculateQoLScore(qolA, state.qolWeights);
    const qolScoreB = calculateQoLScore(qolB, state.qolWeights);

    return [
      {
        label: `Net Worth at ${globals.retirementAge}`,
        values: [fmt(lastA.totalNetWorth), fmt(lastB.totalNetWorth)],
        raw: [lastA.totalNetWorth, lastB.totalNetWorth],
        higherIsBetter: true,
      },
      {
        label: 'Year-1 Income',
        values: [fmt(firstA.grossIncome), fmt(firstB.grossIncome)],
        raw: [firstA.grossIncome, firstB.grossIncome],
        higherIsBetter: true,
      },
      {
        label: 'Annual Expenses',
        values: [fmt(firstA.totalExpenses), fmt(firstB.totalExpenses)],
        raw: [firstA.totalExpenses, firstB.totalExpenses],
        higherIsBetter: false,
      },
      {
        label: 'Estimated Tax Load',
        values: [fmt(firstA.totalTax), fmt(firstB.totalTax)],
        raw: [firstA.totalTax, firstB.totalTax],
        higherIsBetter: false,
      },
      {
        label: 'COL Multiplier',
        values: [
          `${destA.costOfLiving.costMultiplierVsDC.toFixed(2)}x`,
          `${destB.costOfLiving.costMultiplierVsDC.toFixed(2)}x`,
        ],
        raw: [destA.costOfLiving.costMultiplierVsDC, destB.costOfLiving.costMultiplierVsDC],
        higherIsBetter: false,
      },
      {
        label: 'QoL Score',
        values: [qolScoreA.toFixed(1), qolScoreB.toFixed(1)],
        raw: [qolScoreA, qolScoreB],
        higherIsBetter: true,
      },
    ];
  }, [destA, destB, projA, projB, globals, state]);

  function bestIndex(raw: number[], higherIsBetter: boolean): number {
    if (raw.length < 2) return -1;
    if (higherIsBetter) return raw[0] >= raw[1] ? 0 : 1;
    return raw[0] <= raw[1] ? 0 : 1;
  }

  const bothSelected = destA && destB && idA !== idB;

  return (
    <div className="page-enter compare-page">
      <h1>Compare</h1>
      <p className="compare-subtitle">Side-by-side financial and life quality comparison.</p>
      <PageGuide sections={COMPARE_GUIDE} />

      {/* Selectors */}
      <div className="compare-selectors">
        <div className="compare-selector-group">
          <span className="compare-selector-label">Destination A</span>
          <DestinationSelector value={idA} onChange={setA} exclude={idB ? [idB] : []} />
        </div>
        <span className="compare-vs">vs</span>
        <div className="compare-selector-group">
          <span className="compare-selector-label">Destination B</span>
          <DestinationSelector value={idB} onChange={setB} exclude={idA ? [idA] : []} />
        </div>
      </div>

      {!bothSelected && (
        <div className="compare-empty">Select two different destinations to compare.</div>
      )}

      {bothSelected && (
        <>
          {/* Chart */}
          <section className="compare-chart card">
            <div className="compare-chart-header">
              <h3 className="section-title">Net Worth Projection</h3>
              <button
                className={`compare-mc-toggle ${showMC ? 'compare-mc-toggle-active' : ''}`}
                onClick={() => setShowMC((v) => !v)}
              >
                {showMC ? 'Hide' : 'Show'} Projection Range
              </button>
            </div>
            <ComparisonChart datasets={datasets} dcProjections={dcProjections} />
            <div className="compare-chart-legend">
              <span className="compare-legend-item">
                <span className="compare-legend-line" style={{ background: destA.accentColor }} />
                {destA.name}
              </span>
              <span className="compare-legend-item">
                <span className="compare-legend-line" style={{ background: destB.accentColor }} />
                {destB.name}
              </span>
              <span className="compare-legend-item">
                <span className="compare-legend-line compare-legend-dashed" />
                DC Baseline
              </span>
            </div>
          </section>

          {/* MC stats row */}
          {showMC && mcA && mcB && (
            <section className="compare-mc-stats card">
              <h3 className="section-title">Monte Carlo Range</h3>
              <div className="compare-mc-stats-grid">
                <div className="compare-mc-stats-col">
                  <div className="compare-mc-stats-header" style={{ color: destA.accentColor }}>
                    {destA.flag} {destA.name}
                  </div>
                  <div className="compare-mc-stat">
                    <span className="compare-mc-stat-label">Pessimistic (p10)</span>
                    <span className="compare-mc-stat-value mono">{fmt(mcA.summary.p10Final)}</span>
                  </div>
                  <div className="compare-mc-stat">
                    <span className="compare-mc-stat-label">Median (p50)</span>
                    <span className="compare-mc-stat-value mono">{fmt(mcA.summary.p50Final)}</span>
                  </div>
                  <div className="compare-mc-stat">
                    <span className="compare-mc-stat-label">Optimistic (p90)</span>
                    <span className="compare-mc-stat-value mono">{fmt(mcA.summary.p90Final)}</span>
                  </div>
                </div>
                <div className="compare-mc-stats-col">
                  <div className="compare-mc-stats-header" style={{ color: destB.accentColor }}>
                    {destB.flag} {destB.name}
                  </div>
                  <div className="compare-mc-stat">
                    <span className="compare-mc-stat-label">Pessimistic (p10)</span>
                    <span className="compare-mc-stat-value mono">{fmt(mcB.summary.p10Final)}</span>
                  </div>
                  <div className="compare-mc-stat">
                    <span className="compare-mc-stat-label">Median (p50)</span>
                    <span className="compare-mc-stat-value mono">{fmt(mcB.summary.p50Final)}</span>
                  </div>
                  <div className="compare-mc-stat">
                    <span className="compare-mc-stat-label">Optimistic (p90)</span>
                    <span className="compare-mc-stat-value mono">{fmt(mcB.summary.p90Final)}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Metrics table */}
          <section className="card">
            <h3 className="section-title">Key Metrics</h3>
            <div className="scroll-x">
              <table className="compare-metrics-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th className="right">{destA.flag} {destA.name}</th>
                    <th className="right">{destB.flag} {destB.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {metricsRows.map((row) => {
                    const best = bestIndex(row.raw, row.higherIsBetter);
                    return (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td className={`right ${best === 0 ? 'compare-best' : ''}`}>
                          {row.values[0]}
                        </td>
                        <td className={`right ${best === 1 ? 'compare-best' : ''}`}>
                          {row.values[1]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
