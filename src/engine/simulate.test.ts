import { describe, it, expect } from 'vitest';
import { simulate } from './simulate';
import { GLOBAL_DEFAULTS } from '@/data/global-defaults';
import { getDestination } from '@/data/destinations';

describe('simulate', () => {
  const globals = GLOBAL_DEFAULTS;

  it('produces projections for each year from moveYear to retirement', () => {
    const dest = getDestination('dc-baseline')!;
    const career = dest.careerPresets[0];
    const result = simulate(dest, career, globals, { dcHomeDecision: 'keep', moveYear: 2027, returnYear: null });
    const expectedYears = globals.retirementAge - globals.currentAge;
    expect(result.length).toBe(expectedYears);
    expect(result[0].age).toBe(globals.currentAge + 1);
    expect(result[result.length - 1].age).toBe(globals.retirementAge);
  });

  it('net worth grows over time for DC baseline', () => {
    const dest = getDestination('dc-baseline')!;
    const career = dest.careerPresets[0];
    const result = simulate(dest, career, globals, { dcHomeDecision: 'keep', moveYear: 2027, returnYear: null });
    const firstYear = result[0].totalNetWorth;
    const lastYear = result[result.length - 1].totalNetWorth;
    expect(lastYear).toBeGreaterThan(firstYear);
  });

  it('Kenya scenario has lower expenses than DC', () => {
    const dcDest = getDestination('dc-baseline')!;
    const dcCareer = dcDest.careerPresets[0];
    const dcResult = simulate(dcDest, dcCareer, globals, { dcHomeDecision: 'keep', moveYear: 2027, returnYear: null });

    const keDest = getDestination('kenya-nairobi')!;
    const keCareer = keDest.careerPresets[0];
    const keResult = simulate(keDest, keCareer, globals, { dcHomeDecision: 'sell', moveYear: 2027, returnYear: null });

    expect(keResult[0].totalExpenses).toBeLessThan(dcResult[0].totalExpenses);
  });

  it('selling DC home adds lump sum to investments', () => {
    const dest = getDestination('kenya-nairobi')!;
    const career = dest.careerPresets[0];
    const sellResult = simulate(dest, career, globals, { dcHomeDecision: 'sell', moveYear: 2027, returnYear: null });
    const keepResult = simulate(dest, career, globals, { dcHomeDecision: 'keep', moveYear: 2027, returnYear: null });
    expect(sellResult[0].investmentBalance).toBeGreaterThan(keepResult[0].investmentBalance);
  });

  it('return-to-DC switches location mid-projection', () => {
    const dest = getDestination('kenya-nairobi')!;
    const career = dest.careerPresets[0];
    const result = simulate(dest, career, globals, { dcHomeDecision: 'rent', moveYear: 2027, returnYear: 2032 });
    const abroadYears = result.filter((y) => y.location === 'kenya-nairobi');
    const dcYears = result.filter((y) => y.location === 'dc-baseline');
    expect(abroadYears.length).toBe(2032 - 2027);
    expect(dcYears.length).toBeGreaterThan(0);
  });
});
