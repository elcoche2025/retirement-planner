import type { Destination } from '@/types';

export const uruguayMontevideo: Destination = {
  id: 'uruguay-montevideo',
  name: 'Montevideo, Uruguay',
  country: 'Uruguay',
  city: 'Montevideo',
  accentColor: 'var(--color-accent-montevideo)',
  flag: '\u{1F1FA}\u{1F1FE}',
  timezone: 'America/Montevideo',
  utcOffset: -3,
  usTimezoneGap: 2,
  researchDepth: 'moderate',

  costOfLiving: {
    monthlyBaseline: 3500,
    monthlyComfortable: 5000,
    internationalSchoolAnnual: 14000,
    healthInsuranceMonthly: 300,
    costMultiplierVsDC: 0.52,
    notes: [
      'International schools $10K-$18K/yr',
      'Mutualista health system ~$70-$150/person/mo',
      'Higher cost of living than Colombia/Mexico but lower than DC',
    ],
  },

  taxRegime: {
    incomeTaxRate: 36,
    capitalGainsTax: 12,
    socialCharges: 15,
    specialRegime: 'Tax Holiday 2.0',
    specialRegimeDetails:
      '10-year exemption on foreign-source income for new residents (183-day presence); then 5 years at 6% reduced rate',
    usTaxObligation: 'Must still file US taxes; FEIE + FTC offsets available',
    treatyBenefits: 'No US-Uruguay tax treaty; rely on FEIE and FTC credits',
    estimatedEffectiveTotalRate: 14,
  },

  housing: {
    rentMonthly2BR: 1000,
    rentMonthly3BR: 1500,
    buyMedianPrice: 240000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      'Pocitos/Punta Carretas 2BR: $800-$1,200',
      'Cordon/Parque Rodo 3BR: $900-$1,300',
      'No restrictions on foreign ownership whatsoever',
    ],
  },

  careerPresets: [
    {
      id: 'mvd-remote-dual',
      name: 'Dual Remote (US-Based)',
      description:
        'Both work remotely for US employers, leveraging the extraordinary Tax Holiday 2.0 benefit.',
      yourRole: 'Remote SPED consulting / EdTech',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 70000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 130000,
      incomeGrowthRate: 3,
      benefits: [
        'Tax Holiday = near-zero local tax on foreign income for 10 years',
        'Stable democracy',
        'Direct permanent residency',
      ],
      benefitsMonetaryValue: 5000,
      visaCompatible: true,
      notes: ['Extraordinary tax benefit for remote workers'],
      localCurrencyIncome: false,
    },
    {
      id: 'mvd-school-remote',
      name: 'International School + Remote',
      description:
        'Mekoce teaches at UAS or GEMS; Kara works remotely with Tax Holiday benefits.',
      yourRole: 'UAS or GEMS teacher',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 25000,
      karaAnnualIncome: 85000,
      householdAnnualIncome: 110000,
      incomeGrowthRate: 2,
      benefits: [
        'Tuition discount',
        'Structured life',
        'Tax Holiday benefits on Kara\u2019s remote income',
      ],
      benefitsMonetaryValue: 15000,
      visaCompatible: true,
      notes: ['Local teacher salary $20K-$30K'],
      localCurrencyIncome: true,
    },
    {
      id: 'mvd-entrepreneur',
      name: 'EdTech + Passive Income',
      description:
        'Mekoce builds EdTech products and earns investment income, sheltered by Tax Holiday.',
      yourRole: 'Build EdTech products + investment income',
      karaRole: 'Remote / freelance',
      yourAnnualIncome: 30000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 90000,
      incomeGrowthRate: 10,
      benefits: [
        'Tax Holiday shelters investment income',
        'Free-trade zone companies taxed at 0%',
        'Stable banking system',
      ],
      benefitsMonetaryValue: 3000,
      visaCompatible: true,
      notes: ['Tax-optimized for investment and passive income streams'],
      localCurrencyIncome: false,
    },
  ],

  qolDefaults: {
    familyProximity: 2,
    childEducation: 7,
    languageEnvironment: 8,
    healthcareQuality: 7,
    safety: 7,
    climate: 6,
    culturalFit: 7,
    careerSatisfaction: 5,
    communityBuilding: 6,
    politicalStability: 9,
    adventureNovelty: 7,
    returnFlexibility: 6,
  },

  qolNotes: {
    climate:
      'Humid subtropical on the Río de la Plata estuary — four real seasons (inverted from the northern hemisphere). Southern-hemisphere summers (Dec–Feb) hit 82–86°F with humid sticky nights; winters (Jun–Aug) drop to 42–48°F, damp and windy off the river. Spring and fall are pleasant. Rain spreads year-round; humidity is the defining feature. For Oakland-calibrated tastes: the pattern is closer to a muted Mid-Atlantic US than a Mediterranean mild — miss Oakland\'s dry summers and rare humidity.',
  },

  visa: {
    type: 'Residencia Legal Permanente (direct permanent residency)',
    duration: 'Permanent from day one',
    renewalProcess: 'No renewal needed \u2014 permanent from the start',
    requirements: [
      'Proof of income (~$1,500/mo for family)',
      'Clean criminal record',
      'Health certificate',
      'No minimum investment for income-based route',
    ],
    processingTime: '3-6 months (Uruguay processes are slow)',
    costs: '~$200-400 total in fees',
    workRights: 'Full work rights with permanent residency',
    spouseWorkRights: 'Full work rights \u2014 both get permanent residency',
    pathToPR: 'Permanent from day one; citizenship after 3-5 years',
    gotchas: [
      'Processing is slow (3-6 months)',
      'Must maintain 183-day presence to keep Tax Holiday benefits',
      'Bureaucracy can be frustrating',
      'Small market limits local career options',
    ],
  },

  narrative:
    'The tax-optimized stability play. Uruguay\u2019s new Tax Holiday 2.0 gives you 10 years of near-zero tax on foreign income, combined with South America\u2019s most stable democracy and direct permanent residency. Politically, it\u2019s the \u201CSwitzerland of South America.\u201D',

  pros: [
    '10-year tax holiday on foreign income (extraordinary benefit)',
    'Direct permanent residency from day one',
    'Most stable democracy in South America',
    'Birthright citizenship for children born there',
    'Progressive social policies',
    'No foreign ownership restrictions',
    'Strong banking system',
  ],

  cons: [
    'Furthest from Kenya on this list (28+ hr)',
    'Small city (1.4M) can feel quiet',
    'Higher cost of living than Colombia/Mexico',
    'Limited career market',
    'Underwhelming weather (humid summers, cool winters)',
    'Slow bureaucracy',
  ],

  dealbreakers: [],

  currency: 'UYU',
  defaultExchangeRate: 42,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 6,
    secondaryAge: 12,
    highSchoolAge: 15,
    systemName: 'Uruguayan education system',
    languageOfInstruction: 'Spanish',
    curriculumType: 'Uruguayan national, IB',
    internationalSchoolOptions: ['Uruguayan American School (UAS)', 'GEMS Academy Montevideo', 'British Schools'],
    transitionNotes: [
      'UAS follows American curriculum — smooth transition from US schools',
      'Tax Holiday benefits make international school tuition more affordable',
      'Small but welcoming international community in Montevideo',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 300,
};
