import { describe, it, expect, vi } from 'vitest';
import { scoreCompleteness } from './lib';

describe('completeness-scorer lib', () => {
  it('should penalize TODOs', () => {
    const result = scoreCompleteness('Do stuff TODO: fix this');
    expect(result.score).toBeLessThan(100);
    expect(result.issues[0]).toContain('TODOs');
  });
});
