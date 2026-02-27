import { describe, it, expect } from 'vitest';
import { detectEncoding } from './lib';

describe('encoding-detector lib', () => {
  it('should detect UTF-8 and LF', () => {
    // Include non-ASCII to ensure UTF-8 detection over ASCII
    const buffer = Buffer.from(['hello', 'world', 'こんにちは'].join('\n'));
    const result = detectEncoding(buffer);
    expect(result.encoding.toUpperCase()).toBe('UTF-8');
    expect(result.lineEnding).toBe('LF');
  });
});
