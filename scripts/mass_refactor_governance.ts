/**
 * scripts/mass_refactor_governance.ts
 * Mass Refactoring Tool for Governance Enforcement v2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const rootDir = process.cwd();

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

function refactorFile(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  if (content.includes('fs.writeFileSync(') && !content.includes('process.argv')) {
    content = content.replace(/fs\.writeFileSync\(/g, 'safeWriteFile(');
    modified = true;
  }

  if (content.includes('fs.readFileSync(') && !content.includes('process.argv')) {
    content = content.replace(/fs\.readFileSync\(/g, 'safeReadFile(');
    modified = true;
  }

  if (modified) {
    if (!content.includes("'@agent/core'") && !content.includes("'@agent/core/secure-io'")) {
      const importLine = "import { safeWriteFile, safeReadFile } from '@agent/core';\n";
      content = importLine + content;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const skillsDir = path.join(rootDir, 'skills');
  if (!fs.existsSync(skillsDir)) return;

  const files = walk(skillsDir).filter(f => f.includes('/src/'));
  let total = 0;

  console.log(`Scanning ${files.length} files for governance refactoring...`);

  files.forEach((file) => {
    if (refactorFile(file)) {
      console.log(`  [FIXED] ${path.relative(rootDir, file)}`);
      total++;
    }
  });

  console.log(`\nRefactoring complete. ${total} files updated.`);
}

main();
