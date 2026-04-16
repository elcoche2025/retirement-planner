import type { PageGuideSection } from '@/components/PageGuide';

export const DASHBOARD_GUIDE: PageGuideSection[] = [
  {
    title: 'What this page shows',
    body: 'An at-a-glance summary of the DC baseline and each destination using the currently selected career preset, quality-of-life ratings, and global assumptions.',
  },
  {
    title: 'Key assumptions',
    body: 'Net worth projections use the shared simulation engine, including your DC income override, housing decision, inflation, returns, and destination-specific schooling and healthcare estimates.',
  },
  {
    title: 'Data sources',
    body: 'Destination cards are backed by the research files in src/data/destinations plus the exchange-rate settings and global assumptions you edit in the app.',
  },
  {
    title: 'How to update this',
    body: 'Adjust assumptions in Settings or edit the destination data files directly when you have better local cost, visa, school, or tax information.',
  },
];

export const COMPARE_GUIDE: PageGuideSection[] = [
  {
    title: 'What this page shows',
    body: 'A side-by-side comparison of two destination scenarios against the DC baseline, with net worth trajectories, estimated tax load, expenses, and quality-of-life scoring.',
  },
  {
    title: 'Key assumptions',
    body: 'The chart uses the same financial engine as the dashboard. Monte Carlo is a range estimate based on varying return and income-growth assumptions, not a full macroeconomic model.',
  },
  {
    title: 'Data sources',
    body: 'Comparison metrics come from the selected destination presets, your global settings, and the rough destination-level tax-rate assumptions stored in the data files.',
  },
  {
    title: 'How to update this',
    body: 'Pick different presets in each destination tab, adjust settings, or refine destination data if you learn better rent, salary, tax, or school-cost assumptions.',
  },
];

export const MATRIX_GUIDE: PageGuideSection[] = [
  {
    title: 'What this page shows',
    body: 'A weighted decision matrix that combines custom life-dimension scores with a normalized financial score so you can see ranking changes at a glance.',
  },
  {
    title: 'Key assumptions',
    body: 'Financial score is relative across destinations, not an absolute grade. Green/red heatmap tinting reflects stronger and weaker cells within each row based on the current ranking logic.',
  },
  {
    title: 'Data sources',
    body: 'Quality-of-life inputs come from destination defaults plus any overrides you have made. Financial score comes from the simulation engine under the current assumptions.',
  },
  {
    title: 'How to update this',
    body: 'Use the preset buttons or sliders to change your weighting, then revisit destination data when your research changes the underlying scores.',
  },
];

export const PLAN_GUIDE: PageGuideSection[] = [
  {
    title: 'What this page shows',
    body: 'A staged planning checklist for the move, with destination-specific visa requirements inserted into the preparation phase.',
  },
  {
    title: 'Key assumptions',
    body: 'The checklist is advisory and intentionally generic. It is not a legal or tax filing workflow and should be validated against your actual move timeline.',
  },
  {
    title: 'Data sources',
    body: 'Visa-related items come from each destination record. The rest of the checklist is a reusable planning scaffold based on the family’s relocation goals.',
  },
  {
    title: 'How to update this',
    body: 'Revise the destination data or the shared phase checklist if you discover more accurate immigration, school, or move-preparation requirements.',
  },
];

export const INPUTS_GUIDE: PageGuideSection[] = [
  {
    title: 'What this page shows',
    body: 'The global assumptions that feed every scenario: income, savings, home costs, investment returns, move year, and exchange rates.',
  },
  {
    title: 'Key assumptions',
    body: 'These values are intentionally editable stress-test inputs, not claims about the world. The DC household income override directly affects the DC baseline simulation.',
  },
  {
    title: 'Data sources',
    body: 'Most values are user-supplied assumptions. Exchange rates sync from Frankfurter and can still be manually overridden for planning sensitivity.',
  },
  {
    title: 'How to update this',
    body: 'Change the sliders when your assumptions shift, especially for mortgage-related costs, exchange rates, or expected retirement inputs.',
  },
];

