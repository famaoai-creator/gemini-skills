import { describe, it, expect } from 'vitest';
import { analyzeLogLines } from './lib';

describe('crisis-manager lib', () => {
  it('should count errors and extract patterns', () => {
    const lines = ['ERROR: Connection failed', 'FATAL: Out of memory'];
    const analysis = analyzeLogLines(lines);
    expect(analysis.errorCount).toBe(2);
    expect(analysis.topPatterns.length).toBeGreaterThan(0);
  });
});
