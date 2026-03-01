#!/usr/bin/env node
/**
 * tech-dd-analyst: Technical due diligence analysis on project directories.
 * Safe Implementation using Static Rule Evaluation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runSkill } = require('@agent/core');
const { createStandardYargs } = require('@agent/core/cli-utils');
const { getAllFiles } = require('@agent/core/fs-utils');
const { safeReadFile, safeWriteFile } = require('@agent/core/secure-io');

const argv = createStandardYargs()
  .option('dir', { alias: 'd', type: 'string', default: '.', description: 'Project directory' })
  .option('out', { alias: 'o', type: 'string', description: 'Output file path' })
  .help().argv;

function loadRules() {
  const rootDir = process.cwd();
  const rulesPath = path.resolve(rootDir, 'knowledge/skills/business/tech-dd-analyst/rules.json');
  return JSON.parse(safeReadFile(rulesPath, 'utf8'));
}

function evaluateRule(rule, context) {
  const { path: p, op, value } = rule;
  const parts = p.split('.');
  let cur = context;
  for (const part of parts) { if (cur) cur = cur[part]; }
  switch (op) {
    case '>': return cur > value;
    case '<': return cur < value;
    case '===': return cur === value;
    case '!==': return cur !== value;
    default: return false;
  }
}

function assessCodeQuality(dir) {
  let totalFiles = 0, totalLines = 0;
  const allFiles = getAllFiles(dir, { maxDepth: 5 });
  for (const full of allFiles) {
    if (['.js', '.ts', '.py'].includes(path.extname(full))) {
      try { totalLines += safeReadFile(full, 'utf8').split('\n').length; totalFiles++; } catch (_e) {}
    }
  }
  return { totalFiles, totalLines, avgFileSize: totalFiles > 0 ? Math.round(totalLines / totalFiles) : 0 };
}

runSkill('tech-dd-analyst', () => {
  const rules = loadRules();
  const targetDir = path.resolve(argv.dir);
  const code = assessCodeQuality(targetDir);
  const team = { contributors: 0, busFactor: 0 }; // Simplified for CLI example
  const arch = { hasMonorepo: fs.existsSync(path.join(targetDir, 'pnpm-workspace.yaml')), testFramework: 'none' };
  
  let score = rules.scoring.base_score;
  const context = { code, team, arch };
  rules.scoring.rules.forEach(r => { if (evaluateRule(r, context)) score += r.points; });

  let verdict = score >= rules.verdicts.strong_pass ? 'strong_pass' : score >= rules.verdicts.pass ? 'pass' : 'fail';
  const result = { directory: targetDir, score: Math.min(100, score), verdict, codeQuality: code };
  if (argv.out) safeWriteFile(argv.out, JSON.stringify(result, null, 2));
  return result;
});
