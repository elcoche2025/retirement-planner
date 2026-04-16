import type { Destination } from '@/types';

export const kenyaNairobi: Destination = {
  id: 'kenya-nairobi',
  name: 'Nairobi, Kenya',
  country: 'Kenya',
  city: 'Nairobi',
  accentColor: 'var(--color-accent-kenya)',
  flag: '\u{1F1F0}\u{1F1EA}',
  timezone: 'Africa/Nairobi',
  utcOffset: 3,
  usTimezoneGap: 8,
  researchDepth: 'deep',

  costOfLiving: {
    monthlyBaseline: 3500,
    monthlyComfortable: 5500,
    internationalSchoolAnnual: 20000,
    healthInsuranceMonthly: 325,
    costMultiplierVsDC: 0.45,
    notes: [
      'International schools range $15K-$25K/yr',
      'Private health insurance $250-$400/mo for family',
      'Gated community housing often included with school employment',
    ],
  },

  taxRegime: {
    incomeTaxRate: 30,
    capitalGainsTax: 5,
    socialCharges: 6,
    usTaxObligation: 'Must still file US taxes; FEIE ($132,900 for 2026) + FTC offsets most',
    treatyBenefits: 'No US-Kenya tax treaty; rely on FEIE and FTC',
    estimatedEffectiveTotalRate: 27,
  },

  housing: {
    rentMonthly2BR: 1600,
    rentMonthly3BR: 2400,
    buyMedianPrice: 265000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      'Kilimani/Westlands 2BR: $1,200-$2,000',
      'Karen/Runda purchase: $180K-$350K',
      'Leasehold for non-citizens (99 years)',
      'Housing often included with international school employment',
    ],
  },

  careerPresets: [
    {
      id: 'kenya-intl-school',
      name: 'International School + Remote',
      description:
        'Mekoce teaches SPED at an international school while Kara works remotely for a US employer.',
      yourRole: 'International school SPED teacher',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 35000,
      karaAnnualIncome: 50000,
      householdAnnualIncome: 85000,
      incomeGrowthRate: 2,
      benefits: [
        'Housing often included',
        'Tuition discount for daughter',
        'Proximity to Nanyuki family',
      ],
      benefitsMonetaryValue: 30000,
      visaCompatible: true,
      notes: ['School typically sponsors work permit'],
      localCurrencyIncome: true,
    },
    {
      id: 'kenya-both-remote',
      name: 'Both Remote US-Based',
      description:
        'Both work remotely for US-based employers, earning US-level income at Kenya cost of living.',
      yourRole: 'Remote SPED consulting/EdTech',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 70000,
      karaAnnualIncome: 50000,
      householdAnnualIncome: 120000,
      incomeGrowthRate: 3,
      benefits: [
        'US-level income at Kenya cost of living',
        'FEIE tax exclusion up to $132,900 (2026)',
      ],
      benefitsMonetaryValue: 5000,
      visaCompatible: true,
      notes: ['Need to structure visa carefully for remote work'],
      localCurrencyIncome: false,
    },
    {
      id: 'kenya-ngo-education',
      name: 'NGO + Education',
      description:
        'Mekoce works in an education NGO focused on disability inclusion; Kara does NGO or remote work.',
      yourRole: 'Education NGO (SPED/inclusion)',
      karaRole: 'NGO or remote work',
      yourAnnualIncome: 30000,
      karaAnnualIncome: 40000,
      householdAnnualIncome: 70000,
      incomeGrowthRate: 2,
      benefits: [
        'Mission-driven work',
        'Housing packages common',
        'Expat community',
        'Meaningful SPED impact',
      ],
      benefitsMonetaryValue: 20000,
      visaCompatible: true,
      notes: ['NGO typically sponsors visa'],
      localCurrencyIncome: true,
    },
  ],

  qolDefaults: {
    familyProximity: 9,
    childEducation: 7,
    languageEnvironment: 7,
    healthcareQuality: 5,
    safety: 4,
    climate: 8,
    culturalFit: 8,
    careerSatisfaction: 6,
    communityBuilding: 7,
    politicalStability: 5,
    adventureNovelty: 9,
    returnFlexibility: 7,
  },

  visa: {
    type: 'Work Permit (Class D/G) or Dependent Pass',
    duration: '1-2 years, renewable',
    renewalProcess: 'Annual renewal through immigration; employer-driven',
    requirements: [
      'Job offer from Kenyan employer',
      'School typically sponsors work permit',
    ],
    processingTime: '4-8 weeks',
    costs: '~$200-500 per person',
    workRights: 'Tied to sponsoring employer',
    spouseWorkRights: 'Dependent pass; separate work permit needed for employment',
    pathToPR: 'Possible after 7+ years continuous residence',
    gotchas: [
      'Work permit tied to specific employer',
      'Renewal can be unpredictable',
      'Dependent pass does not automatically grant work rights',
    ],
  },

  narrative:
    'The heart move. Close to Mekoce\u2019s parents in Nanyuki, raising your daughter with cultural roots, at roughly half the cost of DC living. International schools are excellent and often include housing.',

  pros: [
    'Family proximity \u2014 3hr drive to Nanyuki (main driver)',
    'Cultural immersion for daughter',
    'Low cost of living (0.45x DC)',
    'Adventure lifestyle with safari access',
    'Temperate Nairobi climate (1,600m elevation)',
    'Meaningful SPED work in emerging systems',
  ],

  cons: [
    'Lower income potential',
    'Healthcare limitations for complex needs',
    'Security concerns require gated community lifestyle',
    'Infrastructure challenges',
    'Career ceiling for Kara locally',
  ],

  dealbreakers: [
    'Healthcare access for serious medical emergencies',
  ],

  currency: 'KES',
  defaultExchangeRate: 130,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 6,
    secondaryAge: 14,
    highSchoolAge: 14,
    systemName: 'Kenyan 8-4-4 / CBC system',
    languageOfInstruction: 'English and Swahili',
    curriculumType: 'Kenyan CBC, British, IB (at international schools)',
    internationalSchoolOptions: ['ISK (International School of Kenya)', 'Braeburn', 'Rosslyn Academy'],
    transitionNotes: [
      'International schools teach in English — smooth transition from US',
      'ISK follows American curriculum with IB option',
      'Age 3-5 ideal for dual-language immersion (English + Swahili)',
    ],
  },
  publicSchoolFree: false,
  childcareMonthly: 300,
};
