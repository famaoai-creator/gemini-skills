import { describe, it, expect } from 'vitest';
import { generatePnL, analyzeRunway, generateScenarios, FinancialAssumptions } from './lib';

describe('financial-modeling-maestro lib', () => {
  const mockAssumptions: FinancialAssumptions = {
    revenue: { initial_mrr: 10000, monthly_growth_rate: 0.1, churn_rate: 0.02 },
    costs: { initial_monthly_cost: 8000, cost_growth_rate: 0.05, headcount: 5, avg_salary: 80000 },
    funding: { cash_on_hand: 500000 }
  };

  it('should generate PnL projections correctly', () => {
    const result = generatePnL(mockAssumptions, 1);
    expect(result.monthly).toHaveLength(12);
    expect(result.yearly).toHaveLength(1);
    expect(result.monthly[0].mrr).toBe(10000);
    expect(result.yearly[0].annualRevenue).toBeGreaterThan(120000);
  });

  it('should analyze runway and sustainability', () => {
    const projections = generatePnL(mockAssumptions, 3);
    const runway = analyzeRunway(projections.monthly);
    expect(runway.sustainable).toBe(true); // Large initial cash
    expect(runway.breakevenMonth).toBe(1); // MRR(10k) > OpEx(8k) initially
  });

  it('should identify cash out scenario', () => {
    const poorAssumptions: FinancialAssumptions = {
      revenue: { initial_mrr: 1000, monthly_growth_rate: 0, churn_rate: 0 },
      costs: { initial_monthly_cost: 10000, cost_growth_rate: 0, headcount: 1, avg_salary: 50000 },
      funding: { cash_on_hand: 5000 }
    };
    const projections = generatePnL(poorAssumptions, 1);
    const runway = analyzeRunway(projections.monthly);
    expect(runway.sustainable).toBe(false);
    expect(runway.runwayMonths).toBeLessThan(12);
  });

  it('should generate optimistic and pessimistic scenarios', () => {
    const scenarios = generateScenarios(mockAssumptions, 3);
    expect(scenarios.optimistic.yearly[2].annualRevenue).toBeGreaterThan(scenarios.base.yearly[2].annualRevenue);
    expect(scenarios.pessimistic.yearly[2].annualRevenue).toBeLessThan(scenarios.base.yearly[2].annualRevenue);
  });
});
