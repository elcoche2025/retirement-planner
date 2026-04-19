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
    monthlyEssentials: 2150,
    monthlyComfortable: 2900,
    internationalSchoolAnnual: 8800,
    healthInsuranceMonthly: 180,
    notes: [
      'Essentials (~\u20AC1,975/mo) = groceries (~\u20AC640 with light bio premium) + utilities (~\u20AC128) + internet/mobile (~\u20AC45) + transit pass (~\u20AC45) + household (~\u20AC120) + dining (~\u20AC230, pintxos culture) + kid extras (~\u20AC150) + clothing/personal (~\u20AC130).',
      'Organic/non-GMO premium: only ~+$100/mo bump (EU baseline; Basque Country has good local farm-to-table supply that helps).',
      'Rent tracked separately; Bilbao 3BR runs \u20AC1,500\u20132,200/mo (Indautxu/Abando premium).',
      'Family private health insurance \u20AC140\u2013200/mo (Basque region not premium-priced).',
      'International school: ASOB nursery\u2013K \u20AC7,087\u20137,813/yr; G1\u20136 \u20AC8,619\u20139,777/yr. Smaller IB program than ASM/BFIS.',
      'Per-sqm ownership is high relative to city size (\u20AC3,889/m\u00B2 citywide, \u20AC5,000+ in Indautxu).',
      'Sources: Numbeo Apr 2026, ASOB fees, Idealista listings.',
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
    climate: 6,
    culturalFit: 8,
    careerSatisfaction: 5,
    communityBuilding: 7,
    politicalStability: 8,
    adventureNovelty: 8,
    returnFlexibility: 7,
  },

  qolNotes: {
    climate:
      'Oceanic / Atlantic — Spain\'s greenest region for a reason. Temperatures are the best part: summers (Jun–Aug) 70–75°F, winters (Dec–Feb) 40–45°F, almost no extremes. But rainfall is the defining feature — ~1,200mm/yr spread across ~180 rainy days, more than twice Oakland\'s. Expect stretches of gray drizzle in any month. For Oakland-calibrated tastes: the thermal range is a match, but the wetness is a serious trade-off.',
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
