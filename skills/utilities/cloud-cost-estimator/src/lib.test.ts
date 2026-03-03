import { describe, it, expect } from 'vitest';
import { estimateServiceCost, calculateTotalProjectedCost, generateRecommendations, CloudService } from './lib';

describe('cloud-cost-estimator lib', () => {
  const mockServices: CloudService[] = [
    { name: 'web', type: 'compute', provider: 'aws', size: 'xlarge', count: 3 },
    { name: 'db', type: 'database', provider: 'gcp', size: 'xlarge' }
  ];

  it('should calculate individual service costs', () => {
    const cost = estimateServiceCost(mockServices[0]);
    expect(cost).toBe(300 * 3); // xlarge compute(300) * 3
  });

  it('should calculate total projected costs (monthly/yearly)', () => {
    const totals = calculateTotalProjectedCost(mockServices);
    const expectedMonthly = (300 * 3) + 600; // 900 + 600
    expect(totals.monthly).toBe(expectedMonthly);
    expect(totals.yearly).toBe(expectedMonthly * 12);
  });

  it('should generate relevant recommendations', () => {
    const recs = generateRecommendations(mockServices);
    expect(recs).toHaveLength(1);
    expect(recs[0]).toContain('reserved instances');
  });

  it('should detect high compute count waste', () => {
    const manyCompute: CloudService[] = Array(6).fill({ name: 'c', type: 'compute', size: 'small' });
    const recs = generateRecommendations(manyCompute);
    expect(recs).toContain('High compute count. Review autoscaling policies to optimize idle capacity.');
  });
});
