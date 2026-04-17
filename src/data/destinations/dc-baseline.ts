import type { Destination } from '@/types';

export const dcBaseline: Destination = {
  id: 'dc-baseline',
  name: 'DC (Stay Put)',
  country: 'United States',
  city: 'Washington',
  region: 'District of Columbia',
  accentColor: 'var(--color-accent-dc)',
  flag: '\u{1F1FA}\u{1F1F8}',
  timezone: 'America/New_York',
  utcOffset: -5,
  usTimezoneGap: 0,
  researchDepth: 'deep',

  costOfLiving: {
    monthlyBaseline: 7500,
    monthlyComfortable: 10500,
    internationalSchoolAnnual: 0,
    healthInsuranceMonthly: 600,
    costMultiplierVsDC: 1.0,
    notes: [
      'Public school for daughter (no tuition)',
      'Employer-subsidized family health plan',
      'High baseline driven by housing, childcare, and transportation',
    ],
  },

  taxRegime: {
    incomeTaxRate: 24,
    capitalGainsTax: 15,
    socialCharges: 7.65,
    usTaxObligation: 'Full US federal + DC state tax obligation',
    estimatedEffectiveTotalRate: 30,
  },

  housing: {
    rentMonthly2BR: 2800,
    rentMonthly3BR: 3500,
    buyMedianPrice: 725000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      'Currently own home valued at $1.1M with $622K mortgage',
      'Monthly mortgage payment: $4,600',
    ],
  },

  careerPresets: [
    {
      id: 'dc-status-quo',
      name: 'Current Jobs (Status Quo)',
      description: 'Both continue current roles in DC with established careers and benefits.',
      yourRole: 'DCPS SPED Teacher',
      karaRole: 'Current role ($90K)',
      yourAnnualIncome: 130000,
      karaAnnualIncome: 90000,
      householdAnnualIncome: 220000,
      incomeGrowthRate: 3,
      benefits: [
        'DCPS pension accrual',
        'Health insurance (employer-subsidized)',
        'Summers off',
        'DC public schools for daughter',
      ],
      benefitsMonetaryValue: 35000,
      visaCompatible: true,
      notes: ['Stable but potentially stagnant', 'Golden handcuffs with pension'],
      localCurrencyIncome: false,
    },
  ],

  qolDefaults: {
    familyProximity: 3,
    childEducation: 7,
    languageEnvironment: 5,
    healthcareQuality: 8,
    safety: 5,
    climate: 4,
    culturalFit: 7,
    careerSatisfaction: 6,
    communityBuilding: 7,
    politicalStability: 6,
    adventureNovelty: 3,
    returnFlexibility: 10,
  },

  qolNotes: {
    climate:
      'Humid subtropical. Summers (Jun–Aug) are the weak spot: highs 85–90°F with oppressive humidity and frequent afternoon thunderstorms. Winters (Dec–Feb) drop to 28–35°F with occasional snow and ice. Spring and fall (~55–75°F) are the reward — short, pleasant windows. Rain spreads throughout the year (~40"/yr). For Oakland-calibrated tastes: the humidity makes summers feel much hotter than the thermometer says, and there is no real escape from the seasonal extremes.',
  },

  visa: {
    type: 'N/A \u2014 Citizens',
    duration: 'N/A',
    renewalProcess: 'N/A',
    requirements: ['N/A'],
    processingTime: 'N/A',
    costs: '$0',
    workRights: 'Full',
    spouseWorkRights: 'Full',
    pathToPR: 'N/A \u2014 already citizens',
    gotchas: [],
  },

  narrative:
    'The safe default. High earning power, established careers, known schools \u2014 but high cost of living, distance from family in Kenya, and limited sense of adventure.',

  pros: [
    'Dual high incomes with pension accrual',
    'Established social network',
    'Excellent healthcare access',
    'No relocation disruption',
  ],

  cons: [
    '$220K feels middle-class in DC',
    'Far from Kenya family (20+ hr travel)',
    'National political climate turbulent',
    'High cost of living erodes savings potential',
    'Golden handcuffs \u2014 hard to leave later',
  ],

  dealbreakers: [],

  currency: 'USD',
  defaultExchangeRate: 1,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 5,
    secondaryAge: 11,
    highSchoolAge: 14,
    systemName: 'US K-12 system',
    languageOfInstruction: 'English',
    curriculumType: 'US Common Core / DCPS',
    internationalSchoolOptions: [],
    transitionNotes: [
      'DCPS provides free public education K-12',
      'Strong SPED services through IEP system',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 2500,
};
