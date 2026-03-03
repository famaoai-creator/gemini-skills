/**
 * scripts/scan_pii_in_docs.ts
 * PII Shield for Documentation
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger } from '@agent/core/core';
import * as pathResolver from '@agent/core/path-resolver';

const rootDir = process.cwd();
const knowledgeDir = pathResolver.knowledge();

const FORBIDDEN_PATTERNS = [
  { name: 'API_KEY', regex: /AIza[0-9A-Za-z-_]{35}/ },
  { name: 'OAUTH_SECRET', regex: /[0-9A-Za-z-_]{24,32}\.apps\.googleusercontent\.com/ },
  { name: 'PRIVATE_KEY', regex: /-----BEGIN PRIVATE KEY-----/ },
  { name: 'GENERIC_SECRET', regex: /secret[:=]\s*['"][0-9A-Za-z-_]{16,}['"]/i },
];

function scanDocs() {
  const violations: any[] = [];
  const personalDir = path.join(knowledgeDir, 'personal');

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const p = path.join(dir, entry.name);
      if (p.startsWith(personalDir)) continue;

      if (entry.isDirectory()) {
        walk(p);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json')) {
        const content = fs.readFileSync(p, 'utf8');
        FORBIDDEN_PATTERNS.forEach((pattern) => {
          if (pattern.regex.test(content)) {
            violations.push({ file: path.relative(rootDir, p), type: pattern.name });
          }
        });
      }
    }
  }

  walk(knowledgeDir);
  return violations;
}

async function main() {
  const violations = scanDocs();
  if (violations.length > 0) {
    console.error('\n🚨  SECURITY ALERT: Forbidden tokens detected in Knowledge Base!\n');
    violations.forEach((v) => console.log(`  [${v.type}] ${v.file}`));
    process.exit(1);
  } else {
    logger.success('Documentation safety verified. No sensitive tokens found.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
