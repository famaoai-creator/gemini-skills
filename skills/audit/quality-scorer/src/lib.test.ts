import { describe, it, expect } from 'vitest';
import { calculateScore, DEFAULT_RULES } from './lib';

describe('quality-scorer', () => {
  it('calculates score for good content', () => {
    const content = 'This is a well-written paragraph with multiple sentences. It has good length and structure. ' +
      'The content covers several points. Each sentence is reasonable in length.';
    const longContent = content.repeat(5);
    const result = calculateScore(longContent);
    expect(result.score).toBe(100);
    expect(result.issues).toHaveLength(0);
  });

  it('penalizes short content', () => {
    const content = 'Short.';
    const result = calculateScore(content);
    expect(result.score).toBeLessThan(100);
    expect(result.issues).toContain(DEFAULT_RULES.min_length.message);
  });

  it('penalizes high complexity', () => {
    const complex = 'if (a) { if (b) { while(c) { case d: } } } && || && || ? a : b;';
    const result = calculateScore(complex);
    expect(result.metrics.complexity).toBeGreaterThan(DEFAULT_RULES.complexity.threshold);
    expect(result.score).toBeLessThan(100);
    expect(result.issues).toContain(DEFAULT_RULES.complexity.message);
  });

  it('handles empty content', () => {
    const result = calculateScore('');
    expect(result.score).toBe(0);
    expect(result.issues).toContain('Content is empty.');
  });

  it('handles unicode (Japanese) text', () => {
    const content = '日本語のテスト文書です。これは品質テストです。\n完全な文です。\nもう一つの段落。';
    const result = calculateScore(content);
    expect(result.score).toBeGreaterThan(0);
    expect(result.metrics.charCount).toBe(content.length);
  });
});
