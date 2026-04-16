import type { Destination, CareerPreset, GlobalAssumptions, YearlyProjection } from '@/types';
import { getEducationCost } from '@/engine/education';
import { getDestination } from '@/data/destinations';
import { getCurrentPlanningYear } from '@/utils/date';
import './CalculationBreakdown.css';

const $ = (n: number) => '$' + Math.round(n).toLocaleString();
const pct = (n: number) => (n * 100).toFixed(1) + '%';

interface CalculationBreakdownProps {
  year: YearlyProjection;
  yearIndex: number; // 1-based (year 1, year 2, etc.)
  destination: Destination;
  career: CareerPreset;
  globals: GlobalAssumptions;
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  moveYear: number;
  returnYear: number | null;
  isFirstYear?: boolean;
}

export default function CalculationBreakdown({
  year,
  yearIndex,
  destination,
  career,
  globals,
  dcHomeDecision,
  moveYear,
  returnYear,
  isFirstYear = false,
}: CalculationBreakdownProps) {
  const currentYear = getCurrentPlanningYear();
  const calendarYear = currentYear + yearIndex;
  const isAbroad = calendarYear >= moveYear && (returnYear === null || calendarYear < returnYear);
  const activeDest = isAbroad ? destination : getDestination('dc-baseline')!;
  const activeCareer = isAbroad ? career : getDestination('dc-baseline')!.careerPresets[0];
  const inflationRate = globals.inflationRate / 100;
  const inflationMultiplier = Math.pow(1 + inflationRate, yearIndex);
  const yearsInRole = isAbroad ? calendarYear - moveYear : yearIndex;
  const growthMultiplier = Math.pow(1 + activeCareer.incomeGrowthRate / 100, yearsInRole);
  const daughterAge = (globals.daughterAge ?? 3) + yearIndex;

  // Income breakdown
  const baseYourIncome = activeCareer.yourAnnualIncome;
  const baseKaraIncome = activeCareer.karaAnnualIncome;
  const baseHouseholdIncome = activeDest.id === 'dc-baseline' ? globals.currentHouseholdIncome : baseYourIncome + baseKaraIncome;

  let fxAdjustment = 1;
  if (isAbroad && activeCareer.localCurrencyIncome && activeDest.currency !== 'USD') {
    const currentRate = globals.exchangeRates?.[activeDest.currency] ?? activeDest.defaultExchangeRate;
    fxAdjustment = activeDest.defaultExchangeRate / currentRate;
  }

  // Expense breakdown
  const colMultiplier = activeDest.costOfLiving.costMultiplierVsDC;
  const baseLiving = 6500 * 12 * colMultiplier;
  const baseHousing = activeDest.id === 'dc-baseline'
    ? globals.monthlyMortgage * 12
    : activeDest.housing.rentMonthly3BR * 12;
  const baseSchooling = getEducationCost(activeDest, activeCareer, daughterAge);
  const baseHealthIns = activeDest.costOfLiving.healthInsuranceMonthly * 12;

  // Rental income
  const hasRentalIncome = dcHomeDecision === 'rent' && isAbroad;
  const baseRentalIncome = hasRentalIncome ? globals.rentalIncomeMonthly * 12 : 0;
  const baseMgmtFee = hasRentalIncome ? baseRentalIncome * (globals.propertyMgmtPct / 100) : 0;
  const baseMortgageCost = hasRentalIncome ? globals.monthlyMortgage * 12 : 0;
  const baseInsTax = hasRentalIncome ? globals.monthlyInsuranceTax * 12 : 0;
  const baseMaint = hasRentalIncome ? globals.monthlyMaintenance * 12 : 0;

  // Initial balance (for first year context)
  const homeSaleProceeds = dcHomeDecision === 'sell'
    ? Math.max(0, globals.currentHomeValue - globals.currentMortgageBalance - globals.currentHomeValue * globals.closingCostPct / 100)
    : 0;
  const startingInvestments = globals.currentSavings + (dcHomeDecision === 'sell' ? homeSaleProceeds : 0);
  const startingRetirement = globals.convertToRoth
    ? (globals.retirement457b + globals.otherRetirement) * (1 - globals.rothConversionTaxRate / 100)
    : globals.retirement457b + globals.otherRetirement;

  return (
    <div className="calc-breakdown">
      <div className="calc-breakdown-header">
        <span className="calc-breakdown-title">
          Year {yearIndex} Calculation — Age {year.age} ({calendarYear})
        </span>
        <span className="calc-breakdown-location">
          {isAbroad ? `${destination.flag} ${destination.name}` : '🇺🇸 DC Baseline'}
        </span>
      </div>

      {/* Starting balances (first year only) */}
      {isFirstYear && (
        <div className="calc-section">
          <div className="calc-section-title">Starting Balances</div>
          <div className="calc-row">
            <span>Current savings</span>
            <span className="mono">{$(globals.currentSavings)}</span>
          </div>
          {dcHomeDecision === 'sell' && (
            <>
              <div className="calc-row calc-indent">
                <span>Home sale: {$(globals.currentHomeValue)} − {$(globals.currentMortgageBalance)} mortgage − {$(globals.currentHomeValue * globals.closingCostPct / 100)} closing ({globals.closingCostPct}%)</span>
                <span className="mono text-positive">+{$(homeSaleProceeds)}</span>
              </div>
            </>
          )}
          <div className="calc-row calc-total">
            <span>Starting investment balance</span>
            <span className="mono">{$(startingInvestments)}</span>
          </div>
          <div className="calc-row">
            <span>Retirement accounts ({globals.convertToRoth ? `Roth conversion: ${$(globals.retirement457b + globals.otherRetirement)} × ${pct(1 - globals.rothConversionTaxRate / 100)}` : 'pre-tax'})</span>
            <span className="mono">{$(startingRetirement)}</span>
          </div>
        </div>
      )}

      {/* Income */}
      <div className="calc-section">
        <div className="calc-section-title">Income</div>
        {activeDest.id === 'dc-baseline' ? (
          <div className="calc-row">
            <span>DC household income (from Settings)</span>
            <span className="mono">{$(globals.currentHouseholdIncome)}</span>
          </div>
        ) : (
          <>
            <div className="calc-row">
              <span>Your base income ({activeCareer.yourRole.substring(0, 40)}...)</span>
              <span className="mono">{$(baseYourIncome)}</span>
            </div>
            <div className="calc-row">
              <span>Kara's base income ({activeCareer.karaRole.substring(0, 40)}...)</span>
              <span className="mono">{$(baseKaraIncome)}</span>
            </div>
            <div className="calc-row">
              <span>Combined base</span>
              <span className="mono">{$(baseYourIncome + baseKaraIncome)}</span>
            </div>
          </>
        )}
        {fxAdjustment !== 1 && (
          <div className="calc-row calc-indent">
            <span>FX adjustment ({activeDest.currency}: {activeDest.defaultExchangeRate} default → {globals.exchangeRates?.[activeDest.currency]?.toFixed(2) ?? activeDest.defaultExchangeRate} current)</span>
            <span className="mono">{fxAdjustment < 1 ? '×' : '×'}{fxAdjustment.toFixed(3)}</span>
          </div>
        )}
        <div className="calc-row calc-indent">
          <span>Growth: {activeCareer.incomeGrowthRate}%/yr × {yearsInRole} years → multiplier {growthMultiplier.toFixed(3)}</span>
          <span className="mono">×{growthMultiplier.toFixed(3)}</span>
        </div>
        <div className="calc-row calc-total">
          <span>Gross income</span>
          <span className="mono">{$(year.grossIncome)}</span>
        </div>
      </div>

      {/* Taxes */}
      <div className="calc-section">
        <div className="calc-section-title">Taxes (Estimated)</div>
        <div className="calc-row">
          <span>Destination effective rate: {activeDest.taxRegime.estimatedEffectiveTotalRate}% of gross</span>
          <span className="mono"></span>
        </div>
        {activeDest.taxRegime.specialRegime && (
          <div className="calc-row calc-indent calc-note">
            <span>Special regime: {activeDest.taxRegime.specialRegime}</span>
          </div>
        )}
        <div className="calc-row">
          <span>Local tax portion</span>
          <span className="mono text-negative">−{$(year.localTax)}</span>
        </div>
        <div className="calc-row">
          <span>US tax (after foreign tax credit)</span>
          <span className="mono text-negative">−{$(year.usTax)}</span>
        </div>
        <div className="calc-row calc-total">
          <span>Total estimated tax</span>
          <span className="mono text-negative">−{$(year.totalTax)}</span>
        </div>
      </div>

      {/* Expenses */}
      <div className="calc-section">
        <div className="calc-section-title">Expenses (inflating at {globals.inflationRate}%/yr — year {yearIndex} multiplier: {inflationMultiplier.toFixed(3)})</div>
        <div className="calc-row">
          <span>Living: $6,500/mo × {colMultiplier.toFixed(2)} COL × 12 × {inflationMultiplier.toFixed(3)}</span>
          <span className="mono text-negative">−{$(year.livingExpenses)}</span>
        </div>
        <div className="calc-row">
          <span>Housing: {activeDest.id === 'dc-baseline' ? `$${globals.monthlyMortgage.toLocaleString()}/mo mortgage (fixed)` : `$${activeDest.housing.rentMonthly3BR.toLocaleString()}/mo rent × ${inflationMultiplier.toFixed(3)}`}</span>
          <span className="mono text-negative">−{$(year.housingCost)}</span>
        </div>
        <div className="calc-row">
          <span>Education: daughter age {daughterAge} → {baseSchooling === 0 ? (daughterAge < activeDest.educationSystem.preschoolAge ? 'too young' : daughterAge < activeDest.educationSystem.primaryAge ? 'childcare' : activeCareer.benefits.some(b => b.toLowerCase().includes('tuition waiver')) ? 'tuition waiver' : activeDest.publicSchoolFree ? 'free public school' : 'international school') : `${$(baseSchooling)}/yr base`}{baseSchooling > 0 ? ` × ${inflationMultiplier.toFixed(3)}` : ''}</span>
          <span className="mono text-negative">−{$(year.schooling)}</span>
        </div>
        <div className="calc-row">
          <span>Health insurance: ${activeDest.costOfLiving.healthInsuranceMonthly}/mo × 12 × {inflationMultiplier.toFixed(3)}</span>
          <span className="mono text-negative">−{$(year.healthInsurance)}</span>
        </div>
        <div className="calc-row calc-total">
          <span>Total expenses</span>
          <span className="mono text-negative">−{$(year.totalExpenses)}</span>
        </div>
      </div>

      {/* Rental income */}
      {hasRentalIncome && (
        <div className="calc-section">
          <div className="calc-section-title">DC Rental Income</div>
          <div className="calc-row">
            <span>Rent: ${globals.rentalIncomeMonthly.toLocaleString()}/mo × 12 × {inflationMultiplier.toFixed(3)}</span>
            <span className="mono text-positive">+{$(baseRentalIncome * inflationMultiplier)}</span>
          </div>
          <div className="calc-row calc-indent">
            <span>− Mgmt fee ({globals.propertyMgmtPct}%): −{$(baseMgmtFee * inflationMultiplier)}</span>
          </div>
          <div className="calc-row calc-indent">
            <span>− Mortgage (fixed): −{$(baseMortgageCost)}</span>
          </div>
          <div className="calc-row calc-indent">
            <span>− Insurance+tax: −{$(baseInsTax * inflationMultiplier)}</span>
          </div>
          <div className="calc-row calc-indent">
            <span>− Maintenance: −{$(baseMaint * inflationMultiplier)}</span>
          </div>
          <div className="calc-row calc-total">
            <span>Net rental income</span>
            <span className={`mono ${year.rentalNetIncome >= 0 ? 'text-positive' : 'text-negative'}`}>
              {year.rentalNetIncome >= 0 ? '+' : ''}{$(year.rentalNetIncome)}
            </span>
          </div>
        </div>
      )}

      {/* Net cash flow */}
      <div className="calc-section">
        <div className="calc-section-title">Net Cash Flow</div>
        <div className="calc-row">
          <span>{$(year.grossIncome)} income − {$(year.totalTax)} tax − {$(year.totalExpenses)} expenses{hasRentalIncome ? ` + ${$(year.rentalNetIncome)} rental` : ''}</span>
          <span className={`mono calc-total-value ${year.netCashFlow >= 0 ? 'text-positive' : 'text-negative'}`}>
            = {$(year.netCashFlow)}
          </span>
        </div>
      </div>

      {/* Wealth */}
      <div className="calc-section">
        <div className="calc-section-title">End-of-Year Balances</div>
        <div className="calc-row">
          <span>Investments: (prior balance × {(1 + globals.investmentReturnRate / 100).toFixed(2)} return) + net cash flow</span>
          <span className="mono">{$(year.investmentBalance)}</span>
        </div>
        <div className="calc-row">
          <span>Retirement: (prior balance × {(1 + globals.investmentReturnRate / 100).toFixed(2)}) + {$(globals.annualRothContribution)} Roth contribution</span>
          <span className="mono">{$(year.retirementBalance)}</span>
        </div>
        {year.homeEquity > 0 && (
          <div className="calc-row">
            <span>DC home equity: {$(globals.currentHomeValue)} × (1 + {globals.homeAppreciationRate}%)^{yearIndex} − mortgage remaining</span>
            <span className="mono">{$(year.homeEquity)}</span>
          </div>
        )}
        <div className="calc-row calc-total calc-grand-total">
          <span>Total Net Worth</span>
          <span className="mono">{$(year.totalNetWorth)}</span>
        </div>
      </div>
    </div>
  );
}
