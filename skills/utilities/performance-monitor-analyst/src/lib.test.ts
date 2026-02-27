import { describe, it, expect } from 'vitest';
import { calculatePercentile, classifyMetric } from './lib';

describe('performance-monitor-analyst lib', () => {
  it('should calculate p95', () => {
    const sorted = [10, 20, 30, 40, 50];
    expect(calculatePercentile(sorted, 50)).toBe(30);
  });
  it('should classify metrics', () => {
    expect(classifyMetric('api_latency', 'ms')).toBe('responseTime');
  });
});
