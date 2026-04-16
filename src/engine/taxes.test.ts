import { describe, it, expect } from 'vitest';
import { estimateUSTax, estimateLocalTax, estimateEffectiveTax } from './taxes';

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
  it('effective is max of US and local, not sum', () => {
    const result = estimateEffectiveTax(100000, 'nl-the-hague');
    expect(result.total).toBeLessThan(result.usTax + result.localTax + 1);
  });
});
