import { describe, it, expect } from 'vitest';
import { analyzeVariance } from './lib';

describe('budget-variance-tracker lib', () => {
  it('should detect negative variance', () => {
    const cat = { name: 'AWS Cost', forecast: 100, actual: 150 };
    const result = analyzeVariance(cat, 10);
    expect(result.status).toBe('negative_variance');
    expect(result.flagged).toBe(true);
  });
});
