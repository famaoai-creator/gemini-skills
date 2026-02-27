import { describe, it, expect } from 'vitest';
import { calculateRiskScore } from './lib';

describe('bug-predictor lib', () => {
  it('should calculate risk score', () => {
    const score = calculateRiskScore(10, 5, 100);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
