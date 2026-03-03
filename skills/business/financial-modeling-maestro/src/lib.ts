/**
 * Financial Modeling Maestro Core Library.
 * Transforms business assumptions into multi-year financial statements.
 */

export interface FinancialAssumptions {
  revenue?: {
    initial_mrr: number;
    monthly_growth_rate: number;
    churn_rate: number;
  };
  costs?: {
    initial_monthly_cost: number;
    cost_growth_rate: number;
    headcount: number;
    avg_salary: number;
  };
  funding?: {
    cash_on_hand: number;
  };
}

export function generatePnL(assumptions: FinancialAssumptions, years: number = 3) {
  const months = years * 12;
  const monthlyProjections = [];
  
  const rev = assumptions.revenue || { initial_mrr: 0, monthly_growth_rate: 0, churn_rate: 0 };
  const cost = assumptions.costs || { initial_monthly_cost: 0, cost_growth_rate: 0, headcount: 0, avg_salary: 0 };
  const funding = assumptions.funding || { cash_on_hand: 0 };

  let currentMRR = rev.initial_mrr;
  let currentCash = funding.cash_on_hand;

  for (let m = 1; m <= months; m++) {
    const monthlyRevenue = currentMRR;
    const monthlyOpEx = cost.initial_monthly_cost * Math.pow(1 + cost.cost_growth_rate, m - 1);
    const monthlyNet = monthlyRevenue - monthlyOpEx;
    currentCash += monthlyNet;

    monthlyProjections.push({
      month: m,
      mrr: Math.round(currentMRR),
      revenue: Math.round(monthlyRevenue),
      opex: Math.round(monthlyOpEx),
      net: Math.round(monthlyNet),
      cash: Math.round(currentCash)
    });

    currentMRR = currentMRR * (1 + rev.monthly_growth_rate - rev.churn_rate);
  }

  const yearlyProjections = [];
  for (let y = 0; y < years; y++) {
    const start = y * 12;
    const end = start + 12;
    const yearSlice = monthlyProjections.slice(start, end);
    yearlyProjections.push({
      year: y + 1,
      annualRevenue: yearSlice.reduce((sum, m) => sum + m.revenue, 0),
      annualOpEx: yearSlice.reduce((sum, m) => sum + m.opex, 0),
      endCash: yearSlice[yearSlice.length - 1].cash
    });
  }

  return { monthly: monthlyProjections, yearly: yearlyProjections };
}

export function analyzeRunway(monthlyProjections: any[]) {
  const firstNegativeCash = monthlyProjections.find(m => m.cash < 0);
  const firstPositiveNet = monthlyProjections.find(m => m.net > 0);

  return {
    runwayMonths: firstNegativeCash ? firstNegativeCash.month - 1 : monthlyProjections.length,
    sustainable: !firstNegativeCash,
    breakevenMonth: firstPositiveNet ? firstPositiveNet.month : null
  };
}

export function generateScenarios(assumptions: FinancialAssumptions, years: number) {
  const base = generatePnL(assumptions, years);
  
  // Simple scenario logic
  const optimistic = generatePnL({
    ...assumptions,
    revenue: {
      ...assumptions.revenue!,
      monthly_growth_rate: (assumptions.revenue?.monthly_growth_rate || 0) * 1.5
    }
  }, years);

  const pessimistic = generatePnL({
    ...assumptions,
    revenue: {
      ...assumptions.revenue!,
      monthly_growth_rate: (assumptions.revenue?.monthly_growth_rate || 0) * 0.5
    }
  }, years);

  return { base, optimistic, pessimistic };
}
