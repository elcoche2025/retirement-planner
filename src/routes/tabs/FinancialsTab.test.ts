import { describe, expect, it } from 'vitest';
import { formatSignedCompactCurrency } from './FinancialsTab';

describe('formatSignedCompactCurrency', () => {
  it('preserves a plus sign for positive values', () => {
    expect(formatSignedCompactCurrency(125000)).toBe('+$125K');
  });

  it('preserves a minus sign for negative values', () => {
    expect(formatSignedCompactCurrency(-125000)).toBe('-$125K');
  });
});
