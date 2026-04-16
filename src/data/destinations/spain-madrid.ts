import type { Destination } from '@/types';

export const spainMadrid: Destination = {
  id: 'spain-madrid',
  name: 'Madrid, Spain',
  country: 'Spain',
  city: 'Madrid',
  region: 'Community of Madrid',
  accentColor: 'var(--color-accent-bilbao)',
  flag: '\u{1F1EA}\u{1F1F8}',
  timezone: 'Europe/Madrid',
  utcOffset: 1,
  usTimezoneGap: 6,
  researchDepth: 'shallow',

  costOfLiving: {
    monthlyBaseline: 4200,
    monthlyComfortable: 5800,
    internationalSchoolAnnual: 11500,
    healthInsuranceMonthly: 275,
    costMultiplierVsDC: 0.57,
    notes: [
      'International schools $8K-$15K/yr',
      'Private health insurance $200-$350/mo',
      'Slightly cheaper than Barcelona',
    ],
  },

  taxRegime: {
    incomeTaxRate: 41,
    capitalGainsTax: 22,
    socialCharges: 6.4,
    specialRegime: 'Beckham Law',
    specialRegimeDetails: '24% flat rate on Spanish income for 6 years',
    usTaxObligation: 'Must still file US taxes; FTC offsets Spanish taxes',
    treatyBenefits: 'US-Spain tax treaty; Madrid region has lower top rate than Catalonia',
    estimatedEffectiveTotalRate: 26,
  },

  housing: {
    rentMonthly2BR: 1800,
    rentMonthly3BR: 2250,
    buyMedianPrice: 375000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      '2BR rent: $1,500-$2,100',
      '3BR rent: $1,900-$2,600',
      'Purchase: $300K-$450K',
    ],
  },

  careerPresets: [
    {
      id: 'mad-remote-dual',
      name: 'Dual Remote',
      description: 'Both work remotely from Madrid, leveraging capital city resources.',
      yourRole: 'Remote SPED/EdTech',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 60000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 120000,
      incomeGrowthRate: 2.5,
      benefits: [
        'Beckham Law tax benefit',
        'Capital city resources',
        'Central location',
        'Lower regional taxes than Catalonia',
      ],
      benefitsMonetaryValue: 8000,
      visaCompatible: true,
      notes: ['Digital Nomad Visa for remote work'],
      localCurrencyIncome: false,
    },
    {
      id: 'mad-corporate-school',
      name: 'Corporate + International School',
      description:
        'Mekoce at an international school; Kara in a multinational corporate role.',
      yourRole: 'International school / American School of Madrid',
      karaRole: 'Corporate role (many multinationals HQ here)',
      yourAnnualIncome: 35000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 95000,
      incomeGrowthRate: 3,
      benefits: [
        'Largest job market in Spain',
        'Many multinationals headquartered here',
        'Excellent metro transit',
        'Tuition discount possible',
      ],
      benefitsMonetaryValue: 12000,
      visaCompatible: true,
      notes: ['Best career market in Spain'],
      localCurrencyIncome: true,
    },
  ],

  qolDefaults: {
    familyProximity: 4,
    childEducation: 8,
    languageEnvironment: 9,
    healthcareQuality: 9,
    safety: 8,
    climate: 7,
    culturalFit: 8,
    careerSatisfaction: 7,
    communityBuilding: 7,
    politicalStability: 8,
    adventureNovelty: 7,
    returnFlexibility: 8,
  },

  visa: {
    type: 'Digital Nomad Visa or Non-Lucrative Visa',
    duration: '1-3 years',
    renewalProcess: 'Renew at local immigration office',
    requirements: ['Same Spain-wide requirements'],
    processingTime: '1-3 months',
    costs: '~\u20AC80-280',
    workRights: 'DNV: remote work for foreign employer',
    spouseWorkRights: 'Family reunification; spouse can apply for work authorization',
    pathToPR: 'Permanent residency after 5 years',
    gotchas: [
      'No beach (3+ hours away)',
      'Hot summers / cold winters (continental climate)',
      'Can feel large and impersonal',
    ],
  },

  narrative:
    'Spain\u2019s capital offers the best career market in the country, pure Castilian Spanish, and lower regional taxes than Barcelona. Slightly cheaper than Barcelona with more corporate opportunities.',

  pros: [
    'Best job market in Spain',
    'Lower regional taxes than Catalonia',
    'Excellent metro transit system',
    'Cultural capital (museums, nightlife, food)',
    'Beckham Law tax benefit',
    'Central European flight hub',
  ],

  cons: [
    'No beach (3+ hours away)',
    'Hot dry summers, cold winters',
    'Less charming than Barcelona or Bilbao',
    'Can feel large and impersonal',
  ],

  dealbreakers: [],

  currency: 'EUR',
  defaultExchangeRate: 0.92,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 6,
    secondaryAge: 12,
    highSchoolAge: 16,
    systemName: 'Spanish system (Madrid)',
    languageOfInstruction: 'Spanish',
    curriculumType: 'Spanish national, IB',
    internationalSchoolOptions: ['American School of Madrid', 'International College Spain', 'British Council School'],
    transitionNotes: [
      'Madrid has the most international school options in Spain',
      'Pure Castilian Spanish immersion in public schools',
      'Many multinational families provide transition community',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 400,
};
