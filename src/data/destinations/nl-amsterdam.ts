import type { Destination } from '@/types';

export const nlAmsterdam: Destination = {
  id: 'nl-amsterdam',
  name: 'Amsterdam, Netherlands',
  country: 'Netherlands',
  city: 'Amsterdam',
  region: 'North Holland',
  accentColor: 'var(--color-accent-amsterdam)',
  flag: '\u{1F1F3}\u{1F1F1}',
  timezone: 'Europe/Amsterdam',
  utcOffset: 1,
  usTimezoneGap: 6,
  researchDepth: 'moderate',

  costOfLiving: {
    monthlyBaseline: 6500,
    monthlyComfortable: 9000,
    internationalSchoolAnnual: 23000,
    healthInsuranceMonthly: 425,
    costMultiplierVsDC: 0.88,
    notes: [
      'International schools $18K-$28K/yr',
      'Mandatory health insurance: basic ~\u20AC120/person + supplemental',
      'Housing costs approaching DC levels',
      'Nearly as expensive as DC overall',
    ],
  },

  taxRegime: {
    incomeTaxRate: 37,
    capitalGainsTax: 1.4,
    specialRegime: '30% Ruling',
    specialRegimeDetails:
      'Reducing to 27% in 2027; income cap \u20AC262,000 applies to all from 2026',
    usTaxObligation: 'Must still file US taxes; FTC offsets Dutch taxes paid',
    treatyBenefits: 'US-NL tax treaty prevents double taxation',
    estimatedEffectiveTotalRate: 32,
  },

  housing: {
    rentMonthly2BR: 2950,
    rentMonthly3BR: 3650,
    buyMedianPrice: 625000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      '2BR rent: $2,500-$3,400',
      '3BR rent: $3,100-$4,200',
      'Purchase: $550K-$700K',
      'Extremely competitive rental market',
    ],
  },

  careerPresets: [
    {
      id: 'ams-kara-hsm-school',
      name: 'Kara HSM + Mekoce School',
      description:
        'Kara anchors residency through a conventional Amsterdam employer while Mekoce works in an international-school or specialist inclusion role.',
      yourRole: 'International school SEN / inclusion support role',
      karaRole: 'Tech, program, operations, or nonprofit role (HSM-sponsored)',
      yourAnnualIncome: 65000,
      karaAnnualIncome: 90000,
      householdAnnualIncome: 155000,
      incomeGrowthRate: 3,
      benefits: [
        'Kara may qualify for the 30% ruling if recruited from abroad',
        'Access to Amsterdam\u2019s larger job market',
        'Potential school-child discount depending on employer',
        'Spouse full work rights through the primary visa anchor',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 22000,
      visaCompatible: true,
      notes: [
        'This is the most straightforward high-stability Amsterdam scenario for the household.',
        'Higher salary potential in Amsterdam is partly offset by rent and childcare pressure.',
        'Do not assume a full tuition waiver unless an offer explicitly includes one.',
      ],
      localCurrencyIncome: true,
    },
    {
      id: 'ams-kara-daft-school',
      name: 'Kara DAFT + Mekoce School',
      description:
        'Kara uses DAFT to anchor a small business, consultancy, or co-owned project while Mekoce works locally at an Amsterdam-area international school.',
      yourRole: 'International school SEN / inclusion support role',
      karaRole: 'DAFT business owner (consulting, program services, or co-owned project)',
      yourAnnualIncome: 65000,
      karaAnnualIncome: 50000,
      householdAnnualIncome: 115000,
      incomeGrowthRate: 8,
      benefits: [
        'DAFT \u20AC4,500 capital requirement is relatively accessible',
        'Mekoce can use spouse work rights for salaried school work',
        'Room for Kara\u2019s business to scale over time',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 18000,
      visaCompatible: true,
      notes: [
        'Treat the DAFT business path as viable but still exploratory until the actual project structure is defined.',
        'No 30% ruling assumed in this path.',
        'Amsterdam rent pressure makes this less forgiving than the same idea in The Hague.',
      ],
      localCurrencyIncome: true,
    },
    {
      id: 'ams-both-remote',
      name: 'Both Remote from NL Base',
      description:
        'Both continue remote or consulting-style work while using Amsterdam as a base, with residency still needing a compliant legal structure.',
      yourRole: 'Remote SPED / EdTech consulting',
      karaRole: 'Remote operations, strategy, or program work',
      yourAnnualIncome: 80000,
      karaAnnualIncome: 70000,
      householdAnnualIncome: 150000,
      incomeGrowthRate: 4,
      benefits: [
        'Higher income ceiling than local-only roles',
        'Flexibility to keep US-linked clients or employers',
        'Amsterdam remains a strong network base for future opportunities',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 8000,
      visaCompatible: true,
      notes: [
        'Pure remote work still needs a real residency basis; do not treat this as visa-free remote life.',
        'A DAFT-style business wrapper or other qualifying permit may still be necessary even if the income is foreign.',
        'This scenario stays attractive only if both remote roles remain durable enough to offset Amsterdam costs.',
      ],
      localCurrencyIncome: false,
    },
  ],

  qolDefaults: {
    familyProximity: 4,
    childEducation: 9,
    languageEnvironment: 7,
    healthcareQuality: 9,
    safety: 8,
    climate: 4,
    culturalFit: 7,
    careerSatisfaction: 8,
    communityBuilding: 7,
    politicalStability: 8,
    adventureNovelty: 7,
    returnFlexibility: 8,
  },

  visa: {
    type: 'DAFT (Dutch American Friendship Treaty) — primary; or HSM if employer-sponsored',
    duration: '2 years initial, renewable for 5 more',
    renewalProcess: 'Renew if business shows genuine activity. Permanent residency after 5 years.',
    requirements: [
      'DAFT: \u20AC4,500 deposited in Dutch business bank account',
      'DAFT: Register business with KVK (~\u20AC65)',
      'DAFT: No formal business plan required',
      'HSM alternative: Employer must be recognized sponsor, salary \u20AC48,013+/yr',
      'Apostilled birth/marriage certificates',
    ],
    processingTime: '6-8 weeks (DAFT via IND pilot)',
    costs: '\u20AC762 total: \u20AC423 primary + \u20AC254 spouse + \u20AC85 child',
    workRights: 'DAFT: self-employment only. HSM: full employment.',
    spouseWorkRights: 'DAFT spouse: FULL work rights (salaried + self-employed). No separate permit.',
    pathToPR: 'Permanent residency after 5 years. Citizenship at 5 years (generally requires renouncing US citizenship).',
    gotchas: [
      'DAFT holders CANNOT accept salaried work',
      'Housing market extremely competitive — Amsterdam is worst in NL',
      '30% ruling reducing to 27% in 2027',
      'Cost of living nearly matches DC',
      'Need \u20AC50K-\u20AC100K liquidity buffer',
    ],
  },

  narrative:
    'The higher-upside Dutch option. Amsterdam offers broader employer and client markets than The Hague, but the household only comes out ahead if that opportunity premium is strong enough to justify Amsterdam-level housing pressure.',

  pros: [
    'Strong job market with tech hub ecosystem',
    'Employer-sponsored scenarios may qualify for the 30% ruling',
    'International and diverse city',
    'Direct KLM flights to Nairobi',
    'World-class cycling infrastructure',
    'Progressive and welcoming',
  ],

  cons: [
    'Very expensive housing (approaching DC levels)',
    'Gray, rainy weather',
    'Tourist overcrowding',
    'Housing shortage makes finding apartments competitive',
    'Cost of living nearly as high as DC',
  ],

  dealbreakers: [],

  currency: 'EUR',
  defaultExchangeRate: 0.92,
  educationSystem: {
    preschoolAge: 2,
    primaryAge: 4,
    secondaryAge: 12,
    highSchoolAge: 12,
    systemName: 'Dutch basisschool (8 years, age 4-12)',
    languageOfInstruction: 'Dutch (English at international schools)',
    curriculumType: 'IB, American (ISA), British, Dutch national',
    internationalSchoolOptions: ['ISA (International School of Amsterdam)', 'British School of Amsterdam', 'Amsterdam International Community School'],
    transitionNotes: [
      'Basisschool starts at age 4 — completely free',
      'Amsterdam has the most international school options in NL',
      'Childcare subsidized but Amsterdam waitlists can be long',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 700,
};
