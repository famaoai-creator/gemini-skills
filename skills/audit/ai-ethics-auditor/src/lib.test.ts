import { describe, it, expect } from 'vitest';
import { auditEthics } from './lib';

describe('ai-ethics-auditor lib', () => {
  it('should detect bias keywords', () => {
    const content = 'This is a test for gender and race bias.';
    const findings = auditEthics(content);
    expect(findings.bias.length).toBeGreaterThan(0);
  });
});
