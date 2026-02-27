import { describe, it, expect } from 'vitest';
import { generateTestCases } from './lib';

describe('test-viewpoint-analyst lib', () => {
  it('should generate test cases', () => {
    const reqAdf = { requirements: [{ id: 'R1', title: 'Login', rule: 'Must work' }] };
    const cases = generateTestCases(reqAdf);
    expect(cases).toHaveLength(1);
    expect(cases[0].id).toBe('TC-R1-01');
  });
});
