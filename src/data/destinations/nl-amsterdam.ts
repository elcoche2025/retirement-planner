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
      id: 'ams-tech-school',
      name: 'Tech/EdTech + International School',
      description:
        'Mekoce teaches or works in EdTech; Kara joins Amsterdam\u2019s thriving tech ecosystem.',
      yourRole: 'International school SPED teacher or EdTech role',
      karaRole: 'Tech company / startup',
      yourAnnualIncome: 50000,
      karaAnnualIncome: 70000,
      householdAnnualIncome: 120000,
      incomeGrowthRate: 3,
      benefits: [
        '30% ruling tax benefit',
        'Startup ecosystem',
        'International community',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 18000,
      visaCompatible: true,
      notes: ['Amsterdam is a major European tech hub'],
    },
    {
      id: 'ams-hsm-dual',
      name: 'Dual Highly Skilled Migrant',
      description:
        'Both qualify for HSM visas with high-earning corporate roles.',
      yourRole: 'EdTech / inclusion consultancy',
      karaRole: 'Corporate (Booking.com, Adyen, etc.)',
      yourAnnualIncome: 55000,
      karaAnnualIncome: 75000,
      householdAnnualIncome: 130000,
      incomeGrowthRate: 3,
      benefits: [
        'Both qualify for 30% ruling',
        'High earning potential',
        'Canal-side living',
      ],
      benefitsMonetaryValue: 22000,
      visaCompatible: true,
      notes: ['Highest earning potential in Europe on this list'],
    },
    {
      id: 'ams-remote-plus',
      name: 'Remote US + Local Part-Time',
      description:
        'Both work primarily remote for US employers with optional local freelance.',
      yourRole: 'Remote SPED consulting',
      karaRole: 'Remote US-based work + local freelance',
      yourAnnualIncome: 55000,
      karaAnnualIncome: 55000,
      householdAnnualIncome: 110000,
      incomeGrowthRate: 2.5,
      benefits: [
        'US income levels',
        'Amsterdam lifestyle',
        'FEIE potential',
      ],
      benefitsMonetaryValue: 10000,
      visaCompatible: true,
      notes: ['Visa structure needs careful planning for remote work'],
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
    type: 'Highly Skilled Migrant (HSM)',
    duration: '5 years, renewable',
    renewalProcess: 'Employer-driven; permanent residency after 5 years',
    requirements: [
      'Employer must be recognized sponsor',
      'Salary threshold \u20AC48,013/yr (2026)',
      'Master\u2019s under-30 threshold \u20AC36,497',
    ],
    processingTime: '2-4 weeks',
    costs: '~\u20AC350 per person',
    workRights: 'Full work rights with HSM permit',
    spouseWorkRights: 'Full work rights for spouse',
    pathToPR: 'Permanent residency after 5 years',
    gotchas: [
      'Housing market extremely competitive',
      '30% ruling being reduced \u2014 27% cap in 2027',
      'Tourist overcrowding in city center',
      'Cost of living nearly matches DC',
    ],
  },

  narrative:
    'The career-maximizing European option. Amsterdam\u2019s tech ecosystem and international companies offer the highest earning potential in Europe, plus the 30% ruling softens the tax blow. More expensive than The Hague but more vibrant.',

  pros: [
    'Strong job market with tech hub ecosystem',
    '30% ruling tax benefit',
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
};
