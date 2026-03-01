import { safeWriteFile, safeReadFile } from '@agent/core/secure-io';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getAllFiles } from '@agent/core/fs-utils';
import { RiskEntry, TechStackInfo, Severity } from '@agent/core/shared-business-types';

export interface CodeQualityStats { totalFiles: number; totalLines: number; avgFileSize: number; languages: Record<string, number>; }
export interface Contributor { commits: number; name: string; }
export interface TeamMaturity { contributors: number; topContributors: Contributor[]; busFactor: number; risk: 'critical' | 'high' | 'low' | 'unknown'; }
export interface ArchitectureSignals extends TechStackInfo {
  hasMonorepo: boolean; hasMicroservices: boolean; hasDockerCompose: boolean; hasTerraform: boolean; hasK8s: boolean; testFramework: string; cicd: string;
}
export interface DDRisk extends RiskEntry { area: string; }
export interface DDResult {
  directory: string; score: number; verdict: 'strong_pass' | 'pass' | 'conditional_pass' | 'fail';
  codeQuality: CodeQualityStats; teamMaturity: TeamMaturity; architecture: ArchitectureSignals; risks: DDRisk[]; recommendations: string[];
}

function loadDDRules() {
  const rootDir = process.cwd();
  const rulesPath = path.resolve(rootDir, 'knowledge/skills/business/tech-dd-analyst/rules.json');
  if (!fs.existsSync(rulesPath)) throw new Error('DD Rules not found.');
  return JSON.parse(safeReadFile(rulesPath, 'utf8'));
}

/**
 * Safe evaluator for DD rules using property mapping instead of new Function().
 */
function evaluateRule(rule: any, context: { code: any, team: any, arch: any }): boolean {
  const { path: propPath, op, value } = rule;
  const parts = propPath.split('.');
  let current: any = context;
  for (const p of parts) { if (current) current = current[p]; }

  switch (op) {
    case '>': return current > value;
    case '<': return current < value;
    case '>=': return current >= value;
    case '<=': return current <= value;
    case '===': return current === value;
    case '!==': return current !== value;
    case 'exists': return !!current;
    default: return false;
  }
}

export function assessCodeQuality(dir: string): CodeQualityStats {
  let totalFiles = 0; let totalLines = 0;
  const languages: Record<string, number> = {};
  const allFiles = getAllFiles(dir, { maxDepth: 5 });
  const targetExts = ['.js', '.cjs', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.rb'];

  for (const full of allFiles) {
    const ext = path.extname(full).toLowerCase();
    if (targetExts.includes(ext)) {
      try {
        const content = safeReadFile(full, 'utf8');
        totalLines += content.split('\n').length;
        totalFiles++;
        languages[ext] = (languages[ext] || 0) + 1;
      } catch (_e) { /* ignore */ }
    }
  }
  return { totalFiles, totalLines, avgFileSize: totalFiles > 0 ? Math.round(totalLines / totalFiles) : 0, languages };
}

export function assessTeamMaturity(dir: string): TeamMaturity {
  const rules = loadDDRules();
  const since = rules.thresholds.git_since;
  try {
    const authors = execSync(`git log --format="%an" --since="${since}" | sort | uniq -c | sort -rn`, { cwd: dir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const contributors: Contributor[] = authors.trim().split('\n').filter(Boolean).map((l) => {
      const m = l.trim().match(/(\d+)\s+(.+)/);
      return m ? { commits: parseInt(m[1]), name: m[2] } : null;
    }).filter((c): c is Contributor => c !== null);
    const totalCommits = contributors.reduce((s, c) => s + c.commits, 0);
    const busFactorThreshold = totalCommits * 0.5;
    let busFactor = 0; let acc = 0;
    for (const c of contributors) { acc += c.commits; busFactor++; if (acc >= busFactorThreshold) break; }
    const topContributorShare = totalCommits > 0 ? Math.round((contributors[0].commits / totalCommits) * 100) : 0;
    let risk: TeamMaturity['risk'] = 'low';
    if (busFactor <= rules.thresholds.bus_factor_critical || topContributorShare > rules.thresholds.top_contributor_share_critical) risk = 'critical';
    else if (busFactor <= rules.thresholds.bus_factor_high || topContributorShare > rules.thresholds.top_contributor_share_high) risk = 'high';
    return { contributors: contributors.length, topContributors: contributors.slice(0, 5), busFactor, risk };
  } catch (_e) { return { contributors: 0, topContributors: [], busFactor: 0, risk: 'unknown' }; }
}

export function assessArchitecture(dir: string): ArchitectureSignals {
  const signals: ArchitectureSignals = {
    languages: [], frameworks: [], tools: [], hasMonorepo: false, hasMicroservices: false, hasDockerCompose: false, hasTerraform: false, hasK8s: false, testFramework: 'none', cicd: 'none',
  };
  const exists = (p: string) => fs.existsSync(path.join(dir, p));
  if (exists('lerna.json') || exists('pnpm-workspace.yaml')) signals.hasMonorepo = true;
  if (exists('docker-compose.yml')) signals.hasDockerCompose = true;
  if (exists('terraform') || exists('main.tf')) signals.hasTerraform = true;
  if (exists('jest.config.js')) signals.testFramework = 'jest';
  return signals;
}

export function calculateDDScore(code: CodeQualityStats, team: TeamMaturity, arch: ArchitectureSignals): number {
  const rules = loadDDRules();
  let score = rules.scoring.base_score;
  const context = { code, team, arch };
  rules.scoring.rules.forEach((r: any) => { if (evaluateRule(r, context)) score += r.points; });
  return Math.max(0, Math.min(100, score));
}

export function processTechDD(dir: string): DDResult {
  const rules = loadDDRules();
  const code = assessCodeQuality(dir);
  const team = assessTeamMaturity(dir);
  const arch = assessArchitecture(dir);
  const score = calculateDDScore(code, team, arch);
  let verdict: DDResult['verdict'] = 'fail';
  if (score >= rules.verdicts.strong_pass) verdict = 'strong_pass';
  else if (score >= rules.verdicts.pass) verdict = 'pass';
  else if (score >= rules.verdicts.conditional_pass) verdict = 'conditional_pass';
  return { directory: dir, score, verdict, codeQuality: code, teamMaturity: team, architecture: arch, risks: [], recommendations: [] };
}
