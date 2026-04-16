import { describe, it, expect } from 'vitest';
import { simulate } from './simulate';
import { GLOBAL_DEFAULTS } from '@/data/global-defaults';
import { getDestination } from '@/data/destinations';

describe('simulate — education costs', () => {
  it('charges childcare for young daughter, free school for older', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = simulate(dc, career, { ...GLOBAL_DEFAULTS, daughterAge: 2 }, {
      dcHomeDecision: 'keep', moveYear: 2027, returnYear: null,
    });
    // First year daughter is 3 — preschool age (DC preschoolAge=3, primaryAge=5)
    const earlyYear = result[0]; // daughter age 3
    const laterYear = result[5]; // daughter age 8
    // DC has free public school, so school-age cost should be $0
    // But childcare at age 3 should be non-zero for DC
    expect(earlyYear.schooling).toBeGreaterThan(0); // childcare
    expect(laterYear.schooling).toBe(0); // free public school
  });
});

describe('simulate — currency adjustment', () => {
  it('weaker local currency reduces income for local-currency presets', () => {
    const hague = getDestination('nl-the-hague')!;
    const career = hague.careerPresets.find(p => p.localCurrencyIncome)!;

    const normalResult = simulate(hague, career, GLOBAL_DEFAULTS, {
      dcHomeDecision: 'sell', moveYear: 2027, returnYear: null,
    });

    // Weaker EUR (more EUR per USD = local currency lost value)
    const weakEurGlobals = {
      ...GLOBAL_DEFAULTS,
      exchangeRates: { ...GLOBAL_DEFAULTS.exchangeRates, EUR: 1.10 },
    };
    const weakResult = simulate(hague, career, weakEurGlobals, {
      dcHomeDecision: 'sell', moveYear: 2027, returnYear: null,
    });

    // Weaker EUR means less USD income
    expect(weakResult[0].grossIncome).toBeLessThan(normalResult[0].grossIncome);
  });
});

describe('simulate — inflation', () => {
  it('expenses grow year over year due to inflation', () => {
    const dc = getDestination('dc-baseline')!;
    const career = dc.careerPresets[0];
    const result = simulate(dc, career, GLOBAL_DEFAULTS, {
      dcHomeDecision: 'keep', moveYear: 2027, returnYear: null,
    });
    // Living expenses should increase each year (3% inflation default)
    expect(result[5].livingExpenses).toBeGreaterThan(result[0].livingExpenses);
    expect(result[10].livingExpenses).toBeGreaterThan(result[5].livingExpenses);
    // Health insurance should also inflate
    expect(result[10].healthInsurance).toBeGreaterThan(result[0].healthInsurance);
    // Compare years where schooling is the same (both school-age, free public)
    // Year 5 = daughter age 8, Year 15 = daughter age 18 — both free public
    if (result.length > 15) {
      expect(result[15].totalExpenses).toBeGreaterThan(result[5].totalExpenses);
    }
  });

  it('abroad rent inflates but DC mortgage stays fixed', () => {
    const dc = getDestination('dc-baseline')!;
    const dcCareer = dc.careerPresets[0];
    const dcResult = simulate(dc, dcCareer, GLOBAL_DEFAULTS, {
      dcHomeDecision: 'keep', moveYear: 2027, returnYear: null,
    });
    // DC mortgage is fixed — housing cost should NOT inflate
    expect(dcResult[0].housingCost).toBe(dcResult[10].housingCost);

    const kenya = getDestination('kenya-nairobi')!;
    const keCareer = kenya.careerPresets[0];
    const keResult = simulate(kenya, keCareer, GLOBAL_DEFAULTS, {
      dcHomeDecision: 'sell', moveYear: 2027, returnYear: null,
    });
    // Kenya rent SHOULD inflate
    expect(keResult[10].housingCost).toBeGreaterThan(keResult[0].housingCost);
  });
});

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
