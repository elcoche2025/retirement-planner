import type { Destination, CareerPreset, GlobalAssumptions, YearlyProjection } from '@/types';
import { estimateEffectiveTax } from './taxes';
import { calculateSaleProceeds, calculateRentalCashFlow, projectHomeEquity } from './housing';
import { getDestination } from '@/data/destinations';
import { getEducationCost } from './education';

interface SimulateOverrides {
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  moveYear: number;
  returnYear: number | null;
  customIncome?: { yours?: number; karas?: number };
}

export function simulate(
  destination: Destination,
  career: CareerPreset,
  globals: GlobalAssumptions,
  overrides: SimulateOverrides,
): YearlyProjection[] {
  const totalYears = globals.retirementAge - globals.currentAge;
  const currentYear = new Date().getFullYear();
  const projections: YearlyProjection[] = [];

  let investmentBalance = globals.currentSavings;
  let retirementBalance = globals.retirement457b;

  if (globals.convertToRoth) {
    retirementBalance = retirementBalance * (1 - globals.rothConversionTaxRate / 100);
  }

  if (overrides.dcHomeDecision === 'sell') {
    const proceeds = calculateSaleProceeds(
      globals.currentHomeValue,
      globals.currentMortgageBalance,
      globals.closingCostPct,
    );
    investmentBalance += proceeds;
  }

  const returnRate = globals.investmentReturnRate / 100;
  const dcDest = getDestination('dc-baseline')!;
  const dcCareer = dcDest.careerPresets[0];

  for (let y = 1; y <= totalYears; y++) {
    const age = globals.currentAge + y;
    const year = currentYear + y;
    const isAbroad = year >= overrides.moveYear && (overrides.returnYear === null || year < overrides.returnYear);
    const activeDest = isAbroad ? destination : dcDest;
    const activeCareer = isAbroad ? career : dcCareer;
    const locationId = activeDest.id;

    const yourIncome = overrides.customIncome?.yours ?? activeCareer.yourAnnualIncome;
    const karasIncome = overrides.customIncome?.karas ?? activeCareer.karaAnnualIncome;
    const yearsInRole = isAbroad ? year - overrides.moveYear : y;
    const growthMultiplier = Math.pow(1 + activeCareer.incomeGrowthRate / 100, yearsInRole);

    let adjustedYourIncome = yourIncome;
    let adjustedKarasIncome = karasIncome;

    if (isAbroad && activeCareer.localCurrencyIncome && activeDest.currency !== 'USD') {
      const currentRate = globals.exchangeRates?.[activeDest.currency] ?? activeDest.defaultExchangeRate;
      const fxAdjustment = activeDest.defaultExchangeRate / currentRate;
      // fxAdjustment < 1 means local currency weakened (bad for local earners)
      adjustedYourIncome = yourIncome * fxAdjustment;
      adjustedKarasIncome = karasIncome * fxAdjustment;
    }

    const grossIncome = (adjustedYourIncome + adjustedKarasIncome) * growthMultiplier;
    const benefitsValue = activeCareer.benefitsMonetaryValue;
    const totalCompensation = grossIncome + benefitsValue;

    const taxes = estimateEffectiveTax(grossIncome, locationId);

    const colMultiplier = activeDest.costOfLiving.costMultiplierVsDC;
    const livingExpenses = 6500 * 12 * colMultiplier;
    const housingCost = activeDest.id === 'dc-baseline'
      ? globals.monthlyMortgage * 12
      : activeDest.housing.rentMonthly3BR * 12;
    const daughterAgeThisYear = (globals.daughterAge ?? 3) + y;
    const schooling = getEducationCost(activeDest, activeCareer, daughterAgeThisYear);
    const healthInsurance = activeDest.costOfLiving.healthInsuranceMonthly * 12;
    const totalExpenses = livingExpenses + housingCost + schooling + healthInsurance;

    let rentalNetIncome = 0;
    if (overrides.dcHomeDecision === 'rent' && isAbroad) {
      rentalNetIncome = calculateRentalCashFlow(
        globals.rentalIncomeMonthly,
        globals.monthlyMortgage,
        globals.monthlyInsuranceTax,
        globals.monthlyMaintenance,
        globals.propertyMgmtPct,
      );
    }

    const netCashFlow = grossIncome - taxes.total - totalExpenses + rentalNetIncome;

    investmentBalance = investmentBalance * (1 + returnRate);
    retirementBalance = retirementBalance * (1 + returnRate) + globals.annualRothContribution;

    if (netCashFlow > 0) {
      investmentBalance += netCashFlow;
    } else {
      investmentBalance += netCashFlow;
    }

    let homeEquity = 0;
    if (overrides.dcHomeDecision !== 'sell') {
      const proj = projectHomeEquity(
        globals.currentHomeValue,
        globals.currentMortgageBalance,
        globals.monthlyMortgage,
        globals.homeAppreciationRate,
        y,
      );
      homeEquity = proj.equity;
    }

    const totalNetWorth = Math.max(0, investmentBalance) + retirementBalance + homeEquity;

    projections.push({
      year,
      age,
      location: locationId,
      grossIncome: Math.round(grossIncome),
      benefitsValue: Math.round(benefitsValue),
      totalCompensation: Math.round(totalCompensation),
      localTax: Math.round(taxes.localTax),
      usTax: Math.round(taxes.usTax),
      totalTax: Math.round(taxes.total),
      livingExpenses: Math.round(livingExpenses),
      housingCost: Math.round(housingCost),
      schooling: Math.round(schooling),
      healthInsurance: Math.round(healthInsurance),
      totalExpenses: Math.round(totalExpenses),
      netCashFlow: Math.round(netCashFlow),
      savingsContribution: Math.round(Math.max(0, netCashFlow)),
      investmentBalance: Math.round(investmentBalance),
      retirementBalance: Math.round(retirementBalance),
      homeEquity: Math.round(homeEquity),
      rentalNetIncome: Math.round(rentalNetIncome),
      totalNetWorth: Math.round(totalNetWorth),
    });
  }

  return projections;
}
