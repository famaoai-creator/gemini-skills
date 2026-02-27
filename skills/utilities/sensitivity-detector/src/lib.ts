export const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  ipv4: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  phone_jp: /\b0\d{1,4}-\d{1,4}-\d{3,4}\b/g,
  credit_card: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
};

export interface SensitivityResult {
  hasPII: boolean;
  findings: Record<string, number>;
}

export function scanContent(content: string): SensitivityResult {
  const findings: Record<string, number> = {};
  let hasPII = false;

  for (const [type, regex] of Object.entries(PII_PATTERNS)) {
    const matches = content.match(regex);
    if (matches) {
      findings[type] = matches.length;
      hasPII = true;
    }
  }

  return { hasPII, findings };
}
