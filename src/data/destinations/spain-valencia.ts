import type { Destination } from '@/types';

export const spainValencia: Destination = {
  id: 'spain-valencia',
  name: 'Valencia, Spain',
  country: 'Spain',
  city: 'Valencia',
  region: 'Valencian Community',
  accentColor: 'var(--color-accent-bilbao)',
  flag: '\u{1F1EA}\u{1F1F8}',
  timezone: 'Europe/Madrid',
  utcOffset: 1,
  usTimezoneGap: 6,
  researchDepth: 'shallow',

  costOfLiving: {
    monthlyEssentials: 2050,
    monthlyComfortable: 2800,
    internationalSchoolAnnual: 8000,
    healthInsuranceMonthly: 180,
    notes: [
      'Essentials (~\u20AC1,880/mo) = groceries (~\u20AC620 with light bio premium) + utilities (~\u20AC142) + internet/mobile (~\u20AC49) + transit pass (~\u20AC30) + household (~\u20AC120) + dining (~\u20AC215) + kid extras (~\u20AC150) + clothing/personal (~\u20AC130). 15\u201320% cheaper than Madrid on day-to-day.',
      'Organic/non-GMO premium: only ~+$100/mo bump (EU baseline).',
      'Rent tracked separately; Valencia 3BR runs \u20AC1,600\u20132,200/mo in central/Ruzafa.',
      'Family private health insurance \u20AC140\u2013200/mo (slightly cheaper than Madrid/BCN).',
      'International school: ASV K1\u2013K3 \u20AC7,246/yr; G1\u20135 \u20AC7,687/yr. Notably cheaper than Madrid/BCN; first-year extras \u20AC5,325.',
      'Sources: Numbeo Apr 2026, ASV admissions page.',
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
    rentMonthly2BR: 1250,
    rentMonthly3BR: 1600,
    buyMedianPrice: 260000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      '2BR rent: $1,000-$1,500',
      '3BR rent: $1,300-$1,900',
      'Purchase: $200K-$320K',
    ],
  },

  careerPresets: [
    {
      id: 'val-remote-dual',
      name: 'Dual Remote',
      description: 'Both work remotely, maximizing US income against Valencia\u2019s low costs.',
      yourRole: 'Remote SPED/EdTech',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 60000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 120000,
      incomeGrowthRate: 2.5,
      benefits: [
        'Beckham Law tax benefit',
        'Beach lifestyle',
        'Cheapest Spanish city on this list',
      ],
      benefitsMonetaryValue: 8000,
      visaCompatible: true,
      notes: ['Digital Nomad Visa for remote work'],
      localCurrencyIncome: false,
    },
    {
      id: 'val-school-remote',
      name: 'Local School + Remote',
      description: 'Mekoce teaches at a bilingual school; Kara works remotely.',
      yourRole: 'Bilingual school or language academy',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 40000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 100000,
      incomeGrowthRate: 2,
      benefits: [
        'Beach + affordability',
        'Daughter in bilingual school',
        'Free public preschool',
      ],
      benefitsMonetaryValue: 10000,
      visaCompatible: true,
      notes: ['Local school salary is lower but cost of living is very low'],
      localCurrencyIncome: false,
    },
  ],

  qolDefaults: {
    familyProximity: 4,
    childEducation: 7,
    languageEnvironment: 9,
    healthcareQuality: 8,
    safety: 8,
    climate: 7,
    culturalFit: 8,
    careerSatisfaction: 5,
    communityBuilding: 7,
    politicalStability: 8,
    adventureNovelty: 7,
    returnFlexibility: 6,
  },

  qolNotes: {
    climate:
      'Mediterranean coastal — the reputation as "best climate in Spain" is largely earned. 300+ sunny days a year, winters (Dec–Feb) stay 45–60°F (locals wear jackets; Oakland ears would call it pleasant), shoulder seasons lovely. The dent in the score is Jul–Aug: highs 84–88°F with humid coastal nights, and the Mediterranean sea heat-sinks through September. Cooler and breezier than Barcelona, drier than Bilbao. For Oakland-calibrated tastes: very close, but summer humidity drops it below Oakland\'s dry-summer perfection.',
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
      'Smallest job market of the Spanish cities',
      'Fewer international school options',
      'Airport less connected internationally',
      'Recent catastrophic flooding risk (2024)',
    ],
  },

  narrative:
    'The value-Mediterranean pick. Valencia gives you Barcelona\u2019s beach lifestyle at Bilbao\u2019s prices, plus Spain\u2019s best weather. If career ambition takes a back seat to quality of life, this is the winner.',

  pros: [
    'Cheapest beach city in Spain',
    'Excellent climate (300+ sunny days)',
    'Free public preschool',
    'Paella capital of the world',
    'Beckham Law tax benefit',
    'Affordable housing',
    'Growing digital nomad community',
  ],

  cons: [
    'Smallest job market of the Spanish cities',
    'Fewer international school options',
    'Airport less connected internationally',
    'Can feel sleepy compared to Barcelona/Madrid',
    'Catastrophic flooding risk (2024 event)',
  ],

  dealbreakers: [],

  currency: 'EUR',
  defaultExchangeRate: 0.92,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 6,
    secondaryAge: 12,
    highSchoolAge: 16,
    systemName: 'Spanish system (Valencia)',
    languageOfInstruction: 'Spanish / Valencian',
    curriculumType: 'Spanish national, Valencian regional, IB',
    internationalSchoolOptions: ['American School of Valencia', 'Caxton College', 'Cambridge House'],
    transitionNotes: [
      'Free public preschool available from age 3',
      'Valencian (similar to Catalan) used alongside Spanish in public schools',
      'Growing digital nomad family community eases transition',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 350,
};
