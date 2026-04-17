export type { UserProfile, UserPreferences, ScenarioPreferenceOverrides } from './profiles';

// ============================================
// EDUCATION SYSTEM
// ============================================

export interface EducationSystem {
  preschoolAge: number;
  primaryAge: number;
  secondaryAge: number;
  highSchoolAge: number;
  systemName: string;
  languageOfInstruction: string;
  curriculumType: string;
  internationalSchoolOptions: string[];
  transitionNotes: string[];
}

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
  qolNotes?: Partial<Record<QoLDimension, string>>;
  visa: VisaInfo;
  narrative: string;
  pros: string[];
  cons: string[];
  dealbreakers: string[];
  currency: string;              // ISO code: 'USD' | 'EUR' | 'KES' | 'MXN' | 'COP' | 'UYU'
  defaultExchangeRate: number;   // local currency units per 1 USD
  educationSystem: EducationSystem;
  publicSchoolFree: boolean;
  childcareMonthly: number;      // USD, pre-school age
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
  localCurrencyIncome: boolean;  // true if income is denominated in local currency (affected by FX)
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
  daughterAge: number;
  exchangeRates: Record<string, number>;  // currency code → units per USD
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
// MONTE CARLO
// ============================================

export interface MonteCarloResult {
  percentiles: {
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
  };
  summary: {
    p10Final: number;
    p25Final: number;
    p50Final: number;
    p75Final: number;
    p90Final: number;
  };
  years: number[];
}

// ============================================
// APP STATE
// ============================================

export type FxSyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FxRatesMeta {
  provider: string;
  baseCurrency: string;
  asOfDate: string | null;
  fetchedAt: string | null;
  status: FxSyncStatus;
  error: string | null;
}

export interface AppState {
  version: number;
  globalAssumptions: GlobalAssumptions;
  fxRatesMeta: FxRatesMeta;
  profiles: Record<string, import('./profiles').UserProfile>;
  activeProfileId: string;
  lastVisited: string;
  localUpdatedAt: string;
}
