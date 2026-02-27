import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditCompliance } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('compliance-officer lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should detect compliant and gap patterns', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => p.toString().includes('.git'));
    const results = auditCompliance('.', ['.git', 'missing.txt']);
    expect(results.find((r: any) => r.pattern === '.git').status).toBe('compliant');
    expect(results.find((r: any) => r.pattern === 'missing.txt').status).toBe('gap');
  });
});
