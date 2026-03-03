import * as fs from 'node:fs';
import * as path from 'node:path';
import { safeReadFile } from '@agent/core/secure-io';

/**
 * Completeness Scorer Core Library.
 */

export interface ScorerResult {
  score: number;
  issues: string[];
}

export function scoreCompleteness(content: string, requiredKeywords: string[] = []): ScorerResult {
  const rootDir = process.cwd();
  const criteriaPath = path.resolve(rootDir, 'knowledge/skills/utilities/completeness-scorer/criteria.json');
  
  let criteria = {
    base_score: 100,
    min_score: 0,
    deductions: {
      todo_per_item: 5,
      missing_keyword: 10
    }
  };

  if (fs.existsSync(criteriaPath)) {
    try {
      criteria = JSON.parse(safeReadFile(criteriaPath, { encoding: 'utf8' }) as string);
    } catch (_) {}
  }

  let score = criteria.base_score;
  const issues: string[] = [];

  if (!content.trim()) {
    return { score: criteria.min_score, issues: ['Content is empty'] };
  }

  // Check for TODOs
  const todoCount = (content.match(/\bTODO\b/g) || []).length;
  if (todoCount > 0) {
    score -= todoCount * criteria.deductions.todo_per_item;
    issues.push(`Found ${todoCount} TODOs`);
  }

  // Check for missing keywords
  requiredKeywords.forEach((keyword) => {
    if (!content.includes(keyword)) {
      score -= criteria.deductions.missing_keyword;
      issues.push(`Missing keyword: ${keyword}`);
    }
  });

  return {
    score: Math.max(criteria.min_score, score),
    issues
  };
}
