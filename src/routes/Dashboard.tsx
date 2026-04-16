import { useMemo } from 'react';
import { ALL_DESTINATIONS, getDestination } from '@/data/destinations';
import { simulate } from '@/engine/simulate';
import { calculateQoLScore } from '@/engine/scoring';
import { useAppState } from '@/state/AppStateContext';
import MetricCard from '@/components/MetricCard';
import DestinationCard from '@/components/DestinationCard';
import type { Destination, YearlyProjection } from '@/types';
import './Dashboard.css';

const fmt = (n: number) =>
  n >= 1e6
    ? `$${(n / 1e6).toFixed(2)}M`
    : n >= 1e3
      ? `$${(n / 1e3).toFixed(0)}K`
      : `$${n}`;

interface SimResult {
  destination: Destination;
  projections: YearlyProjection[];
  presetName: string;
  qolScore: number;
}

export default function Dashboard() {
  const { state } = useAppState();
  const { globalAssumptions, scenarios, qolWeights } = state;

  const results = useMemo<SimResult[]>(() => {
    return ALL_DESTINATIONS.map((dest) => {
      const config = scenarios[dest.id];
      const career = dest.careerPresets.find((p) => p.id === config?.selectedCareerPreset)
        ?? dest.careerPresets[0];
      const projections = simulate(dest, career, globalAssumptions, {
        dcHomeDecision: config?.dcHomeDecision ?? 'sell',
        moveYear: config?.moveYear ?? globalAssumptions.moveYear,
        returnYear: config?.returnYear ?? null,
        customIncome: config?.customIncome,
      });
      const effectiveQoL = { ...dest.qolDefaults, ...config?.customQoLRatings };
      const qolScore = calculateQoLScore(effectiveQoL, qolWeights);
      return {
        destination: dest,
        projections,
        presetName: career.name,
        qolScore,
      };
    });
  }, [globalAssumptions, scenarios, qolWeights]);

  const dcResult = results.find((r) => r.destination.id === 'dc-baseline');
  const otherResults = results.filter((r) => r.destination.id !== 'dc-baseline');

  const dcLast = dcResult?.projections[dcResult.projections.length - 1];

  return (
    <div className="page-enter dashboard">
      {/* DC Baseline Banner */}
      {dcResult && dcLast && (
        <section className="dashboard-baseline card">
          <div className="dashboard-baseline-header">
            <span className="dashboard-baseline-flag">{dcResult.destination.flag}</span>
            <div>
              <h2 className="dashboard-baseline-title">DC Baseline</h2>
              <p className="dashboard-baseline-sub">
                Stay put &mdash; what happens if nothing changes
              </p>
            </div>
          </div>
          <div className="dashboard-baseline-metrics">
            <MetricCard
              label="Household Income"
              value={fmt(globalAssumptions.currentHouseholdIncome)}
              color="var(--color-accent-dc)"
            />
            <MetricCard
              label={`Net Worth at ${globalAssumptions.retirementAge}`}
              value={fmt(dcLast.totalNetWorth)}
              color="var(--color-accent-dc)"
            />
            <MetricCard
              label="Home Equity"
              value={fmt(dcLast.homeEquity)}
              color="var(--color-accent-dc)"
            />
          </div>
        </section>
      )}

      {/* Destination Grid */}
      <section className="dashboard-grid">
        {otherResults.map((r) => (
          <DestinationCard
            key={r.destination.id}
            destination={r.destination}
            projections={r.projections}
            careerPresetName={r.presetName}
            qolScore={r.qolScore}
          />
        ))}
      </section>
    </div>
  );
}
