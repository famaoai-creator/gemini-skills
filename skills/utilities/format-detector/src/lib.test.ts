import { describe, it, expect } from 'vitest';
import { detectFormat } from './lib';

describe('format-detector lib', () => {
  it('should detect JSON', () => {
    expect(detectFormat('{"a":1}').format).toBe('json');
    expect(detectFormat('{"a":1}').confidence).toBe(1.0);
  });

  it('should detect CSV', () => {
    const csv = 'id,name,value\n1,test,42';
    expect(detectFormat(csv).format).toBe('csv');
    expect(detectFormat(csv).confidence).toBeGreaterThan(0.5);
  });

  it('should detect YAML', () => {
    const yaml = 'name: test\nversion: 1.0';
    expect(detectFormat(yaml).format).toBe('yaml');
  });

  it('should handle malformed JSON', () => {
    const badJson = '{"key": "value",}'; // trailing comma
    const result = detectFormat(badJson);
    expect(result.format).toBe('json');
    expect(result.confidence).toBe(0.5);
  });

  it('should handle empty input', () => {
    expect(detectFormat('').format).toBe('unknown');
    expect(detectFormat('   ').confidence).toBe(0);
  });
});
