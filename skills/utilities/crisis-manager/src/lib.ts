/**
 * Crisis Manager Core Library.
 * Rapidly analyzes logs and system state during outages.
 */

export interface LogAnalysis {
  errorCount: number;
  fatalCount: number;
  warnCount: number;
  topPatterns: string[];
}

export interface IncidentReport {
  severity: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
}

export function analyzeLogLines(lines: string[]): LogAnalysis {
  let errorCount = 0;
  let fatalCount = 0;
  let warnCount = 0;
  const patterns: Record<string, number> = {};

  lines.forEach((line) => {
    const l = line.toUpperCase();
    if (l.includes('FATAL')) fatalCount++;
    else if (l.includes('ERROR')) errorCount++;
    else if (l.includes('WARN')) warnCount++;

    if (l.includes('ECONNREFUSED')) patterns.ECONNREFUSED = (patterns.ECONNREFUSED || 0) + 1;
    if (l.includes('TIMEOUT')) patterns.TIMEOUT = (patterns.TIMEOUT || 0) + 1;
    if (l.includes('OUT OF MEMORY')) patterns.OOM = (patterns.OOM || 0) + 1;
  });

  return {
    errorCount,
    fatalCount,
    warnCount,
    topPatterns: Object.keys(patterns),
  };
}

export function generateIncidentReport(analysis: LogAnalysis): IncidentReport {
  let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
  
  if (analysis.fatalCount > 0 || analysis.errorCount > 50) severity = 'critical';
  else if (analysis.errorCount > 10) severity = 'high';
  else if (analysis.errorCount > 0 || analysis.warnCount > 20) severity = 'medium';

  let summary = 'System is stable.';
  if (severity === 'critical') summary = `CRITICAL FAILURE: ${analysis.fatalCount} fatal errors detected.`;
  else if (severity === 'high') summary = `High error rate detected (${analysis.errorCount} errors).`;

  return { severity, summary };
}

export async function generateRCAReport(logContent: string): Promise<string> {
  // AI-driven RCA stub
  return `### 🕵️ AI Root Cause Analysis\n\nAnalyzed ${logContent.length} bytes of logs.\nDetected possible issues: Service Connection failure.`;
}
