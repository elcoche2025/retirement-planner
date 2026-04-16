// ============================================
// DESTINATION & SCENARIO DATA
// ============================================

export interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  region?: string;
  accentColor: string;
  flag: string;
  timezone: string;
  utcOffset: number;
  usTimezoneGap: number;
  researchDepth: 'deep' | 'moderate' | 'shallow';
  costOfLiving: CostOfLiving;
  taxRegime: TaxRegime;
  housing: HousingMarket;
  careerPresets: CareerPreset[];
  qolDefaults: QualityOfLifeRatings;
  visa: VisaInfo;
  narrative: string;
  pros: string[];
  cons: string[];
  dealbreakers: string[];
}

export interface CostOfLiving {
  monthlyBaseline: number;
  monthlyComfortable: number;
  internationalSchoolAnnual: number;
  healthInsuranceMonthly: number;
  costMultiplierVsDC: number;
  notes: string[];
}

export interface TaxRegime {
  incomeTaxRate: number;
  capitalGainsTax: number;
  socialCharges?: number;
  specialRegime?: string;
  specialRegimeDetails?: string;
  usTaxObligation: string;
  treatyBenefits?: string;
  estimatedEffectiveTotalRate: number;
}

export interface HousingMarket {
  rentMonthly2BR: number;
  rentMonthly3BR: number;
  buyMedianPrice: number;
  mortgageAvailable: boolean;
  foreignOwnershipAllowed: boolean;
  notes: string[];
}

export interface VisaInfo {
  type: string;
  duration: string;
  renewalProcess: string;
  requirements: string[];
  processingTime: string;
  costs: string;
  workRights: string;
  spouseWorkRights: string;
  pathToPR: string;
  gotchas: string[];
}

// ============================================
// CAREER MODEL
// ============================================

export interface CareerPreset {
  id: string;
  name: string;
  description: string;
  yourRole: string;
  karaRole: string;
  yourAnnualIncome: number;
  karaAnnualIncome: number;
  householdAnnualIncome: number;
  incomeGrowthRate: number;
  benefits: string[];
  benefitsMonetaryValue: number;
  visaCompatible: boolean;
  notes: string[];
}

// ============================================
// QUALITY OF LIFE
// ============================================

export type QoLDimension =
  | 'familyProximity'
  | 'childEducation'
  | 'languageEnvironment'
  | 'healthcareQuality'
  | 'safety'
  | 'climate'
  | 'culturalFit'
  | 'careerSatisfaction'
  | 'communityBuilding'
  | 'politicalStability'
  | 'adventureNovelty'
  | 'returnFlexibility';

export const QOL_DIMENSIONS: QoLDimension[] = [
  'familyProximity',
  'childEducation',
  'languageEnvironment',
  'healthcareQuality',
  'safety',
  'climate',
  'culturalFit',
  'careerSatisfaction',
  'communityBuilding',
  'politicalStability',
  'adventureNovelty',
  'returnFlexibility',
];

export interface QoLDimensionMeta {
  id: QoLDimension;
  label: string;
  description: string;
  icon: string;
}

export type QualityOfLifeRatings = Record<QoLDimension, number>;

export interface QoLWeights {
  weights: Record<QoLDimension, number>;
  financialWeight: number;
}

export interface WeightPreset {
  id: string;
  name: string;
  weights: QoLWeights;
}

// ============================================
// FINANCIAL PROJECTION ENGINE
// ============================================

export interface GlobalAssumptions {
  currentAge: number;
  retirementAge: number;
  moveYear: number;
  returnYear: number | null;
  currentSavings: number;
  retirement457b: number;
  otherRetirement: number;
  currentHomeValue: number;
  currentMortgageBalance: number;
  monthlyMortgage: number;
  homeAppreciationRate: number;
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  rentalIncomeMonthly: number;
  propertyMgmtPct: number;
  monthlyInsuranceTax: number;
  monthlyMaintenance: number;
  investmentReturnRate: number;
  inflationRate: number;
  currentHouseholdIncome: number;
  closingCostPct: number;
  convertToRoth: boolean;
  rothConversionTaxRate: number;
  annualRothContribution: number;
}

export interface YearlyProjection {
  year: number;
  age: number;
  location: string;
  grossIncome: number;
  benefitsValue: number;
  totalCompensation: number;
  localTax: number;
  usTax: number;
  totalTax: number;
  livingExpenses: number;
  housingCost: number;
  schooling: number;
  healthInsurance: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsContribution: number;
  investmentBalance: number;
  retirementBalance: number;
  homeEquity: number;
  rentalNetIncome: number;
  totalNetWorth: number;
}

// ============================================
// SCENARIO
// ============================================

export interface ScenarioConfig {
  destinationId: string;
  selectedCareerPreset: string;
  customIncome?: { yours?: number; karas?: number };
  customQoLRatings: Partial<QualityOfLifeRatings>;
  dcHomeDecision: 'sell' | 'rent' | 'keep';
  moveYear: number;
  returnYear: number | null;
}

// ============================================
// DECISION MATRIX
// ============================================

export interface MatrixResult {
  destinationId: string;
  financialScore: number;
  qolScore: number;
  compositeScore: number;
  rank: number;
}

// ============================================
// APP STATE
// ============================================

export interface AppState {
  version: number;
  globalAssumptions: GlobalAssumptions;
  scenarios: Record<string, ScenarioConfig>;
  qolWeights: QoLWeights;
  lastVisited: string;
  compareSelection: string[];
  matrixPreset: string;
}
