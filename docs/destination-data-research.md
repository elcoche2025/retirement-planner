# International Relocation Destination Data

> **⚠ Historical snapshot (April 2026, initial build).** This doc captured the first-pass
> cost data used when building the 12 destinations. It has been **partially superseded**
> by the double-counted-housing fix of 2026-04-18 (see
> `docs/superpowers/plans/2026-04-18-fix-double-counted-housing.md`).
>
> **Canonical source of truth going forward:**
> - Each destination file (`src/data/destinations/*.ts`) carries its own `costOfLiving.notes`
>   array with inline sourcing rationale, 2026 research figures, and organic-adjusted
>   essentials values.
> - The type `CostOfLiving.monthlyEssentials` replaced the old `monthlyBaseline`
>   (which ambiguously meant all-in costs including housing). `costMultiplierVsDC`
>   was dropped entirely — each destination carries an absolute USD/mo essentials figure.
> - Health insurance, rent, and international-school numbers were also refreshed where
>   research showed the original values were materially off.
>
> Below is the **original April 2026 research**, kept for historical reference only.
> The climate rubric section at the end IS still current.
>
> **Research compiled**: April 2026
> **Family profile**: Mekoce (43, SPED teacher, $130K) + Kara ($90K) + young daughter
> **All monetary values in USD unless noted**
> **EUR/USD rate assumed**: 1 EUR = ~1.08 USD (April 2026)
> **MXN/USD rate assumed**: 1 USD = ~17.5 MXN
> **COP/USD rate assumed**: 1 USD = ~4,100 COP
> **UYU/USD rate assumed**: 1 USD = ~40 UYU

---

## 1. DC Baseline (Stay Put)

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 7,500 |
| monthlyComfortable | 10,500 |
| internationalSchoolAnnual | 0 (public school) |
| healthInsuranceMonthly | 600 (employer-subsidized family plan) |
| costMultiplierVsDC | 1.00 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "22-24% federal marginal" |
| capitalGainsTax | "15% long-term" |
| socialCharges | "7.65% FICA each" |
| specialRegime | null |
| estimatedEffectiveTotalRate | "28-32% (federal + DC ~8.5% + FICA)" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 2,800 |
| rentMonthly3BR | 3,500 |
| buyMedianPrice | 725,000 |
| foreignOwnershipAllowed | true |

