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
      id: 'ams-daft-isa',
      name: 'DAFT Business + Kara at ISA',
      description:
        'Mekoce on DAFT visa running IEP Pulse + consulting. Kara teaches at International School of Amsterdam.',
      yourRole: 'DAFT self-employed: IEP Pulse SaaS + SEN consulting',
      karaRole: 'Teacher at ISA (\u20AC60K-\u20AC71K, median \u20AC63K)',
      yourAnnualIncome: 35000,
      karaAnnualIncome: 68000,
      householdAnnualIncome: 103000,
      incomeGrowthRate: 12,
      benefits: [
        'Kara qualifies for 30% ruling',
        'ISA tuition discount for staff children',
        'DAFT requires only \u20AC4,500 capital',
        'Spouse full work rights',
        'EU healthcare',
        'No US SE tax (totalization agreement)',
      ],
      benefitsMonetaryValue: 22000,
      visaCompatible: true,
      notes: [
        'Your Year 1 income conservative (ramp-up). Year 2: ~$50K. Year 3: ~$80K.',
        'ISA salary lower than ASH. Range: \u20AC60K-\u20AC71K.',
        'Amsterdam COL significantly higher than The Hague.',
      ],
    },
    {
      id: 'ams-daft-tech',
      name: 'DAFT Business + Kara in Tech',
      description:
        'Mekoce on DAFT with IEP Pulse. Kara leverages Amsterdam\u2019s tech ecosystem (Booking, Adyen, startups).',
      yourRole: 'DAFT self-employed: IEP Pulse SaaS + SEN consulting',
      karaRole: 'Tech company role (Booking.com, Adyen, startup)',
      yourAnnualIncome: 35000,
      karaAnnualIncome: 75000,
      householdAnnualIncome: 110000,
      incomeGrowthRate: 10,
      benefits: [
        'Kara qualifies for 30% ruling',
        'Access to Amsterdam tech ecosystem',
        'DAFT \u20AC4,500 capital',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 18000,
      visaCompatible: true,
      notes: [
        'Amsterdam is a major European tech hub.',
        'Kara needs HSM visa qualification through employer (salary \u20AC48K+).',
        'Higher COL than Hague offsets higher Kara salary.',
      ],
    },
    {
      id: 'ams-both-schools',
      name: 'Both at International Schools',
      description:
        'Both teach at Amsterdam-area international schools. Requires HSM visa.',
      yourRole: 'SPED teacher at ISA or British School (\u20AC55K-\u20AC70K)',
      karaRole: 'Teacher at ISA or Amsterdam intl school (\u20AC55K-\u20AC70K)',
      yourAnnualIncome: 65000,
      karaAnnualIncome: 68000,
      householdAnnualIncome: 133000,
      incomeGrowthRate: 2.5,
      benefits: [
        'Both may qualify for 30% ruling',
        'Tuition waiver/discount for daughter',
        'Stable dual income',
        'EU healthcare',
      ],
      benefitsMonetaryValue: 25000,
      visaCompatible: true,
      notes: [
        'Requires employer-sponsored HSM visa (not DAFT).',
        'Stable but no IEP Pulse business growth.',
      ],
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
