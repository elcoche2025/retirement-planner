# Retirement Planner — SaaS Evolution Plan

Design document for turning the personal retirement-planner into a two-tier SaaS. Drafted 2026-04-17.

- **Tier 1 — Catalog:** pick from 30–50 curated destinations. Free + Plus.
- **Tier 2 — Anywhere:** custom city entered by user, generated on demand against a curated data pipeline. Premium.

---

## 1. Data sources (the foundation)

Everything else rests on choosing sources that cover the globe, are machine-readable, and give us defensible numbers. Claude's job is **synthesis and formatting, never fact-retrieval**. We don't let Claude browse the open web — we fetch from a known set, feed it in, and have Claude write the narrative + structure the output.

### Primary sources (by category)

| Domain | Source | Coverage | Access | Notes |
|---|---|---|---|---|
| Cost of living | **Numbeo** | ~12,000 cities worldwide | Paid API ($39/mo unlimited) | De facto standard; rent, groceries, utilities, restaurant, healthcare indexes |
| Cost of living | **Teleport / Nomad List** | ~300 cities | Scrape / partial API | Good for lifestyle categories (internet speed, startup scene, etc.) |
| Tax law | **PwC Worldwide Tax Summaries** | 150+ countries | Free HTML | Authoritative; scrapeable; updated annually |
| Tax rates | **Trading Economics** | 200+ countries | Free API (rate-limited) | Live rates, treaty matrix |
| Tax treaties | **OECD Tax Treaty Database** | OECD + partners | Free | Bilateral DTA lookup |
| Housing | **Global Property Guide** | ~120 countries | Scrape | Rent yields, buy prices, foreign-ownership rules |
| Visa / immigration | **Wikipedia "Visa policy of X"** | All countries | Free | Surprisingly well-sourced passport-vs-destination matrices |
| Visa — detail | **IATA Timatic** | All | Paid B2B | Airlines' official travel-doc API; most accurate but $$$ |
| Safety | **US State Dept Travel Advisories** | All | Free HTML/API | 4-level scoring |
| Safety — qualitative | **Numbeo Crime Index** | ~6,000 cities | Numbeo API | Perception-based but consistent |
| Healthcare | **WHO Global Health Observatory** | 194 countries | Free API | Macro indicators |
| Healthcare — quality | **Numbeo Healthcare Index** | City-level | Numbeo API | Perception again; pair with WHO |
| Education | **IB Organization directory** | All IB schools worldwide | Free | International-school inventory |
| Currency / FX | **Frankfurter** | ECB reference rates | Free | Already integrated |
| Geocoding | **Mapbox** or **OpenCage** | Global | Paid (cheap) | Canonicalize "Lisbon" → `Lisbon, Lisboa, Portugal` |
| Macro / GDP | **World Bank Open Data** | All countries | Free API | Inflation, GDP, demographics |

### Minimum viable source set

For launch we don't need all of these. Start with:

1. **Numbeo** — single best source for cost of living + city-level quality indexes. $39/mo unlimited API justifies itself at ~50 users.
2. **PwC Worldwide Tax Summaries** — ground tax facts.
3. **Wikipedia visa policy pages** — ground visa facts. Later upgrade to IATA Timatic if the money justifies it.
4. **US State Dept advisories** — safety ground truth.
5. **Global Property Guide** — housing. Scraped; low volume.
6. **Mapbox Geocoding** — Tier 2 only, for canonicalization.
7. **Frankfurter** — already integrated.

**Total external cost at launch:** ~$50/mo (Numbeo + Mapbox). Scales sublinearly with users because we cache aggressively.

### The curated-fetch pattern

```ts
// Pseudocode
interface SourceAdapter<T> {
  fetch(city: CanonicalCity): Promise<T>;
  cacheTtlDays: number;
}

const adapters = {
  numbeo: NumbeoAdapter,
  pwcTax: PwCTaxAdapter,
  visa: WikipediaVisaAdapter,
  safety: StateDeptAdapter,
  housing: GlobalPropertyGuideAdapter,
};

async function gatherCityData(city: CanonicalCity): Promise<CityDataBundle> {
  return Promise.all(Object.values(adapters).map(a => a.fetch(city)));
}
```

Each adapter caches its raw fetch in a `source_cache` table keyed by `(source, city, fetched_at)`. Numbeo data refreshes quarterly; tax data annually; visa data when Wikipedia edits (weekly check is plenty).

### How Claude fits in

Claude sees **only** the fetched `CityDataBundle` + the schema + a strict system prompt:

> You are formatting pre-fetched data into the destination schema. Every numeric field must come from the bundle — never invent values. If a field is missing, emit `null` with a `_missing: true` metadata flag. Narrative text is your creative output, but must cite source numbers accurately.

