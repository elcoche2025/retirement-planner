import type { QoLWeights, QualityOfLifeRatings } from './index';

export interface UserPreferences {
  qolWeights: QoLWeights;
  scenarioOverrides: Record<string, ScenarioPreferenceOverrides>;
  matrixPreset: string;
  compareSelection: string[];
}

export interface ScenarioPreferenceOverrides {
  selectedCareerPreset?: string;
  customQoLRatings?: Partial<QualityOfLifeRatings>;
  dcHomeDecision?: 'sell' | 'rent' | 'keep';
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  preferences: UserPreferences;
}
