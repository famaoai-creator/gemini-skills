/**
 * Log-to-Requirement Bridge Core Library.
 */

export interface LogPattern {
  pattern: string;
  count: number;
  recommendation: string;
}

const ERROR_PATTERNS = [
  { regex: /timeout/i, label: 'timeout', req: 'Implement retry logic with exponential backoff.' },
  { regex: /oom|out of memory/i, label: 'memory', req: 'Conduct memory profiling and add safeguards.' },
  { regex: /connection refused|econnrefused/i, label: 'connection-failure', req: 'Improve service availability monitoring.' },
  { regex: /permission denied/i, label: 'auth-permission', req: 'Review IAM roles and access control lists.' },
  { regex: /database|query failed/i, label: 'database', req: 'Optimize database queries and connection pooling.' },
];

export function analyzeLogs(lines: string[]): string[] {
  const patterns: Record<string, number> = {};
  const recommendations = new Set<string>();

  lines.forEach((line) => {
    ERROR_PATTERNS.forEach((p) => {
      if (p.regex.test(line)) {
        patterns[p.label] = (patterns[p.label] || 0) + 1;
        recommendations.add(`REQ: ${p.req}`);
      }
    });
  });

  return Array.from(recommendations);
}

export function getDetailedPatterns(lines: string[]): LogPattern[] {
  const counts: Record<string, number> = {};
  lines.forEach((line) => {
    ERROR_PATTERNS.forEach((p) => {
      if (p.regex.test(line)) {
        counts[p.label] = (counts[p.label] || 0) + 1;
      }
    });
  });

  return ERROR_PATTERNS
    .filter(p => counts[p.label])
    .map(p => ({
      pattern: p.label,
      count: counts[p.label],
      recommendation: p.req
    }))
    .sort((a, b) => b.count - a.count);
}
