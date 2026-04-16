import { useMemo } from 'react';
import { useProfiles, useQoLWeights, useGlobalAssumptions } from '@/state/hooks';
import { useAppState } from '@/state/AppStateContext';
import { ALL_DESTINATIONS, getDestination } from '@/data/destinations';
import { simulate } from '@/engine/simulate';
import {
  calculateQoLScore,
  normalizeFinancialScore,
  calculateCompositeScore,
  rankDestinations,
} from '@/engine/scoring';
import { QOL_DIMENSION_META } from '@/data/qol-dimensions';
import { WEIGHT_PRESETS, getMatchingWeightPresetId } from '@/data/weight-presets';
import WealthChart from '@/components/WealthChart';
import MetricCard from '@/components/MetricCard';
import { Printer } from 'lucide-react';
import type { Destination, QualityOfLifeRatings, YearlyProjection } from '@/types';
import './Report.css';

const NON_DC_DESTINATIONS = ALL_DESTINATIONS.filter((d) => d.id !== 'dc-baseline');

const fmtCurrency = (n: number) =>
  n >= 1e6
    ? `$${(n / 1e6).toFixed(2)}M`
    : n >= 1e3
      ? `$${(n / 1e3).toFixed(0)}K`
      : `$${n}`;

const fmtCurrencyWhole = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtPct = (n: number) => `${n}%`;

interface RankedDestination {
  destination: Destination;
  effectiveQoL: QualityOfLifeRatings;
  netWorth: number;
  financialScore: number;
  qolScore: number;
  compositeScore: number;
  rank: number;
  projections: YearlyProjection[];
  careerName: string;
}

