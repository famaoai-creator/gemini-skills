import { describe, it, expect } from 'vitest';
import { scanDepsForRiskyLicenses } from './lib';

describe('license-auditor lib', () => {
  it('should detect risky licenses', () => {
    const deps = { 'some-gpl-pkg': { license: 'GPL-3.0' } };
    const findings = scanDepsForRiskyLicenses(deps);
    expect(findings).toHaveLength(1);
    expect(findings[0].name).toBe('some-gpl-pkg');
  });
});
