import { describe, it, expect } from 'vitest';
import { runMonteCarlo } from './montecarlo';
import { getDestination } from '@/data/destinations';
import { GLOBAL_DEFAULTS } from '@/data/global-defaults';
import { getCurrentPlanningYear } from '@/utils/date';

const NEXT_YEAR = getCurrentPlanningYear() + 1;

describe('runMonteCarlo', () => {
  const globals = GLOBAL_DEFAULTS;

  it('returns percentile arrays of correct length', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = runMonteCarlo(dc, career, globals, {
      dcHomeDecision: 'keep',
      moveYear: NEXT_YEAR,
      returnYear: null,
    }, 50);
    const expectedYears = globals.retirementAge - globals.currentAge;
    expect(result.percentiles.p50.length).toBe(expectedYears);
    expect(result.percentiles.p10.length).toBe(expectedYears);
    expect(result.percentiles.p90.length).toBe(expectedYears);
    expect(result.years.length).toBe(expectedYears);
  });

  it('p10 <= p50 <= p90 at every year', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = runMonteCarlo(dc, career, globals, {
      dcHomeDecision: 'keep',
      moveYear: NEXT_YEAR,
      returnYear: null,
    }, 100);
    for (let i = 0; i < result.percentiles.p50.length; i++) {
      expect(result.percentiles.p10[i]).toBeLessThanOrEqual(result.percentiles.p50[i]);
      expect(result.percentiles.p50[i]).toBeLessThanOrEqual(result.percentiles.p90[i]);
    }
  });

  it('summary final values match last year of percentile arrays', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = runMonteCarlo(dc, career, globals, {
      dcHomeDecision: 'keep',
      moveYear: NEXT_YEAR,
      returnYear: null,
    }, 50);
    const last = result.percentiles.p50.length - 1;
    expect(result.summary.p50Final).toBe(result.percentiles.p50[last]);
    expect(result.summary.p10Final).toBe(result.percentiles.p10[last]);
    expect(result.summary.p90Final).toBe(result.percentiles.p90[last]);
  });

  it('is deterministic (same inputs produce same outputs)', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const overrides = { dcHomeDecision: 'keep' as const, moveYear: NEXT_YEAR, returnYear: null };
    const r1 = runMonteCarlo(dc, career, globals, overrides, 50);
    const r2 = runMonteCarlo(dc, career, globals, overrides, 50);
    expect(r1.summary.p50Final).toBe(r2.summary.p50Final);
  });

  it('p90-p10 spread is > 0 (volatility exists)', () => {
    const kenya = getDestination('kenya-nairobi')!;
    const career = kenya.careerPresets[0];
    const result = runMonteCarlo(kenya, career, globals, {
      dcHomeDecision: 'sell',
      moveYear: NEXT_YEAR,
      returnYear: null,
    }, 200);
    const spread = result.summary.p90Final - result.summary.p10Final;
    expect(spread).toBeGreaterThan(0);
  });
});
