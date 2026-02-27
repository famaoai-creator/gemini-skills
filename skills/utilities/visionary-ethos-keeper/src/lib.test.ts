import { describe, it, expect } from 'vitest';
import { analyzeAlignment } from './lib';

describe('visionary-ethos-keeper lib', () => {
  it('should analyze alignment with keywords', () => {
    const values = [{ name: 'UX', keywords: ['user', 'experience'] }];
    const content = 'We focus on the user experience.';
    const result = analyzeAlignment(content, values);
    expect(result[0].score).toBe(100);
    expect(result[0].matches).toContain('user');
  });
});