Structured output (Anthropic's tool-use mode with `input_schema`) guarantees the response matches the schema. Zod validation before DB write catches any edge cases.

**Result:** zero hallucination risk on numeric facts. Claude contributes synthesis, narrative voice, and QoL-dimension gut-calls (which are subjective anyway and can be user-overridden).

---

## 2. Schema + generator script

### Schema

Convert existing `Destination` TypeScript type to Zod. Add metadata:

```ts
const DestinationSchema = z.object({
  // existing fields...
  id: z.string(),
  name: z.string(),
  // ...
  qolDefaults: QoLRatingsSchema,
  qolNotes: z.record(QoLDimensionSchema, z.string()).optional(),

  // New metadata
  _meta: z.object({
    generatedAt: z.string().datetime(),
    generatorVersion: z.string(),
    sourceAttribution: z.record(z.string(), z.object({
      source: z.enum(['numbeo', 'pwc', 'wikipedia', 'state_dept', 'gpg', 'claude_synthesis']),
      fetchedAt: z.string().datetime(),
      confidence: z.enum(['high', 'medium', 'low']),
    })),
  }),
});
```

Source attribution lets the UI render "Cost of living: Numbeo, Apr 2026" beside every number. Builds trust and lets users know what to double-check.

### Generator architecture

```
┌─────────────────────────────────────────────────────┐
│                  generate-destination                │
├─────────────────────────────────────────────────────┤
│  1. canonicalize city name (Mapbox)                  │
│  2. check shared cache → return if fresh             │
│  3. parallel fetch from source adapters              │
│  4. cache raw fetches in source_cache table          │
│  5. build CityDataBundle + diff vs prior generation  │
│  6. call Claude with bundle + schema + rubric        │
│  7. Zod parse → reject if invalid                    │
│  8. write to destinations table, source='curated'    │
│     or 'user_generated'                              │
│  9. return destination                               │
└─────────────────────────────────────────────────────┘
```

Two entry points:

- **Offline CLI** (`scripts/generate-destination.ts`) — used to build the initial 30–50 curated catalog and to batch-refresh. Run locally, commit results.
- **Server-side job** — triggered by user request for custom cities. Runs as Supabase Edge Function or Vercel cron/background worker.

### Claude call structure (with caching)

```ts
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  system: [
    {
      type: 'text',
      text: RUBRIC_PROMPT,
      cache_control: { type: 'ephemeral' }, // 5-min prompt cache
    },
    {
      type: 'text',
      text: SCHEMA_DESCRIPTION,
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [
    {
      role: 'user',
      content: `Generate destination for: ${city.canonical}\n\nSource data:\n${JSON.stringify(bundle)}`,
    },
  ],
  tools: [{ name: 'emit_destination', input_schema: zodToJsonSchema(DestinationSchema) }],
  tool_choice: { type: 'tool', name: 'emit_destination' },
});
```

Prompt caching drops input cost ~10× for the static rubric + schema (always ~2K tokens). Only the variable CityDataBundle (~2K tokens) + output (~4K tokens) carry full cost.

### Per-generation cost math

At Sonnet 4.6 rates ($3/MT input, $15/MT output) with caching:
- Cached input (rubric + schema): 2K × $0.30/MT = $0.0006
- Fresh input (bundle): 2K × $3/MT = $0.006
- Output: 4K × $15/MT = $0.060
- **Per-generation: ~$0.07**

With web search tool use (not recommended — use curated sources instead), cost jumps ~3×. This is the tradeoff: curated sources cost subscription $$ but per-generation stays predictable.

### Catalog bootstrap

Run the generator once for 30–50 cities. Candidates: the 12 existing destinations plus 20–40 popular expat cities (Lisbon, Porto, Prague, Berlin, Buenos Aires, Singapore, Tokyo, Bangkok, Chiang Mai, Dubai, Seoul, Taipei, Tallinn, Riga, Sofia, Zagreb, Cape Town, Istanbul, Kuala Lumpur, Penang, Hanoi, Da Nang, Medellín already there, Bogotá, Lima, Santiago, Buenos Aires, Córdoba, Panama City, San José CR…).

One-time cost: 50 × $0.07 = **$3.50**. Done.

---

## 3. Tax engine abstraction

This is the biggest engineering investment — plan 1-2 weeks minimum. Current tax code in `src/engine/taxes.ts` is hardcoded for US citizen × various destinations. Can't scale to arbitrary users without generalization.

### Current problems

- FEIE, Beckham Law, 30% ruling, DAFT, totalization — all hardcoded as conditionals
- Filing status assumed MFJ; no single / HoH handling
- Retirement drawdown vs salary income not differentiated
- No support for non-US citizens
- Capital gains treatment hardcoded per destination

### Target architecture: rules engine

```ts
interface TaxProfile {
  citizenship: ISOCountryCode[];     // can be multiple (dual)
  residencyCountry: ISOCountryCode;
  filingStatus: 'single' | 'married_jointly' | 'married_separately' | 'head_of_household';
  dependents: number;
  incomeStreams: {
    type: 'employment' | 'self_employed' | 'passive' | 'retirement_drawdown' | 'rental' | 'capital_gains';
    amount: number;
    currency: string;
    sourceCountry: ISOCountryCode;
  }[];
  yearsInResidencyCountry: number;   // for time-limited special regimes
  retirementAccountTypes: ('US_401k' | 'US_IRA' | 'US_Roth' | 'UK_SIPP' | ...)[];
}

interface TaxRule {
  id: string;
  name: string;
  source: string;  // URL to authoritative doc
  appliesWhen: (profile: TaxProfile, destination: Destination) => boolean;
  apply: (
    profile: TaxProfile,
    destination: Destination,
    runningLiability: TaxLiability
  ) => TaxLiability;
  lastReviewed: Date;
  expertReviewedBy?: string;  // CPA or tax attorney name if reviewed
}
```

### Rule library — initial set (~12 rules)

| Rule ID | Covers | Priority |
|---|---|---|
| `us_federal_income_tax` | US citizens worldwide income | P0 |
| `us_feie` | US citizens abroad meeting residency tests | P0 |
| `us_ftc` | Foreign Tax Credit | P0 |
| `destination_local_income_tax` | Default: apply destination's income tax rate | P0 |
| `bilateral_treaty_relief` | Treaty-based double-tax relief | P0 |
| `totalization_agreement` | Social security carve-outs | P0 |
| `spain_beckham_law` | 6-year 24% flat for Spain inbound | P1 |
| `netherlands_30_ruling` | 30% tax-free for NL skilled migrants | P1 |
| `uruguay_tax_holiday` | 10-year near-zero on foreign income | P1 |
| `portugal_nhr` | Portugal non-habitual resident (ending 2024 but grandfathered) | P1 |
| `italy_impatriati` | Italy inbound worker regime | P2 |
| `greece_nhr` | Greece 7% flat for retirees | P2 |

Each rule is a pure function, unit-tested, with a `lastReviewed` date forcing annual expert review.

### Engine

```ts
function computeTax(
  profile: TaxProfile,
  destination: Destination,
): TaxLiability {
  const applicableRules = ALL_RULES.filter(r => r.appliesWhen(profile, destination));
  applicableRules.sort((a, b) => RULE_ORDER[a.id] - RULE_ORDER[b.id]);
  return applicableRules.reduce(
    (liability, rule) => rule.apply(profile, destination, liability),
    EMPTY_LIABILITY,
  );
}
```

Returns a `TaxLiability` that includes the rules that fired + their contributions, so the UI can explain "Your effective rate of 18% comes from: US federal 24% − FEIE exclusion on first $132,900 − Netherlands 30% ruling on salary portion − treaty relief on the balance."

### Fallback for uncovered combinations

```ts
if (applicableRules.length === 0 || missingRuleCoverage(profile, destination)) {
  return {
    mode: 'rough_estimate',
    estimatedRate: destination.taxRegime.estimatedEffectiveTotalRate,
    warning: `We don't have detailed tax modeling for ${profile.citizenship[0]} citizens moving to ${destination.country}. Numbers are a rough estimate only — please consult a cross-border tax professional.`,
  };
}
```

Ship with coverage for US + EU/UK citizens (covers ~80% of likely user base); flag uncovered cases clearly.

### Testing

Every rule has:
- Unit tests with known scenarios
- A "regression" test locking current hardcoded behavior for Mekoce's scenario
- An annual review checklist

---

## 4. Billing architecture

Standard Stripe + Supabase pattern. Nothing novel here, just execution.

### Data model

```sql
create table subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  tier text not null check (tier in ('free', 'plus', 'premium')) default 'free',
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  updated_at timestamptz default now()
);

