import { useCallback } from 'react';
import { useExchangeRates, useGlobalAssumptions } from '@/state/hooks';
import PageGuide from '@/components/PageGuide';
import SliderInput from '@/components/SliderInput';
import { INPUTS_GUIDE } from '@/data/page-guides';
import { getCurrentPlanningYear } from '@/utils/date';
import './Inputs.css';

const fmtDollar = (v: number) => '$' + v.toLocaleString('en-US');
const fmtPct = (v: number) => v + '%';

function fmtDate(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Inputs() {
  const { globals, updateGlobals } = useGlobalAssumptions();
  const { fxRatesMeta, refreshRates, ratesAreStale } = useExchangeRates();
  const currentYear = getCurrentPlanningYear();

  const updateExchangeRate = useCallback(
    (currency: string, value: number) => {
      updateGlobals({
        exchangeRates: { ...globals.exchangeRates, [currency]: value },
      });
    },
    [globals.exchangeRates, updateGlobals],
  );

  const fxAsOf = fmtDate(fxRatesMeta.asOfDate);
  const fxFetchedAt = fmtDate(fxRatesMeta.fetchedAt);
  const isRefreshingRates = fxRatesMeta.status === 'loading';

  return (
    <div className="page-enter inputs-page">
      <h1>Settings</h1>
      <p className="text-secondary inputs-subtitle">
        Global assumptions that apply across all scenarios.
      </p>
      <PageGuide sections={INPUTS_GUIDE} />

      {/* Personal */}
      <div className="card inputs-section">
        <h3 className="section-title">Personal</h3>
        <div className="inputs-grid">
          <SliderInput
            label="Current Age"
            value={globals.currentAge}
            onChange={(v) => updateGlobals({ currentAge: v })}
            min={30} max={55} step={1}
          />
          <SliderInput
            label="Retirement Age"
            value={globals.retirementAge}
            onChange={(v) => updateGlobals({ retirementAge: v })}
            min={55} max={72} step={1}
          />
          <SliderInput
            label="Move Year"
            value={globals.moveYear}
            onChange={(v) => updateGlobals({ moveYear: v })}
            min={currentYear} max={currentYear + 6} step={1}
          />
          <SliderInput
            label="Daughter's Age"
            value={globals.daughterAge}
            onChange={(v) => updateGlobals({ daughterAge: v })}
            min={0}
            max={10}
            step={1}
            format={(v) => `${v}`}
            suffix=" yrs"
          />
        </div>
      </div>

      {/* Current Financial State */}
      <div className="card inputs-section">
        <h3 className="section-title">Current Financial State</h3>
        <div className="inputs-grid">
          <SliderInput
            label="Current Savings"
            value={globals.currentSavings}
            onChange={(v) => updateGlobals({ currentSavings: v })}
            min={0} max={500000} step={5000}
            format={fmtDollar}
          />
          <SliderInput
            label="457(b) Balance"
            value={globals.retirement457b}
            onChange={(v) => updateGlobals({ retirement457b: v })}
            min={0} max={500000} step={5000}
            format={fmtDollar}
          />
          <SliderInput
            label="DC Household Income"
            value={globals.currentHouseholdIncome}
            onChange={(v) => updateGlobals({ currentHouseholdIncome: v })}
            min={100000} max={400000} step={5000}
            format={fmtDollar}
          />
        </div>
        <p className="text-secondary inputs-helper">
          This drives the DC baseline projection directly, including comparison cases that return to DC later.
        </p>
      </div>

      {/* DC Home */}
      <div className="card inputs-section">
        <h3 className="section-title">DC Home</h3>
        <div className="inputs-grid">
          <SliderInput
            label="Home Value"
            value={globals.currentHomeValue}
            onChange={(v) => updateGlobals({ currentHomeValue: v })}
            min={600000} max={1600000} step={10000}
            format={fmtDollar}
          />
          <SliderInput
            label="Mortgage Balance"
            value={globals.currentMortgageBalance}
            onChange={(v) => updateGlobals({ currentMortgageBalance: v })}
            min={0} max={900000} step={5000}
            format={fmtDollar}
          />
          <SliderInput
            label="Monthly Mortgage"
            value={globals.monthlyMortgage}
            onChange={(v) => updateGlobals({ monthlyMortgage: v })}
            min={2000} max={7000} step={100}
            format={fmtDollar}
          />
          <SliderInput
            label="Appreciation Rate"
            value={globals.homeAppreciationRate}
            onChange={(v) => updateGlobals({ homeAppreciationRate: v })}
            min={1} max={8} step={0.5}
            format={fmtPct}
          />
          <SliderInput
            label="Closing Cost %"
            value={globals.closingCostPct}
            onChange={(v) => updateGlobals({ closingCostPct: v })}
            min={3} max={10} step={0.5}
            format={fmtPct}
          />
        </div>
      </div>

      {/* Investment Assumptions */}
      <div className="card inputs-section">
        <h3 className="section-title">Investment Assumptions</h3>
        <div className="inputs-grid">
          <SliderInput
            label="Annual Return"
            value={globals.investmentReturnRate}
            onChange={(v) => updateGlobals({ investmentReturnRate: v })}
            min={3} max={12} step={0.5}
            format={fmtPct}
          />
          <SliderInput
            label="Inflation"
            value={globals.inflationRate}
            onChange={(v) => updateGlobals({ inflationRate: v })}
            min={1} max={6} step={0.5}
            format={fmtPct}
          />
          <SliderInput
            label="Annual Roth Contribution"
            value={globals.annualRothContribution}
            onChange={(v) => updateGlobals({ annualRothContribution: v })}
            min={0} max={8000} step={500}
            format={fmtDollar}
          />
        </div>
      </div>

      <div className="card inputs-section">
        <h3 className="section-title">DC Home Carrying Costs</h3>
        <p className="text-secondary inputs-helper">
          These assumptions apply when you keep or rent out the DC home. Set insurance/tax to 0 if those costs are already escrowed inside your mortgage payment.
        </p>
        <div className="inputs-grid">
          <SliderInput
            label="Additional Insurance + Tax (outside mortgage)"
            value={globals.monthlyInsuranceTax}
            onChange={(v) => updateGlobals({ monthlyInsuranceTax: v })}
            min={0} max={1500} step={50}
            format={fmtDollar}
          />
          <SliderInput
            label="Maintenance"
            value={globals.monthlyMaintenance}
            onChange={(v) => updateGlobals({ monthlyMaintenance: v })}
            min={0} max={1000} step={50}
            format={fmtDollar}
          />
        </div>
      </div>

      <div className="card inputs-section">
        <h3 className="section-title">Rental Income</h3>
        <p className="text-secondary inputs-helper">
          Used in any scenario where the DC home decision is set to Rent Out.
        </p>
        <div className="inputs-grid">
          <SliderInput
            label="Monthly Rental Income"
            value={globals.rentalIncomeMonthly}
            onChange={(v) => updateGlobals({ rentalIncomeMonthly: v })}
            min={3000} max={8000} step={100}
            format={fmtDollar}
          />
          <SliderInput
            label="Property Mgmt Fee"
            value={globals.propertyMgmtPct}
            onChange={(v) => updateGlobals({ propertyMgmtPct: v })}
            min={5} max={15} step={1}
            format={fmtPct}
          />
        </div>
      </div>

      {/* Currency Exchange Rates */}
      <div className="card inputs-section">
        <div className="inputs-fx-header">
          <div>
            <h3 className="section-title">Currency Exchange Rates</h3>
            <p className="text-secondary inputs-fx-helper">
              Auto-refreshes from Frankfurter with USD as the base currency. Manual slider changes
              still work if you want to stress-test different FX scenarios.
            </p>
          </div>
          <button
            type="button"
            className="btn inputs-fx-refresh"
            onClick={() => { void refreshRates(); }}
            disabled={isRefreshingRates}
          >
            {isRefreshingRates ? 'Refreshing...' : 'Refresh Latest Rates'}
          </button>
        </div>

        <div className="inputs-fx-status text-secondary">
          {fxRatesMeta.status === 'success' && (
            <span>
              Source: {fxRatesMeta.provider}. Reference date {fxAsOf ?? 'unknown'}.
              Synced {fxFetchedAt ?? 'just now'}.
              {ratesAreStale ? ' Rates are older than one day.' : ''}
            </span>
          )}
          {fxRatesMeta.status === 'loading' && (
            <span>Refreshing rates from {fxRatesMeta.provider}...</span>
          )}
          {fxRatesMeta.status === 'error' && (
            <span className="text-negative">
              Latest sync failed: {fxRatesMeta.error ?? 'Unable to refresh exchange rates'}.
            </span>
          )}
          {fxRatesMeta.status === 'idle' && (
            <span>Rates have not been synced yet.</span>
          )}
        </div>

        <div className="inputs-grid">
          <SliderInput
            label="USD → EUR"
            value={globals.exchangeRates.EUR ?? 0.92}
            onChange={(v) => updateExchangeRate('EUR', v)}
            min={0.65}
            max={1.2}
            step={0.01}
            format={(v) => `$1 = \u20AC${v.toFixed(2)}`}
          />
          <SliderInput
            label="USD → KES"
            value={globals.exchangeRates.KES ?? 130}
            onChange={(v) => updateExchangeRate('KES', v)}
            min={90}
            max={180}
            step={1}
            format={(v) => `$1 = ${v} KES`}
          />
          <SliderInput
            label="USD → MXN"
            value={globals.exchangeRates.MXN ?? 17.5}
            onChange={(v) => updateExchangeRate('MXN', v)}
            min={12}
            max={25}
            step={0.5}
            format={(v) => `$1 = ${v.toFixed(1)} MXN`}
          />
          <SliderInput
            label="USD → COP"
            value={globals.exchangeRates.COP ?? 4200}
            onChange={(v) => updateExchangeRate('COP', v)}
            min={3000}
            max={5500}
            step={50}
            format={(v) => `$1 = ${v.toLocaleString('en-US')} COP`}
          />
          <SliderInput
            label="USD → UYU"
            value={globals.exchangeRates.UYU ?? 42}
            onChange={(v) => updateExchangeRate('UYU', v)}
            min={30}
            max={60}
            step={1}
            format={(v) => `$1 = ${v} UYU`}
          />
        </div>
      </div>
    </div>
  );
}
