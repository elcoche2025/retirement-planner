import type { QualityOfLifeRatings, QoLWeights, MatrixResult } from '@/types';
import { QOL_DIMENSIONS } from '@/types';

export function calculateQoLScore(ratings: QualityOfLifeRatings, qolWeights: QoLWeights): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const dim of QOL_DIMENSIONS) {
    const weight = qolWeights.weights[dim];
    const rating = ratings[dim];
    weightedSum += rating * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return 50;
  return (weightedSum / totalWeight) * 10;
}

export function normalizeFinancialScore(netWorth: number, minNetWorth: number, maxNetWorth: number): number {
  if (maxNetWorth <= minNetWorth) return 50;
  const normalized = (netWorth - minNetWorth) / (maxNetWorth - minNetWorth);
  return Math.max(0, Math.min(100, normalized * 100));
}

export function calculateCompositeScore(
  financialScore: number,
  qolScore: number,
  financialWeight: number,
): number {
  const totalWeight = financialWeight + 10;
  return (financialScore * financialWeight + qolScore * 10) / totalWeight;
}

export function rankDestinations(results: Omit<MatrixResult, 'rank'>[]): MatrixResult[] {
  const sorted = [...results].sort((a, b) => b.compositeScore - a.compositeScore);
  return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
}
