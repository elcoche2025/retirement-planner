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
    monthlyEssentials: 2580,
    monthlyComfortable: 3500,
    internationalSchoolAnnual: 13000,
    healthInsuranceMonthly: 200,
    notes: [
      'Essentials (~\u20AC2,365/mo) = groceries (~\u20AC735 with light bio premium) + utilities (~\u20AC177) + internet/mobile (~\u20AC46) + Metro pass (~\u20AC35) + household (~\u20AC150) + dining (~\u20AC250) + kid extras (~\u20AC180) + clothing/personal (~\u20AC150). Madrid Metro is unusually cheap due to subsidized passes.',
      'Organic/non-GMO premium: only ~+$100/mo bump (EU regulatory baseline already cleaner than US conventional).',
      'Rent tracked separately via housing.rentMonthly3BR; Chamber\u00ED/Chamart\u00EDn 3BR runs \u20AC2,800\u20133,500/mo.',
      'Family private health insurance (Sanitas/Adeslas) \u20AC150\u2013220/mo for couple + child on mid-tier plan.',
      'International school: ASM K1\u2013K3 \u20AC11,593\u201312,050/yr; G1\u20132 \u20AC16,267/yr; G3\u20134 \u20AC18,263/yr.',
      'Sources: Numbeo Apr 2026, ASM fees page, Sanitas/Adeslas published rates.',
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
    climate: 5,
    culturalFit: 8,
    careerSatisfaction: 7,
    communityBuilding: 7,
    politicalStability: 8,
    adventureNovelty: 7,
    returnFlexibility: 8,
  },

  qolNotes: {
    climate:
      'Continental Mediterranean on the inland plateau (~650m elevation, no coastal buffer). Hot dry summers Jul–Aug routinely hit 90–95°F with 100°F+ spikes; winters Dec–Feb drop to 30–38°F with occasional snow. Spring and fall (50–75°F) are brilliant. Very dry year-round with ~2,800 sun hours — great light, but the seasonal swing is larger than anywhere on the Spanish coast. For Oakland-calibrated tastes: the extremes cut both ways; not a mild climate by any measure.',
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
