import { describe, it, expect } from 'vitest';
import { scanContent } from './lib';

describe('sensitivity-detector lib', () => {
  it('should detect emails', () => {
    const result = scanContent('Contact admin@example.com');
    expect(result.hasPII).toBe(true);
    expect(result.findings.email).toBe(1);
  });
});
