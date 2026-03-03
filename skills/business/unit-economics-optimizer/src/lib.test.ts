import { describe, it, expect } from 'vitest';
import { calculateLTV, analyzeSegment, processUnitEconomics, CustomerSegment } from './lib';

describe('unit-economics-optimizer lib', () => {
  const mockSegments: CustomerSegment[] = [
    {
      name: 'Basic',
      monthly_price: 29,
      cac: 150,
      monthly_churn_rate: 0.05,
      gross_margin: 0.8,
      customer_count: 500
    },
    {
      name: 'Enterprise',
      monthly_price: 299,
      cac: 2000,
      monthly_churn_rate: 0.02,
      gross_margin: 0.85,
      customer_count: 50
    }
  ];

  it('should calculate LTV correctly', () => {
    // Basic: (29 * 0.8) / 0.05 = 23.2 / 0.05 = 464
    const ltv = calculateLTV(mockSegments[0]);
    expect(ltv).toBe(464);
  });

  it('should analyze segment health', () => {
    const analysis = analyzeSegment(mockSegments[0]);
    // 464 / 150 = 3.09 (> 3 is healthy)
    expect(analysis.ltvCacRatio).toBe(3.09);
    expect(analysis.health).toBe('healthy');
  });

  it('should detect unprofitable segments', () => {
    const badSegment: CustomerSegment = {
      name: 'Losing',
      monthly_price: 10,
      cac: 1000,
      churnRate: 0.2,
      grossMargin: 0.5,
      customer_count: 100
    };
    // LTV = (10 * 0.5) / 0.2 = 25
    // Ratio = 25 / 1000 = 0.025
    const analysis = analyzeSegment(badSegment);
    expect(analysis.health).toBe('unprofitable');
    
    const result = processUnitEconomics([badSegment]);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0]).toContain('Losing');
  });

  it('should calculate portfolio totals', () => {
    const result = processUnitEconomics(mockSegments);
    expect(result.portfolio.totalMRR).toBe((29 * 500) + (299 * 50));
    expect(result.portfolio.segmentCount).toBe(2);
  });
});
