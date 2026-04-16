export function calculateSaleProceeds(homeValue: number, mortgageBalance: number, closingCostPct: number): number {
  const closingCosts = homeValue * (closingCostPct / 100);
  return Math.max(0, homeValue - mortgageBalance - closingCosts);
}

export function projectHomeEquity(
  homeValue: number,
  mortgageBalance: number,
  monthlyMortgage: number,
  appreciationRate: number,
  years: number,
): { homeValue: number; mortgageRemaining: number; equity: number } {
  const futureValue = homeValue * Math.pow(1 + appreciationRate / 100, years);
  const totalPaid = monthlyMortgage * 12 * years;
  const principalPaid = totalPaid * 0.35;
  const mortgageRemaining = Math.max(0, mortgageBalance - principalPaid);
  return { homeValue: futureValue, mortgageRemaining, equity: futureValue - mortgageRemaining };
}

export function calculateRentalCashFlow(
  monthlyRent: number,
  monthlyMortgage: number,
  monthlyInsuranceTax: number,
  monthlyMaintenance: number,
  propertyMgmtPct: number,
): number {
  const annualRent = monthlyRent * 12;
  const mgmtFee = annualRent * (propertyMgmtPct / 100);
  const annualCosts = (monthlyMortgage + monthlyInsuranceTax + monthlyMaintenance) * 12;
  return annualRent - mgmtFee - annualCosts;
}
