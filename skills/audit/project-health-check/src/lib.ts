import * as fs from 'node:fs';
import * as path from 'node:path';
import { safeReadFile } from '@agent/core/secure-io';

/**
 * Project Health Check Core Library.
 * Audits project structure, deliverables, and quality metrics.
 */

export interface HealthCheckResult {
  score: number;
  grade: string;
  projectRoot: string;
  checks: any[];
}

export function checkExistence(dir: string, patterns: string[]): string | null {
  for (const p of patterns) {
    const fullPath = path.join(dir, p);
    if (fs.existsSync(fullPath)) return p;
  }
  return null;
}

export function checkPackageJson(dir: string, type: 'test' | 'lint'): boolean {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (type === 'test') {
      return !!(pkg.scripts?.test || pkg.devDependencies?.jest || pkg.devDependencies?.vitest);
    }
    if (type === 'lint') {
      return !!(pkg.scripts?.lint || pkg.devDependencies?.eslint || pkg.devDependencies?.prettier);
    }
  } catch (_) {}
  return false;
}

export function performAudit(projectRoot: string): HealthCheckResult {
  const checks = [
    {
      check: 'Documentation',
      status: checkExistence(projectRoot, ['README.md', 'docs/INDEX.md']) ? 'found' : 'missing',
      weight: 20
    },
    {
      check: 'Testing Framework',
      status: checkPackageJson(projectRoot, 'test') ? 'found' : 'missing',
      weight: 30
    },
    {
      check: 'Linting/Formatting',
      status: checkPackageJson(projectRoot, 'lint') ? 'found' : 'missing',
      weight: 20
    },
    {
      check: 'CI/CD Configuration',
      status: checkExistence(projectRoot, ['.github/workflows', '.gitlab-ci.yml']) ? 'found' : 'missing',
      weight: 30
    }
  ];

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earnedWeight = checks.reduce((sum, c) => sum + (c.status === 'found' ? c.weight : 0), 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  let grade = 'F';
  if (score >= 90) grade = 'S';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 40) grade = 'D';

  return {
    score,
    grade,
    projectRoot,
    checks
  };
}
