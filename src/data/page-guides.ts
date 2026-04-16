import type { PageGuideSection } from '@/components/PageGuide';

export const DASHBOARD_GUIDE: PageGuideSection[] = [
  {
    title: 'How net worth is calculated',
    body: 'Each card runs a year-by-year simulation from now to retirement. Every year: income comes in (from the selected career preset, growing at the preset\'s growth rate), taxes and all expenses go out, and whatever is left gets added to your investment balance. Investments grow at your chosen return rate (default 7%). The final number is: investment balance + retirement accounts + DC home equity (if you kept the house).',
  },
  {
    title: 'What counts as income',
    body: 'For DC: your household income from the Settings page (default $220K). For abroad scenarios: the career preset\'s combined income for you + Kara, adjusted for exchange rates if the preset is marked as local-currency income. Income grows each year by the preset\'s growth rate (2-3% for salaried jobs, 10-15% for startup/independent paths).',
  },
  {
    title: 'What counts as expenses',
    body: 'Four categories, all inflating at your chosen rate (default 3%/yr): (1) Living expenses = $6,500/mo × destination cost multiplier. (2) Housing = your DC mortgage (fixed, no inflation) or destination rent (inflates). (3) Education = childcare or school cost based on daughter\'s age. (4) Health insurance = destination\'s monthly rate × 12. Selling the DC home eliminates that mortgage; renting it out generates net rental income.',
  },
  {
    title: 'What the QoL score means',
    body: 'A weighted average of 12 life dimensions (family proximity, safety, climate, etc.) rated 1-10, multiplied by your importance weights from the Matrix page. Score is 0-100. It\'s entirely subjective — you set the ratings and the weights.',
  },
];

export const COMPARE_GUIDE: PageGuideSection[] = [
  {
    title: 'How the comparison works',
    body: 'Both scenarios run the same year-by-year simulation engine with their own career preset, tax rate, and cost of living. The dashed gold line is always DC staying put. The chart shows total net worth (investments + retirement + home equity) at each age.',
  },
  {
    title: 'What "Show Projection Range" does',
    body: 'Runs the simulation 500 times with randomized assumptions: investment returns vary around your chosen rate (±12% standard deviation, like real stock market volatility) and income growth varies around the preset\'s rate. The shaded bands show the range of outcomes — the darker band is the 25th-75th percentile (likely range), the lighter band is 10th-90th (wide range). The line is the median outcome.',
  },
  {
    title: 'Why one scenario beats another',
    body: 'The main drivers are: (1) income level and growth rate, (2) cost of living, (3) tax burden, (4) whether you sell the DC home (lump sum invested early compounds significantly), and (5) how long you stay abroad. Lower expenses abroad mean more money invested each year, which compounds. But lower income abroad works against you. The comparison chart lets you see which effect wins.',
  },
  {
    title: 'Metrics table: what each row means',
    body: 'Net Worth at 62: total assets at retirement. Year-1 Income: household income in the first year of the scenario. Annual Expenses: total cost of living + housing + school + health in year 1. Tax Burden: estimated total tax (US + local, after foreign tax credit) in year 1. COL Multiplier: destination cost as a fraction of DC (0.45 = 45% of DC costs). QoL Score: weighted quality-of-life rating out of 100.',
  },
];

export const MATRIX_GUIDE: PageGuideSection[] = [
  {
    title: 'How the composite score is calculated',
    body: 'Each destination gets two scores: a financial score (0-100) and a QoL score (0-100). The composite blends them using your Financial Weight slider. Formula: (financial × financialWeight + QoL × 10) ÷ (financialWeight + 10). If financial weight is 5, finance and QoL contribute roughly equally. At 10, finances dominate. At 0, QoL dominates.',
  },
  {
    title: 'How the financial score works',
    body: 'The engine simulates each destination to retirement and records the final net worth. The destination with the highest net worth gets 100, the lowest gets 0, and everything else is linearly interpolated between them. This is a relative ranking, not an absolute measure — a score of 50 means you\'re halfway between the worst and best financial outcome on the list.',
  },
  {
    title: 'How the QoL score works',
    body: 'For each destination: multiply each of the 12 dimension ratings (1-10) by your importance weight (0-10), sum them up, divide by total weight, and scale to 0-100. A dimension with weight 0 is ignored. A dimension with weight 10 matters twice as much as one with weight 5.',
  },
  {
    title: 'What sensitivity analysis tells you',
    body: 'For each QoL dimension, the app tests: "if I increase this weight by 3, does the #1 and #2 swap?" If yes, it tells you which dimension change would flip the winner. This shows how robust your result is — if many dimensions could flip it, the ranking is fragile.',
  },
];

