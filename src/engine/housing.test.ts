import { describe, it, expect } from 'vitest';
import { projectHomeEquity, calculateRentalCashFlow, calculateSaleProceeds } from './housing';

describe('calculateSaleProceeds', () => {
  it('subtracts mortgage and closing costs', () => {
    const proceeds = calculateSaleProceeds(1100000, 622338, 6);
    expect(proceeds).toBeCloseTo(411662, 0);
  });

  it('returns 0 when underwater', () => {
    const proceeds = calculateSaleProceeds(500000, 600000, 6);
    expect(proceeds).toBe(0);
  });
});

describe('projectHomeEquity', () => {
  it('grows home value at appreciation rate', () => {
    const equity = projectHomeEquity(1100000, 622338, 4600, 4, 10);
    expect(equity.homeValue).toBeGreaterThan(1100000);
    expect(equity.equity).toBeGreaterThan(0);
  });
});

describe('calculateRentalCashFlow', () => {
  it('returns annual net rental income', () => {
    const annual = calculateRentalCashFlow(5000, 4600, 800, 400, 8);
    expect(annual).toBeDefined();
    expect(typeof annual).toBe('number');
  });
});