create table usage_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id),
  event_type text not null check (event_type in ('custom_city_generated', 'city_refreshed')),
  billing_period text not null,  -- 'YYYY-MM'
  metadata jsonb,
  created_at timestamptz default now()
);
create index on usage_events (user_id, billing_period);
```

### Tier check function

```sql
create or replace function public.user_tier(uid uuid)
returns text language sql stable security definer as $$
  select coalesce(tier, 'free')
  from subscriptions
  where user_id = uid
    and status in ('active', 'trialing');
$$;
```

Used in RLS policies:

```sql
create policy "Premium users generate custom cities"
  on destinations
  for insert
  to authenticated
  with check (
    source = 'user_generated'
    and user_tier(auth.uid()) = 'premium'
  );
```

### Stripe webhook (Supabase Edge Function)

```ts
// supabase/functions/stripe-webhook/index.ts
Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(await req.text(), sig!, WEBHOOK_SECRET);

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await upsertSubscription(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await downgradeToFree(event.data.object.customer);
      break;
  }
  return new Response('ok');
});
```

### Checkout flow

1. User clicks "Upgrade to Plus" in app
2. Client calls `/create-checkout-session` edge function
3. Edge function creates Stripe Checkout session, returns URL
4. User redirected to Stripe, pays
5. Stripe → webhook → subscriptions table updated
6. User redirected back, tier refreshed

### Billing portal

Stripe-hosted. Client calls `/create-portal-session`, user manages their sub directly.

### Usage metering for Premium custom cities

Before generation:
```ts
const currentPeriod = format(new Date(), 'yyyy-MM');
const used = await countUsageEvents(user.id, 'custom_city_generated', currentPeriod);
if (used >= PREMIUM_MONTHLY_CITY_LIMIT) {
  throw new Error('Monthly custom city limit reached. Limit resets on ${nextPeriodStart}');
}
```

### Testing

Stripe test mode throughout dev. Test cards for success, decline, auth-required flows. Webhooks tested with Stripe CLI forwarding.

---

## 5. Build roadmap

| Phase | Duration | Scope |
|---|---|---|
| 0. Design lock | 1 week | Finalize schema, select final source list, negotiate Numbeo subscription, draft rubric prompts, design DB tables |
| 1. Catalog MVP | 3–4 weeks | Schema → generator script → DB migration → onboarding wizard → destination picker → basic tier gating (no payments yet) |
| 2. Billing | 2 weeks | Stripe integration, webhooks, tier gating, billing portal, free/Plus launch |
| 3. Tax engine generalization | 2 weeks | Rule architecture, initial 12-rule library, migration of existing tax logic |
| 4. Custom city tier | 2–3 weeks | Geocoding, shared cache, generation worker, rate limits, Premium tier launch |
| 5. Polish | ongoing | Marketing site, SEO, legal review, customer support tooling, rule library expansion |

**Realistic total to two-tier launch:** 10–13 weeks single developer focused.

### Sensible MVP cuts

To compress to ~6–8 weeks, skip:
- Tax engine generalization (use current hardcoded logic; warn non-US-citizens "beta")
- Annual-billing Stripe product (monthly only at launch)
- Marketing site (use GitHub Pages landing + direct app link)
- Rule library beyond basic (expand as users hit gaps)

### What not to cut

- Source attribution in UI. This is the trust differentiator.
- Zod validation on every generation. Bad data in = unfixable trust loss.
- Stripe webhook idempotency. Double-billing = churn.
- Rate limits on custom-city generation. One abusive user can drain $100+ in a day.

---

## 6. Open questions / decisions needed

1. **Tax advice liability.** Even with disclaimers, presenting tax numbers to users creates exposure. Consider: incorporate as LLC, get E&O insurance, have ToS reviewed. Before public launch.
2. **GDPR / data residency.** European users → personal data → EU jurisdiction. Supabase has EU regions; need to pick one at project setup (or create a second EU project and route by geoip). Non-trivial.
3. **Refund policy.** Claude generation is non-refundable cost. Tier 2 premium users who generate 10 cities then cancel can't be refunded proportionally. Set refund policy up front.
4. **IATA Timatic for visa data.** $$$. Only worth it if lots of paid users rely on visa accuracy. Start with Wikipedia + State Dept, upgrade later.
5. **Numbeo as single point of failure.** If they sunset the API or spike prices, cost-of-living data disappears. Hedge: implement adapter interface so swapping to Teleport / Expatistan / Nomad List is a day of work.

---

## 7. Immediate next actions (when Mekoce says go)

1. Design schema v1 — convert existing `Destination` to Zod, add `_meta` attribution.
2. Sign up for Numbeo API, Mapbox, confirm PwC scraping is OK per their ToS.
3. Write and test the first source adapter (Numbeo) end-to-end.
4. Write the generator script, generate one city (e.g. Lisbon) and manually verify.
5. Decide on repo strategy: stay in `retirement-planner` repo and fork UI, or new `relocation-planner` repo with the current one as reference. Recommend new repo — the existing one is Mekoce's personal tool and should stay narrow.
