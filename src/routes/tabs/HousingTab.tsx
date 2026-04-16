import { useScenario, useGlobalAssumptions } from '@/state/hooks';
import { calculateSaleProceeds, calculateRentalCashFlow, projectHomeEquity } from '@/engine/housing';
import './HousingTab.css';

const fmt = (n: number) =>
  n >= 1e6
    ? `$${(n / 1e6).toFixed(2)}M`
    : n >= 1e3
      ? `$${(n / 1e3).toFixed(0)}K`
      : `$${Math.round(n).toLocaleString()}`;

const fmtFull = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

type Decision = 'sell' | 'rent' | 'keep';

const DECISION_LABELS: Record<Decision, { label: string; icon: string }> = {
  sell: { label: 'Sell', icon: 'S' },
  rent: { label: 'Rent Out', icon: 'R' },
  keep: { label: 'Keep', icon: 'K' },
};

export default function HousingTab({ destinationId }: { destinationId: string }) {
  const { destination, config, update } = useScenario(destinationId);
  const { globals } = useGlobalAssumptions();

  if (!destination) {
    return <div className="text-tertiary">Destination not found.</div>;
  }

  const decision = config?.dcHomeDecision ?? globals.dcHomeDecision;
  const yearsToRetirement = globals.retirementAge - globals.currentAge;
  const isDC = destinationId === 'dc-baseline';

  // Sell calculation
  const saleProceeds = calculateSaleProceeds(
    globals.currentHomeValue,
    globals.currentMortgageBalance,
    globals.closingCostPct,
  );
  const proceedsAtRetirement = saleProceeds * Math.pow(1 + globals.investmentReturnRate / 100, yearsToRetirement);

  // Rent calculation
  const annualNet = calculateRentalCashFlow(
    globals.rentalIncomeMonthly,
    globals.monthlyMortgage,
    globals.monthlyInsuranceTax,
    globals.monthlyMaintenance,
    globals.propertyMgmtPct,
  );
  const monthlyNet = annualNet / 12;
  const mgmtFee = globals.rentalIncomeMonthly * (globals.propertyMgmtPct / 100);

  // Keep calculation
  const equityProjection = projectHomeEquity(
    globals.currentHomeValue,
    globals.currentMortgageBalance,
    globals.monthlyMortgage,
    globals.homeAppreciationRate,
    yearsToRetirement,
  );
  const carryingCosts = (globals.monthlyMortgage + globals.monthlyInsuranceTax + globals.monthlyMaintenance) * 12;

  const handleDecision = (d: Decision) => {
    update({ dcHomeDecision: d });
  };

  return (
    <div className="housing-tab">
      {/* DC Home Decision */}
      {!isDC && (
        <section className="housing-dc-section">
          <h3 className="section-title">DC Home Decision</h3>
          <p className="housing-intro text-secondary">
            What happens to your DC home when you move to {destination.name}?
          </p>

          <div className="housing-toggle-row">
            {(['sell', 'rent', 'keep'] as Decision[]).map((d) => (
              <button
                key={d}
                type="button"
                className={`housing-toggle-btn${decision === d ? ' housing-toggle-active' : ''}`}
                onClick={() => handleDecision(d)}
              >
                <span className="housing-toggle-icon">{DECISION_LABELS[d].icon}</span>
                <span className="housing-toggle-label">{DECISION_LABELS[d].label}</span>
              </button>
            ))}
          </div>

          {/* Info cards for each option */}
          <div className="housing-option-cards">
            {decision === 'sell' && (
              <div className="card housing-option-card">
                <h4 className="housing-option-title">Sell Your DC Home</h4>
                <div className="housing-option-grid">
                  <div className="housing-stat">
                    <span className="housing-stat-value mono">{fmtFull(globals.currentHomeValue)}</span>
                    <span className="housing-stat-label">Home Value</span>
                  </div>
                  <div className="housing-stat">
                    <span className="housing-stat-value mono">{fmtFull(globals.currentMortgageBalance)}</span>
                    <span className="housing-stat-label">Mortgage Balance</span>
                  </div>
                  <div className="housing-stat">
                    <span className="housing-stat-value mono text-positive">{fmtFull(saleProceeds)}</span>
                    <span className="housing-stat-label">Net Proceeds (after {globals.closingCostPct}% closing)</span>
                  </div>
                </div>
                <div className="housing-projection">
                  Proceeds reinvested at {globals.investmentReturnRate}% ={' '}
                  <strong className="mono">{fmt(proceedsAtRetirement)}</strong> at retirement
                </div>
              </div>
            )}

            {decision === 'rent' && (
              <div className="card housing-option-card">
                <h4 className="housing-option-title">Rent Out Your DC Home</h4>
                <div className="housing-breakdown">
                  <div className="housing-breakdown-row">
                    <span>Rental Income</span>
                    <span className="mono">{fmtFull(globals.rentalIncomeMonthly)}/mo</span>
                  </div>
                  <div className="housing-breakdown-row housing-breakdown-minus">
                    <span>Mortgage</span>
                    <span className="mono">-{fmtFull(globals.monthlyMortgage)}/mo</span>
                  </div>
                  <div className="housing-breakdown-row housing-breakdown-minus">
                    <span>Mgmt Fee ({globals.propertyMgmtPct}%)</span>
                    <span className="mono">-{fmtFull(Math.round(mgmtFee))}/mo</span>
                  </div>
                  <div className="housing-breakdown-row housing-breakdown-minus">
                    <span>Insurance + Tax</span>
                    <span className="mono">-{fmtFull(globals.monthlyInsuranceTax)}/mo</span>
                  </div>
                  <div className="housing-breakdown-row housing-breakdown-minus">
                    <span>Maintenance</span>
                    <span className="mono">-{fmtFull(globals.monthlyMaintenance)}/mo</span>
                  </div>
                  <div className="housing-breakdown-row housing-breakdown-total">
                    <span>Net Monthly</span>
                    <span className={`mono ${monthlyNet >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {fmtFull(Math.round(monthlyNet))}/mo
                    </span>
                  </div>
                </div>
                <div className="housing-projection">
                  Annual net income: <strong className={`mono ${annualNet >= 0 ? 'text-positive' : 'text-negative'}`}>{fmtFull(Math.round(annualNet))}</strong>
                </div>
              </div>
            )}

            {decision === 'keep' && (
              <div className="card housing-option-card">
                <h4 className="housing-option-title">Keep Your DC Home</h4>
                <div className="housing-option-grid">
                  <div className="housing-stat">
                    <span className="housing-stat-value mono">{fmt(equityProjection.homeValue)}</span>
                    <span className="housing-stat-label">Projected Value ({yearsToRetirement}yr)</span>
                  </div>
                  <div className="housing-stat">
                    <span className="housing-stat-value mono">{fmt(equityProjection.mortgageRemaining)}</span>
                    <span className="housing-stat-label">Mortgage Remaining</span>
                  </div>
                  <div className="housing-stat">
                    <span className="housing-stat-value mono text-positive">{fmt(equityProjection.equity)}</span>
                    <span className="housing-stat-label">Projected Equity</span>
                  </div>
                </div>
                <div className="housing-projection">
                  Annual carrying costs: <strong className="mono text-negative">{fmtFull(carryingCosts)}</strong>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {isDC && (
        <section className="housing-dc-section">
          <h3 className="section-title">Your DC Home</h3>
          <div className="card housing-option-card">
            <div className="housing-option-grid">
              <div className="housing-stat">
                <span className="housing-stat-value mono">{fmtFull(globals.currentHomeValue)}</span>
                <span className="housing-stat-label">Current Value</span>
              </div>
              <div className="housing-stat">
                <span className="housing-stat-value mono">{fmtFull(globals.currentMortgageBalance)}</span>
                <span className="housing-stat-label">Mortgage Balance</span>
              </div>
              <div className="housing-stat">
                <span className="housing-stat-value mono text-positive">
                  {fmtFull(globals.currentHomeValue - globals.currentMortgageBalance)}
                </span>
                <span className="housing-stat-label">Current Equity</span>
              </div>
            </div>
            <div className="housing-projection">
              Projected equity at retirement ({yearsToRetirement}yr):{' '}
              <strong className="mono">{fmt(equityProjection.equity)}</strong>
            </div>
          </div>
        </section>
      )}

      {/* Destination Housing Overview */}
      <section className="housing-destination-section">
        <h3 className="section-title">Housing in {destination.name}</h3>
        <div className="card housing-destination-card">
          <div className="housing-destination-grid">
            <div className="housing-stat">
              <span className="housing-stat-value mono">{fmtFull(destination.housing.rentMonthly2BR)}</span>
              <span className="housing-stat-label">2BR Rent /mo</span>
            </div>
            <div className="housing-stat">
              <span className="housing-stat-value mono">{fmtFull(destination.housing.rentMonthly3BR)}</span>
              <span className="housing-stat-label">3BR Rent /mo</span>
            </div>
            <div className="housing-stat">
              <span className="housing-stat-value mono">{fmt(destination.housing.buyMedianPrice)}</span>
              <span className="housing-stat-label">Median Buy Price</span>
            </div>
          </div>

          <div className="housing-badges">
            {destination.housing.foreignOwnershipAllowed && (
              <span className="badge housing-badge-positive">Foreign Ownership Allowed</span>
            )}
            {!destination.housing.foreignOwnershipAllowed && (
              <span className="badge housing-badge-warning">Foreign Ownership Restricted</span>
            )}
            {destination.housing.mortgageAvailable && (
              <span className="badge">Mortgages Available</span>
            )}
          </div>

          {destination.housing.notes.length > 0 && (
            <ul className="housing-notes">
              {destination.housing.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
