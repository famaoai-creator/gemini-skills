import { describe, it, expect } from 'vitest';
import { processImpactAnalysis, classifyDORA, calculateBusinessImpact } from './lib';

describe('business-impact-analyzer lib', () => {
  const mockInput = {
    dora: {
      deployment_frequency_per_week: 5,
      lead_time_hours: 24,
      change_failure_rate: 0.1,
      mttr_hours: 2,
    },
    quality: { error_rate_per_1000: 5, test_coverage: 0.75, tech_debt_hours: 200 },
    business: { hourly_revenue: 1000, developer_hourly_cost: 80, team_size: 10 },
  };

  it('should classify DORA metrics correctly', () => {
    const classification = classifyDORA(mockInput.dora);
    expect(classification.metrics.deployment_frequency).toBe('high');
    expect(classification.overallLevel).toBe('high');
  });

  it('should identify elite DORA level', () => {
    const eliteDora = {
      deployment_frequency_per_week: 10,
      lead_time_hours: 0.5,
      change_failure_rate: 0.01,
      mttr_hours: 0.5
    };
    const classification = classifyDORA(eliteDora);
    expect(classification.overallLevel).toBe('elite');
  });

  it('should calculate annual business impact', () => {
    const impact = calculateBusinessImpact(mockInput.dora, mockInput.quality, mockInput.business);
    // Annual failures = 5*52*0.1 = 26
    // Downtime = 26*2 = 52 hours
    // Revenue loss = 52 * 1000 = 52000
    // Tech debt liability = 200 * 80 = 16000
    expect(impact.annualRevenueLoss).toBe(52000);
    expect(impact.techDebtFinancialLiability).toBe(16000);
    expect(impact.annualImpact).toBe(68000);
  });

  it('should process full analysis', () => {
    const result = processImpactAnalysis(mockInput);
    expect(result.doraClassification.overallLevel).toBe('high');
    expect(result.businessImpact.annualImpact).toBeGreaterThan(0);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });
});
