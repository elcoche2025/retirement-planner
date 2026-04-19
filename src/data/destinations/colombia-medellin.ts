import type { Destination } from '@/types';

export const colombiaMedellin: Destination = {
  id: 'colombia-medellin',
  name: 'Medell\u00EDn, Colombia',
  country: 'Colombia',
  city: 'Medell\u00EDn',
  region: 'Antioquia',
  accentColor: 'var(--color-accent-medellin)',
  flag: '\u{1F1E8}\u{1F1F4}',
  timezone: 'America/Bogota',
  utcOffset: -5,
  usTimezoneGap: 0,
  researchDepth: 'moderate',

  costOfLiving: {
    monthlyEssentials: 2150,
    monthlyComfortable: 2850,
    internationalSchoolAnnual: 9000,
    healthInsuranceMonthly: 280,
    notes: [
      'Essentials (~COP 9M/mo) = groceries (~\\$700 organic-leaning, Carulla Wong / \u00C9xito Premium / specialty stores; mainstream Colombian supply chain includes GMO Mon810 corn) + utilities (~\\$140) + Metro+Uber mix (~\\$160) + part-time cleaner (~\\$250) + dining (~\\$250) + kid extras (~\\$100) + household (~\\$100) + clothing/personal (~\\$150) + buffer. Higher with full-time nanny (~+\\$250).',
      'Organic/non-GMO premium: ~+$250/mo. Colombia permits GMO corn (Mon810) and uses chemicals US-organic households would avoid; organic = Carulla Wong / specialty / farmer\u2019s markets at heavy markup.',
      'Rent tracked separately; Poblado 3BR runs \\$1,500\u20132,000 furnished, Laureles \\$1,100\u20131,600 unfurnished.',
      'Health insurance: EPS contributory + Plan Complementario \\$200\u2013350/mo for family of 3; full prepagada (ColSanitas/SURA premium) \\$300\u2013400/mo.',
      'International school: TCS (Columbus School, Envigado, IB-accredited) ~\\$6,000\u20139,000/yr primary; Vermont/Canadian School \\$5,000\u201310,000/yr. Top-tier secondary trends higher.',
      'Sources: Numbeo Apr 2026, Medell\u00EDn Advisors COL guide, Medell\u00EDn Guru insurance overview.',
    ],
  },

  taxRegime: {
    incomeTaxRate: 39,
    capitalGainsTax: 15,
    socialCharges: 8,
    usTaxObligation: 'Must still file US taxes; FEIE + FTC offsets available',
    estimatedEffectiveTotalRate: 29,
  },

  housing: {
    rentMonthly2BR: 950,
    rentMonthly3BR: 1400,
    buyMedianPrice: 175000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      'Laureles 2BR: $700-$1,200',
      'El Poblado 2BR: $900-$1,600',
      'El Poblado 3BR: $1,400-$2,500',
      'No restrictions on foreign ownership \u2014 same process as Colombians',
    ],
  },

  careerPresets: [
    {
      id: 'med-remote-dual',
      name: 'Dual Remote (US-Based)',
      description:
        'Both work remotely for US employers at 40% of DC costs with eternal spring climate.',
      yourRole: 'Remote SPED consulting / EdTech',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 70000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 130000,
      incomeGrowthRate: 3,
      benefits: [
        'US income at 40% DC costs',
        'Eternal spring climate',
        'Growing tech scene',
      ],
      benefitsMonetaryValue: 5000,
      visaCompatible: true,
      notes: ['Digital Nomad Visa (Type V)'],
      localCurrencyIncome: false,
    },
    {
      id: 'med-school-remote',
      name: 'International School + Remote',
      description:
        'Mekoce teaches at Columbus School or TCS; Kara works remotely as income anchor.',
      yourRole: 'Columbus School or TCS teacher',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 27000,
      karaAnnualIncome: 83000,
      householdAnnualIncome: 110000,
      incomeGrowthRate: 2.5,
      benefits: [
        'Tuition discount',
        'Structured schedule',
        'Kara\u2019s income is the anchor',
      ],
      benefitsMonetaryValue: 12000,
      visaCompatible: true,
      notes: ['Local teacher salary $20K-$35K'],
      localCurrencyIncome: true,
    },
    {
      id: 'med-entrepreneur',
      name: 'EdTech Entrepreneur + Remote',
      description:
        'Mekoce expands IEP Pulse into LatAm; Kara works remotely.',
      yourRole: 'IEP Pulse LatAm expansion / SPED consulting',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 25000,
      karaAnnualIncome: 70000,
      householdAnnualIncome: 95000,
      incomeGrowthRate: 12,
      benefits: [
        'Growing EdTech ecosystem',
        'Low burn rate',
        'Medell\u00EDn has startup culture',
      ],
      benefitsMonetaryValue: 3000,
      visaCompatible: true,
      notes: ['High growth potential; Medell\u00EDn is a startup hub'],
      localCurrencyIncome: false,
    },
  ],

  qolDefaults: {
    familyProximity: 3,
    childEducation: 7,
    languageEnvironment: 9,
    healthcareQuality: 8,
    safety: 5,
    climate: 9,
    culturalFit: 8,
    careerSatisfaction: 6,
    communityBuilding: 8,
    politicalStability: 5,
    adventureNovelty: 9,
    returnFlexibility: 7,
  },

  qolNotes: {
    climate:
      'The "City of Eternal Spring" at 1,495m elevation in the Aburrá Valley. Remarkably consistent year-round: daytime highs 78–82°F, nighttime lows 60–65°F, no seasons in the traditional sense. Two rainy seasons (Apr–May, Sep–Nov) bring predictable afternoon showers; mornings usually clear. Humidity is moderate but present. For Oakland-calibrated tastes: slightly warmer and more humid than Oakland\'s coastal cool, but the lack of seasonal variation and the reliable "sweater in the evening" pattern is probably the closest year-round match on the list.',
  },

  visa: {
    type: 'Digital Nomad Visa (Type V)',
    duration: 'Up to 2 years',
    renewalProcess: 'Apply for new visa or convert to resident visa',
    requirements: [
      'Remote income from foreign sources',
      '~$1,435/mo minimum (3x minimum wage 2026)',
      'Health insurance',
      'Clean criminal record',
    ],
    processingTime: 'Up to 30 business days',
    costs: '~$177 study fee + ~$232 visa issuance',
    workRights: 'Remote work for foreign employers only',
    spouseWorkRights: 'Beneficiary visa; separate work permit for local employment',
    pathToPR: 'Resident visa after 2+ years; citizenship after 5 years of residence',
    gotchas: [
      '183-day presence triggers Colombian tax residency on worldwide income',
      'Colombian tax rates can be steep at higher brackets (up to 39%)',
      'Digital Nomad Visa only allows remote work for foreign employers',
    ],
  },

  narrative:
    'The lifestyle optimizer. Medell\u00EDn\u2019s perfect climate, excellent healthcare, and rock-bottom costs make it the sweet spot between adventure and comfort. At 40% of DC costs, your savings rate could be extraordinary.',

  pros: [
    'Best climate on the list (eternal spring, 70-80\u00B0F year-round)',
    'Excellent private healthcare (medical tourism hub)',
    'Very low cost of living (0.40x DC)',
    'Warm, welcoming culture',
    'Growing tech ecosystem',
    'No foreign ownership restrictions',
    'Easy digital nomad visa',
  ],

  cons: [
    'Distance from Kenya (22+ hr, 2+ flights)',
    '183-day tax residency triggers steep rates on worldwide income',
    'Safety requires neighborhood awareness',
    'Colombian bureaucracy',
    'Limited top-tier international school options compared to CDMX',
  ],

  dealbreakers: [],

  currency: 'COP',
  defaultExchangeRate: 4200,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 6,
    secondaryAge: 11,
    highSchoolAge: 15,
    systemName: 'Colombian education system',
    languageOfInstruction: 'Spanish',
    curriculumType: 'Colombian national, IB',
    internationalSchoolOptions: ['Columbus School', 'The Columbus School (TCS)', 'Colegio Montessori'],
    transitionNotes: [
      'Columbus School follows American curriculum with IB option',
      'Several bilingual schools offer English-Spanish instruction',
      'Medellin has a growing international family community',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 200,
};
