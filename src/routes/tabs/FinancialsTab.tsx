import { useMemo } from 'react';
import { useScenario } from '@/state/hooks';
import { useAppState } from '@/state/AppStateContext';
import { simulate } from '@/engine/simulate';
import { getDestination } from '@/data/destinations';
import MetricCard from '@/components/MetricCard';
import WealthChart from '@/components/WealthChart';
import type { YearlyProjection } from '@/types';
import './FinancialsTab.css';

const fmt = (n: number) =>
  n >= 1e6
    ? `$${(n / 1e6).toFixed(2)}M`
    : n >= 1e3
      ? `$${(n / 1e3).toFixed(0)}K`
      : `$${n}`;

const fmtSigned = (n: number) => {
  const prefix = n >= 0 ? '+' : '';
  return prefix + fmt(Math.abs(n));
};

export default function FinancialsTab({ destinationId }: { destinationId: string }) {
  const { destination, config, selectedPreset } = useScenario(destinationId);
  const { state } = useAppState();
  const globals = state.globalAssumptions;

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

  if (!destination || !selectedPreset) {
    return <div className="text-tertiary">Destination not found.</div>;
  }

  const lastProjection = projections[projections.length - 1];
  const dcLast = dcProjections[dcProjections.length - 1];

  const netWorthAtRetirement = lastProjection?.totalNetWorth ?? 0;
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
      {/* Metric cards row */}
      <div className="financials-metrics">
        <MetricCard
          label={`Net Worth at ${globals.retirementAge}`}
          value={fmt(netWorthAtRetirement)}
          color={destination.accentColor}
        />
        <MetricCard
          label="vs DC Baseline"
          value={fmtSigned(delta)}
          color={delta >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'}
        />
        <MetricCard
          label="Avg Savings Rate"
          value={`${(avgSavings * 100).toFixed(0)}%`}
        />
        <MetricCard
          label="Avg Tax Rate"
          value={`${(avgTax * 100).toFixed(0)}%`}
        />
      </div>

      {/* Wealth projection chart */}
      <section className="financials-chart card">
        <h3 className="section-title">Wealth Projection</h3>
        <WealthChart
          projections={projections}
          dcProjections={dcProjections}
          accentColor={destination.accentColor}
          currentYear={currentYear}
        />
        <div className="financials-chart-legend">
          <span className="financials-legend-item">
            <span className="financials-legend-line" style={{ background: destination.accentColor }} />
            {destination.name}
          </span>
          <span className="financials-legend-item">
            <span className="financials-legend-line financials-legend-dashed" />
            DC Baseline
          </span>
        </div>
      </section>

      {/* Cash flow table */}
      <section className="financials-table-section">
        <h3 className="section-title">Cash Flow</h3>
        <div className="scroll-x">
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
                  <td className={`right ${p.netCashFlow < 0 ? 'text-negative' : ''}`}>
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
