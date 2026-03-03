import { describe, it, expect } from 'vitest';
import { scanDepsForRiskyLicenses, classifyLicenseRisk } from './lib';

describe('license-auditor lib', () => {
  describe('classifyLicenseRisk', () => {
    it('detects permissive licenses', () => {
      expect(classifyLicenseRisk('MIT')).toBe('permissive');
      expect(classifyLicenseRisk('Apache-2.0')).toBe('permissive');
    });

    it('detects restrictive licenses', () => {
      expect(classifyLicenseRisk('GPL-3.0')).toBe('restrictive');
      expect(classifyLicenseRisk('AGPL-1.0')).toBe('restrictive');
    });

    it('handles unknown licenses', () => {
      expect(classifyLicenseRisk('UNKNOWN')).toBe('unknown');
      expect(classifyLicenseRisk('')).toBe('unknown');
    });
  });

  describe('scanDepsForRiskyLicenses', () => {
    it('should detect risky licenses in dependency map', () => {
      const deps = {
        'safe-pkg': { license: 'MIT', version: '1.0.0' },
        'risky-pkg': { license: 'GPL-2.0', version: '2.0.0' }
      };
      const findings = scanDepsForRiskyLicenses(deps);
      expect(findings).toHaveLength(1);
      expect(findings[0].name).toBe('risky-pkg');
      expect(findings[0].risk).toBe('restrictive');
    });

    it('should return empty array if no risky licenses found', () => {
      const deps = { 'safe-pkg': { license: 'MIT' } };
      const findings = scanDepsForRiskyLicenses(deps);
      expect(findings).toHaveLength(0);
    });
  });
});
