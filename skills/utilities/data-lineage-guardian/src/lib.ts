export interface DataSource {
  file: string;
  type: string;
  flow: 'input' | 'output' | 'bidirectional';
  pii_detected?: boolean;
  compliance_risk?: string;
}

export function scanForDataFlows(content: string, fileName: string): DataSource[] {
  const sources: DataSource[] = [];
  
  // Basic Flow Detection
  if (/(?:readFile|fs\.read|open\()/i.test(content))
    sources.push({ file: fileName, type: 'file_read', flow: 'input' });
  if (/(?:writeFile|fs\.write)/i.test(content))
    sources.push({ file: fileName, type: 'file_write', flow: 'output' });
  if (/(?:SELECT|INSERT|UPDATE|DELETE)/i.test(content))
    sources.push({ file: fileName, type: 'database', flow: 'bidirectional' });

  // PII & Privacy Awareness (APPI/GDPR)
  const piiPattern = /\b(email|password|address|phone|ssn|birthdate|card_number)\b/gi;
  if (piiPattern.test(content)) {
    sources.forEach(s => {
      s.pii_detected = true;
      s.compliance_risk = 'APPI/GDPR Sensitivity: Ensure encryption and consent are managed.';
    });
  }

  return sources;
}
