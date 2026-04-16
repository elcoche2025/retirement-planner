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
      id: 'hague-kara-hsm-school',
      name: 'Kara HSM + Mekoce School',
      description:
        'Kara anchors residency through a conventional employer-sponsored role while Mekoce works at an international school or specialist learning-support program.',
      yourRole: 'International school SEN / inclusion support role',
      karaRole: 'Program, operations, nonprofit, or corporate role (HSM-sponsored)',
      yourAnnualIncome: 62000,
      karaAnnualIncome: 78000,
      householdAnnualIncome: 140000,
      incomeGrowthRate: 3,
      benefits: [
        'Kara may qualify for the 30% ruling if recruited from abroad',
        'Stable employer-sponsored residency path',
        'Potential school-child discount depending on employer',
        'Spouse work rights follow the primary visa anchor',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 18000,
      visaCompatible: true,
      notes: [
        'This is the cleanest conventional-employment path for the household.',
        'Do not assume a full tuition waiver unless a school offer explicitly includes one.',
        'Exact HSM salary thresholds and eligibility should be rechecked against current IND guidance.',
      ],
      localCurrencyIncome: true,
    },
    {
      id: 'hague-kara-daft-school',
      name: 'Kara DAFT + Mekoce School',
      description:
        'Kara uses DAFT to anchor a small business, consultancy, or co-owned project while Mekoce works locally at an international school through spouse work rights.',
      yourRole: 'International school SEN / inclusion support role',
      karaRole: 'DAFT business owner (consulting, program services, or co-owned project)',
      yourAnnualIncome: 60000,
      karaAnnualIncome: 45000,
      householdAnnualIncome: 105000,
      incomeGrowthRate: 8,
      benefits: [
        'DAFT requires relatively low startup capital',
        'Mekoce can use spouse work rights for salaried school work',
        'Business upside if Kara\u2019s project gains traction',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 12000,
      visaCompatible: true,
      notes: [
        'Treat Kara\u2019s DAFT income as an early-stage planning assumption rather than a confirmed business case.',
        'DAFT is a self-employment route, so the business structure and client plan need to be real enough to support renewal.',
        'No 30% ruling assumed in this path.',
      ],
      localCurrencyIncome: true,
    },
    {
      id: 'hague-both-remote',
      name: 'Both Remote from NL Base',
      description:
        'Both continue remote or consulting-style work while living in the Netherlands, using a residency path that still needs to be structured carefully.',
      yourRole: 'Remote SPED / EdTech consulting',
      karaRole: 'Remote operations, program, or strategy work',
      yourAnnualIncome: 70000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 130000,
      incomeGrowthRate: 4,
      benefits: [
        'Higher income ceiling than local-only roles',
        'Flexibility to keep US-linked work',
        'Potential to build business assets alongside remote earnings',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 6000,
      visaCompatible: true,
      notes: [
        'Pure remote work still needs a real residency basis; this should not be read as a tourist-style remote-work scenario.',
        'A DAFT-style business wrapper or other qualifying permit may still be needed even if client work stays abroad.',
        'Tax treatment for mixed foreign-remote income should be confirmed with a cross-border specialist.',
      ],
      localCurrencyIncome: false,
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
    type: 'DAFT (Dutch American Friendship Treaty) — primary; or HSM if employer-sponsored',
    duration: '2 years initial, renewable for 5 more',
    renewalProcess: 'Renew if business shows genuine activity. Permanent residency after 5 years.',
    requirements: [
      'DAFT: \u20AC4,500 deposited in Dutch business bank account',
      'DAFT: Register business with KVK (~\u20AC65)',
      'DAFT: No formal business plan required',
      'DAFT: IND informally expects ~\u20AC1,700/mo income from month 7',
      'HSM alternative: Employer must be recognized sponsor, salary \u20AC48,013+/yr',
      'Apostilled birth/marriage certificates',
    ],
    processingTime: '6-8 weeks (IND pilot program)',
    costs: '\u20AC762 total: \u20AC423 primary + \u20AC254 spouse + \u20AC85 child',
    workRights: 'DAFT: self-employment only (no salaried work). HSM: full employment.',
    spouseWorkRights: 'DAFT spouse: FULL work rights — salaried AND self-employed. No separate permit needed.',
    pathToPR: 'Permanent residency after 5 years (A2 Dutch, civic integration exam). Citizenship at 5 years but generally requires renouncing US citizenship.',
    gotchas: [
      'DAFT holders CANNOT accept salaried work — self-employed only',
      'Severe housing shortage (350K-410K homes short) — budget to prepay 6-12 months rent',
      'Need \u20AC50K-\u20AC100K liquidity buffer beyond \u20AC4,500 DAFT minimum',
      '30% ruling reducing to 27% in 2027, may be further limited',
      'Must renounce US citizenship for Dutch citizenship (exceptions exist)',
    ],
  },

  narrative:
    'The pragmatic European choice. The Hague offers strong schools, a manageable Dutch cost base, and multiple realistic ways for this household to structure work and residency without forcing implausible roles.',

  pros: [
    'Employer-sponsored scenarios may qualify for the 30% ruling',
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

  currency: 'EUR',
  defaultExchangeRate: 0.92,
  educationSystem: {
    preschoolAge: 2,
    primaryAge: 4,
    secondaryAge: 12,
    highSchoolAge: 12,
    systemName: 'Dutch basisschool (8 years, age 4-12)',
    languageOfInstruction: 'Dutch (English at international schools)',
    curriculumType: 'IB, American (ASH), British (BSN), Dutch national',
    internationalSchoolOptions: ['ASH (American School of The Hague)', 'BSN (British School)', 'Lighthouse Special Education'],
    transitionNotes: [
      'Basisschool starts at age 4 — completely free',
      'Age 2-4 ideal for Dutch language immersion via kinderdagverblijf',
      'Some international schools offer child-fee discounts when a parent is employed there',
      'Childcare subsidized up to 96% at lower incomes',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 600,
};
