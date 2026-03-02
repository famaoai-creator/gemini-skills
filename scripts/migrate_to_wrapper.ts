import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = process.cwd();
const applyMode = process.argv.includes('--apply');

/**
 * Migration Script: Migrate skill scripts to use runSkill() from skill-wrapper.cjs
 */

const SKIP_FILES = [
  'nonfunctional-architect/scripts/assess.cjs',
  'github-skills-manager/scripts/dashboard.cjs',
  'voice-command-listener/scripts/listen.cjs',
  'voice-interface-maestro/scripts/chat_loop.cjs',
  'voice-interface-maestro/scripts/speak.cjs',
  'nonfunctional-architect/scripts/iac_analyzer.cjs',
  'github-skills-manager/scripts/git_status.cjs',
];

type MigrationPattern = 'already-migrated' | 'skip' | 'pattern-a' | 'pattern-b' | 'pattern-c' | 'async';

function findSkillScripts(dir: string = path.join(ROOT, 'skills')): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findSkillScripts(filePath));
    } else if (file.endsWith('.cjs') && filePath.includes('/scripts/')) {
      results.push(path.relative(ROOT, filePath));
    }
  }
  return results;
}

function detectPattern(content: string, relativePath: string): MigrationPattern {
  if (content.includes('runSkill') || content.includes('runAsyncSkill')) return 'already-migrated';

  const relPath = relativePath.replace(/\\/g, '/');
  if (SKIP_FILES.some(skip => relPath.includes(skip))) return 'skip';

  if (
    content.includes('(async ()') ||
    (content.includes('async function') &&
      (content.includes('await ') || content.includes('.then(')))
  ) {
    return 'async';
  }

  if (content.includes('console.log(JSON.stringify(') && content.includes('try {')) {
    if (!content.includes('argv.out') && !content.includes('--out')) return 'pattern-a';
  }

  if (
    (content.includes('argv.out') || content.includes('argv.o')) &&
    content.includes('fs.' + 'writeFileSync')
  ) {
    return 'pattern-b';
  }

  return 'pattern-c';
}

function main(): void {
  console.log('\n=== Skill Migration Scanner ===');
  console.log(`Mode: ${applyMode ? 'APPLY' : 'DRY-RUN'}\n`);

  const files = findSkillScripts();
  const results: Record<MigrationPattern, string[]> = {
    'already-migrated': [],
    skip: [],
    'pattern-a': [],
    'pattern-b': [],
    'pattern-c': [],
    async: [],
  };

  for (const file of files) {
    const fullPath = path.join(ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const pattern = detectPattern(content, file);
    results[pattern].push(file);
  }

  // Report details
  console.log(`Already migrated (${results['already-migrated'].length}):`);
  results['already-migrated'].forEach((f) => console.log(`  [OK] ${f}`));

  console.log(`\n=== Summary ===`);
  console.log(`Total skill scripts: ${files.length}`);
  console.log(`Already migrated:    ${results['already-migrated'].length}`);
  console.log(`Need migration:      ${files.length - results['already-migrated'].length - results['skip'].length}`);

  if (!applyMode) {
    console.log('\nRun with --apply to execute migrations.');
  }
}

main();