### Career Presets
```
[
  {
    id: "dc-status-quo",
    label: "Current Jobs (Status Quo)",
    mekoce: "DCPS SPED Teacher",
    kara: "Current role ($90K)",
    combinedIncome: 220000,
    benefits: "DCPS pension, health insurance, summers off, DC public schools for daughter"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 3 | Parents in Nanyuki, Kenya — 20+ hr travel |
| childEducation | 7 | DC public/charter options solid |
| languageEnvironment | 5 | English baseline |
| healthcareQuality | 8 | World-class hospitals |
| safety | 5 | Varies by neighborhood |
| climate | 5 | Hot summers, cold winters |
| culturalFit | 7 | Home base, diverse city |
| careerSatisfaction | 6 | Stable but potentially stagnant |
| communityBuilding | 7 | Established network |
| politicalStability | 6 | National politics turbulent |
| adventureNovelty | 3 | Familiar |
| returnFlexibility | 10 | Already here |

### Visa Info
| Field | Value |
|---|---|
| type | "N/A — Citizens" |
| duration | "N/A" |
| requirements | "N/A" |
| processingTime | "N/A" |
| costs | 0 |

### Narrative
**Pitch**: The safe default. High earning power, established careers, known schools — but high cost of living, distance from family in Kenya, and limited sense of adventure.

**Pros**: Dual high incomes, pension accrual, established social network, excellent healthcare, no relocation disruption

**Cons**: $220K feels middle-class in DC, far from Kenya family, political climate, high cost of living, golden handcuffs

---

## 2. Kenya (Nairobi)

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 3,500 |
| monthlyComfortable | 5,500 |
| internationalSchoolAnnual | 15,000-25,000 |
| healthInsuranceMonthly | 250-400 |
| costMultiplierVsDC | 0.45 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "10-30% progressive (PAYE)" |
| capitalGainsTax | "15% on property; 5% capital gains" |
| socialCharges | "~6% NHIF + NSSF" |
| specialRegime | null |
| estimatedEffectiveTotalRate | "25-30% (still file US; FEIE + FTC offsets most)" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 1,200-2,000 (Kilimani/Westlands) |
| rentMonthly3BR | 1,800-3,000 |
| buyMedianPrice | 180,000-350,000 (Karen/Runda) |
| foreignOwnershipAllowed | true (leasehold for non-citizens, 99 years) |

### Career Presets
```
[
  {
    id: "kenya-intl-school",
    label: "International School + Remote",
    mekoce: "International school SPED teacher",
    kara: "Remote US-based work",
    combinedIncome: 85000,
    benefits: "Housing often included, tuition discount for daughter, proximity to Nanyuki family"
  },
  {
    id: "kenya-both-remote",
    label: "Both Remote US-Based",
    mekoce: "Remote SPED consulting/EdTech",
    kara: "Remote US-based work",
    combinedIncome: 120000,
    benefits: "US-level income, Kenya cost of living, FEIE tax exclusion up to $132,900 (2026)"
  },
  {
    id: "kenya-ngo-education",
    label: "NGO + Education",
    mekoce: "Education NGO (SPED/inclusion)",
    kara: "NGO or remote work",
    combinedIncome: 70000,
    benefits: "Mission-driven, housing packages, expat community, meaningful SPED impact"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 9 | Parents in Nanyuki, ~3hr drive |
| childEducation | 7 | Excellent international schools |
| languageEnvironment | 7 | English + Swahili immersion |
| healthcareQuality | 5 | Good private hospitals, limited specialist access |
| safety | 4 | Gated community lifestyle, traffic |
| climate | 8 | Nairobi is temperate year-round (1,600m elevation) |
| culturalFit | 8 | Family heritage, raising daughter with roots |
| careerSatisfaction | 6 | Meaningful but lower pay |
| communityBuilding | 7 | Large expat + local community |
| politicalStability | 5 | Stable democracy with periodic tensions |
| adventureNovelty | 9 | Safari, culture, family connection |
| returnFlexibility | 7 | Can return to US teaching |

### Visa Info
| Field | Value |
|---|---|
| type | "Work Permit (Class D/G) or Dependent Pass" |
| duration | "1-2 years, renewable" |
| requirements | "Job offer from Kenyan employer; school typically sponsors" |
| processingTime | "4-8 weeks" |
| costs | "~$200-500 per person" |

### Narrative
**Pitch**: The heart move. Close to Mekoce's parents in Nanyuki, raising your daughter with cultural roots, at roughly half the cost of DC living. International schools are excellent and often include housing.

**Pros**: Family proximity (main driver), cultural immersion for daughter, low cost of living, adventure lifestyle, temperate climate, meaningful SPED work in emerging systems

**Cons**: Lower income, healthcare limitations for complex needs, security concerns, infrastructure challenges, career ceiling for Kara

---

## 3. Netherlands — The Hague

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 5,500 |
| monthlyComfortable | 7,500 |
| internationalSchoolAnnual | 18,000-25,000 |
| healthInsuranceMonthly | 350-500 (mandatory basic + supplemental, family) |
| costMultiplierVsDC | 0.75 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "36.97% (up to ~€75K) / 49.5% (above)" |
| capitalGainsTax | "~1.2-1.6% deemed return (Box 3)" |
| socialCharges | "Included in income tax brackets" |
| specialRegime | "30% Ruling (tax-free allowance on 30% of salary for 5 years; reducing to 27% in 2027)" |
| estimatedEffectiveTotalRate | "30-35% with 30% ruling; must still file US but FTC offsets" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 1,800-2,400 |
| rentMonthly3BR | 2,200-3,000 |
| buyMedianPrice | 420,000-500,000 |
| foreignOwnershipAllowed | true |

### Career Presets
```
[
  {
    id: "hague-kara-hsm-school",
    label: "Kara HSM + Mekoce School",
    mekoce: "International school SPED teacher",
    kara: "International org / operations / program role",
    combinedIncome: 140000,
    benefits: "Possible 30% ruling, strong schools, spouse work rights, EU healthcare"
  },
  {
    id: "hague-kara-daft-school",
    label: "Kara DAFT + Mekoce School",
    mekoce: "International school SEN / inclusion role",
    kara: "DAFT small business / consultancy / co-owned project",
    combinedIncome: 105000,
    benefits: "Low-capital DAFT path, spouse salaried work rights, EU healthcare"
  },
  {
    id: "hague-both-remote",
    label: "Both Remote from NL Base",
    mekoce: "Remote SPED / EdTech consulting",
    kara: "Remote operations / strategy / program work",
    combinedIncome: 130000,
    benefits: "US-linked earnings, flexibility, but residency structure still needed"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 4 | ~10hr flight to Nairobi |
| childEducation | 9 | Excellent international + Dutch schools |
| languageEnvironment | 7 | Dutch + English widely spoken |
| healthcareQuality | 9 | Universal, high quality |
| safety | 9 | Very safe |
| climate | 4 | Gray, rainy, windy |
| culturalFit | 6 | Progressive but reserved culture |
| careerSatisfaction | 7 | International orgs, good SPED systems |
| communityBuilding | 6 | Expat bubble common, Dutch hard to befriend |
| politicalStability | 8 | Stable democracy |
| adventureNovelty | 6 | European travel hub |
| returnFlexibility | 7 | Transferable experience |

### Visa Info
| Field | Value |
|---|---|
| type | "Highly Skilled Migrant (HSM) or Intra-Company Transfer" |
| duration | "5 years, renewable; permanent after 5 years" |
| requirements | "Employer must be recognized sponsor; salary threshold €48,013/yr (2026) or €36,497 if under 30 with Master's" |
| processingTime | "2-4 weeks (employer-driven)" |
| costs | "~€350 per person" |

### Narrative
**Pitch**: The pragmatic European choice. The Hague offers strong schools, a more manageable Dutch cost base than Amsterdam, and multiple realistic work/visa structures for this household.

**Pros**: Employer-sponsored scenarios may qualify for the 30% ruling, international community, EU healthcare, bike-friendly, safe, excellent schools

**Cons**: Gray weather, reserved culture, housing shortage, lower net income than DC, far from Kenya

---

## 4. Spain — Bilbao

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 3,800 |
| monthlyComfortable | 5,200 |
| internationalSchoolAnnual | 8,000-14,000 |
| healthInsuranceMonthly | 200-350 (private) or public healthcare access |
| costMultiplierVsDC | 0.52 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "Basque Country has own rates: 23-49% progressive" |
| capitalGainsTax | "19-26%" |
| socialCharges | "~6.4% employee social security" |
| specialRegime | "Beckham Law (24% flat on Spanish income for 6 years)" |
| estimatedEffectiveTotalRate | "24-28% under Beckham Law; must still file US" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 1,000-1,400 |
| rentMonthly3BR | 1,300-1,800 |
| buyMedianPrice | 250,000-350,000 |
| foreignOwnershipAllowed | true |

### Career Presets
```
[
  {
    id: "bilbao-remote-school",
    label: "Remote + International School",
    mekoce: "Remote EdTech/SPED consulting",
    kara: "Remote US-based work",
    combinedIncome: 100000,
    benefits: "Beckham Law (24% flat tax), FEIE, Basque quality of life, affordable housing"
  },
  {
    id: "bilbao-local",
    label: "Local Employment",
    mekoce: "Bilingual school or language academy",
    kara: "Local or remote work",
    combinedIncome: 65000,
    benefits: "Full integration, Spanish/Basque immersion, public healthcare"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 4 | ~12hr to Nairobi |
| childEducation | 7 | Good public + some international options |
| languageEnvironment | 9 | Spanish + Basque immersion |
| healthcareQuality | 9 | Spain's public healthcare excellent |
| safety | 9 | Very safe, family-oriented |
| climate | 7 | Mild but rainy (Atlantic coast) |
| culturalFit | 8 | Strong food culture, family values, walkable |
| careerSatisfaction | 5 | Limited English-language career options |
| communityBuilding | 7 | Basque people are warm once connected |
| politicalStability | 8 | Stable |
| adventureNovelty | 8 | Unique culture, food, mountain + coast |
| returnFlexibility | 7 | EU experience transferable |

### Visa Info
| Field | Value |
|---|---|
| type | "Digital Nomad Visa or Non-Lucrative Visa" |
| duration | "1 year (DNV from consulate), renewable to 3 years; NLV 1 year renewable" |
| requirements | "DNV: €2,849/mo income, remote employment, health insurance; NLV: ~€28,800/yr passive income, no work permitted" |
| processingTime | "1-3 months" |
| costs | "~€80 visa fee + ~€200 NIE/TIE" |

### Narrative
**Pitch**: The hidden gem. Bilbao offers world-class food, affordable Basque Country living, and genuine community at half DC's cost. The Beckham Law makes taxes manageable for remote workers.

**Pros**: Affordable by European standards, exceptional food culture, safe, excellent healthcare, beautiful setting (mountains + coast), family-oriented culture

**Cons**: Limited English-speaking career market, smaller expat community, rainy climate, fewer direct flights to Kenya

---

## 5. Netherlands — Amsterdam

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 6,500 |
| monthlyComfortable | 9,000 |
| internationalSchoolAnnual | 18,000-28,000 |
| healthInsuranceMonthly | 350-500 (mandatory basic ~€120/person + supplemental) |
| costMultiplierVsDC | 0.88 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "36.97% (up to ~€75K) / 49.5% (above)" |
| capitalGainsTax | "~1.2-1.6% deemed return (Box 3)" |
| socialCharges | "Included in income tax brackets" |
| specialRegime | "30% Ruling (reducing to 27% in 2027); income cap €262,000 applies to all from 2026" |
| estimatedEffectiveTotalRate | "30-35% with 30% ruling; must still file US but FTC offsets" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 2,500-3,400 |
| rentMonthly3BR | 3,100-4,200 |
| buyMedianPrice | 550,000-700,000 |
| foreignOwnershipAllowed | true |

### Career Presets
```
[
  {
    id: "ams-kara-hsm-school",
    label: "Kara HSM + Mekoce School",
    mekoce: "International school SEN / inclusion role",
    kara: "Tech / operations / program role",
    combinedIncome: 155000,
    benefits: "Possible 30% ruling, broader job market, school-role stability"
  },
  {
    id: "ams-kara-daft-school",
    label: "Kara DAFT + Mekoce School",
    mekoce: "International school SEN / inclusion role",
    kara: "DAFT business owner / consultancy / co-owned project",
    combinedIncome: 115000,
    benefits: "DAFT path with spouse salaried work rights, EU healthcare"
  },
  {
    id: "ams-both-remote",
    label: "Both Remote from NL Base",
    mekoce: "Remote SPED consulting",
    kara: "Remote operations / strategy / program work",
    combinedIncome: 150000,
    benefits: "Higher remote ceiling, Amsterdam network base, but residency still needs structure"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 4 | ~10hr flight to Nairobi (direct KLM) |
| childEducation | 9 | Many international schools, Dutch system also excellent |
| languageEnvironment | 7 | Dutch + very high English proficiency |
| healthcareQuality | 9 | Universal, high quality |
| safety | 8 | Very safe overall |
| climate | 4 | Gray, rainy, windy — worse than The Hague |
| culturalFit | 7 | Very international, diverse, progressive |
| careerSatisfaction | 8 | Strong job market for skilled workers |
| communityBuilding | 7 | Large expat community but transient |
| politicalStability | 8 | Stable democracy |
| adventureNovelty | 7 | Canal city, European travel hub |
| returnFlexibility | 8 | Internationally recognized experience |

### Visa Info
| Field | Value |
|---|---|
| type | "Highly Skilled Migrant (HSM)" |
| duration | "5 years, renewable; permanent residency after 5 years" |
| requirements | "Employer must be recognized sponsor; salary threshold €48,013/yr (2026); Master's under-30 threshold €36,497" |
| processingTime | "2-4 weeks" |
| costs | "~€350 per person" |

### Narrative
**Pitch**: The higher-upside Dutch option. Amsterdam can deliver more opportunity than The Hague, but only if the household earns enough to outrun Amsterdam-level housing pressure.

**Pros**: Strong job market, employer-sponsored scenarios may qualify for the 30% ruling, international city, direct KLM flights to Nairobi, world-class cycling infrastructure, diverse & progressive

**Cons**: Very expensive housing (approaching DC levels), gray weather, tourist overcrowding, housing shortage makes finding apartments competitive, cost of living nearly as high as DC

---

## 6. Mexico — Mexico City (CDMX)

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 3,200 |
| monthlyComfortable | 5,000 |
| internationalSchoolAnnual | 8,000-18,000 |
| healthInsuranceMonthly | 150-300 (private; public IMSS ~$50) |
| costMultiplierVsDC | 0.45 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "1.92-35% progressive (ISR); 183+ days = tax resident on worldwide income" |
| capitalGainsTax | "10% on Mexican real estate; 35% on other gains for residents" |
| socialCharges | "~2% employee contribution if locally employed" |
| specialRegime | "None; but FEIE ($132,900 in 2026) shelters most US-source income from US tax" |
| estimatedEffectiveTotalRate | "20-28% depending on income structure; remote US income + FEIE can minimize Mexican tax exposure with careful structuring" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 1,200-1,800 (Roma/Condesa); 800-1,100 (Narvarte/Del Valle) |
| rentMonthly3BR | 1,800-2,800 (Roma/Condesa); 1,200-1,800 (outer neighborhoods) |
| buyMedianPrice | 200,000-350,000 (comparable 2-3BR in Roma/Condesa) |
| foreignOwnershipAllowed | true (CDMX is outside restricted zone; direct ownership) |

### Career Presets
```
[
  {
    id: "cdmx-remote-dual",
    label: "Dual Remote (US-Based Income)",
    mekoce: "Remote SPED consulting / EdTech",
    kara: "Remote US-based work",
    combinedIncome: 130000,
    benefits: "US income at Mexican costs, FEIE shelter, world-class food & culture"
  },
  {
    id: "cdmx-school-remote",
    label: "International School + Remote",
    mekoce: "American/international school SPED teacher ($25K-45K local)",
    kara: "Remote US-based work",
    combinedIncome: 115000,
    benefits: "Tuition discount for daughter, structured schedule, Kara's income stretches far"
  },
  {
    id: "cdmx-entrepreneur",
    label: "EdTech Startup + Freelance",
    mekoce: "Build SPED EdTech tools (IEP Pulse expansion for LatAm)",
    kara: "Freelance / remote consulting",
    combinedIncome: 80000,
    benefits: "Lower burn rate, entrepreneurial freedom, huge LatAm education market"
  },
  {
    id: "cdmx-ngo",
    label: "Education NGO + Remote",
    mekoce: "Disability inclusion NGO",
    kara: "Remote US-based work",
    combinedIncome: 100000,
    benefits: "Mission-driven, growing SPED awareness in Mexico, strong NGO sector in CDMX"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 3 | ~20hr to Nanyuki (2 flights) |
| childEducation | 7 | Many international schools, bilingual options |
| languageEnvironment | 9 | Full Spanish immersion, daughter grows up bilingual |
| healthcareQuality | 7 | Good private hospitals, affordable |
| safety | 5 | Neighborhood-dependent; expat areas generally safe |
| climate | 8 | Eternal spring at altitude (2,200m), mild year-round |
| culturalFit | 8 | Incredible food, art, music; family-oriented culture |
| careerSatisfaction | 7 | Growing EdTech/education scene |
| communityBuilding | 8 | Huge expat community, very welcoming culture |
| politicalStability | 6 | Stable but corruption concerns |
| adventureNovelty | 9 | Enormous city with endless exploration |
| returnFlexibility | 8 | Close to US, easy to return |

### Visa Info
| Field | Value |
|---|---|
| type | "Temporary Resident Visa (Residente Temporal)" |
| duration | "1 year, renewable up to 4 years total" |
| requirements | "Monthly income ~$4,400/mo (2026) or savings of ~$73K; family unity route waives financial req if spouse qualifies" |
| processingTime | "2-6 weeks at Mexican consulate" |
| costs | "~$400-600 per person (doubled in 2026; 50% discount for family unity)" |

### Narrative
**Pitch**: The best bang-for-your-buck cosmopolitan move. Mexico City offers world-class culture, food, and bilingual immersion at 45% of DC costs, with easy flights home. The largest city in North America has everything — and your dollar goes incredibly far.

**Pros**: Extreme cost advantage, full Spanish immersion, incredible food/culture, huge expat community, close to US (3.5hr flight), mild climate, direct ownership allowed, growing education sector

**Cons**: Air quality issues, traffic/commute, safety requires neighborhood awareness, Mexican tax residency triggers worldwide taxation, bureaucracy, distance from Kenya

---

## 7. Mexico — Oaxaca

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 2,200 |
| monthlyComfortable | 3,500 |
| internationalSchoolAnnual | 3,000-6,000 (limited options; mostly bilingual private schools) |
| healthInsuranceMonthly | 100-200 (private) |
| costMultiplierVsDC | 0.32 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "Same as CDMX: 1.92-35% progressive" |
| capitalGainsTax | "Same as CDMX" |
| socialCharges | "Same as CDMX" |
| specialRegime | "None; same federal Mexican tax law" |
| estimatedEffectiveTotalRate | "20-28% (same structure as CDMX)" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 500-900 (Centro/Jalatlaco); 250-500 (Xoxocotlan/outer) |
| rentMonthly3BR | 800-1,500 (Centro); 500-800 (outer areas) |
| buyMedianPrice | 120,000-220,000 |
| foreignOwnershipAllowed | true (Oaxaca City is outside restricted zone) |

### Career Presets
```
[
  {
    id: "oaxaca-remote-dual",
    label: "Dual Remote (US-Based)",
    mekoce: "Remote SPED consulting / EdTech / writing",
    kara: "Remote US-based work",
    combinedIncome: 120000,
    benefits: "US income at extremely low costs, artistic community, slow living"
  },
  {
    id: "oaxaca-creative-remote",
    label: "Creative + Remote",
    mekoce: "Writing (essays/book) + part-time remote SPED",
    kara: "Remote US-based work",
    combinedIncome: 95000,
    benefits: "Space for creative work, minimal cost pressure, artisan culture"
  },
  {
    id: "oaxaca-local-school",
    label: "Local Bilingual School + Remote",
    mekoce: "Bilingual school teacher ($12K-18K local salary)",
    kara: "Remote US-based work",
    combinedIncome: 105000,
    benefits: "Daughter in bilingual environment, Kara's income carries the family easily"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 2 | Remote from everything — 24+ hr to Nanyuki |
| childEducation | 4 | Limited international/English options; strong bilingual private schools |
| languageEnvironment | 10 | Deep Spanish + indigenous language immersion |
| healthcareQuality | 5 | Basic private care; serious needs require CDMX/Puebla |
| safety | 6 | Generally safe for expats; protests can disrupt |
| climate | 8 | Warm and dry, pleasant year-round |
| culturalFit | 9 | Artisan culture, food capital of Mexico, community-oriented |
| careerSatisfaction | 5 | Very limited local career options |
| communityBuilding | 7 | Growing expat community, strong local culture |
| politicalStability | 5 | Occasional teacher union strikes, road blockades |
| adventureNovelty | 9 | Extraordinary culture, food, indigenous heritage |
| returnFlexibility | 6 | Remote location; flights via CDMX |

### Visa Info
| Field | Value |
|---|---|
| type | "Temporary Resident Visa (same as CDMX)" |
| duration | "1 year, renewable up to 4 years" |
| requirements | "Same as CDMX: ~$4,400/mo income or ~$73K savings" |
| processingTime | "2-6 weeks" |
| costs | "~$400-600 per person" |

### Narrative
**Pitch**: The radical downshift. Oaxaca is where you go to write the book, make the art, and live richly on very little. The food alone is worth it. But this is a lifestyle choice, not a career move — your daughter's education options are limited.

**Pros**: Absurdly low cost of living (32% of DC), world's best food region, deep cultural immersion, creative community, warm climate, space to breathe and create

**Cons**: Limited education options for daughter, healthcare limitations, remote location (connections via CDMX), limited career opportunities, infrastructure gaps, occasional political disruptions

---

## 8. Colombia — Medellin

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 2,500 |
| monthlyComfortable | 4,000 |
| internationalSchoolAnnual | 7,500-15,000 |
| healthInsuranceMonthly | 150-300 (private EPS/prepagada plan for family) |
| costMultiplierVsDC | 0.40 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "0-39% progressive; tax-free up to ~$14K (1,090 UVT)" |
| capitalGainsTax | "15% (separate from income tax)" |
| socialCharges | "~8% employee (health 4% + pension 4%); employer pays more" |
| specialRegime | "None for general expats; pension income exempt up to 1,000 UVT/mo" |
| estimatedEffectiveTotalRate | "25-33% for resident; FEIE + FTC offsets US filing; Colombian rates can be steep at higher brackets" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 700-1,200 (Laureles); 900-1,600 (El Poblado) |
| rentMonthly3BR | 1,000-1,800 (Laureles); 1,400-2,500 (El Poblado) |
| buyMedianPrice | 100,000-250,000 (nice 2-3BR in Laureles or Poblado) |
| foreignOwnershipAllowed | true (no restrictions; same process as Colombians) |

### Career Presets
```
[
  {
    id: "med-remote-dual",
    label: "Dual Remote (US-Based)",
    mekoce: "Remote SPED consulting / EdTech",
    kara: "Remote US-based work",
    combinedIncome: 130000,
    benefits: "US income at 40% DC costs, eternal spring climate, growing tech scene"
  },
  {
    id: "med-school-remote",
    label: "International School + Remote",
    mekoce: "Columbus School or TCS teacher ($20K-35K)",
    kara: "Remote US-based work",
    combinedIncome: 110000,
    benefits: "Tuition discount, structured schedule, Kara's income is the anchor"
  },
  {
    id: "med-entrepreneur",
    label: "EdTech Entrepreneur + Remote",
    mekoce: "IEP Pulse LatAm expansion / SPED consulting",
    kara: "Remote US-based work",
    combinedIncome: 95000,
    benefits: "Growing EdTech ecosystem, low burn rate, Medellin has startup culture"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 3 | ~22hr to Nanyuki (2+ flights) |
| childEducation | 7 | Good international schools (Columbus School, TCS) |
| languageEnvironment | 9 | Full Spanish immersion, clear Paisa accent good for learning |
| healthcareQuality | 8 | Colombia has excellent private healthcare; medical tourism hub |
| safety | 5 | Dramatically improved but requires neighborhood awareness |
| climate | 10 | "City of Eternal Spring" — 70-80F year-round at 1,500m |
| culturalFit | 8 | Warm, family-oriented, vibrant music/food |
| careerSatisfaction | 6 | Growing but still limited English-language market |
| communityBuilding | 8 | Massive expat community, very welcoming locals |
| politicalStability | 5 | Improved but ongoing political transitions |
| adventureNovelty | 9 | Mountains, coffee region, Caribbean coast |
| returnFlexibility | 7 | 5hr flight to Miami |

### Visa Info
| Field | Value |
|---|---|
| type | "Digital Nomad Visa (Type V)" |
| duration | "Up to 2 years" |
| requirements | "Remote income from foreign sources; ~$1,435/mo minimum (3x minimum wage 2026); health insurance; clean criminal record" |
| processingTime | "Up to 30 business days" |
| costs | "~$177 study fee + ~$232 visa issuance" |

### Narrative
**Pitch**: The lifestyle optimizer. Medellin's perfect climate, excellent healthcare, and rock-bottom costs make it the sweet spot between adventure and comfort. At 40% of DC costs, your savings rate could be extraordinary.

**Pros**: Best climate on the list, excellent private healthcare, very low cost of living, welcoming culture, growing tech ecosystem, no foreign ownership restrictions, easy digital nomad visa

**Cons**: Distance from Kenya, 183-day tax residency triggers worldwide taxation at steep rates, safety requires awareness, Colombian bureaucracy, limited top-tier international school options compared to CDMX

---

## 9. Uruguay — Montevideo

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 3,500 |
| monthlyComfortable | 5,000 |
| internationalSchoolAnnual | 10,000-18,000 |
| healthInsuranceMonthly | 200-400 (mutualista system, ~$70-150/person) |
| costMultiplierVsDC | 0.52 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "0-36% progressive (IRPF) on Uruguayan-source income" |
| capitalGainsTax | "12% (IRPF on capital income)" |
| socialCharges | "~15% employee contributions (health + pension + labor fund)" |
| specialRegime | "Tax Holiday 2.0 (2026+): 10-year exemption on foreign-source income for new residents (183-day presence); then 5 years at 6% reduced rate" |
| estimatedEffectiveTotalRate | "10-18% during Tax Holiday (only local income taxed); effectively 0% on foreign capital income for 10 years" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 800-1,200 (Pocitos/Punta Carretas) |
| rentMonthly3BR | 1,200-1,800 (Pocitos); 900-1,300 (Cordon/Parque Rodo) |
| buyMedianPrice | 180,000-300,000 |
| foreignOwnershipAllowed | true (no restrictions whatsoever) |

### Career Presets
```
[
  {
    id: "mvd-remote-dual",
    label: "Dual Remote (US-Based)",
    mekoce: "Remote SPED consulting / EdTech",
    kara: "Remote US-based work",
    combinedIncome: 130000,
    benefits: "Tax Holiday = near-zero local tax on foreign income for 10 years; stable democracy"
  },
  {
    id: "mvd-school-remote",
    label: "International School + Remote",
    mekoce: "UAS or GEMS teacher ($20K-30K)",
    kara: "Remote US-based work",
    combinedIncome: 110000,
    benefits: "Tuition discount, structured life, Tax Holiday benefits on Kara's remote income"
  },
  {
    id: "mvd-entrepreneur",
    label: "EdTech + Passive Income",
    mekoce: "Build EdTech products + investment income",
    kara: "Remote / freelance",
    combinedIncome: 90000,
    benefits: "Tax Holiday shelters investment income, free-trade zone companies taxed at 0%, stable banking system"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 2 | ~28hr to Nanyuki (3 flights typically) |
| childEducation | 7 | Good international schools (UAS, GEMS, Crandon) |
| languageEnvironment | 8 | Spanish immersion, Rioplatense dialect |
| healthcareQuality | 7 | Mutualista system is solid; private options too |
| safety | 7 | Safest country in South America |
| climate | 6 | Temperate, four seasons, humid summers |
| culturalFit | 7 | Progressive, mate culture, beach lifestyle, laid-back |
| careerSatisfaction | 5 | Small market, limited English-language options |
| communityBuilding | 6 | Smaller expat community; Uruguayans are friendly but reserved |
| politicalStability | 9 | Most stable democracy in South America |
| adventureNovelty | 7 | Beach culture, wine country, Punta del Este, Buenos Aires nearby |
| returnFlexibility | 6 | Less connected than CDMX; flights via Panama/Miami |

### Visa Info
| Field | Value |
|---|---|
| type | "Residencia Legal Permanente (direct permanent residency)" |
| duration | "Permanent from day one" |
| requirements | "Proof of income (~$1,500/mo for family), clean criminal record, health certificate; no minimum investment for income-based route" |
| processingTime | "3-6 months (Uruguay processes are slow)" |
| costs | "~$200-400 total in fees" |

### Narrative
**Pitch**: The tax-optimized stability play. Uruguay's new Tax Holiday 2.0 gives you 10 years of near-zero tax on foreign income, combined with South America's most stable democracy and direct permanent residency. Politically, it's the "Switzerland of South America."

**Pros**: 10-year tax holiday on foreign income (extraordinary benefit), direct permanent residency, most stable country in the region, birthright citizenship for children, progressive social policies, no foreign ownership restrictions, strong banking system

**Cons**: Furthest from Kenya on this list, small city (1.4M) can feel quiet, higher cost of living than Colombia/Mexico, limited career market, weather is underwhelming, slow bureaucracy

---

## 10. Spain — Barcelona (Placeholder/Shallow)

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 4,500 |
| monthlyComfortable | 6,200 |
| internationalSchoolAnnual | 9,000-16,000 |
| healthInsuranceMonthly | 200-400 (private) or public access |
| costMultiplierVsDC | 0.60 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "19-47% progressive (Catalonia has slightly higher top rates)" |
| capitalGainsTax | "19-26%" |
| socialCharges | "~6.4% employee" |
| specialRegime | "Beckham Law (24% flat for 6 years)" |
| estimatedEffectiveTotalRate | "24-28% under Beckham Law" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 1,600-2,200 |
| rentMonthly3BR | 2,000-2,800 |
| buyMedianPrice | 350,000-500,000 |
| foreignOwnershipAllowed | true |

### Career Presets
```
[
  {
    id: "bcn-remote-dual",
    label: "Dual Remote",
    mekoce: "Remote SPED/EdTech",
    kara: "Remote US-based work",
    combinedIncome: 120000,
    benefits: "Beckham Law, Mediterranean lifestyle, beach + city, tech hub"
  },
  {
    id: "bcn-tech-school",
    label: "Tech + International School",
    mekoce: "International school teacher",
    kara: "Tech/startup role",
    combinedIncome: 90000,
    benefits: "Growing Barcelona tech scene, Mediterranean climate"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 4 | ~12hr to Nairobi |
| childEducation | 8 | Many international schools |
| languageEnvironment | 9 | Spanish + Catalan |
| healthcareQuality | 9 | Excellent public healthcare |
| safety | 8 | Safe; petty crime in tourist areas |
| climate | 9 | Mediterranean — warm, sunny |
| culturalFit | 8 | Vibrant, international, food/beach culture |
| careerSatisfaction | 7 | Growing tech hub |
| communityBuilding | 7 | Large expat community |
| politicalStability | 7 | Catalonia independence tensions, but stable |
| adventureNovelty | 8 | Beach + mountains + Europe |
| returnFlexibility | 7 | Well-connected airport |

### Visa Info
| Field | Value |
|---|---|
| type | "Digital Nomad Visa or Non-Lucrative Visa" |
| duration | "1-3 years" |
| requirements | "Same as Bilbao (Spain-wide): DNV €2,849/mo; NLV ~€28,800/yr" |
| processingTime | "1-3 months" |
| costs | "~€80-280" |

### Narrative
**Pitch**: The Mediterranean dream. Barcelona delivers beach, culture, food, and a growing tech scene at 60% of DC costs. More expensive than other Spanish cities but with far more energy and career opportunities.

**Pros**: Mediterranean climate, beach + city, international community, growing tech scene, Beckham Law tax benefit, excellent schools

**Cons**: Most expensive Spanish city on this list, tourist overcrowding, rental market very competitive, Catalan language adds complexity, cost rising fast

---

## 11. Spain — Madrid (Placeholder/Shallow)

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 4,200 |
| monthlyComfortable | 5,800 |
| internationalSchoolAnnual | 8,000-15,000 |
| healthInsuranceMonthly | 200-350 |
| costMultiplierVsDC | 0.57 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "19-45% progressive (Madrid region has lower top rate than Catalonia)" |
| capitalGainsTax | "19-26%" |
| socialCharges | "~6.4% employee" |
| specialRegime | "Beckham Law (24% flat for 6 years)" |
| estimatedEffectiveTotalRate | "24-28% under Beckham Law" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 1,500-2,100 |
| rentMonthly3BR | 1,900-2,600 |
| buyMedianPrice | 300,000-450,000 |
| foreignOwnershipAllowed | true |

### Career Presets
```
[
  {
    id: "mad-remote-dual",
    label: "Dual Remote",
    mekoce: "Remote SPED/EdTech",
    kara: "Remote US-based work",
    combinedIncome: 120000,
    benefits: "Beckham Law, capital city resources, central location, lower taxes than Catalonia"
  },
  {
    id: "mad-corporate-school",
    label: "Corporate + International School",
    mekoce: "International school / American School of Madrid",
    kara: "Corporate role (many multinationals HQ here)",
    combinedIncome: 95000,
    benefits: "Largest job market in Spain, many multinationals, excellent transit"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 4 | ~12hr to Nairobi |
| childEducation | 8 | Large selection of international schools |
| languageEnvironment | 9 | Pure Castilian Spanish |
| healthcareQuality | 9 | Excellent |
| safety | 8 | Very safe major city |
| climate | 7 | Hot dry summers, cold winters (continental) |
| culturalFit | 8 | Rich culture, nightlife, food, museums |
| careerSatisfaction | 7 | Best job market in Spain |
| communityBuilding | 7 | Large expat community |
| politicalStability | 8 | Stable |
| adventureNovelty | 7 | Central Spain, day trips to Toledo/Segovia |
| returnFlexibility | 8 | Major international hub airport |

### Visa Info
| Field | Value |
|---|---|
| type | "Digital Nomad Visa or Non-Lucrative Visa" |
| duration | "1-3 years" |
| requirements | "Same Spain-wide requirements" |
| processingTime | "1-3 months" |
| costs | "~€80-280" |

### Narrative
**Pitch**: Spain's capital offers the best career market in the country, pure Castilian Spanish, and lower regional taxes than Barcelona. Slightly cheaper than Barcelona with more corporate opportunities.

**Pros**: Best job market in Spain, lower regional taxes, excellent transit (metro), cultural capital, Beckham Law, central European flight hub

**Cons**: No beach (3+ hours away), hot summers/cold winters, less charming than Barcelona or Bilbao, can feel large/impersonal

---

## 12. Spain — Valencia (Placeholder/Shallow)

### Cost of Living (family of 3)
| Field | Value |
|---|---|
| monthlyBaseline | 3,500 |
| monthlyComfortable | 4,800 |
| internationalSchoolAnnual | 6,000-12,000 |
| healthInsuranceMonthly | 180-320 |
| costMultiplierVsDC | 0.48 |

### Tax Regime
| Field | Value |
|---|---|
| incomeTaxRate | "19-47% progressive (Valencian Community rates)" |
| capitalGainsTax | "19-26%" |
| socialCharges | "~6.4% employee" |
| specialRegime | "Beckham Law (24% flat for 6 years)" |
| estimatedEffectiveTotalRate | "24-28% under Beckham Law" |

### Housing
| Field | Value |
|---|---|
| rentMonthly2BR | 1,000-1,500 |
| rentMonthly3BR | 1,300-1,900 |
| buyMedianPrice | 200,000-320,000 |
| foreignOwnershipAllowed | true |

### Career Presets
```
[
  {
    id: "val-remote-dual",
    label: "Dual Remote",
    mekoce: "Remote SPED/EdTech",
    kara: "Remote US-based work",
    combinedIncome: 120000,
    benefits: "Beckham Law, beach lifestyle, cheapest Spanish city on this list"
  },
  {
    id: "val-school-remote",
    label: "Local School + Remote",
    mekoce: "Bilingual school or language academy",
    kara: "Remote US-based work",
    combinedIncome: 100000,
    benefits: "Beach + affordability, daughter in bilingual school, free public preschool"
  }
]
```

### Quality of Life (1-10)
| Dimension | Score | Notes |
|---|---|---|
| familyProximity | 4 | ~13hr to Nairobi |
| childEducation | 7 | Good options, fewer than Barcelona/Madrid |
| languageEnvironment | 9 | Spanish + Valencian (Catalan variant) |
| healthcareQuality | 8 | Good public system |
| safety | 8 | Very safe |
| climate | 9 | Mediterranean — 300+ sunny days, mild winters |
| culturalFit | 8 | Beach culture, paella hometown, family-oriented |
| careerSatisfaction | 5 | Limited English-language career options |
| communityBuilding | 7 | Growing expat community |
| politicalStability | 8 | Stable |
| adventureNovelty | 7 | Beach, mountains, festivals (Fallas) |
| returnFlexibility | 6 | Smaller airport, connections via Madrid |

### Visa Info
| Field | Value |
|---|---|
| type | "Digital Nomad Visa or Non-Lucrative Visa" |
| duration | "1-3 years" |
| requirements | "Same Spain-wide requirements" |
| processingTime | "1-3 months" |
| costs | "~€80-280" |

### Narrative
**Pitch**: The value-Mediterranean pick. Valencia gives you Barcelona's beach lifestyle at Bilbao's prices, plus Spain's best weather. If career ambition takes a back seat to quality of life, this is the winner.

**Pros**: Cheapest beach city in Spain, excellent climate (300+ sunny days), free public preschool, paella capital, Beckham Law, affordable housing, growing digital nomad community

**Cons**: Smallest job market of the Spanish cities, fewer international school options, airport less connected, can feel sleepy compared to Barcelona/Madrid, recent catastrophic flooding risk (2024)

---

## Comparative Summary Table

| Destination | Monthly Comfortable | Cost Multiplier | Tax Rate (Effective) | 2BR Rent | Climate | Family Proximity | Safety |
|---|---|---|---|---|---|---|---|
| DC (Baseline) | $10,500 | 1.00 | 28-32% | $2,800 | 5/10 | 3/10 | 5/10 |
| Kenya (Nairobi) | $5,500 | 0.45 | 25-30% | $1,600 | 8/10 | 9/10 | 4/10 |
| Netherlands (The Hague) | $7,500 | 0.75 | 30-35% | $2,100 | 4/10 | 4/10 | 9/10 |
| Netherlands (Amsterdam) | $9,000 | 0.88 | 30-35% | $2,950 | 4/10 | 4/10 | 8/10 |
| Spain (Bilbao) | $5,200 | 0.52 | 24-28% | $1,200 | 7/10 | 4/10 | 9/10 |
| Spain (Barcelona) | $6,200 | 0.60 | 24-28% | $1,900 | 9/10 | 4/10 | 8/10 |
| Spain (Madrid) | $5,800 | 0.57 | 24-28% | $1,800 | 7/10 | 4/10 | 8/10 |
| Spain (Valencia) | $4,800 | 0.48 | 24-28% | $1,250 | 9/10 | 4/10 | 8/10 |
| Mexico (CDMX) | $5,000 | 0.45 | 20-28% | $1,500 | 8/10 | 3/10 | 5/10 |
| Mexico (Oaxaca) | $3,500 | 0.32 | 20-28% | $700 | 8/10 | 2/10 | 6/10 |
| Colombia (Medellin) | $4,000 | 0.40 | 25-33% | $950 | 10/10 | 3/10 | 5/10 |
| Uruguay (Montevideo) | $5,000 | 0.52 | 10-18%* | $1,000 | 6/10 | 2/10 | 7/10 |

*\* Uruguay Tax Holiday 2.0 rate during 10-year exemption period on foreign-source income*

---

## Key Decision Axes

### Closest to Kenya (family proximity)
1. **Kenya/Nairobi** (9/10) — 3hr drive to Nanyuki
2. All others are 10-28hr travel time (3-4/10)

### Lowest Cost of Living
1. **Oaxaca** (0.32x DC)
2. **Medellin** (0.40x DC)
3. **CDMX** / **Nairobi** (0.45x DC)
4. **Valencia** (0.48x DC)

### Best Tax Situation (for remote US income)
1. **Uruguay** — Tax Holiday 2.0 (near-zero on foreign income for 10 years)
2. **Spain (any)** — Beckham Law (24% flat for 6 years)
3. **Kenya** — FEIE covers most income
4. **Netherlands** — 30% ruling helps but still high

### Climate Rubric (Oakland = 10 anchor)

Climate is rated 1–10 against **Oakland, CA = 10**: mild Mediterranean coastal, 50–70°F year-round, dry summers (Jun–Oct), mild wet winters (Nov–Mar), rare temperature extremes, abundant sun. This is Mekoce and Kara's stated preference.

| Score | Meaning |
|---|---|
| **10** | Oakland-equivalent: mild year-round, no temperature extremes, low humidity, plenty of sun |
| **9** | Very close to Oakland (small giveaway: slightly warmer, slightly more humid, or a short rainy season) |
| **7–8** | Pleasant with one real trade-off (hot summer weeks, a persistent rainy season, air-quality days, or notable humidity) |
| **5–6** | Mixed — strong seasonality, with real heat, cold, humidity, or wet stretches that meaningfully reduce comfort |
| **3–4** | Persistently gray/cold/wet, *or* severe seasonal extremes — the climate is a drawback, not a draw |
| **1–2** | Dealbreaker-level discomfort year-round (none of the current destinations hit this) |

### Best Climate (Oakland-calibrated)
1. **Medellin** (9 — eternal spring, slightly warmer/more humid than Oakland)
2. **Nairobi** (9 — high-altitude equatorial, 70s days / 50s nights, closest diurnal match)
3. **Barcelona / Valencia / CDMX** (7 — sunny or mild but with summer humidity, air quality, or rainy-season trade-offs)
4. **Oaxaca / Bilbao** (6 — April heat or persistent rain)
5. **Madrid / Montevideo** (5–6 — continental or humid-subtropical extremes)
6. **DC** (4 — humid summers + cold winters)
7. **Amsterdam / The Hague** (3 — gray, rainy, windy)

**Source for per-destination notes:** see `qolNotes.climate` in each `src/data/destinations/*.ts` file. Those plain-language descriptions are the source of truth and should be updated alongside the numeric score if either changes.

### Best for Daughter's Education + Language
1. **CDMX** — best combo of school options + Spanish immersion
2. **Amsterdam** / **The Hague** — best school quality overall
3. **Barcelona** — international schools + beach + Spanish/Catalan

### Best Career Market
1. **Amsterdam** — tech hub, highest earning potential in Europe
2. **DC** — established, highest current income
3. **Madrid** — best in Spain
4. **CDMX** — growing EdTech scene

### Highest Savings Rate Potential
*(Comfortable income minus comfortable expenses)*
1. **Oaxaca** with dual remote ($120K - $42K/yr = $78K saved)
2. **Medellin** with dual remote ($130K - $48K/yr = $82K saved)
3. **Uruguay** with dual remote + Tax Holiday ($130K - $60K/yr = $70K saved, plus minimal taxes)
4. **CDMX** with dual remote ($130K - $60K/yr = $70K saved)