export const PLAN_GUIDE: PageGuideSection[] = [
  {
    title: 'What this page is for',
    body: 'A structured checklist for executing a move, broken into 5 phases. The visa requirements from your selected destination are automatically pulled into Phase 1. Checkboxes are for your own tracking — they\'re not saved between sessions.',
  },
  {
    title: 'This is not legal or tax advice',
    body: 'The checklist is a planning aid based on research. Visa rules change, tax situations are individual, and immigration law requires professional guidance. Use this as a conversation starter with an attorney and CPA, not as a substitute.',
  },
];

export const INPUTS_GUIDE: PageGuideSection[] = [
  {
    title: 'How these settings affect calculations',
    body: 'Every value on this page feeds directly into the simulation engine. Current Age and Retirement Age determine how many years are simulated. Investment Return Rate is the annual growth rate applied to your investment balance. Inflation Rate compounds on all expenses each year. DC Household Income sets your baseline DC earnings (the starting point for the DC scenario).',
  },
  {
    title: 'DC Home settings',
    body: 'Home Value minus Mortgage Balance minus closing costs = your sale proceeds (if selling). Monthly Mortgage is your fixed payment (doesn\'t inflate). If you rent the house out, rental income inflates but the mortgage stays fixed — so rental cash flow improves over time. Insurance/tax and maintenance costs DO inflate.',
  },
  {
    title: 'Currency exchange rates',
    body: 'These only affect destinations where the career preset is flagged as local-currency income (e.g., Kara\'s salary at ASH in euros). Remote US work and IEP Pulse income are always in USD and unaffected. The adjustment is proportional: if EUR weakens 10% from the default, locally-earned income drops 10% in USD terms.',
  },
  {
    title: 'Roth conversion',
    body: 'If "Convert to Roth" is on: your 457(b) balance is reduced by the conversion tax rate (default 22%), then grows tax-free. Annual Roth contributions are added each year on top of that. If off: the full 457(b) balance grows but will be taxed on withdrawal.',
  },
];

export function getFinancialsGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'How the wealth projection is calculated',
      body: `Each row in the table is one year. The engine starts with your current savings + 457(b) balance (minus Roth conversion tax if applicable). If selling the DC home, sale proceeds are added to investments upfront. Then each year: (1) Income from the career preset grows at its growth rate, adjusted for exchange rates if local-currency. (2) Taxes are estimated at the destination's effective total rate (US + local combined, after credits). (3) Expenses = living costs + rent/mortgage + education + health insurance, all inflating at ${INPUTS_GUIDE[0] ? '3' : '3'}%/yr default. (4) Net cash flow = income − taxes − expenses + rental income (if renting DC home). (5) Investment balance grows at the return rate, plus net cash flow. (6) Retirement accounts grow at the return rate plus annual Roth contributions.`,
    },
    {
      title: `How ${destinationName} taxes are estimated`,
      body: 'The app uses the destination\'s "estimated effective total rate" — a single percentage that represents the combined US + local tax burden after foreign tax credits and treaty benefits. This is NOT a bracket-by-bracket tax calculation. It\'s a planning estimate. For DC, it\'s your domestic federal + DC rate. For abroad scenarios, it accounts for FEIE (Foreign Earned Income Exclusion of ~$133K) and the principle that you pay the higher of US or local rates, not both.',
    },
    {
      title: 'What "vs DC Baseline" means',
      body: 'The delta shows how much more or less net worth you\'d have compared to staying in DC with your current household income, keeping the house, and continuing until retirement. A positive number means this scenario ends up richer than DC. The DC ghost line (dashed gold) on the chart is always this baseline for visual comparison.',
    },
    {
      title: 'Why expenses might decrease in some years',
      body: 'Education costs change as your daughter ages: childcare costs in early years drop to $0 when she enters free public school (in destinations where public school is viable). This can cause a noticeable drop in total expenses around age 5-6 depending on the destination. After that, expenses should steadily increase due to inflation. If you see flat or declining expenses after age 6, something may be misconfigured.',
    },
  ];
}

export function getCareerGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'How career presets affect the numbers',
      body: `Each preset defines: your annual income, Kara's annual income, an income growth rate, benefits value, and whether the income is in local currency. Selecting a preset immediately recalculates the entire financial projection for ${destinationName}. The "household income" shown is your income + Kara's income before growth.`,
    },
    {
      title: 'What the growth rate means',
      body: 'Salaried positions (international school teachers, corporate roles) use 2-3% growth — roughly inflation-matching raises. Independent/startup presets (DAFT business, consulting) use 10-15% — modeling the ramp-up from a low Year 1 to a mature practice. A 12% growth rate means your Year 1 income of $35K becomes ~$50K by Year 3 and ~$110K by Year 7.',
    },
    {
      title: 'What "local currency income" means',
      body: 'If checked, the income is denominated in the destination\'s currency (EUR, KES, etc.) and gets adjusted when you change exchange rate sliders in Settings. Remote US consulting, IEP Pulse SaaS, and US-client work is always in USD and unaffected by exchange rates.',
    },
    {
      title: 'What "visa compatible" means',
      body: 'Some career configurations require specific visa types. For example, DAFT holders in the Netherlands can ONLY be self-employed — they cannot accept salaried positions. A preset marked "not visa compatible" means it doesn\'t work with the primary visa pathway listed for this destination.',
    },
  ];
}