export default function Report() {
  const { activeProfile } = useProfiles();
  const { weights } = useQoLWeights();
  const { globals } = useGlobalAssumptions();
  const { state } = useAppState();

  const profile = state.profiles[state.activeProfileId];
  const scenarioOverrides = profile?.preferences.scenarioOverrides ?? {};

  // DC baseline projections (for ghost line in charts)
  const dcProjections = useMemo<YearlyProjection[]>(() => {
    const dc = getDestination('dc-baseline');
    if (!dc) return [];
    const dcCareer = dc.careerPresets[0];
    const dcOverrides = scenarioOverrides['dc-baseline'];
    return simulate(dc, dcCareer, globals, {
      dcHomeDecision: dcOverrides?.dcHomeDecision ?? 'keep',
      moveYear: globals.moveYear,
      returnYear: globals.returnYear ?? null,
    });
  }, [globals, scenarioOverrides]);

  // Simulate all non-DC destinations, score and rank
  const ranked = useMemo<RankedDestination[]>(() => {
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

      return { destination: dest, effectiveQoL, netWorth, projections, careerName: career.name };
    });

    const netWorths = rawCols.map((c) => c.netWorth);
    const minNW = Math.min(...netWorths);
    const maxNW = Math.max(...netWorths);

    const scored = rawCols.map((col) => {
      const financialScore = normalizeFinancialScore(col.netWorth, minNW, maxNW);
      const qolScore = calculateQoLScore(col.effectiveQoL, weights);
      const compositeScore = calculateCompositeScore(financialScore, qolScore, weights.financialWeight);
      return { ...col, financialScore, qolScore, compositeScore, rank: 0 };
    });

    const rankings = rankDestinations(
      scored.map((s) => ({
        destinationId: s.destination.id,
        financialScore: s.financialScore,
        qolScore: s.qolScore,
        compositeScore: s.compositeScore,
      })),
    );

    return scored
      .map((s) => {
        const r = rankings.find((rk) => rk.destinationId === s.destination.id);
        return { ...s, rank: r?.rank ?? 99 };
      })
      .sort((a, b) => a.rank - b.rank);
  }, [globals, scenarioOverrides, weights]);

  const dcLastNW = dcProjections[dcProjections.length - 1]?.totalNetWorth ?? 0;
  const top3 = ranked.slice(0, 3);
  const yearsFromNow = globals.retirementAge - globals.currentAge;
  const presetId = getMatchingWeightPresetId(weights);
  const presetName = presetId
    ? WEIGHT_PRESETS.find((p) => p.id === presetId)?.name ?? 'Custom'
    : 'Custom';

  return (
    <div className="page-enter report-page">
      {/* Print button */}
      <button className="btn report-print-btn" onClick={() => window.print()}>
        <Printer size={16} />
        Print
      </button>

      {/* 1. Header */}
      <header className="report-header">
        <h1>Life Change Planner</h1>
        <p className="report-subtitle">
          Report for {activeProfile?.name ?? 'Unknown'} &mdash;{' '}
          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* 2. Assumptions summary */}
      <section className="report-section card">
        <h3 className="section-title">Assumptions</h3>
        <div className="report-assumptions-grid">
          <div className="report-assumption">
            <span className="report-assumption-label">Household Income</span>
            <span className="report-assumption-value">{fmtCurrencyWhole(globals.currentHouseholdIncome)}</span>
          </div>
          <div className="report-assumption">
            <span className="report-assumption-label">Home Value</span>
            <span className="report-assumption-value">{fmtCurrencyWhole(globals.currentHomeValue)}</span>
          </div>
          <div className="report-assumption">
            <span className="report-assumption-label">Mortgage Balance</span>
            <span className="report-assumption-value">{fmtCurrencyWhole(globals.currentMortgageBalance)}</span>
          </div>
          <div className="report-assumption">
            <span className="report-assumption-label">Retirement Age</span>
            <span className="report-assumption-value">{globals.retirementAge} ({yearsFromNow} years)</span>
          </div>
          <div className="report-assumption">
            <span className="report-assumption-label">Investment Return</span>
            <span className="report-assumption-value">{fmtPct(globals.investmentReturnRate)}</span>
          </div>
          <div className="report-assumption">
            <span className="report-assumption-label">Inflation</span>
            <span className="report-assumption-value">{fmtPct(globals.inflationRate)}</span>
          </div>
          <div className="report-assumption">
            <span className="report-assumption-label">Move Year</span>
            <span className="report-assumption-value">{globals.moveYear}</span>
          </div>
          <div className="report-assumption">
            <span className="report-assumption-label">Daughter's Age</span>
            <span className="report-assumption-value">{globals.daughterAge}</span>
          </div>
        </div>
      </section>

      {/* 3. Ranked destinations table */}
      <section className="report-section card">
        <h3 className="section-title">Destination Rankings</h3>
        <div className="report-table-wrapper">
          <table className="data-table report-ranking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Destination</th>
                <th className="right">Net Worth at {globals.retirementAge}</th>
                <th className="right">QoL</th>
                <th className="right">Composite</th>
                <th>Career</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row) => (
                <tr
                  key={row.destination.id}
                  className={row.rank === 1 ? 'report-winner-row' : ''}
                >
                  <td>{row.rank}</td>
                  <td className="report-dest-cell">
                    <span className="report-dest-flag">{row.destination.flag}</span>
                    {row.destination.name}
                  </td>
                  <td className="right">{fmtCurrency(row.netWorth)}</td>
                  <td className="right">{row.qolScore.toFixed(1)}</td>
                  <td className="right">{row.compositeScore.toFixed(1)}</td>
                  <td>{row.careerName}</td>
                  <td className="report-summary-cell">{row.destination.narrative.slice(0, 80)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Top 3 spotlight */}
      <section className="report-section">
        <h3 className="section-title">Top 3 Destinations</h3>
        <div className="report-spotlight-grid">
          {top3.map((item) => {
            const lastYear = item.projections[item.projections.length - 1];
            const firstAbroadYear = item.projections.find(
              (p) => p.location === item.destination.id,
            );
            const delta = item.netWorth - dcLastNW;

            return (
              <div
                key={item.destination.id}
                className="card report-spotlight-card"
                style={{ borderLeftColor: item.destination.accentColor }}
              >
                <div className="report-spotlight-header">
                  <span className="report-spotlight-flag">{item.destination.flag}</span>
                  <h4>{item.destination.name}</h4>
                  <span className="report-spotlight-rank">#{item.rank}</span>
                </div>

                <div className="report-spotlight-metrics">
                  <MetricCard
                    label="Net Worth"
                    value={fmtCurrency(item.netWorth)}
                    color={item.destination.accentColor}
                  />
                  <MetricCard
                    label="vs DC"
                    value={`${delta >= 0 ? '+' : ''}${fmtCurrency(delta)}`}
                    color={delta >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'}
                  />
                  <MetricCard
                    label="Year-1 Income"
                    value={fmtCurrency(firstAbroadYear?.grossIncome ?? 0)}
                  />
                  <MetricCard
                    label="Tax Rate"
                    value={fmtPct(Math.round(item.destination.taxRegime.estimatedEffectiveTotalRate))}
                  />
                </div>

                <div className="report-spotlight-chart">
                  <WealthChart
                    projections={item.projections}
                    dcProjections={dcProjections}
                    accentColor={item.destination.accentColor}
                  />
                </div>

                <div className="report-spotlight-lists">
                  <div className="report-spotlight-pros">
                    <h5>Pros</h5>
                    <ul>
                      {item.destination.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="report-spotlight-cons">
                    <h5>Cons</h5>
                    <ul>
                      {item.destination.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Matrix summary */}
      <section className="report-section card">
        <h3 className="section-title">Weight Configuration</h3>
        <p className="report-preset-name">
          Preset: <strong>{presetName}</strong> &nbsp;|&nbsp; Financial Weight: <strong>{weights.financialWeight}/10</strong>
        </p>

        <div className="report-weights-list">
          {QOL_DIMENSION_META.map((dim) => {
            const w = weights.weights[dim.id];
            return (
              <div key={dim.id} className="report-weight-row">
                <span className="report-weight-label">{dim.label}</span>
                <div className="report-weight-bar-track">
                  <div
                    className="report-weight-bar-fill"
                    style={{ width: `${w * 10}%` }}
                  />
                </div>
                <span className="report-weight-value">{w}/10</span>
              </div>
            );
          })}
        </div>

        <div className="report-composite-bars">
          <h4 className="report-composite-title">Composite Scores</h4>
          {ranked.slice(0, 6).map((item) => (
            <div key={item.destination.id} className="report-composite-row">
              <span className="report-composite-label">
                {item.destination.flag} {item.destination.city}
              </span>
              <div className="report-composite-bar-track">
                <div
                  className="report-composite-bar-fill"
                  style={{
                    width: `${item.compositeScore}%`,
                    backgroundColor: item.destination.accentColor,
                  }}
                />
              </div>
              <span className="report-composite-value">{item.compositeScore.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="report-footer">
        Generated by {activeProfile?.name ?? 'Unknown'} on{' '}
        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
        These are planning estimates, not financial advice.
      </footer>
    </div>
  );
}