export function getFinancialsGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'What this page shows',
      body: `A long-range wealth projection for ${destinationName}, including estimated tax load, expenses, and comparison against the DC baseline.`,
    },
    {
      title: 'Key assumptions',
      body: 'Taxes are rough destination-level effective estimates, not return-ready tax prep. Monte Carlo shows a planning range, not a forecast of year-by-year volatility.',
    },
    {
      title: 'Data sources',
      body: 'The numbers come from the destination preset, home decision, schooling logic, healthcare costs, investment assumptions, and synced/manual FX settings.',
    },
    {
      title: 'How to update this',
      body: 'Change presets, housing choices, and settings if you get better salary, visa, rent, or schooling information for this destination.',
    },
  ];
}

export function getCareerGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'What this page shows',
      body: `Career scenarios for ${destinationName}, each representing a plausible household setup with different income, benefits, and visa compatibility assumptions.`,
    },
    {
      title: 'Key assumptions',
      body: 'These are modeled presets, not promises. The notes should be read as planning hypotheses that need confirmation with actual employers, recruiters, or immigration counsel.',
    },
    {
      title: 'Data sources',
      body: 'Preset income and benefits values are maintained in the destination data files and reflect the current best-fit assumptions for this family.',
    },
    {
      title: 'How to update this',
      body: 'Edit the destination preset definitions when a job path becomes clearly viable or unrealistic so the scenario set stays grounded in your real options.',
    },
  ];
}

export function getHousingGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'What this page shows',
      body: `How the DC home decision interacts with projected finances and what current rent/buy assumptions look like in ${destinationName}.`,
    },
    {
      title: 'Key assumptions',
      body: 'Home sale proceeds, rental cash flow, and equity growth are planning estimates. Additional insurance/tax is treated as an out-of-pocket amount outside the mortgage payment.',
    },
    {
      title: 'Data sources',
      body: 'DC home inputs come from Settings. Destination rents and purchase assumptions come from the destination data file for this location.',
    },
    {
      title: 'How to update this',
      body: 'Update the sliders when your mortgage or escrow facts change, and edit destination housing notes when you get better local market information.',
    },
  ];
}

export function getLifeGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'What this page shows',
      body: `A quality-of-life profile for ${destinationName}, including weighted life score, dimension sliders, and education-path notes for your daughter.`,
    },
    {
      title: 'Key assumptions',
      body: 'The life score is subjective by design. The education transition assessment is a planning heuristic based on age-at-move, not a clinical or academic evaluation.',
    },
    {
      title: 'Data sources',
      body: 'Default ratings and education-system notes come from the destination data file and can be overridden in the app to reflect your lived judgment.',
    },
    {
      title: 'How to update this',
      body: 'Adjust the dimension sliders as your priorities evolve and revise destination education notes when you confirm school pathways or language realities.',
    },
  ];
}

export function getVisaGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'What this page shows',
      body: `A concise summary of the current visa path assumptions for ${destinationName}, including work rights, renewal, and the main watch-outs.`,
    },
    {
      title: 'Key assumptions',
      body: 'This is decision-support research, not legal advice. Visa viability can change with policy updates, family structure, income source, or employer specifics.',
    },
    {
      title: 'Data sources',
      body: 'The content is stored in the destination data file and should reflect your current best research rather than exhaustive immigration guidance.',
    },
    {
      title: 'How to update this',
      body: 'When you confirm new immigration facts, update the destination record so the scenario assumptions and planning copy stay aligned.',
    },
  ];
}

export function getTimelineGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'What this page shows',
      body: `A move timeline for ${destinationName} based on the current move year, optional return year, retirement date, and your daughter’s projected education milestones.`,
    },
    {
      title: 'Key assumptions',
      body: 'This uses the same current-year basis as the financial engine so milestone timing stays aligned. The checklist is a planning aid rather than a dependency tracker.',
    },
    {
      title: 'Data sources',
      body: 'Milestones are generated from your settings plus the destination education-system ages and basic move/return assumptions.',
    },
    {
      title: 'How to update this',
      body: 'Change move timing or destination education assumptions when your plan becomes more concrete or you identify better school-transition information.',
    },
  ];
}
