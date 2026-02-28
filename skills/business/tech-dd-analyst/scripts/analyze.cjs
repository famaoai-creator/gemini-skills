#!/usr/bin/env node
/**
 * tech-dd-analyst: Technical due diligence analysis on project directories.
 * Official Implementation using Externalized Governance Rules.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runSkill } = require('@agent/core');
const { createStandardYargs } = require('@agent/core/cli-utils');
const { getAllFiles } = require('@agent/core/fs-utils');
const { safeWriteFile } = require('@agent/core/secure-io');

const argv = createStandardYargs()
  .option('dir', { alias: 'd', type: 'string', default: '.', description: 'Project directory' })
  .option('out', { alias: 'o', type: 'string', description: 'Output file path' })
  .help().argv;

function loadRules() {
  const rootDir = process.cwd();
  const rulesPath = path.resolve(rootDir, 'knowledge/skills/business/tech-dd-analyst/rules.json');
  if (!fs.existsSync(rulesPath)) throw new Error(`DD Rules missing: ${rulesPath}`);
  return JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
}

function assessCodeQuality(dir) {
  let totalFiles = 0, totalLines = 0;
  const languages = {};
  const allFiles = getAllFiles(dir, { maxDepth: 5 });
  for (const full of allFiles) {
    const ext = path.extname(full).toLowerCase();
    if (['.js', '.cjs', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.rb'].includes(ext)) {
      try {
        totalLines += fs.readFileSync(full, 'utf8').split('\n').length;
        totalFiles++;
        languages[ext] = (languages[ext] || 0) + 1;
      } catch (_e) {}
    }
  }
  return { totalFiles, totalLines, avgFileSize: totalFiles > 0 ? Math.round(totalLines / totalFiles) : 0, languages };
}

function assessTeamMaturity(dir, rules) {
  try {
    const authors = execSync(`git log --format="%an" --since="${rules.thresholds.git_since}" | sort | uniq -c | sort -rn`, { cwd: dir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const contributors = authors.trim().split('\n').filter(Boolean).map(l => {
      const m = l.trim().match(/(\d+)\s+(.+)/);
      return m ? { commits: parseInt(m[1]), name: m[2] } : null;
    }).filter(Boolean);
    const totalCommits = contributors.reduce((s, c) => s + c.commits, 0);
    const busFactorThreshold = totalCommits * 0.5;
    let busFactor = 0, acc = 0;
    for (const c of contributors) { acc += c.commits; busFactor++; if (acc >= busFactorThreshold) break; }
    const topShare = totalCommits > 0 ? (contributors[0].commits / totalCommits) * 100 : 0;
    return { 
      contributors: contributors.length, topContributors: contributors.slice(0, 5), busFactor, 
      risk: (busFactor <= rules.thresholds.bus_factor_critical || topShare > rules.thresholds.top_contributor_share_critical) ? 'critical' : (busFactor <= rules.thresholds.bus_factor_high) ? 'high' : 'low'
    };
  } catch (_e) { return { contributors: 0, topContributors: [], busFactor: 0, risk: 'unknown' }; }
}

function assessArchitecture(dir) {
  const signals = { hasMonorepo: false, hasMicroservices: false, hasDockerCompose: false, hasTerraform: false, hasK8s: false, testFramework: 'none', cicd: 'none' };
  const exists = (p) => fs.existsSync(path.join(dir, p));
  if (exists('lerna.json') || exists('pnpm-workspace.yaml') || exists('workspaces')) signals.hasMonorepo = true;
  if (exists('docker-compose.yml') || exists('docker-compose.yaml')) { signals.hasDockerCompose = true; signals.hasMicroservices = true; }
  if (exists('terraform') || exists('main.tf')) signals.hasTerraform = true;
  if (exists('k8s') || exists('kubernetes')) signals.hasK8s = true;
  if (exists('jest.config.js')) signals.testFramework = 'jest';
  else if (exists('vitest.config.ts')) signals.testFramework = 'vitest';
  if (exists('.github/workflows')) signals.cicd = 'github-actions';
  return signals;
}

function calculateDDScore(code, team, arch, rules) {
  let score = rules.scoring.base_score;
  const evalCond = (c) => { try { return new Function('code', 'team', 'arch', `return ${c}`)(code, team, arch); } catch { return false; } };
  rules.scoring.rules.forEach(r => { if (evalCond(r.condition)) score += r.points; });
  return Math.max(0, Math.min(100, score));
}

runSkill('tech-dd-analyst', () => {
  const rules = loadRules();
  const targetDir = path.resolve(argv.dir);
  const code = assessCodeQuality(targetDir);
  const team = assessTeamMaturity(targetDir, rules);
  const arch = assessArchitecture(targetDir);
  const score = calculateDDScore(code, team, arch, rules);

  let verdict = 'fail';
  if (score >= rules.verdicts.strong_pass) verdict = 'strong_pass';
  else if (score >= rules.verdicts.pass) verdict = 'pass';
  else if (score >= rules.verdicts.conditional_pass) verdict = 'conditional_pass';

  const risks = [];
  if (team.risk === 'critical') risks.push({ area: 'Team', severity: 'critical', detail: `Bus factor ${team.busFactor}` });
  if (arch.testFramework === 'none') risks.push({ area: 'Quality', severity: 'high', detail: 'No test framework' });
  if (code.avgFileSize > rules.thresholds.avg_file_size_risk) risks.push({ area: 'Maintainability', severity: 'medium', detail: `Avg file size ${code.avgFileSize}` });

  const result = { directory: targetDir, score, verdict, codeQuality: code, teamMaturity: team, architecture: arch, risks };
  if (argv.out) safeWriteFile(argv.out, JSON.stringify(result, null, 2));
  return result;
});
