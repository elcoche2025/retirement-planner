import { getDestination } from '@/data/destinations';

const FEIE_2026 = 130000;
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
    const taxableAfterFEIE = Math.max(0, grossIncome - FEIE_2026);
    if (taxableAfterFEIE <= 0) return 0;
    return calcBracketTax(taxableAfterFEIE, US_BRACKETS_2026);
  }
  return calcBracketTax(grossIncome, US_BRACKETS_2026);
}

export function estimateLocalTax(grossIncome: number, destinationId: string): number {
  if (destinationId === 'dc-baseline') return 0;
  const dest = getDestination(destinationId);
  if (!dest) return 0;
  const effectiveRate = dest.taxRegime.incomeTaxRate / 100;
  return grossIncome * effectiveRate;
}

export interface TaxResult {
  usTax: number;
  localTax: number;
  foreignTaxCredit: number;
  total: number;
}

export function estimateEffectiveTax(grossIncome: number, destinationId: string): TaxResult {
  const usTax = estimateUSTax(grossIncome, destinationId);
  const localTax = estimateLocalTax(grossIncome, destinationId);
  const foreignTaxCredit = Math.min(localTax, usTax);
  const total = Math.max(usTax, localTax);
  return { usTax, localTax, foreignTaxCredit, total };
}
