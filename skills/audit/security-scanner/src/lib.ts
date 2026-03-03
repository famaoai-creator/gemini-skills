import * as fs from 'node:fs';
import * as path from 'node:path';
import { safeReadFile } from '@agent/core/secure-io';

/**
 * Lightweight security scanner core.
 * Detects hardcoded secrets, dangerous functions, and insecure protocols.
 */

const SCAN_PATTERNS = [
  { name: 'Generic Hardcoded Secret', regex: /['"][0-9a-zA-Z-_]{32,}['"]/ },
  { name: 'Dangerous Eval', regex: /\beval\s*\(/ },
  { name: 'Insecure HTTP', regex: /'http:\/\// },
  { name: 'Private Key', regex: /-----BEGIN PRIVATE KEY-----/ },
];

export interface Finding {
  file: string;
  pattern: string;
  line: number;
}

export function scanFile(filePath: string, content: string): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    SCAN_PATTERNS.forEach((p) => {
      if (p.regex.test(line)) {
        findings.push({
          file: filePath,
          pattern: p.name,
          line: index + 1,
        });
      }
    });
  });

  return findings;
}

export function scanProject(dir: string): { findings: Finding[]; scannedFiles: number } {
  const findings: Finding[] = [];
  let scannedFiles = 0;

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
        walk(fullPath);
      } else if (/\.(js|ts|json|yaml|yml|md|env)$/.test(entry.name)) {
        scannedFiles++;
        const content = fs.readFileSync(fullPath, 'utf8');
        findings.push(...scanFile(fullPath, content));
      }
    }
  }

  walk(dir);
  return { findings, scannedFiles };
}
