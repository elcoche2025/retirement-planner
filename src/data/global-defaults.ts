import type { GlobalAssumptions } from '@/types';

export const GLOBAL_DEFAULTS: GlobalAssumptions = {
  currentAge: 43,
  retirementAge: 62,
  moveYear: 2027,
  returnYear: null,

  currentSavings: 50000,
  retirement457b: 100000,
  otherRetirement: 0,

  currentHomeValue: 1100000,
  currentMortgageBalance: 622338,
  monthlyMortgage: 4600,
  homeAppreciationRate: 4,
  dcHomeDecision: 'sell',
  rentalIncomeMonthly: 5000,
  propertyMgmtPct: 8,
  monthlyInsuranceTax: 800,
  monthlyMaintenance: 400,

  investmentReturnRate: 7,
  inflationRate: 3,
  currentHouseholdIncome: 220000,

  closingCostPct: 6,
  convertToRoth: true,
  rothConversionTaxRate: 22,
  annualRothContribution: 7000,

  daughterAge: 3,
  exchangeRates: {
    EUR: 0.92,
    KES: 130,
    MXN: 17.5,
    COP: 4200,
    UYU: 42,
  },
};
