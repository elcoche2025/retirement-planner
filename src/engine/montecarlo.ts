import type { Destination, CareerPreset, GlobalAssumptions, MonteCarloResult } from '@/types';
import { simulate } from './simulate';

// Simple seeded PRNG (xorshift32)
function createRng(seed: number) {
  let state = seed;
  return function next(): number {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296; // 0 to 1
  };
}

// Hash string to number for seed
function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

// Box-Muller transform for normal distribution
function normalRandom(rng: () => number, mean: number, stddev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

interface SimulateOverrides {
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  moveYear: number;
  returnYear: number | null;
  customIncome?: { yours?: number; karas?: number };
}

export function runMonteCarlo(
  destination: Destination,
  career: CareerPreset,
  globals: GlobalAssumptions,
  overrides: SimulateOverrides,
  runs: number = 500,
): MonteCarloResult {
  const seed = hashSeed(destination.id + career.id);
  const rng = createRng(seed);
  const totalYears = globals.retirementAge - globals.currentAge;

  // Collect net worth at each year across all runs
  const allNetWorths: number[][] = Array.from({ length: totalYears }, () => []);

  for (let run = 0; run < runs; run++) {
    // Randomize investment return rate (drawn once per run)
    const randomReturn = normalRandom(rng, globals.investmentReturnRate, 12);
    const clampedReturn = Math.max(-30, Math.min(40, randomReturn));

    // Randomize income growth rate (drawn once per run)
    const incomeGrowthStddev = career.incomeGrowthRate / 3;
    const randomGrowth = normalRandom(rng, career.incomeGrowthRate, incomeGrowthStddev);
    const clampedGrowth = Math.max(0, Math.min(career.incomeGrowthRate * 3, randomGrowth));

    const modifiedGlobals: GlobalAssumptions = {
      ...globals,
      investmentReturnRate: clampedReturn,
    };

    const modifiedCareer: CareerPreset = {
      ...career,
      incomeGrowthRate: clampedGrowth,
    };

    const projections = simulate(destination, modifiedCareer, modifiedGlobals, overrides);

    for (let y = 0; y < projections.length && y < totalYears; y++) {
      allNetWorths[y].push(projections[y].totalNetWorth);
    }
  }

  // Compute percentiles at each year
  function percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.max(0, Math.ceil((p / 100) * sorted.length) - 1);
    return sorted[idx];
  }

  const p10: number[] = [];
  const p25: number[] = [];
  const p50: number[] = [];
  const p75: number[] = [];
  const p90: number[] = [];
  const years: number[] = [];

  for (let y = 0; y < totalYears; y++) {
    const data = allNetWorths[y];
    if (data.length === 0) {
      p10.push(0); p25.push(0); p50.push(0); p75.push(0); p90.push(0);
    } else {
      p10.push(Math.round(percentile(data, 10)));
      p25.push(Math.round(percentile(data, 25)));
      p50.push(Math.round(percentile(data, 50)));
      p75.push(Math.round(percentile(data, 75)));
      p90.push(Math.round(percentile(data, 90)));
    }
    years.push(globals.currentAge + y + 1);
  }

  const last = totalYears - 1;

  return {
    percentiles: { p10, p25, p50, p75, p90 },
    summary: {
      p10Final: p10[last] ?? 0,
      p25Final: p25[last] ?? 0,
      p50Final: p50[last] ?? 0,
      p75Final: p75[last] ?? 0,
      p90Final: p90[last] ?? 0,
    },
    years,
  };
}
