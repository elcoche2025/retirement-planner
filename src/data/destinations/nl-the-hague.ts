import type { Destination } from '@/types';

export const nlTheHague: Destination = {
  id: 'nl-the-hague',
  name: 'The Hague, Netherlands',
  country: 'Netherlands',
  city: 'The Hague',
  region: 'South Holland',
  accentColor: 'var(--color-accent-netherlands)',
  flag: '\u{1F1F3}\u{1F1F1}',
  timezone: 'Europe/Amsterdam',
  utcOffset: 1,
  usTimezoneGap: 6,
  researchDepth: 'deep',

  costOfLiving: {
    monthlyBaseline: 5500,
    monthlyComfortable: 7500,
    internationalSchoolAnnual: 21500,
    healthInsuranceMonthly: 425,
    costMultiplierVsDC: 0.75,
    notes: [
      'International schools $18K-$25K/yr',
      'Mandatory health insurance: basic ~\u20AC120/person + supplemental',
      'Cycling infrastructure reduces transport costs significantly',
    ],
  },

  taxRegime: {
    incomeTaxRate: 37,
    capitalGainsTax: 1.4,
    specialRegime: '30% Ruling',
    specialRegimeDetails:
      'Tax-free allowance on 30% of salary for 5 years; reducing to 27% in 2027',
    usTaxObligation: 'Must still file US taxes; FTC offsets Dutch taxes paid',
    treatyBenefits: 'US-NL tax treaty prevents double taxation',
    estimatedEffectiveTotalRate: 32,
  },

  housing: {
    rentMonthly2BR: 2100,
    rentMonthly3BR: 2600,
    buyMedianPrice: 460000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      '2BR rent: $1,800-$2,400',
      '3BR rent: $2,200-$3,000',
      'Purchase: $420K-$500K',
      'Severe housing shortage across Netherlands',
    ],
  },

  careerPresets: [
    {
      id: 'hague-intl-org',
      name: 'International Org + School',
      description:
        'Mekoce teaches at an international school; Kara works at an international organization (ICC, OPCW, Europol).',
      yourRole: 'International school SPED teacher',
      karaRole: 'International org (ICC, OPCW, Europol)',
      yourAnnualIncome: 40000,
      karaAnnualIncome: 55000,
      householdAnnualIncome: 95000,
      incomeGrowthRate: 2.5,
      benefits: [
        '30% ruling tax benefit',
        'Excellent public transit and bike culture',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 15000,
      visaCompatible: true,
      notes: ['Employer must be recognized sponsor for HSM visa'],
    },
    {
      id: 'hague-hsm',
      name: 'Highly Skilled Migrant',
      description:
        'Both qualify as highly skilled migrants with corporate/consulting roles.',
      yourRole: 'EdTech or inclusion consultant',
      karaRole: 'Corporate role (HSM visa)',
      yourAnnualIncome: 50000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 110000,
      incomeGrowthRate: 3,
      benefits: [
        '30% ruling tax benefit',
        'EU travel freedom',
        'World-class cycling infrastructure',
      ],
      benefitsMonetaryValue: 18000,
      visaCompatible: true,
      notes: ['Both must meet salary threshold of \u20AC48,013/yr (2026)'],
    },
  ],

  qolDefaults: {
    familyProximity: 4,
    childEducation: 9,
    languageEnvironment: 7,
    healthcareQuality: 9,
    safety: 9,
    climate: 4,
    culturalFit: 6,
    careerSatisfaction: 7,
    communityBuilding: 6,
    politicalStability: 8,
    adventureNovelty: 6,
    returnFlexibility: 7,
  },

  visa: {
    type: 'Highly Skilled Migrant (HSM) or Intra-Company Transfer',
    duration: '5 years, renewable',
    renewalProcess: 'Employer-driven renewal; permanent after 5 years',
    requirements: [
      'Employer must be recognized sponsor',
      'Salary threshold \u20AC48,013/yr (2026)',
      'Or \u20AC36,497 if under 30 with Master\u2019s',
    ],
    processingTime: '2-4 weeks (employer-driven)',
    costs: '~\u20AC350 per person',
    workRights: 'Full work rights with HSM permit',
    spouseWorkRights: 'Full work rights for spouse (no separate permit needed)',
    pathToPR: 'Permanent residency after 5 years; citizenship after 5 years (must renounce other citizenship unless exception)',
    gotchas: [
      'Must renounce other citizenship for Dutch citizenship (exceptions exist)',
      'Severe housing shortage \u2014 finding an apartment can take months',
      '30% ruling is being reduced and may be further limited',
    ],
  },

  narrative:
    'The pragmatic European choice. The Hague offers international organizations, excellent schools, and the 30% ruling tax benefit. Less expensive than Amsterdam, more international community feel.',

  pros: [
    '30% ruling saves thousands in taxes',
    'International community (ICC, Europol hub)',
    'EU healthcare (universal, high quality)',
    'Bike-friendly and safe',
    'Excellent schools',
    'Spouse gets full work rights',
  ],

  cons: [
    'Gray, rainy, windy weather',
    'Reserved Dutch culture \u2014 hard to make close friends',
    'Severe housing shortage',
    'Lower net income than DC',
    'Far from Kenya (10hr flight)',
  ],

  dealbreakers: [
    'Must renounce other citizenship for Dutch citizenship (if pursuing)',
  ],
};
