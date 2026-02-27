import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateHash } from './lib';

describe('data-collector lib', () => {
  it('should calculate consistent sha256 hash', () => {
    const data = Buffer.from('hello gemini');
    const hash1 = calculateHash(data);
    const hash2 = calculateHash(data);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });
});
