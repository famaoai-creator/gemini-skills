import { describe, it, expect } from 'vitest';
import { estimateCosts } from './lib';

describe('cloud-cost-estimator lib', () => {
  it('should calculate costs', () => {
    const adf = { nodes: [{ id: 'n1', type: 'ec2', details: { size: 't3.micro' } }] };
    const pricing = { ec2: { 't3.micro': 0.01 } };
    const result = estimateCosts(adf, pricing, []);
    expect(result.totalCost).toBe(0.01 * 24 * 30);
  });
});
