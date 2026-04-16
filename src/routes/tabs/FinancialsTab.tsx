import { useMemo, useState } from 'react';
import { useScenario } from '@/state/hooks';
import { useAppState } from '@/state/AppStateContext';
import { simulate } from '@/engine/simulate';
import { runMonteCarlo } from '@/engine/montecarlo';
import { getDestination } from '@/data/destinations';
import MetricCard from '@/components/MetricCard';
import WealthChart from '@/components/WealthChart';
import PageGuide from '@/components/PageGuide';
import { getFinancialsGuide } from '@/data/page-guides';
import type { YearlyProjection, MonteCarloResult } from '@/types';
import './FinancialsTab.css';

export const formatCompactCurrency = (n: number) =>
  n >= 1e6
    ? `$${(n / 1e6).toFixed(2)}M`
    : n >= 1e3
      ? `$${(n / 1e3).toFixed(0)}K`
      : `$${n}`;

export const formatSignedCompactCurrency = (n: number) => {
  const prefix = n >= 0 ? '+' : '-';
  return prefix + formatCompactCurrency(Math.abs(n));
};

export default function FinancialsTab({ destinationId }: { destinationId: string }) {
  const { destination, config, selectedPreset } = useScenario(destinationId);
  const { state } = useAppState();
  const globals = state.globalAssumptions;
  const [showMC, setShowMC] = useState(false);

  const projections = useMemo<YearlyProjection[]>(() => {
    if (!destination || !selectedPreset) return [];
    return simulate(destination, selectedPreset, globals, {
      dcHomeDecision: config?.dcHomeDecision ?? 'sell',
      moveYear: config?.moveYear ?? globals.moveYear,
      returnYear: config?.returnYear ?? null,
      customIncome: config?.customIncome,
    });
  }, [destination, selectedPreset, globals, config]);

  const dcProjections = useMemo<YearlyProjection[]>(() => {
    const dc = getDestination('dc-baseline');
    if (!dc) return [];
    const dcCareer = dc.careerPresets[0];
    const dcConfig = state.scenarios['dc-baseline'];
    return simulate(dc, dcCareer, globals, {
      dcHomeDecision: dcConfig?.dcHomeDecision ?? 'keep',
      moveYear: dcConfig?.moveYear ?? globals.moveYear,
      returnYear: dcConfig?.returnYear ?? null,
    });
  }, [globals, state.scenarios]);

  const mcResult = useMemo<MonteCarloResult | undefined>(() => {
    if (!showMC || !destination || !selectedPreset) return undefined;
    return runMonteCarlo(destination, selectedPreset, globals, {
      dcHomeDecision: config?.dcHomeDecision ?? 'sell',
      moveYear: config?.moveYear ?? globals.moveYear,
      returnYear: config?.returnYear ?? null,
      customIncome: config?.customIncome,
    });
  }, [showMC, destination, selectedPreset, globals, config]);

  if (!destination || !selectedPreset) {
    return <div className="text-tertiary">Destination not found.</div>;
  }

  const lastProjection = projections[projections.length - 1];
  const dcLast = dcProjections[dcProjections.length - 1];

  const deterministicNetWorth = lastProjection?.totalNetWorth ?? 0;
  const netWorthAtRetirement = mcResult ? mcResult.summary.p50Final : deterministicNetWorth;
  const dcNetWorthAtRetirement = dcLast?.totalNetWorth ?? 0;
  const delta = netWorthAtRetirement - dcNetWorthAtRetirement;

  // Average savings rate
  const avgSavings = projections.length > 0
    ? projections.reduce((sum, p) => sum + (p.grossIncome > 0 ? p.netCashFlow / p.grossIncome : 0), 0) / projections.length
    : 0;

  // Average tax rate
  const avgTax = projections.length > 0
    ? projections.reduce((sum, p) => sum + (p.grossIncome > 0 ? p.totalTax / p.grossIncome : 0), 0) / projections.length
    : 0;

  const currentYear = new Date().getFullYear();

  return (
    <div className="financials-tab">
      <PageGuide sections={getFinancialsGuide(destination.name)} />

      {/* Metric cards row */}
      <div className="financials-metrics">
        <MetricCard
          label={`Net Worth at ${globals.retirementAge}`}
          value={formatCompactCurrency(netWorthAtRetirement)}
          color={destination.accentColor}
        />
        <MetricCard
          label="vs DC Baseline"
          value={formatSignedCompactCurrency(delta)}
          color={delta >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'}
        />
        <MetricCard
          label="Avg Savings Rate"
          value={`${(avgSavings * 100).toFixed(0)}%`}
        />
        <MetricCard
          label="Avg Estimated Tax Rate"
          value={`${(avgTax * 100).toFixed(0)}%`}
        />
      </div>

      {/* Wealth projection chart */}
      <section className="financials-chart card">
        <div className="financials-chart-header">
          <h3 className="section-title">Wealth Projection</h3>
          <button
            className={`financials-mc-toggle ${showMC ? 'financials-mc-toggle-active' : ''}`}
            onClick={() => setShowMC((v) => !v)}
          >
            {showMC ? 'Hide' : 'Show'} Projection Range
          </button>
        </div>
        <WealthChart
          projections={projections}
          dcProjections={dcProjections}
          accentColor={destination.accentColor}
          currentYear={currentYear}
          monteCarlo={mcResult}
        />
        <div className="financials-chart-legend">
          <span className="financials-legend-item">
            <span className="financials-legend-line" style={{ background: destination.accentColor }} />
            {showMC ? 'Median (p50)' : destination.name}
          </span>
          <span className="financials-legend-item">
            <span className="financials-legend-line financials-legend-dashed" />
            DC Baseline
          </span>
          {showMC && (
            <span className="financials-legend-item">
              <span className="financials-legend-band" style={{ background: destination.accentColor }} />
              p25-p75 / p10-p90
            </span>
          )}
        </div>
      </section>

      {/* Monte Carlo stats box */}
      {showMC && mcResult && (
        <div className="financials-mc-stats">
          <MetricCard
            label="Pessimistic (p10)"
            value={formatCompactCurrency(mcResult.summary.p10Final)}
            color="var(--color-negative)"
          />
          <MetricCard
            label="Median (p50)"
            value={formatCompactCurrency(mcResult.summary.p50Final)}
            color={destination.accentColor}
          />
          <MetricCard
            label="Optimistic (p90)"
            value={formatCompactCurrency(mcResult.summary.p90Final)}
            color="var(--color-positive)"
          />
        </div>
      )}

      {/* Cash flow table */}
      <section className="financials-table-section">
        <h3 className="section-title">Cash Flow</h3>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>Age</th>
                <th className="right">Income</th>
                <th className="right">Est. Tax</th>
                <th className="right">Expenses</th>
                <th className="right">Net Cash</th>
                <th className="right">Net Worth</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => (
                <tr key={p.year}>
                  <td>{p.age}</td>
                  <td className="right">{formatCompactCurrency(p.grossIncome)}</td>
                  <td className="right">{formatCompactCurrency(p.totalTax)}</td>
                  <td className="right">{formatCompactCurrency(p.totalExpenses)}</td>
                  <td className={`right ${p.netCashFlow < 0 ? 'text-negative' : ''}`}>
                    {formatCompactCurrency(p.netCashFlow)}
                  </td>
                  <td className="right">{formatCompactCurrency(p.totalNetWorth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
