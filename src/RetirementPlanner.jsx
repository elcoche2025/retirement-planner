import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const fmt = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

const fmtFull = (n) => `$${Math.round(n).toLocaleString()}`;

const COLORS = {
  bg: "#0f1117",
  card: "#1a1d27",
  cardAlt: "#222633",
  accent1: "#e07a3a",
  accent2: "#3aa5e0",
  accent3: "#6ee03a",
  accent4: "#e03a8a",
  accent5: "#c9a227",
  text: "#e8e4df",
  textDim: "#8a8680",
  border: "#2e3140",
  input: "#13151d",
  slider: "#e07a3a",
};

function Slider({ label, value, onChange, min, max, step = 1, format = fmtFull, suffix = "" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.03em" }}>{label}</span>
        <span style={{ color: COLORS.accent1, fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
          {format(value)}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          height: 6,
          borderRadius: 3,
          appearance: "none",
          background: `linear-gradient(to right, ${COLORS.accent1} 0%, ${COLORS.accent1} ${((value - min) / (max - min)) * 100}%, ${COLORS.border} ${((value - min) / (max - min)) * 100}%, ${COLORS.border} 100%)`,
          outline: "none",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: value ? COLORS.accent1 : COLORS.border,
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            background: COLORS.text,
            position: "absolute",
            top: 3,
            left: value ? 21 : 3,
            transition: "left 0.2s",
          }}
        />
      </div>
      <span style={{ color: COLORS.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
    </div>
  );
}

function SectionTitle({ children, color = COLORS.accent1 }) {
  return (
    <h3
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 17,
        color,
        margin: "20px 0 12px",
        borderBottom: `1px solid ${COLORS.border}`,
        paddingBottom: 8,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </h3>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 10,
        padding: 18,
        marginBottom: 14,
        border: `1px solid ${COLORS.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatBox({ label, value, color = COLORS.accent1, sub = null }) {
  return (
    <div style={{ textAlign: "center", flex: 1, minWidth: 100, padding: "8px 4px" }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: COLORS.textDim, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function computeScenario(params) {
  const {
    currentAge,
    retireAge,
    homeValue,
    mortgageBalance,
    closingCostPct,
    sellHome,
    rentHome,
    monthlyRent,
    propertyMgmtPct,
    monthlyMortgage,
    monthlyInsuranceTax,
    monthlyMaintenance,
    annualRentIncrease,
    homeAppreciation,
    current457b,
    convertToRoth,
    rothTaxRate,
    annualRothContribution,
    annualReturnRate,
    schoolSalary,
    schoolRetirementPct,
    wifeSalary,
    kenyaAnnualCost,
    dcAnnualCost,
    dcSalary,
    dc457bContribution,
    dcWifeSalary,
    ssMonthlyEstimate,
    dcSSMonthlyEstimate,
    dcPensionAnnual,
    extraBrokerageContribution,
  } = params;

  const years = retireAge - currentAge;
  const r = annualReturnRate / 100;

  // --- KENYA SCENARIO ---
  let homeSaleProceeds = 0;
  let rentalCashFlowTotal = 0;
  let homeEquityAtRetirement = 0;

  if (sellHome) {
    const closingCosts = homeValue * (closingCostPct / 100);
    homeSaleProceeds = Math.max(0, homeValue - mortgageBalance - closingCosts);
  }

  if (rentHome && !sellHome) {
    let cumulativeCashFlow = 0;
    let rent = monthlyRent;
    for (let y = 0; y < years; y++) {
      const annualRentIncome = rent * 12;
      const mgmtFee = annualRentIncome * (propertyMgmtPct / 100);
      const annualMortgage = monthlyMortgage * 12;
      const annualInsTax = monthlyInsuranceTax * 12;
      const annualMaint = monthlyMaintenance * 12;
      const netCashFlow = annualRentIncome - mgmtFee - annualMortgage - annualInsTax - annualMaint;
      cumulativeCashFlow += netCashFlow;
      rent *= 1 + annualRentIncrease / 100;
    }
    rentalCashFlowTotal = cumulativeCashFlow;
    homeEquityAtRetirement = homeValue * Math.pow(1 + homeAppreciation / 100, years);
    const remainingMortgage = Math.max(0, mortgageBalance - monthlyMortgage * 12 * years * 0.35);
    homeEquityAtRetirement -= remainingMortgage;
  }

  // Roth IRA
  let rothStart = current457b;
  if (convertToRoth) {
    rothStart = current457b * (1 - rothTaxRate / 100);
  }
  let rothBalance = rothStart;
  const rothTimeline = [{ year: 0, value: rothBalance }];
  for (let y = 1; y <= years; y++) {
    rothBalance = rothBalance * (1 + r) + annualRothContribution;
    rothTimeline.push({ year: y, value: rothBalance });
  }

  // Traditional IRA (if not converting to Roth)
  let tradIRABalance = convertToRoth ? 0 : current457b;
  for (let y = 0; y < years; y++) {
    tradIRABalance *= 1 + r;
  }

  // Home sale investment
  let homeSaleInvestment = homeSaleProceeds;
  const investmentTimeline = [{ year: 0, value: homeSaleInvestment }];
  for (let y = 1; y <= years; y++) {
    homeSaleInvestment *= 1 + r;
    investmentTimeline.push({ year: y, value: homeSaleInvestment });
  }

  // School retirement
  const annualSchoolRetirement = schoolSalary * (schoolRetirementPct / 100);
  let schoolRetirementBalance = 0;
  const schoolTimeline = [{ year: 0, value: 0 }];
  for (let y = 1; y <= years; y++) {
    schoolRetirementBalance = schoolRetirementBalance * (1 + r) + annualSchoolRetirement;
    schoolTimeline.push({ year: y, value: schoolRetirementBalance });
  }

  // Extra brokerage
  let brokerageBalance = 0;
  for (let y = 0; y < years; y++) {
    brokerageBalance = brokerageBalance * (1 + r) + extraBrokerageContribution;
  }

  const kenyaTotal =
    (convertToRoth ? rothBalance : tradIRABalance) +
    homeSaleInvestment +
    schoolRetirementBalance +
    brokerageBalance +
    (rentHome && !sellHome ? Math.max(0, homeEquityAtRetirement) : 0);

  const kenyaRothPortion = convertToRoth ? rothBalance : 0;
  const kenyaTaxablePortion = kenyaTotal - kenyaRothPortion;
  const kenyaAnnualWithdrawal = kenyaTotal * 0.04;
  const kenyaSS = ssMonthlyEstimate * 12;
  const kenyaTotalIncome = kenyaAnnualWithdrawal + kenyaSS;
  const kenyaTotalSpentLiving = kenyaAnnualCost * years;

  // --- DC SCENARIO ---
  let dc457bBalance = current457b;
  const dc457bTimeline = [{ year: 0, value: dc457bBalance }];
  for (let y = 1; y <= years; y++) {
    dc457bBalance = dc457bBalance * (1 + r) + dc457bContribution;
    dc457bTimeline.push({ year: y, value: dc457bBalance });
  }

  const dcHomeValue = homeValue * Math.pow(1 + homeAppreciation / 100, years);
  const dcMortgagePaid = monthlyMortgage * 12 * Math.min(years, 24);
  const dcRemainingMortgage = Math.max(0, mortgageBalance - dcMortgagePaid * 0.35);
  const dcHomeEquity = dcHomeValue - dcRemainingMortgage;

  const dcTotal = dc457bBalance + dcHomeEquity;
  const dcAnnualWithdrawal = dc457bBalance * 0.04;
  const dcSS = dcSSMonthlyEstimate * 12;
  const dcTotalIncome = dcAnnualWithdrawal + dcPensionAnnual + dcSS;
  const dcTotalSpentLiving = dcAnnualCost * years;

  // Combined timeline data
  const timelineData = [];
  let kRunning = homeSaleProceeds;
  let kRoth = rothStart;
  let kSchool = 0;
  let kBrokerage = 0;
  let dcRunning = current457b;

  for (let y = 0; y <= years; y++) {
    if (y > 0) {
      kRunning *= 1 + r;
      kRoth = kRoth * (1 + r) + annualRothContribution;
      kSchool = kSchool * (1 + r) + annualSchoolRetirement;
      kBrokerage = kBrokerage * (1 + r) + extraBrokerageContribution;
      dcRunning = dcRunning * (1 + r) + dc457bContribution;
    }
    const kTotal = kRunning + (convertToRoth ? kRoth : current457b * Math.pow(1 + r, y)) + kSchool + kBrokerage;
    timelineData.push({
      year: currentAge + y,
      kenya: Math.round(kTotal),
      dc: Math.round(dcRunning + homeValue * Math.pow(1 + homeAppreciation / 100, y) * 0.5),
    });
  }

  return {
    kenya: {
      homeSaleProceeds,
      rothBalance: convertToRoth ? rothBalance : 0,
      tradIRABalance: convertToRoth ? 0 : tradIRABalance,
      homeSaleInvestment,
      schoolRetirementBalance,
      brokerageBalance,
      rentalCashFlowTotal,
      homeEquityAtRetirement: rentHome && !sellHome ? homeEquityAtRetirement : 0,
      total: kenyaTotal,
      rothPortion: kenyaRothPortion,
      annualWithdrawal: kenyaAnnualWithdrawal,
      ssAnnual: kenyaSS,
      totalIncome: kenyaTotalIncome,
      totalSpentLiving: kenyaTotalSpentLiving,
    },
    dc: {
      balance457b: dc457bBalance,
      homeValue: dcHomeValue,
      homeEquity: dcHomeEquity,
      total: dcTotal,
      annualWithdrawal: dcAnnualWithdrawal,
      pensionAnnual: dcPensionAnnual,
      ssAnnual: dcSS,
      totalIncome: dcTotalIncome,
      totalSpentLiving: dcTotalSpentLiving,
    },
    timelineData,
    years,
  };
}

export default function RetirementPlanner() {
  const [tab, setTab] = useState("inputs");

  // Personal
  const [currentAge, setCurrentAge] = useState(43);
  const [retireAge, setRetireAge] = useState(62);

  // Home
  const [homeValue, setHomeValue] = useState(1100000);
  const [mortgageBalance, setMortgageBalance] = useState(622338);
  const [closingCostPct, setClosingCostPct] = useState(6);
  const [sellHome, setSellHome] = useState(true);
  const [rentHome, setRentHome] = useState(false);
  const [monthlyRent, setMonthlyRent] = useState(5000);
  const [propertyMgmtPct, setPropertyMgmtPct] = useState(8);
  const [monthlyMortgage, setMonthlyMortgage] = useState(4600);
  const [monthlyInsuranceTax, setMonthlyInsuranceTax] = useState(800);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState(400);
  const [annualRentIncrease, setAnnualRentIncrease] = useState(3);
  const [homeAppreciation, setHomeAppreciation] = useState(4);

  // Retirement accounts
  const [current457b, setCurrent457b] = useState(100000);
  const [convertToRoth, setConvertToRoth] = useState(true);
  const [rothTaxRate, setRothTaxRate] = useState(22);
  const [annualRothContribution, setAnnualRothContribution] = useState(7000);
  const [annualReturnRate, setAnnualReturnRate] = useState(7);

  // Kenya income
  const [schoolSalary, setSchoolSalary] = useState(60000);
  const [schoolRetirementPct, setSchoolRetirementPct] = useState(11);
  const [wifeSalary, setWifeSalary] = useState(25000);
  const [kenyaAnnualCost, setKenyaAnnualCost] = useState(50000);
  const [extraBrokerageContribution, setExtraBrokerageContribution] = useState(5000);

  // DC comparison
  const [dcSalary, setDcSalary] = useState(130000);
  const [dc457bContribution, setDc457bContribution] = useState(23500);
  const [dcWifeSalary, setDcWifeSalary] = useState(90000);
  const [dcAnnualCost, setDcAnnualCost] = useState(105000);

  // Social Security & Pension
  const [ssMonthlyEstimate, setSSMonthlyEstimate] = useState(2500);
  const [dcSSMonthlyEstimate, setDcSSMonthlyEstimate] = useState(3500);
  const [dcPensionAnnual, setDcPensionAnnual] = useState(58000);

  const results = useMemo(
    () =>
      computeScenario({
        currentAge, retireAge, homeValue, mortgageBalance, closingCostPct,
        sellHome, rentHome, monthlyRent, propertyMgmtPct, monthlyMortgage,
        monthlyInsuranceTax, monthlyMaintenance, annualRentIncrease, homeAppreciation,
        current457b, convertToRoth, rothTaxRate, annualRothContribution, annualReturnRate,
        schoolSalary, schoolRetirementPct, wifeSalary, kenyaAnnualCost,
        dcSalary, dc457bContribution, dcWifeSalary, dcAnnualCost,
        ssMonthlyEstimate, dcSSMonthlyEstimate, dcPensionAnnual, extraBrokerageContribution,
      }),
    [
      currentAge, retireAge, homeValue, mortgageBalance, closingCostPct,
      sellHome, rentHome, monthlyRent, propertyMgmtPct, monthlyMortgage,
      monthlyInsuranceTax, monthlyMaintenance, annualRentIncrease, homeAppreciation,
      current457b, convertToRoth, rothTaxRate, annualRothContribution, annualReturnRate,
      schoolSalary, schoolRetirementPct, wifeSalary, kenyaAnnualCost,
      dcSalary, dc457bContribution, dcWifeSalary, dcAnnualCost,
      ssMonthlyEstimate, dcSSMonthlyEstimate, dcPensionAnnual, extraBrokerageContribution,
    ]
  );

  const tabStyle = (t) => ({
    padding: "10px 0",
    flex: 1,
    textAlign: "center",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: tab === t ? COLORS.accent1 : COLORS.textDim,
    borderBottom: tab === t ? `2px solid ${COLORS.accent1}` : `1px solid ${COLORS.border}`,
    transition: "all 0.2s",
  });

  const netProceeds = sellHome ? Math.max(0, homeValue - mortgageBalance - homeValue * (closingCostPct / 100)) : 0;

  const incomeCompData = [
    { name: "Withdrawals", kenya: Math.round(results.kenya.annualWithdrawal), dc: Math.round(results.dc.annualWithdrawal) },
    { name: "Soc. Security", kenya: Math.round(results.kenya.ssAnnual), dc: Math.round(results.dc.ssAnnual) },
    { name: "Pension", kenya: 0, dc: Math.round(results.dc.pensionAnnual) },
  ];

  const assetBreakdown = [
    { name: "Investments", value: Math.round(results.kenya.homeSaleInvestment), color: COLORS.accent2 },
    { name: convertToRoth ? "Roth IRA" : "Trad. IRA", value: Math.round(convertToRoth ? results.kenya.rothBalance : results.kenya.tradIRABalance), color: COLORS.accent3 },
    { name: "School Retire.", value: Math.round(results.kenya.schoolRetirementBalance), color: COLORS.accent4 },
    { name: "Brokerage", value: Math.round(results.kenya.brokerageBalance), color: COLORS.accent5 },
  ].filter((d) => d.value > 0);

  if (results.kenya.homeEquityAtRetirement > 0) {
    assetBreakdown.push({ name: "Home Equity", value: Math.round(results.kenya.homeEquityAtRetirement), color: COLORS.accent1 });
  }

  return (
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.text,
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 0 40px",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${COLORS.accent1};
          cursor: pointer;
          border: 2px solid ${COLORS.bg};
          box-shadow: 0 0 6px rgba(224,122,58,0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${COLORS.accent1};
          cursor: pointer;
          border: 2px solid ${COLORS.bg};
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 18px 4px", borderBottom: `1px solid ${COLORS.border}` }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, margin: 0, color: COLORS.text, letterSpacing: "-0.02em" }}>
          Retirement Planner
        </h1>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: COLORS.accent1, margin: "4px 0 12px", letterSpacing: "0.04em" }}>
          DC ↔ KENYA SCENARIO COMPARISON
        </p>
      </div>

      {/* Quick Stats Bar */}
      <div style={{ display: "flex", background: COLORS.cardAlt, borderBottom: `1px solid ${COLORS.border}`, padding: "6px 0" }}>
        <StatBox label="Kenya Total" value={fmt(results.kenya.total)} color={COLORS.accent1} sub={`at age ${retireAge}`} />
        <div style={{ width: 1, background: COLORS.border, margin: "6px 0" }} />
        <StatBox label="DC Total" value={fmt(results.dc.total)} color={COLORS.accent2} sub={`at age ${retireAge}`} />
        <div style={{ width: 1, background: COLORS.border, margin: "6px 0" }} />
        <StatBox label="Gap" value={fmt(Math.abs(results.dc.total - results.kenya.total))} color={COLORS.textDim} sub={results.dc.total > results.kenya.total ? "DC ahead" : "Kenya ahead"} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 18px", background: COLORS.card }}>
        <div style={tabStyle("inputs")} onClick={() => setTab("inputs")}>Inputs</div>
        <div style={tabStyle("kenya")} onClick={() => setTab("kenya")}>Kenya</div>
        <div style={tabStyle("dc")} onClick={() => setTab("dc")}>DC</div>
        <div style={tabStyle("compare")} onClick={() => setTab("compare")}>Compare</div>
      </div>

      <div style={{ padding: "8px 18px" }}>
        {/* INPUTS TAB */}
        {tab === "inputs" && (
          <>
            <SectionTitle>Personal</SectionTitle>
            <Card>
              <Slider label="Current Age" value={currentAge} onChange={setCurrentAge} min={25} max={55} format={(v) => `${v}`} suffix=" yrs" />
              <Slider label="Retirement Age" value={retireAge} onChange={setRetireAge} min={55} max={72} format={(v) => `${v}`} suffix=" yrs" />
              <Slider label="Annual Investment Return" value={annualReturnRate} onChange={setAnnualReturnRate} min={3} max={12} step={0.5} format={(v) => `${v}`} suffix="%" />
            </Card>

            <SectionTitle color={COLORS.accent2}>Your Home</SectionTitle>
            <Card>
              <Slider label="Estimated Home Value" value={homeValue} onChange={setHomeValue} min={600000} max={1600000} step={10000} />
              <Slider label="Mortgage Balance" value={mortgageBalance} onChange={setMortgageBalance} min={0} max={900000} step={5000} />
              <Slider label="Closing Cost %" value={closingCostPct} onChange={setClosingCostPct} min={3} max={10} step={0.5} format={(v) => `${v}`} suffix="%" />
              <Slider label="Annual Appreciation" value={homeAppreciation} onChange={setHomeAppreciation} min={1} max={8} step={0.5} format={(v) => `${v}`} suffix="%" />
              <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 10, marginTop: 6 }}>
                <Toggle label="Sell the home" value={sellHome} onChange={(v) => { setSellHome(v); if (v) setRentHome(false); }} />
                {sellHome && (
                  <div style={{ background: COLORS.cardAlt, borderRadius: 8, padding: 12, marginTop: 6 }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: COLORS.accent3 }}>
                      Net proceeds: {fmtFull(netProceeds)}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4 }}>
                      Sale – mortgage – {closingCostPct}% closing costs
                    </div>
                  </div>
                )}
                <Toggle label="Rent it out instead" value={rentHome && !sellHome} onChange={(v) => { setRentHome(v); if (v) setSellHome(false); }} />
                {rentHome && !sellHome && (
                  <>
                    <Slider label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} min={3000} max={8000} step={100} />
                    <Slider label="Property Mgmt Fee" value={propertyMgmtPct} onChange={setPropertyMgmtPct} min={5} max={12} step={0.5} format={(v) => `${v}`} suffix="%" />
                    <Slider label="Monthly Mortgage" value={monthlyMortgage} onChange={setMonthlyMortgage} min={3000} max={6000} step={100} />
                    <Slider label="Monthly Insurance + Tax" value={monthlyInsuranceTax} onChange={setMonthlyInsuranceTax} min={400} max={1500} step={50} />
                    <Slider label="Monthly Maintenance Reserve" value={monthlyMaintenance} onChange={setMonthlyMaintenance} min={200} max={1000} step={50} />
                    <Slider label="Annual Rent Increase" value={annualRentIncrease} onChange={setAnnualRentIncrease} min={0} max={6} step={0.5} format={(v) => `${v}`} suffix="%" />
                  </>
                )}
              </div>
            </Card>

            <SectionTitle color={COLORS.accent3}>Retirement Accounts</SectionTitle>
            <Card>
              <Slider label="Current 457(b) Balance" value={current457b} onChange={setCurrent457b} min={0} max={300000} step={5000} />
              <Toggle label="Convert to Roth IRA on departure" value={convertToRoth} onChange={setConvertToRoth} />
              {convertToRoth && (
                <Slider label="Roth Conversion Tax Rate" value={rothTaxRate} onChange={setRothTaxRate} min={10} max={35} step={1} format={(v) => `${v}`} suffix="%" />
              )}
              <Slider label="Annual Roth/IRA Contribution" value={annualRothContribution} onChange={setAnnualRothContribution} min={0} max={8000} step={500} />
              <Slider label="Extra Brokerage Savings/yr" value={extraBrokerageContribution} onChange={setExtraBrokerageContribution} min={0} max={25000} step={1000} />
            </Card>

            <SectionTitle color={COLORS.accent4}>Kenya Income</SectionTitle>
            <Card>
              <Slider label="International School Salary" value={schoolSalary} onChange={setSchoolSalary} min={30000} max={90000} step={1000} />
              <Slider label="School Retirement Contribution" value={schoolRetirementPct} onChange={setSchoolRetirementPct} min={0} max={20} step={1} format={(v) => `${v}`} suffix="%" />
              <Slider label="Wife's Income (Kenya)" value={wifeSalary} onChange={setWifeSalary} min={0} max={80000} step={1000} />
              <Slider label="Annual Living Cost (Kenya)" value={kenyaAnnualCost} onChange={setKenyaAnnualCost} min={30000} max={80000} step={1000} />
            </Card>

            <SectionTitle color={COLORS.accent5}>DC Comparison</SectionTitle>
            <Card>
              <Slider label="Your DCPS Salary" value={dcSalary} onChange={setDcSalary} min={80000} max={180000} step={5000} />
              <Slider label="Annual 457(b) Contribution" value={dc457bContribution} onChange={setDc457bContribution} min={0} max={30000} step={500} />
              <Slider label="Wife's DC Salary" value={dcWifeSalary} onChange={setDcWifeSalary} min={0} max={150000} step={5000} />
              <Slider label="Annual Living Cost (DC)" value={dcAnnualCost} onChange={setDcAnnualCost} min={70000} max={160000} step={5000} />
              <Slider label="DCPS Pension (annual at retirement)" value={dcPensionAnnual} onChange={setDcPensionAnnual} min={20000} max={100000} step={2000} />
            </Card>

            <SectionTitle>Social Security</SectionTitle>
            <Card>
              <Slider label="Monthly SS — Kenya scenario (combined)" value={ssMonthlyEstimate} onChange={setSSMonthlyEstimate} min={1000} max={6000} step={100} />
              <Slider label="Monthly SS — DC scenario (combined)" value={dcSSMonthlyEstimate} onChange={setDcSSMonthlyEstimate} min={1500} max={7000} step={100} />
              <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4 }}>
                Kenya SS is lower due to fewer high-earning years in the US calculation.
              </div>
            </Card>
          </>
        )}

        {/* KENYA TAB */}
        {tab === "kenya" && (
          <>
            <SectionTitle>Kenya: Asset Breakdown at Age {retireAge}</SectionTitle>
            <Card>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assetBreakdown} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                    <XAxis type="number" tickFormatter={fmt} tick={{ fill: COLORS.textDim, fontSize: 10, fontFamily: "'DM Mono', monospace" }} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fill: COLORS.text, fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
                    <Tooltip formatter={(v) => fmtFull(v)} contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 12 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {assetBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
                <StatBox label="Total Assets" value={fmt(results.kenya.total)} color={COLORS.accent1} />
                <StatBox label="Tax-Free (Roth)" value={fmt(results.kenya.rothPortion)} color={COLORS.accent3} />
              </div>
            </Card>

            <SectionTitle>Annual Retirement Income</SectionTitle>
            <Card>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <StatBox label="4% Withdrawal" value={fmt(results.kenya.annualWithdrawal)} color={COLORS.accent2} />
                <StatBox label="Social Security" value={fmt(results.kenya.ssAnnual)} color={COLORS.accent3} />
                <StatBox label="Total Income" value={fmt(results.kenya.totalIncome)} color={COLORS.accent1} />
              </div>
              <div style={{ background: COLORS.cardAlt, borderRadius: 8, padding: 10, marginTop: 10, fontSize: 11, color: COLORS.textDim, lineHeight: 1.5 }}>
                Of the {fmt(results.kenya.total)} total, {fmt(results.kenya.rothPortion)} is in a Roth IRA — completely tax-free on withdrawal. Effective tax burden is significantly lower than the DC scenario.
              </div>
            </Card>

            <SectionTitle>Life Cost: Now → Retirement</SectionTitle>
            <Card>
              <div style={{ display: "flex" }}>
                <StatBox label="Total Living Cost" value={fmt(results.kenya.totalSpentLiving)} color={COLORS.accent4} sub={`${retireAge - currentAge} yrs × ${fmtFull(kenyaAnnualCost)}/yr`} />
                <StatBox label="Household Income" value={fmt((schoolSalary + wifeSalary) * (retireAge - currentAge))} color={COLORS.accent2} sub={`${retireAge - currentAge} yrs combined`} />
              </div>
            </Card>
          </>
        )}

        {/* DC TAB */}
        {tab === "dc" && (
          <>
            <SectionTitle color={COLORS.accent2}>DC: Assets at Age {retireAge}</SectionTitle>
            <Card>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <StatBox label="457(b) Balance" value={fmt(results.dc.balance457b)} color={COLORS.accent2} />
                <StatBox label="Home Value" value={fmt(results.dc.homeValue)} color={COLORS.accent1} />
                <StatBox label="Home Equity" value={fmt(results.dc.homeEquity)} color={COLORS.accent3} />
              </div>
              <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 10, paddingTop: 10, display: "flex" }}>
                <StatBox label="Total Net Worth" value={fmt(results.dc.total)} color={COLORS.accent2} />
              </div>
            </Card>

            <SectionTitle color={COLORS.accent2}>Annual Retirement Income</SectionTitle>
            <Card>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <StatBox label="4% from 457(b)" value={fmt(results.dc.annualWithdrawal)} color={COLORS.accent2} />
                <StatBox label="DCPS Pension" value={fmt(results.dc.pensionAnnual)} color={COLORS.accent1} />
                <StatBox label="Social Security" value={fmt(results.dc.ssAnnual)} color={COLORS.accent3} />
              </div>
              <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 10, paddingTop: 10, display: "flex" }}>
                <StatBox label="Total Annual Income" value={fmt(results.dc.totalIncome)} color={COLORS.accent5} />
              </div>
              <div style={{ background: COLORS.cardAlt, borderRadius: 8, padding: 10, marginTop: 10, fontSize: 11, color: COLORS.textDim, lineHeight: 1.5 }}>
                All DC retirement income (457b withdrawals + pension + SS) is fully taxable. At a ~22% effective rate, after-tax income is approximately {fmt(results.dc.totalIncome * 0.78)}/year.
              </div>
            </Card>

            <SectionTitle color={COLORS.accent2}>Life Cost: Now → Retirement</SectionTitle>
            <Card>
              <div style={{ display: "flex" }}>
                <StatBox label="Total Living Cost" value={fmt(results.dc.totalSpentLiving)} color={COLORS.accent4} sub={`${retireAge - currentAge} yrs × ${fmtFull(dcAnnualCost)}/yr`} />
                <StatBox label="Household Income" value={fmt((dcSalary + dcWifeSalary) * (retireAge - currentAge))} color={COLORS.accent2} sub={`${retireAge - currentAge} yrs combined`} />
              </div>
            </Card>
          </>
        )}

        {/* COMPARE TAB */}
        {tab === "compare" && (
          <>
            <SectionTitle>Wealth Growth: Kenya vs DC</SectionTitle>
            <Card>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.timelineData} margin={{ left: 5, right: 10, top: 5, bottom: 5 }}>
                    <XAxis dataKey="year" tick={{ fill: COLORS.textDim, fontSize: 10, fontFamily: "'DM Mono', monospace" }} />
                    <YAxis tickFormatter={fmt} tick={{ fill: COLORS.textDim, fontSize: 10, fontFamily: "'DM Mono', monospace" }} />
                    <Tooltip
                      formatter={(v) => fmtFull(v)}
                      labelFormatter={(l) => `Age ${l}`}
                      contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
                    <Line type="monotone" dataKey="kenya" stroke={COLORS.accent1} strokeWidth={2.5} dot={false} name="Kenya" />
                    <Line type="monotone" dataKey="dc" stroke={COLORS.accent2} strokeWidth={2.5} dot={false} name="DC" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <SectionTitle>Retirement Income Comparison</SectionTitle>
            <Card>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeCompData} margin={{ left: 5, right: 10, top: 5, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fill: COLORS.textDim, fontSize: 10, fontFamily: "'DM Sans', sans-serif" }} />
                    <YAxis tickFormatter={fmt} tick={{ fill: COLORS.textDim, fontSize: 10, fontFamily: "'DM Mono', monospace" }} />
                    <Tooltip formatter={(v) => fmtFull(v)} contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
                    <Bar dataKey="kenya" fill={COLORS.accent1} name="Kenya" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="dc" fill={COLORS.accent2} name="DC" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <SectionTitle>Side by Side</SectionTitle>
            <Card>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, lineHeight: 2 }}>
                <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 4, marginBottom: 6 }}>
                  <span style={{ flex: 2, color: COLORS.textDim }}></span>
                  <span style={{ flex: 1, color: COLORS.accent1, textAlign: "right" }}>Kenya</span>
                  <span style={{ flex: 1, color: COLORS.accent2, textAlign: "right" }}>DC</span>
                </div>
                {[
                  ["Total Assets", results.kenya.total, results.dc.total],
                  ["Annual Income", results.kenya.totalIncome, results.dc.totalIncome],
                  ["After-Tax Income", results.kenya.totalIncome * 0.9, results.dc.totalIncome * 0.78],
                  ["Tax-Free Assets", results.kenya.rothPortion, 0],
                  ["Pension", 0, results.dc.pensionAnnual],
                  [`Cost of Living (${retireAge - currentAge}yr)`, results.kenya.totalSpentLiving, results.dc.totalSpentLiving],
                  ["Lifetime Earnings", (schoolSalary + wifeSalary) * (retireAge - currentAge), (dcSalary + dcWifeSalary) * (retireAge - currentAge)],
                ].map(([label, k, d], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ flex: 2, color: COLORS.textDim, fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                    <span style={{ flex: 1, textAlign: "right", color: COLORS.accent1 }}>{fmt(k)}</span>
                    <span style={{ flex: 1, textAlign: "right", color: COLORS.accent2 }}>{fmt(d)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ background: COLORS.cardAlt, border: `1px solid ${COLORS.accent1}33` }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: COLORS.accent1, marginBottom: 8 }}>
                The Bottom Line
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: COLORS.text }}>
                The DC path yields <strong style={{ color: COLORS.accent2 }}>{fmt(results.dc.total - results.kenya.total)}</strong> more in total assets, but you'd spend{" "}
                <strong style={{ color: COLORS.accent4 }}>{fmt(results.dc.totalSpentLiving - results.kenya.totalSpentLiving)}</strong> more on living costs to get there.{" "}
                After-tax retirement income gap: roughly{" "}
                <strong>{fmt(Math.abs(results.dc.totalIncome * 0.78 - results.kenya.totalIncome * 0.9))}</strong>/year.
                {results.kenya.rothPortion > 0 && (
                  <> Your <span style={{ color: COLORS.accent3 }}>{fmt(results.kenya.rothPortion)}</span> Roth balance is entirely tax-free.</>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
