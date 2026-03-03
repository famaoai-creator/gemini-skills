import { safeWriteFile } from '@agent/core';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Bug Predictor Core Library.
 * Analyzes git churn and complexity to find hotspots.
 */

export interface Hotspot {
  file: string;
  churn: number;
  lines: number;
  complexity: number;
  riskScore: number;
}

export function calculateRiskScore(churn: number, complexity: number, lines: number): number {
  // Heuristic: Churn weights 60%, Complexity weights 40%
  const churnScore = Math.min(100, churn * 10);
  const complexityScore = Math.min(100, complexity * 5);
  return Math.round(churnScore * 0.6 + complexityScore * 0.4);
}

export function getChurnData(repoDir: string, since: string): Record<string, number> {
  try {
    const output = execSync(`git log --since="${since}" --name-only --pretty=format:`, {
      cwd: repoDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    
    const churn: Record<string, number> = {};
    output.split('\n').filter(Boolean).forEach(file => {
      churn[file] = (churn[file] || 0) + 1;
    });
    return churn;
  } catch (_) {
    return {};
  }
}

export function predict(repoDir: string, options: any = {}) {
  const churn = getChurnData(repoDir, options.since || '3 months ago');
  const hotspots: Hotspot[] = [];

  for (const [file, count] of Object.entries(churn)) {
    const filePath = path.join(repoDir, file);
    if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    
    // Simple complexity heuristic
    const complexity = (content.match(/if|for|while|switch|&&|\|\|/g) || []).length;
    const riskScore = calculateRiskScore(count, complexity, lines);

    hotspots.push({
      file,
      churn: count,
      lines,
      complexity,
      riskScore
    });
  }

  const sorted = hotspots.sort((a, b) => b.riskScore - a.riskScore).slice(0, options.top || 10);
  
  const report = {
    repository: path.resolve(repoDir),
    since: options.since || '3 months ago',
    totalFilesAnalyzed: hotspots.length,
    hotspots: sorted,
    riskSummary: {
      high: sorted.filter(h => h.riskScore >= 70).length,
      medium: sorted.filter(h => h.riskScore >= 40 && h.riskScore < 70).length,
      low: sorted.filter(h => h.riskScore < 40).length
    },
    recommendation: sorted.length > 0 ? `Focus refactoring on ${sorted[0].file}` : 'Ecosystem is stable.'
  };

  if (options.outPath) {
    safeWriteFile(options.outPath, JSON.stringify(report, null, 2));
  }

  return report;
}
