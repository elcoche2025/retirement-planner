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
      id: 'hague-daft-ash',
      name: 'DAFT Business + Kara at ASH',
      description:
        'Mekoce on DAFT visa running IEP Pulse + SEN consulting. Kara teaches at American School of The Hague (highest-paying intl school in NL).',
      yourRole: 'DAFT self-employed: IEP Pulse SaaS + SEN consulting',
      karaRole: 'SPED/English teacher at ASH (\u20AC68K-\u20AC80K)',
      yourAnnualIncome: 35000,
      karaAnnualIncome: 81000,
      householdAnnualIncome: 116000,
      incomeGrowthRate: 12,
      benefits: [
        'ASH tuition waiver for daughter (saves $20K+/yr)',
        'Kara qualifies for 30% ruling (recruited from abroad)',
        'DAFT only requires \u20AC4,500 capital',
        'Spouse of DAFT holder has full work rights',
        'EU healthcare',
        'No US self-employment tax (totalization agreement)',
      ],
      benefitsMonetaryValue: 28000,
      visaCompatible: true,
      notes: [
        'Your Year 1 income is conservative (IEP Pulse + consulting ramp-up). Year 2: ~$50K. Year 3: ~$80K.',
        'Kara\u2019s salary is ASH median \u20AC75K ($81K). Range: \u20AC68K-\u20AC80K.',
        'DAFT holders can ONLY be self-employed. Cannot accept salaried work.',
      ],
      localCurrencyIncome: true,
    },
    {
      id: 'hague-daft-kara-independent',
      name: 'DAFT Business + Kara Independent',
      description:
        'Both self-employed. Mekoce on DAFT with IEP Pulse. Kara freelances or tutors (no salaried anchor).',
      yourRole: 'DAFT self-employed: IEP Pulse SaaS + SEN consulting',
      karaRole: 'Freelance tutoring/consulting',
      yourAnnualIncome: 35000,
      karaAnnualIncome: 30000,
      householdAnnualIncome: 65000,
      incomeGrowthRate: 15,
      benefits: [
        'Maximum flexibility',
        'Both build equity in own businesses',
        'DAFT \u20AC4,500 capital requirement',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 5000,
      visaCompatible: true,
      notes: [
        'Higher risk, slower start. Requires larger savings runway (\u20AC50K-\u20AC100K buffer recommended).',
        'No 30% ruling (applies to salaried employees only).',
        'No tuition waiver without ASH employment.',
      ],
      localCurrencyIncome: false,
    },
    {
      id: 'hague-both-schools',
      name: 'Both at International Schools',
      description:
        'Both teach at international schools in The Hague area. Requires HSM visa (not DAFT).',
      yourRole: 'SPED teacher at ASH or Lighthouse (\u20AC60K-\u20AC75K)',
      karaRole: 'Teacher at ASH or British School (\u20AC55K-\u20AC75K)',
      yourAnnualIncome: 70000,
      karaAnnualIncome: 75000,
      householdAnnualIncome: 145000,
      incomeGrowthRate: 2.5,
      benefits: [
        'Both may qualify for 30% ruling',
        'Tuition waiver for daughter',
        'Stable dual income from day one',
        'Summer breaks aligned',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 30000,
      visaCompatible: true,
      notes: [
        'Requires employer-sponsored HSM visa (not DAFT).',
        'ASH actively recruits SPED teachers. 8+ SEN positions listed in current postings.',
        'Highest stable income but no IEP Pulse business growth.',
      ],
      localCurrencyIncome: true,
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
      'ASH tuition waiver if Kara is employed there',
      'Childcare subsidized up to 96% at lower incomes',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 600,
};
