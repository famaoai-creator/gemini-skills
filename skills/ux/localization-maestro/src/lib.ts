export function generateI18nAudit(findings: any): any[] {
  const issues: any[] = [];
  if (!findings.i18nReady)
    issues.push({
      severity: 'high',
      issue: 'No i18n framework detected',
      recommendation: 'Set up i18next or react-intl',
    });
  return issues;
}

export function calculateReadinessScore(findings: any): number {
  return findings.i18nReady ? 100 : 20;
}
