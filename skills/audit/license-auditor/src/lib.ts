/**
 * License Auditor Core Library.
 */

export interface DependencyInfo {
  name: string;
  version: string;
  license: string;
  risk: 'permissive' | 'restrictive' | 'unknown';
}

const RESTRICTIVE_LICENSES = ['GPL', 'AGPL', 'LGPL', 'MPL', 'SSPL'];

export function classifyLicenseRisk(license: string): 'permissive' | 'restrictive' | 'unknown' {
  if (!license || license === 'UNKNOWN') return 'unknown';
  const up = license.toUpperCase();
  if (RESTRICTIVE_LICENSES.some(r => up.includes(r))) return 'restrictive';
  return 'permissive';
}

export function scanDepsForRiskyLicenses(dependencies: Record<string, any>): DependencyInfo[] {
  const findings: DependencyInfo[] = [];
  if (!dependencies) return findings;

  for (const [name, info] of Object.entries(dependencies)) {
    const license = (info as any).license || 'UNKNOWN';
    const risk = classifyLicenseRisk(license);
    if (risk !== 'permissive') {
      findings.push({
        name,
        version: (info as any).version || '0.0.0',
        license,
        risk
      });
    }
  }
  return findings;
}
