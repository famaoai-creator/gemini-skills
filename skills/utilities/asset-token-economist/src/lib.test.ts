import { describe, it, expect } from 'vitest';
import { detectContentType, estimateTokens, calculateCosts, generateRecommendations } from './lib';

describe('asset-token-economist', () => {
  it('detects content type correctly', () => {
    const code = 'import os\nconst x = 1;\nfunction test() {}';
    expect(detectContentType(code)).toBe('code');

    const prose = 'This is a normal english sentence. It should be detected as prose because it has many sentences.';
    const longProse = (prose + '\n').repeat(6);
    expect(detectContentType(longProse)).toBe('prose');
  });

  it('estimates tokens based on type', () => {
    const text = 'hello world'; // 11 chars
    expect(estimateTokens(text, 'prose')).toBe(3); // 11/4 = 2.75 -> 3
    expect(estimateTokens(text, 'code')).toBe(4);  // 11/3 = 3.66 -> 4
  });

  it('calculates model costs', () => {
    const costs = calculateCosts(1000);
    expect(costs.gpt4.inputCost).toBe(0.03);
    expect(costs.claude3.inputCost).toBe(0.015);
  });

  it('provides recommendations for large inputs', () => {
    const smallRecs = generateRecommendations(100, 'prose');
    expect(smallRecs).toHaveLength(0);

    const largeRecs = generateRecommendations(6000, 'code');
    expect(largeRecs).toContain('Input is large. Consider summarizing or chunking.');
    expect(largeRecs).toContain('Large code file. Strip comments and boilerplate to save tokens.');
  });
});
