import type { Destination } from '@/types';

export const spainBilbao: Destination = {
  id: 'spain-bilbao',
  name: 'Bilbao, Spain',
  country: 'Spain',
  city: 'Bilbao',
  region: 'Basque Country',
  accentColor: 'var(--color-accent-bilbao)',
  flag: '\u{1F1EA}\u{1F1F8}',
  timezone: 'Europe/Madrid',
  utcOffset: 1,
  usTimezoneGap: 6,
  researchDepth: 'deep',

  costOfLiving: {
    monthlyBaseline: 3800,
    monthlyComfortable: 5200,
    internationalSchoolAnnual: 11000,
    healthInsuranceMonthly: 275,
    costMultiplierVsDC: 0.52,
    notes: [
      'International schools $8K-$14K/yr',
      'Private health insurance $200-$350/mo or access to public healthcare',
      'Affordable by European standards',
    ],
  },

  taxRegime: {
    incomeTaxRate: 36,
    capitalGainsTax: 22,
    socialCharges: 6.4,
    specialRegime: 'Beckham Law',
    specialRegimeDetails: '24% flat rate on Spanish income for 6 years',
    usTaxObligation: 'Must still file US taxes; FTC offsets Spanish taxes',
    treatyBenefits: 'US-Spain tax treaty; Basque Country has own tax rates',
    estimatedEffectiveTotalRate: 26,
  },

  housing: {
    rentMonthly2BR: 1200,
    rentMonthly3BR: 1550,
    buyMedianPrice: 300000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      '2BR rent: $1,000-$1,400',
      '3BR rent: $1,300-$1,800',
      'Purchase: $250K-$350K',
    ],
  },

  careerPresets: [
    {
      id: 'bilbao-remote-school',
      name: 'Remote + International School',
      description:
        'Remote EdTech/SPED consulting with Kara also working remotely, leveraging Beckham Law tax benefits.',
      yourRole: 'Remote EdTech/SPED consulting',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 50000,
      karaAnnualIncome: 50000,
      householdAnnualIncome: 100000,
      incomeGrowthRate: 2.5,
      benefits: [
        'Beckham Law (24% flat tax)',
        'FEIE potential',
        'Basque quality of life',
        'Affordable housing',
      ],
      benefitsMonetaryValue: 8000,
      visaCompatible: true,
      notes: ['Digital Nomad Visa or Non-Lucrative Visa'],
      localCurrencyIncome: false,
    },
    {
      id: 'bilbao-local',
      name: 'Local Employment',
      description:
        'Full integration into Basque community with local bilingual school employment.',
      yourRole: 'Bilingual school or language academy',
      karaRole: 'Local or remote work',
      yourAnnualIncome: 25000,
      karaAnnualIncome: 40000,
      householdAnnualIncome: 65000,
      incomeGrowthRate: 2,
      benefits: [
        'Full cultural integration',
        'Spanish/Basque immersion',
        'Public healthcare access',
      ],
      benefitsMonetaryValue: 12000,
      visaCompatible: true,
      notes: ['Lower income but extremely low cost of living'],
      localCurrencyIncome: true,
    },
  ],

  qolDefaults: {
    familyProximity: 4,
    childEducation: 7,
    languageEnvironment: 9,
    healthcareQuality: 9,
    safety: 9,
    climate: 7,
    culturalFit: 8,
    careerSatisfaction: 5,
    communityBuilding: 7,
    politicalStability: 8,
    adventureNovelty: 8,
    returnFlexibility: 7,
  },

  visa: {
    type: 'Digital Nomad Visa or Non-Lucrative Visa',
    duration: '1 year (DNV from consulate), renewable to 3 years; NLV 1 year renewable',
    renewalProcess: 'Renew at local immigration office before expiry',
    requirements: [
      'DNV: \u20AC2,849/mo income, remote employment, health insurance',
      'NLV: ~\u20AC28,800/yr passive income, no work permitted',
    ],
    processingTime: '1-3 months',
    costs: '~\u20AC80 visa fee + ~\u20AC200 NIE/TIE',
    workRights: 'DNV: remote work for foreign employer; NLV: no work permitted',
    spouseWorkRights: 'Family reunification visa; spouse can apply for work authorization',
    pathToPR: 'Permanent residency after 5 years of legal residence',
    gotchas: [
      'NLV does not allow any work \u2014 must use DNV for remote income',
      'Beckham Law eligibility has specific conditions',
      'Basque Country has its own tax regime (different from rest of Spain)',
    ],
  },

  narrative:
    'The hidden gem. Bilbao offers world-class food, affordable Basque Country living, and genuine community at half DC\u2019s cost. The Beckham Law makes taxes manageable for remote workers.',

  pros: [
    'Affordable by European standards (0.52x DC)',
    'Exceptional food culture',
    'Very safe and family-oriented',
    'Excellent public healthcare',
    'Beautiful setting (mountains + coast)',
    'Beckham Law tax benefit (24% flat for 6 years)',
  ],

  cons: [
    'Limited English-speaking career market',
    'Smaller expat community than other European cities',
    'Rainy Atlantic climate',
    'Fewer direct flights to Kenya',
  ],

  dealbreakers: [],

  currency: 'EUR',
  defaultExchangeRate: 0.92,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 6,
    secondaryAge: 12,
    highSchoolAge: 16,
    systemName: 'Spanish system (Basque Country)',
    languageOfInstruction: 'Spanish / Basque (Euskara)',
    curriculumType: 'Spanish national, Basque regional, IB',
    internationalSchoolOptions: ['Colegio Ingles', 'Lauro Ikastola (Basque immersion)'],
    transitionNotes: [
      'Basque Country offers trilingual education (Basque + Spanish + English)',
      'Public preschool available from age 3',
      'Smaller expat community means faster language immersion',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 400,
};
