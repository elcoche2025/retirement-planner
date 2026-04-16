import { getDestination } from '@/data/destinations';

const FEIE_2026 = 132900;
const US_BRACKETS_2026 = [
  { min: 0, max: 23850, rate: 0.10 },
  { min: 23850, max: 96950, rate: 0.12 },
  { min: 96950, max: 206700, rate: 0.22 },
  { min: 206700, max: 394600, rate: 0.24 },
  { min: 394600, max: 501050, rate: 0.32 },
  { min: 501050, max: 751600, rate: 0.35 },
  { min: 751600, max: Infinity, rate: 0.37 },
];

function calcBracketTax(income: number, brackets: { min: number; max: number; rate: number }[]): number {
  let tax = 0;
  for (const bracket of brackets) {
    if (income <= bracket.min) break;
    const taxable = Math.min(income, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }
  return tax;
}

export function estimateUSTax(grossIncome: number, destinationId: string, applyFEIE: boolean = true): number {
  const isAbroad = destinationId !== 'dc-baseline';
  if (isAbroad && applyFEIE) {
    const excludedIncome = Math.min(grossIncome, FEIE_2026);
    if (excludedIncome <= 0) return calcBracketTax(grossIncome, US_BRACKETS_2026);
    // Approximate the FEIE worksheet by taxing the full income
    // and subtracting the tax attributable to the excluded amount.
    return Math.max(
      0,
      calcBracketTax(grossIncome, US_BRACKETS_2026) -
      calcBracketTax(excludedIncome, US_BRACKETS_2026),
    );
  }
  return calcBracketTax(grossIncome, US_BRACKETS_2026);
}

function getLocalEstimatedRate(destinationId: string): number {
  if (destinationId === 'dc-baseline') return 0;
  const dest = getDestination(destinationId);
  if (!dest) return 0;

  const combinedNominalRate = dest.taxRegime.incomeTaxRate + (dest.taxRegime.socialCharges ?? 0);
  return Math.min(combinedNominalRate, dest.taxRegime.estimatedEffectiveTotalRate) / 100;
}

export function estimateLocalTax(grossIncome: number, destinationId: string): number {
  if (destinationId === 'dc-baseline') return 0;
  return grossIncome * getLocalEstimatedRate(destinationId);
}

export interface TaxResult {
  usTax: number;
  localTax: number;
  foreignTaxCredit: number;
  total: number;
  method: 'effective-rate-estimate';
}

export function estimateEffectiveTax(grossIncome: number, destinationId: string): TaxResult {
  const dest = getDestination(destinationId);

  if (!dest) {
    const usTax = estimateUSTax(grossIncome, destinationId);
    return {
      usTax,
      localTax: 0,
      foreignTaxCredit: 0,
      total: usTax,
      method: 'effective-rate-estimate',
    };
  }

  const total = grossIncome * (dest.taxRegime.estimatedEffectiveTotalRate / 100);

  if (destinationId === 'dc-baseline') {
    return {
      usTax: total,
      localTax: 0,
      foreignTaxCredit: 0,
      total,
      method: 'effective-rate-estimate',
    };
  }

  const localTax = Math.min(total, estimateLocalTax(grossIncome, destinationId));
  const usTaxResidual = Math.min(
    total - localTax,
    estimateUSTax(grossIncome, destinationId),
  );

  return {
    usTax: Math.max(0, usTaxResidual),
    localTax,
    foreignTaxCredit: Math.max(0, estimateUSTax(grossIncome, destinationId) - usTaxResidual),
    total,
    method: 'effective-rate-estimate',
  };
}
