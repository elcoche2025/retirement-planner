import { describe, it, expect } from 'vitest';
import { estimateUSTax, estimateLocalTax, estimateEffectiveTax } from './taxes';
import { getDestination } from '@/data/destinations';

describe('estimateUSTax', () => {
  it('returns federal tax at domestic rate for DC', () => {
    const tax = estimateUSTax(220000, 'dc-baseline', false);
    expect(tax).toBeGreaterThan(30000);
    expect(tax).toBeLessThan(50000);
  });

  it('applies FEIE for abroad scenarios under exclusion limit', () => {
    const taxAbroad = estimateUSTax(100000, 'kenya-nairobi', true);
    const taxDomestic = estimateUSTax(100000, 'dc-baseline', false);
    expect(taxAbroad).toBeLessThan(taxDomestic);
  });

  it('returns 0 when income is below FEIE', () => {
    const tax = estimateUSTax(80000, 'kenya-nairobi', true);
    expect(tax).toBe(0);
  });

  it('uses the FEIE stacking approach above the exclusion limit', () => {
    const tax = estimateUSTax(180000, 'kenya-nairobi', true);
    expect(tax).toBeGreaterThan(0);
    expect(tax).toBeLessThan(estimateUSTax(180000, 'dc-baseline', false));
  });
});

describe('estimateLocalTax', () => {
  it('returns 0 for DC baseline', () => {
    expect(estimateLocalTax(220000, 'dc-baseline')).toBe(0);
  });

  it('returns positive tax for Netherlands', () => {
    const tax = estimateLocalTax(100000, 'nl-the-hague');
    expect(tax).toBeGreaterThan(10000);
  });
});

describe('estimateEffectiveTax', () => {
  it('uses destination estimated effective rate for total tax', () => {
    const result = estimateEffectiveTax(100000, 'nl-the-hague');
    const destination = getDestination('nl-the-hague')!;
    expect(result.total).toBeCloseTo(100000 * (destination.taxRegime.estimatedEffectiveTotalRate / 100), 5);
  });

  it('keeps local + residual US tax within the total estimate', () => {
    const result = estimateEffectiveTax(100000, 'nl-the-hague');
    expect(result.localTax + result.usTax).toBeLessThanOrEqual(result.total + 1);
  });
});
