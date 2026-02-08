/**
 * TypeScript version of the project-health-check audit skill.
 *
 * Scans a project directory for CI/CD, testing, linting, IaC, and
 * documentation artefacts and produces a health score + grade.
 *
 * The CLI entry point remains in audit.cjs; this module exports
 * typed helper functions for the core audit logic.
 *
 * Usage:
 *   import { runAudit } from './audit.js';
 *   const report = runAudit('/path/to/project');
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { SkillOutput } from '../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration for a single health check category. */
export interface CheckConfig {
  name: string;
  patterns: string[];
  weight: number;
  message: string;
}

/** Map of check keys to their configuration. */
export type ChecksMap = Record<string, CheckConfig>;

/** A single check result when the artefact was found. */
export interface CheckResultFound {
  check: string;
  status: 'found';
  match: string;
  weight: number;
}

/** A single check result when the artefact was missing. */
export interface CheckResultMissing {
  check: string;
  status: 'missing';
  suggestion: string;
  weight: number;
}

/** Union of possible check result shapes. */
export type CheckResult = CheckResultFound | CheckResultMissing;

/** Letter grade assigned to the project health score. */
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

/** Full audit report returned by runAudit(). */
export interface AuditReport {
  projectRoot: string;
  score: number;
  grade: Grade;
  checks: CheckResult[];
}

// ---------------------------------------------------------------------------
// Default check definitions
// ---------------------------------------------------------------------------

/** Default check configuration matching the CJS implementation. */
export const CHECKS: ChecksMap = {
  ci: {
    name: 'CI/CD Pipelines',
    patterns: [
      '.github/workflows',
      '.gitlab-ci.yml',
      '.circleci/config.yml',
      'azure-pipelines.yml',
      'bitbucket-pipelines.yml',
      'Jenkinsfile',
    ],
    weight: 25,
    message: 'Automated pipelines ensure code integration and deployment safety.',
  },
  test: {
    name: 'Testing Framework',
    patterns: [
      'jest.config.*',
      'pytest.ini',
      '.rspec',
      'pom.xml',
      'build.gradle*',
      'go.mod',
      'Cargo.toml',
      'requirements-dev.txt',
      'package.json',
    ],
    weight: 25,
    message: 'Tests prevent regressions and enable confident refactoring.',
  },
  lint: {
    name: 'Linting & Formatting',
    patterns: [
      '.eslintrc*',
      '.prettierrc*',
      'pyproject.toml',
      '.rubocop.yml',
      'checkstyle.xml',
      '.golangci.yml',
    ],
    weight: 15,
    message: 'Consistent style and static analysis reduce bugs and cognitive load.',
  },
  iac: {
    name: 'Containerization & IaC',
    patterns: [
      'Dockerfile',
      'docker-compose.yml',
      'Compose.yaml',
      'k8s/',
      'helm/',
      'terraform/',
      'main.tf',
      'Pulumi.yaml',
      'serverless.yml',
    ],
    weight: 20,
    message: 'Infrastructure as Code and Containers ensure reproducible environments.',
  },
  docs: {
    name: 'Documentation',
    patterns: [
      'README.md',
      'CONTRIBUTING.md',
      'docs/',
      'doc/',
    ],
    weight: 15,
    message: 'Good documentation lowers onboarding cost and explains "Why".',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check whether any of the given filesystem patterns exist under projectRoot.
 *
 * Supports three pattern styles:
 *   - Trailing `/` for directory checks
 *   - Glob `*` wildcards matched via regex against directory listings
 *   - Exact file/directory names
 *
 * @param patterns    - Array of pattern strings to look for
 * @param projectRoot - Absolute path to the project root directory
 * @returns The first matched pattern string, or null if none matched
 */
export function checkExistence(patterns: string[], projectRoot: string): string | null {
  for (const pattern of patterns) {
    if (pattern.endsWith('/')) {
      const dirPath = path.join(projectRoot, pattern.slice(0, -1));
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) return pattern;
    } else if (pattern.includes('*')) {
      const dir = path.dirname(pattern);
      const base = path.basename(pattern);
      try {
        const files = fs.readdirSync(path.join(projectRoot, dir === '.' ? '' : dir));
        const regex = new RegExp('^' + base.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        const match = files.find((f: string) => regex.test(f));
        if (match) return match;
      } catch {
        /* directory does not exist */
      }
    } else {
      if (fs.existsSync(path.join(projectRoot, pattern))) return pattern;
    }
  }
  return null;
}

/**
 * Check package.json for test or lint tooling indicators.
 *
 * @param type        - Check type: 'test' or 'lint'
 * @param projectRoot - Absolute path to the project root directory
 * @returns true if the relevant tooling was detected in package.json
 */
export function checkPackageJson(type: 'test' | 'lint', projectRoot: string): boolean {
  const pkgPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;

  try {
    const pkg: Record<string, unknown> = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = (pkg.dependencies ?? {}) as Record<string, string>;
    const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
    const allDeps: Record<string, string> = { ...deps, ...devDeps };
    const scripts = (pkg.scripts ?? {}) as Record<string, string>;

    if (type === 'test') {
      return (
        Object.keys(allDeps).some(
          (d) => d.includes('jest') || d.includes('mocha') || d.includes('vitest') || d.includes('ava'),
        ) || Object.keys(scripts).some((s) => s === 'test')
      );
    }
    if (type === 'lint') {
      return (
        Object.keys(allDeps).some(
          (d) => d.includes('eslint') || d.includes('prettier') || d.includes('stylelint'),
        ) || Object.keys(scripts).some((s) => s.includes('lint') || s.includes('format'))
      );
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Derive a letter grade from a percentage score.
 *
 * @param percentage - Score between 0 and 100
 * @returns Letter grade
 */
export function deriveGrade(percentage: number): Grade {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

// ---------------------------------------------------------------------------
// Main audit logic
// ---------------------------------------------------------------------------

/**
 * Run a full health-check audit on the given project directory.
 *
 * @param projectRoot - Absolute path to the project root
 * @param checks      - Check definitions (defaults to CHECKS)
 * @returns Audit report with score, grade, and per-check results
 */
export function runAudit(
  projectRoot: string,
  checks: ChecksMap = CHECKS,
): AuditReport {
  let totalScore = 0;
  let maxScore = 0;
  const results: CheckResult[] = [];

  for (const [key, config] of Object.entries(checks)) {
    maxScore += config.weight;
    let found = checkExistence(config.patterns, projectRoot);

    if (!found && (key === 'test' || key === 'lint')) {
      if (checkPackageJson(key, projectRoot)) {
        found = 'package.json (dependencies/scripts)';
      }
    }

    if (found) {
      totalScore += config.weight;
      results.push({ check: config.name, status: 'found', match: found, weight: config.weight });
    } else {
      results.push({ check: config.name, status: 'missing', suggestion: config.message, weight: config.weight });
    }
  }

  const percentage = Math.round((totalScore / maxScore) * 100);
  const grade = deriveGrade(percentage);

  return { projectRoot, score: percentage, grade, checks: results };
}

/**
 * Build a SkillOutput envelope for the project-health-check skill.
 *
 * @param report  - Audit report data
 * @param startMs - Start timestamp from Date.now()
 * @returns Standard SkillOutput envelope
 */
export function buildAuditOutput(
  report: AuditReport,
  startMs: number,
): SkillOutput<AuditReport> {
  return {
    skill: 'project-health-check',
    status: 'success',
    data: report,
    metadata: {
      duration_ms: Date.now() - startMs,
      timestamp: new Date().toISOString(),
    },
  };
}
