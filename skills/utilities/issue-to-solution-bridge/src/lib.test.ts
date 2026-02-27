import { describe, it, expect } from 'vitest';
import { analyzeIssue } from './lib';

describe('issue-to-solution-bridge lib', () => {
  it('should classify bug issues', () => {
    const analysis = analyzeIssue('Fix the crash', 'The app fails when clicking button');
    expect(analysis.type).toBe('bug');
    expect(analysis.suggestedActions).toContain('Reproduce the issue');
  });
});
