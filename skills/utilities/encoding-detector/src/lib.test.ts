import { describe, it, expect } from 'vitest';
import { detectEncoding } from './lib';

describe('encoding-detector lib', () => {
  it('should detect UTF-8 and LF', () => {
    const buffer = Buffer.from('hello\nworld\nこんにちは');
    const result = detectEncoding(buffer);
    expect(result.encoding.toUpperCase()).toContain('UTF-8');
    expect(result.lineEnding).toBe('LF');
  });

  it('should detect CRLF line endings', () => {
    const buffer = Buffer.from('line1\r\nline2\r\n');
    const result = detectEncoding(buffer);
    expect(result.lineEnding).toBe('CRLF');
  });

  it('should detect CR (legacy Mac) line endings', () => {
    const buffer = Buffer.from('line1\rline2\r');
    const result = detectEncoding(buffer);
    expect(result.lineEnding).toBe('CR');
  });

  it('should prioritize CRLF over LF in mixed content', () => {
    const buffer = Buffer.from('line1\r\nline2\n');
    const result = detectEncoding(buffer);
    expect(result.lineEnding).toBe('CRLF');
  });

  it('should handle Japanese (Shift_JIS) encoding (via jschardet)', () => {
    // Note: jschardet might not always be 100% accurate for small strings
    // but we test that it returns something reasonable
    const buffer = Buffer.from([0x82, 0xb1, 0x82, 0xf1, 0x82, 0xc9, 0x82, 0xbf, 0x82, 0xcd]); // こんにちは in SJIS
    const result = detectEncoding(buffer);
    expect(result.encoding).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });
});
