import { describe, it, expect } from 'vitest';
import { scoreCompleteness } from './lib';

describe('completeness-scorer lib', () => {
  it('should score 100 for complete text without issues', () => {
    const result = scoreCompleteness('This is a complete document with no TODOs.');
    expect(result.score).toBe(100);
    expect(result.issues).toHaveLength(0);
  });

  it('should penalize TODOs', () => {
    const result = scoreCompleteness('Do stuff TODO: fix this and TODO: that');
    expect(result.score).toBe(90); // 100 - 5*2
    expect(result.issues[0]).toContain('2 TODOs');
  });

  it('should penalize missing keywords', () => {
    const result = scoreCompleteness('Hello world', ['required_key']);
    expect(result.score).toBe(90); // 100 - 10
    expect(result.issues).toContain('Missing keyword: required_key');
  });

  it('should handle empty content', () => {
    const result = scoreCompleteness('   ');
    expect(result.score).toBe(0);
    expect(result.issues).toContain('Content is empty');
  });
});
