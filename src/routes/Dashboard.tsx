import { useMemo } from 'react';
import { ALL_DESTINATIONS, getDestination } from '@/data/destinations';
import { simulate } from '@/engine/simulate';
import { calculateQoLScore } from '@/engine/scoring';
import { useAppState } from '@/state/AppStateContext';
import MetricCard from '@/components/MetricCard';
import DestinationCard from '@/components/DestinationCard';
import PageGuide from '@/components/PageGuide';
import { DASHBOARD_GUIDE } from '@/data/page-guides';
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
  const { globalAssumptions } = state;
  const profile = state.profiles[state.activeProfileId];
  const scenarioOverrides = profile?.preferences.scenarioOverrides ?? {};
  const qolWeights = profile?.preferences.qolWeights;

  const results = useMemo<SimResult[]>(() => {
    return ALL_DESTINATIONS.map((dest) => {
      const overrides = scenarioOverrides[dest.id];
      const career = dest.careerPresets.find((p) => p.id === overrides?.selectedCareerPreset)
        ?? dest.careerPresets[0];
      const projections = simulate(dest, career, globalAssumptions, {
        dcHomeDecision: overrides?.dcHomeDecision ?? (dest.id === 'dc-baseline' ? 'keep' : 'sell'),
        moveYear: globalAssumptions.moveYear,
        returnYear: globalAssumptions.returnYear ?? null,
      });
      const effectiveQoL = { ...dest.qolDefaults, ...overrides?.customQoLRatings };
      const qolScore = qolWeights ? calculateQoLScore(effectiveQoL, qolWeights) : 0;
      return {
        destination: dest,
        projections,
        presetName: career.name,
        qolScore,
      };
    });
  }, [globalAssumptions, scenarioOverrides, qolWeights]);

  const dcResult = results.find((r) => r.destination.id === 'dc-baseline');
  const otherResults = results.filter((r) => r.destination.id !== 'dc-baseline');

  const dcLast = dcResult?.projections[dcResult.projections.length - 1];

  return (
    <div className="page-enter dashboard">
      <PageGuide sections={DASHBOARD_GUIDE} />

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
