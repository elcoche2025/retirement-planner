import type { Destination } from '@/types';

export const mexicoOaxaca: Destination = {
  id: 'mexico-oaxaca',
  name: 'Oaxaca, Mexico',
  country: 'Mexico',
  city: 'Oaxaca de Ju\u00E1rez',
  region: 'Oaxaca',
  accentColor: 'var(--color-accent-oaxaca)',
  flag: '\u{1F1F2}\u{1F1FD}',
  timezone: 'America/Mexico_City',
  utcOffset: -6,
  usTimezoneGap: 1,
  researchDepth: 'shallow',

  costOfLiving: {
    monthlyEssentials: 2200,
    monthlyComfortable: 2900,
    internationalSchoolAnnual: 4200,
    healthInsuranceMonthly: 380,
    notes: [
      'Essentials (~MXN 38,500/mo) = groceries (~\\$650, supplemented by Pochote organic market + local sustainable farms) + utilities (~\\$120, mild climate, low A/C) + transit (~\\$120, taxis or modest car) + household help (~\\$130) + dining (~\\$300, lots of street food) + kid extras (~\\$150) + household (~\\$130) + clothing/personal (~\\$100) + buffer.',
      'Organic/non-GMO premium: ~+$200/mo. Pochote organic market and Etla-area farms make local organic accessible at lower premium than CDMX; some imports still needed for specialty items.',
      'Rent tracked separately; Centro/Reforma 3BR runs MXN 18,000\u201330,000/mo (~\\$1,030\u20131,715).',
      'Health insurance: same national AXA/GNP product as CDMX (~\\$300\u2013480/mo); Oaxaca network is thinner so some expats pick plans with CDMX/Guadalajara hospital access.',
      'No true international school: best private bilingual options (Colegio La Paz, etc.) MXN 36,000\u201396,000/yr (~\\$2,000\u20135,500). English-instruction quality and accreditation noticeably below ASF.',
      'Sources: Expatistan Mar 2026, Real Estate Oaxaca, ExpatExchange schools guide.',
    ],
  },

  taxRegime: {
    incomeTaxRate: 35,
    capitalGainsTax: 35,
    socialCharges: 2,
    specialRegime: 'FEIE shelter',
    specialRegimeDetails: 'Same federal Mexican tax law as CDMX',
    usTaxObligation: 'Must still file US taxes; FEIE + FTC offsets available',
    estimatedEffectiveTotalRate: 24,
  },

  housing: {
    rentMonthly2BR: 700,
    rentMonthly3BR: 1150,
    buyMedianPrice: 170000,
    mortgageAvailable: true,
    foreignOwnershipAllowed: true,
    notes: [
      'Centro/Jalatlaco 2BR: $500-$900',
      'Outer areas (Xoxocotlan): $250-$500 for 2BR',
      'Purchase: $120K-$220K',
      'Oaxaca City is outside restricted zone',
    ],
  },

  careerPresets: [
    {
      id: 'oaxaca-remote-dual',
      name: 'Dual Remote (US-Based)',
      description:
        'Both work remotely for US employers, maximizing the extreme cost differential.',
      yourRole: 'Remote SPED consulting / EdTech / writing',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 60000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 120000,
      incomeGrowthRate: 2.5,
      benefits: [
        'US income at extremely low costs',
        'Artistic community',
        'Slow living',
      ],
      benefitsMonetaryValue: 3000,
      visaCompatible: true,
      notes: ['Highest potential savings rate on this list'],
      localCurrencyIncome: false,
    },
    {
      id: 'oaxaca-creative-remote',
      name: 'Creative + Remote',
      description:
        'Mekoce focuses on writing and part-time remote SPED work; Kara anchors income remotely.',
      yourRole: 'Writing (essays/book) + part-time remote SPED',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 35000,
      karaAnnualIncome: 60000,
      householdAnnualIncome: 95000,
      incomeGrowthRate: 2,
      benefits: [
        'Space for creative work',
        'Minimal cost pressure',
        'Artisan culture inspires',
      ],
      benefitsMonetaryValue: 3000,
      visaCompatible: true,
      notes: ['Lifestyle choice over career optimization'],
      localCurrencyIncome: false,
    },
    {
      id: 'oaxaca-local-school',
      name: 'Local Bilingual School + Remote',
      description:
        'Mekoce teaches at a bilingual school locally; Kara works remotely.',
      yourRole: 'Bilingual school teacher',
      karaRole: 'Remote US-based work',
      yourAnnualIncome: 15000,
      karaAnnualIncome: 90000,
      householdAnnualIncome: 105000,
      incomeGrowthRate: 2,
      benefits: [
        'Daughter in bilingual environment',
        'Kara\u2019s income carries the family easily',
        'Cultural integration',
      ],
      benefitsMonetaryValue: 5000,
      visaCompatible: true,
      notes: ['Local salary $12K-$18K; Kara\u2019s remote income is the anchor'],
      localCurrencyIncome: true,
    },
  ],

  qolDefaults: {
    familyProximity: 2,
    childEducation: 4,
    languageEnvironment: 10,
    healthcareQuality: 5,
    safety: 6,
    climate: 6,
    culturalFit: 9,
    careerSatisfaction: 5,
    communityBuilding: 7,
    politicalStability: 5,
    adventureNovelty: 9,
    returnFlexibility: 6,
  },

  qolNotes: {
    climate:
      'Semi-arid at 1,555m elevation — milder than the lowland tropics but with real heat windows. Apr–May is the hot stretch: highs 88–92°F, bone dry, intense sun. Nov–Jan is the coolest and most pleasant (highs 75–80°F, lows ~45°F at night, big diurnal swing). Rainy season Jun–Sep brings afternoon showers that cool things down. For Oakland-calibrated tastes: not a year-round match — the spring heat and night-time chill both stretch further than Oakland\'s narrow band.',
  },

  visa: {
    type: 'Temporary Resident Visa (same as CDMX)',
    duration: '1 year, renewable up to 4 years',
    renewalProcess: 'Renew at local INM office',
    requirements: [
      'Same as CDMX: ~$4,400/mo income or ~$73K savings',
    ],
    processingTime: '2-6 weeks',
    costs: '~$400-600 per person',
    workRights: 'Full work rights with Temporary Resident visa',
    spouseWorkRights: 'Full work rights under family unity',
    pathToPR: 'Permanent residency after 4 years',
    gotchas: [
      'Remote location \u2014 flights connect via CDMX',
      'Teacher union strikes can disrupt',
      'Road blockades occasionally',
      'Healthcare limitations for serious needs',
    ],
  },

  narrative:
    'The radical downshift. Oaxaca is where you go to write the book, make the art, and live richly on very little. The food alone is worth it. But this is a lifestyle choice, not a career move \u2014 your daughter\u2019s education options are limited.',

  pros: [
    'Absurdly low cost of living (0.32x DC)',
    'World\u2019s best food region',
    'Deep cultural immersion',
    'Creative artistic community',
    'Warm dry climate',
    'Space to breathe and create',
  ],

  cons: [
    'Limited education options for daughter',
    'Healthcare limitations for complex needs',
    'Remote location (connections via CDMX)',
    'Limited career opportunities',
    'Infrastructure gaps',
    'Occasional political disruptions (teacher strikes, blockades)',
  ],

  dealbreakers: [
    'Limited schooling options may not work long-term for daughter',
  ],

  currency: 'MXN',
  defaultExchangeRate: 17.5,
  educationSystem: {
    preschoolAge: 3,
    primaryAge: 6,
    secondaryAge: 12,
    highSchoolAge: 15,
    systemName: 'Mexican SEP system',
    languageOfInstruction: 'Spanish',
    curriculumType: 'Mexican national (SEP)',
    internationalSchoolOptions: ['Oaxaca International School'],
    transitionNotes: [
      'Limited international school options compared to CDMX',
      'Bilingual private schools offer Spanish-English instruction',
      'Deep cultural immersion opportunity but fewer English-language resources',
    ],
  },
  publicSchoolFree: true,
  childcareMonthly: 150,
};
