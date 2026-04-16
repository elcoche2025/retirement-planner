import { describe, it, expect } from 'vitest';
import { calculateQoLScore, normalizeFinancialScore, calculateCompositeScore } from './scoring';
import type { QualityOfLifeRatings, QoLWeights } from '@/types';

describe('calculateQoLScore', () => {
  it('returns weighted average normalized to 0-100', () => {
    const ratings: QualityOfLifeRatings = {
      familyProximity: 10, childEducation: 5, languageEnvironment: 5,
      healthcareQuality: 5, safety: 5, climate: 5, culturalFit: 5,
      careerSatisfaction: 5, communityBuilding: 5, politicalStability: 5,
      adventureNovelty: 5, returnFlexibility: 5,
    };
    const weights: QoLWeights = {
      weights: {
        familyProximity: 10, childEducation: 5, languageEnvironment: 5,
        healthcareQuality: 5, safety: 5, climate: 5, culturalFit: 5,
        careerSatisfaction: 5, communityBuilding: 5, politicalStability: 5,
        adventureNovelty: 5, returnFlexibility: 5,
      },
      financialWeight: 5,
    };
    const score = calculateQoLScore(ratings, weights);
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns 50 when all ratings are 5 and weights equal', () => {
    const ratings: QualityOfLifeRatings = {
      familyProximity: 5, childEducation: 5, languageEnvironment: 5,
      healthcareQuality: 5, safety: 5, climate: 5, culturalFit: 5,
      careerSatisfaction: 5, communityBuilding: 5, politicalStability: 5,
      adventureNovelty: 5, returnFlexibility: 5,
    };
    const weights: QoLWeights = {
      weights: {
        familyProximity: 5, childEducation: 5, languageEnvironment: 5,
        healthcareQuality: 5, safety: 5, climate: 5, culturalFit: 5,
        careerSatisfaction: 5, communityBuilding: 5, politicalStability: 5,
        adventureNovelty: 5, returnFlexibility: 5,
      },
      financialWeight: 5,
    };
    const score = calculateQoLScore(ratings, weights);
    expect(score).toBeCloseTo(50, 0);
  });
});

describe('normalizeFinancialScore', () => {
  it('returns higher score for higher net worth', () => {
    const scoreHigh = normalizeFinancialScore(3000000, 1000000, 5000000);
    const scoreLow = normalizeFinancialScore(1500000, 1000000, 5000000);
    expect(scoreHigh).toBeGreaterThan(scoreLow);
  });

  it('returns 0-100 range', () => {
    const score = normalizeFinancialScore(2500000, 1000000, 5000000);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('calculateCompositeScore', () => {
  it('blends financial and QoL scores by weight', () => {
    const score = calculateCompositeScore(80, 60, 5);
    // financialWeight=5, qolWeight=10 (hardcoded), so (80*5 + 60*10) / 15 = 1000/15 ≈ 66.67
    expect(score).toBeCloseTo(66.67, 0);
  });
});
