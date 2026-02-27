import { describe, it, expect } from 'vitest';
import { detectFormat } from './lib';

describe('format-detector lib', () => {
  it('should detect JSON', () => {
    expect(detectFormat('{"a":1}').format).toBe('json');
  });
  it('should detect CSV', () => {
    const csv = ['a,b', '1,2'].join('\n');
    expect(detectFormat(csv).format).toBe('csv');
  });
});
