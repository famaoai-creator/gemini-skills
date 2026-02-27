import { safeWriteFile, safeReadFile } from '@agent/core/secure-io';
import * as fs from 'fs';
import * as path from 'path';
import { getAllFiles } from '@agent/core/fs-utils';

export interface Pattern {
  name: string;
  regex: RegExp;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export const SECURITY_PATTERNS: Pattern[] = [
  {
    name: 'Hardcoded API Key',
    regex: /(api|secret|access)[_-]?(key|token)\s*[:=]\s*['"`][a-zA-Z0-9_\-]{20,}['"`]/i,
    severity: 'high',
    suggestion: 'Use environment variables instead of hardcoded secrets.',
  },
  {
    name: 'Insecure Design: Cleartext Credentials',
    regex: /(password|passwd|pwd)\s*[:=]\s*['"`][^'"`]{3,}['"`]/i,
    severity: 'high',
    suggestion: 'Avoid storing passwords in cleartext. Use Secret Managers.',
  },
  {
    name: 'Insecure Design: Disabled Security Flag',
    regex: /(verify_ssl|strict_ssl|secure_only)\s*[:=]\s*(false|0|off)/i,
    severity: 'high',
    suggestion: 'Enabling SSL/Security flags is critical for Security By Design.',
  },
  {
    name: 'Dangerous Eval',
    regex: /\beval\s*\(/,
    severity: 'high',
    suggestion: 'Avoid using eval() as it can execute arbitrary code.',
  },
  {
    name: 'Insecure HTTP',
    regex: /http:\/\//,
    severity: 'medium',
    suggestion: 'Use HTTPS instead of HTTP.',
  },
];

export interface Finding {
  file: string;
  pattern: string;
  severity: string;
  suggestion: string;
  line: number;
}

export function scanFile(filePath: string, content: string): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split(new RegExp('\\r?\\n'));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of SECURITY_PATTERNS) {
      if (pattern.regex.test(line)) {
        findings.push({
          file: filePath,
          pattern: pattern.name,
          severity: pattern.severity,
          suggestion: pattern.suggestion,
          line: i + 1,
        });
      }
    }
  }
  return findings;
}

const IGNORE_DIRS = ['node_modules', 'dist', 'build', 'coverage', '.git'];

export function scanProject(projectRoot: string): { scannedFiles: number; findings: Finding[] } {
  const allFiles = getAllFiles(projectRoot);
  let scannedFiles = 0;
  const findings: Finding[] = [];

  for (const filePath of allFiles) {
    // Skip ignored dirs
    if (IGNORE_DIRS.some((dir) => filePath.includes(`${path.sep}${dir}${path.sep}`))) continue;

    // Simple binary check by extension
    const ext = path.extname(filePath).toLowerCase();
    if (['.png', '.jpg', '.pdf', '.exe', '.bin'].includes(ext)) continue;

    try {
      const content = safeReadFile(filePath, { encoding: 'utf8' }) as string;
      const fileFindings = scanFile(path.relative(projectRoot, filePath), content);
      findings.push(...fileFindings);
      scannedFiles++;
    } catch (_e) {
      // Ignore read errors
    }
  }

  return { scannedFiles, findings };
}
