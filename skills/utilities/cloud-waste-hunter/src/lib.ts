export const OVERSIZED_INSTANCE_PATTERNS = [
  /\b(m5\.4xlarge|m5\.8xlarge|m5\.12xlarge|m5\.16xlarge|m5\.24xlarge|m5\.metal)\b/,
  /\b(c5\.4xlarge|c5\.9xlarge|c5\.12xlarge|c5\.18xlarge|c5\.24xlarge|c5\.metal)\b/,
  /\b(r5\.4xlarge|r5\.8xlarge|r5\.12xlarge|r5\.16xlarge|r5\.24xlarge|r5\.metal)\b/,
];

export interface Finding {
  type: string;
  severity: 'high' | 'medium' | 'low';
  file: string;
  detail: string;
}

export function checkOversizedInstances(content: string, filePath: string): Finding[] {
  const findings: Finding[] = [];
  for (const pattern of OVERSIZED_INSTANCE_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      findings.push({
        type: 'oversized-instance',
        severity: 'high',
        file: filePath,
        detail: 'Potentially oversized instance type: ' + match[0],
      });
    }
  }
  return findings;
}

export function calculateWasteScore(findings: Finding[]): number {
  let score = 0;
  for (const finding of findings) {
    if (finding.severity === 'high') score += 30;
    else if (finding.severity === 'medium') score += 15;
    else if (finding.severity === 'low') score += 5;
  }
  return Math.min(score, 100);
}