export function getHousingGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'How "Sell" works in the model',
      body: 'Sale proceeds = Home Value − Mortgage Balance − (Home Value × Closing Cost %). This lump sum is added to your investment balance at the start of the simulation and compounds at your investment return rate for the entire projection period. Early lump-sum investing has a huge compounding effect — this is often the single biggest factor in abroad scenarios beating DC.',
    },
    {
      title: 'How "Rent" works in the model',
      body: 'Annual rental cash flow = (Monthly Rent × 12) − Management Fee − (Mortgage × 12) − (Insurance+Tax × 12) − (Maintenance × 12). Rental income inflates each year (you can raise rent). Mortgage is fixed. Insurance, tax, and maintenance inflate. So net rental income generally improves over time. Home equity also grows at the appreciation rate.',
    },
    {
      title: 'How "Keep" works in the model',
      body: 'You keep paying the mortgage ($4,600/mo fixed) as a carrying cost. No rental income. Home equity grows at the appreciation rate. You also pay maintenance and insurance/tax as ongoing costs. This is the most conservative option — high carrying cost but you retain the asset.',
    },
    {
      title: `Housing costs in ${destinationName}`,
      body: `When living abroad, your housing cost is the destination's estimated 3BR monthly rent × 12, inflating each year at the inflation rate. This replaces the DC mortgage. The destination's rent data comes from research and may not reflect exactly what you'd pay — treat it as a planning baseline.`,
    },
  ];
}

export function getLifeGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'How the life score is calculated',
      body: 'Each of the 12 dimensions has a rating (1-10) and a weight (0-10, set on the Matrix page). The score formula: sum(rating × weight) ÷ sum(weights) × 10. This gives a score from 0-100. A dimension with weight 0 is completely ignored. You can override any default rating with the sliders — "You: 8 | Default: 6" means you disagree with the research estimate.',
    },
    {
      title: 'What the radar chart shows',
      body: `The colored polygon is ${destinationName}'s ratings across all 12 dimensions. The faint gold polygon is DC's ratings for comparison. A dimension where ${destinationName} extends beyond DC's polygon is an area where it scores better. The chart does NOT account for weights — it shows raw ratings only.`,
    },
    {
      title: 'Education assessment methodology',
      body: 'The transition risk is based on daughter\'s age at the move year: ages 3-5 = "Ideal" (full language immersion window), 6-9 = "Good" (still adapts quickly), 10-12 = "Moderate" (social groups forming, may need international school), 13+ = "Difficult" (international school strongly recommended). This is a heuristic, not a clinical assessment.',
    },
    {
      title: 'Education costs in the model',
      body: 'The engine checks daughter\'s age each year: too young for preschool = $0, preschool age = destination childcare cost, school age with tuition waiver (from career preset) = $0, school age with free public school = $0, otherwise = international school annual cost. All education costs inflate each year.',
    },
  ];
}

export function getVisaGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'How visa info is used in the model',
      body: `The visa details on this page are informational — they don't directly change the financial simulation. However, the career presets for ${destinationName} are designed to be compatible with the primary visa pathway listed here. If a preset is marked "not visa compatible," it means that career configuration conflicts with the visa type.`,
    },
    {
      title: 'Important disclaimer',
      body: 'Visa requirements change frequently. Processing times, fees, and eligibility criteria here are from mid-2026 research. Before making any decisions, verify current requirements with the destination country\'s immigration authority and consult an immigration attorney. This is especially important for the DAFT visa (Netherlands), Beckham Law (Spain), and Digital Nomad Visa programs.',
    },
  ];
}

export function getTimelineGuide(destinationName: string): PageGuideSection[] {
  return [
    {
      title: 'How the timeline connects to finances',
      body: 'The move year and return year directly control the simulation. Before move year: DC income and expenses apply. From move year onward: destination income, expenses, and taxes apply. If you set a return year, the simulation switches back to DC calculations after that point (but with the investment balance you\'ve accumulated abroad).',
    },
    {
      title: 'What the milestones mean',
      body: 'Education milestones (preschool, primary, secondary) are based on your daughter\'s current age and the destination\'s school system. These directly affect the education cost in the simulation — when she transitions from childcare to free public school, expenses drop. The retirement marker shows when the simulation ends.',
    },
    {
      title: 'Return-to-DC modeling',
      body: 'If you enable "return to DC," the simulation assumes you re-establish in DC at the return year. You keep all accumulated savings and investments. Housing reverts to your DC mortgage cost. Income reverts to DC baseline. Note: if you sold the house, you\'d need to buy back in at the appreciated price — the model currently doesn\'t capture that re-purchase cost, so the return scenario is optimistic if you sold.',
    },
  ];
}
