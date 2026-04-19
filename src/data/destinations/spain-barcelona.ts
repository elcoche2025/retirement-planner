import type { Destination } from '@/types';

export const spainBarcelona: Destination = {
  id: 'spain-barcelona',
  name: 'Barcelona, Spain',
  country: 'Spain',
  city: 'Barcelona',
  region: 'Catalonia',
  accentColor: 'var(--color-accent-bilbao)',
  flag: '\u{1F1EA}\u{1F1F8}',
  timezone: 'Europe/Madrid',
  utcOffset: 1,
  usTimezoneGap: 6,
  researchDepth: 'shallow',

  costOfLiving: {
    monthlyEssentials: 2450,
    monthlyComfortable: 3300,
    internationalSchoolAnnual: 14000,
    healthInsuranceMonthly: 200,
    notes: [
      'Essentials (~\u20AC2,250/mo) = groceries (~\u20AC720 with light bio premium) + utilities (~\u20AC157) + internet/mobile (~\u20AC49) + T-Casual transit (~\u20AC22) + household (~\u20AC150) + dining (~\u20AC240) + kid extras (~\u20AC180) + clothing/personal (~\u20AC150).',
      'Organic/non-GMO premium: only ~+$100/mo bump (EU baseline).',
      'Rent tracked separately; BCN 3BR runs \u20AC2,800\u20133,800/mo in central/family neighborhoods (Eixample, Gr\u00E0cia, Sarri\u00E0).',
      'Family private health insurance (Sanitas/Adeslas) \u20AC150\u2013220/mo, similar to Madrid.',
      'International school: BFIS primary \u20AC12,100\u201315,000/yr; first-year ~\u20AC19,930 with entrance fee.',
      'Ownership market is the most expensive of the four Spanish cities (\u20AC6,300/m\u00B2+ in Eixample).',
      'Sources: Numbeo Apr 2026, BFIS fees, Sanitas/Adeslas published rates.',
    ],
  },

  taxRegime: {
    incomeTaxRate: 43,
    capitalGainsTax: 22,
    socialCharges: 6.4,
    specialRegime: 'Beckham Law',
    specialRegimeDetails: '24% flat rate on Spanish income for 6 years',
    usTaxObligation: 'Must still file US taxes; FTC offsets Spanish taxes',
    treatyBenefits: 'US-Spain tax treaty',
    estimatedEffectiveTotalRate: 26,
  },

  housing: {
    rentMonthly2BR: 1900,
    rentMonthly3BR: 2400,
    buyMedianPrice: 425000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      '2BR rent: $1,600-$2,200',
      '3BR rent: $2,000-$2,800',
      'Purchase: $350K-$500K',
      'Very competitive rental market',
    ],
  },

  careerPresets: [
    {
      id: 'bcn-remote-dual',
      name: 'Dual Remote',
      description: 'Both work remotely for US/international employers from Barcelona.',
      yourRole: 'Remote SPED/EdTech',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 60000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 120000,
      incomeGrowthRate: 2.5,
      benefits: [
        'Beckham Law tax benefit',
        'Mediterranean lifestyle',
        'Beach + city combo',
        'Growing tech hub',
      ],
      benefitsMonetaryValue: 8000,
      visaCompatible: true,
      notes: ['Digital Nomad Visa required for remote work'],
      localCurrencyIncome: false,
    },
    {
      id: 'bcn-tech-school',
      name: 'Tech + International School',
      description: 'Mekoce teaches at an international school; Kara joins Barcelona\u2019s tech scene.',
      yourRole: 'International school teacher',
      karaRole: 'Tech/startup role',
      yourAnnualIncome: 30000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 90000,
      incomeGrowthRate: 2.5,
      benefits: [
        'Growing Barcelona tech scene',
        'Mediterranean climate',
        'Tuition discount possible',
      ],
      benefitsMonetaryValue: 12000,
      visaCompatible: true,
      notes: ['School sponsorship for work visa'],
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
    politicalStability: 7,
    adventureNovelty: 8,
    returnFlexibility: 7,
  },

  qolNotes: {
    climate:
      'Mediterranean, sunny, moderated by the sea. Winters (Dec–Feb) are the sweet spot: 40–60°F, mostly dry, crisp — very pleasant. Shoulder seasons (Apr–May, Sep–Oct) are close to perfect. The catch is Jul–Aug: highs 83–86°F paired with humid Mediterranean nights that don\'t cool off, and most older apartments lack AC. Rain clusters in spring and fall; ~2,500 sun hours/yr. For Oakland-calibrated tastes: eight months excellent, two months genuinely uncomfortable.',
  },

  visa: {
    type: 'Digital Nomad Visa or Non-Lucrative Visa',
    duration: '1-3 years',
    renewalProcess: 'Renew at local immigration office',
    requirements: [
      'Same as Bilbao (Spain-wide): DNV \u20AC2,849/mo',
      'NLV ~\u20AC28,800/yr passive income',
    ],
    processingTime: '1-3 months',
    costs: '~\u20AC80-280',
    workRights: 'DNV: remote work for foreign employer',
    spouseWorkRights: 'Family reunification; spouse can apply for work authorization',
    pathToPR: 'Permanent residency after 5 years',
    gotchas: [
      'Most expensive Spanish city on this list',
      'Catalan language adds complexity',
      'Tourist overcrowding in central areas',
      'Rental market very competitive',
    ],
  },

  narrative:
    'The Mediterranean dream. Barcelona delivers beach, culture, food, and a growing tech scene at 60% of DC costs. More expensive than other Spanish cities but with far more energy and career opportunities.',

  pros: [
    'Mediterranean climate (warm, sunny)',
    'Beach + city lifestyle',
    'International community',
    'Growing tech scene',
    'Beckham Law tax benefit',
    'Excellent international schools',
  ],

  cons: [
    'Most expensive Spanish city on this list',
    'Tourist overcrowding',
    'Rental market very competitive',
    'Catalan language adds complexity',
    'Cost rising fast',
  ],

  dealbreakers: [],

  currency: 'EUR',
  defaultExchangeRate: 0.92,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 6,
    secondaryAge: 12,
    highSchoolAge: 16,
    systemName: 'Spanish system (Catalonia)',
    languageOfInstruction: 'Spanish / Catalan',
    curriculumType: 'Spanish national, Catalan regional, IB',
    internationalSchoolOptions: ['Benjamin Franklin International School', 'American School of Barcelona', 'British School of Barcelona'],
    transitionNotes: [
      'Catalan is the primary language of instruction in public schools',
      'International schools teach in English with Spanish/Catalan',
      'Large expat community provides transition support networks',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 450,
};
