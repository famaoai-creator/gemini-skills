/**
 * scripts/check_knowledge_integrity.ts
 * Detects broken internal links in documentation.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger, safeReadFile } from '@agent/core';
import * as pathResolver from '@agent/core/path-resolver';

const knowledgeDir = pathResolver.knowledge();

function* walk(dir: string): Generator<string> {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) yield* walk(path.join(dir, file.name));
    else yield path.join(dir, file.name);
  }
}

async function main() {
  const issues: any[] = [];
  const files: string[] = [];

  for (const file of walk(knowledgeDir)) {
    if (file.endsWith('.md')) files.push(file);
  }

  files.forEach((file) => {
    try {
      const content = safeReadFile(file, { encoding: 'utf8' }) as string;
      const relFile = path.relative(process.cwd(), file);
      const linkRegex = /\[.*?\]\(((\.\/|\.\.\/).*?\.md)\)/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        const linkPath = path.resolve(path.dirname(file), match[1]);
        if (!fs.existsSync(linkPath)) {
          issues.push({ file: relFile, type: 'BROKEN_LINK', detail: match[1] });
        }
      }
    } catch (_) {}
  });

  if (issues.length > 0) {
    logger.warn(`Knowledge Integrity Issues Found: ${issues.length}`);
    issues.forEach(i => console.log(`  [${i.type}] ${i.file}: ${i.detail}`));
    process.exit(1);
  } else {
    logger.success('Knowledge integrity verified.');
  }
}

main().catch(err => {
  logger.error(err.message);
  process.exit(1);
});
