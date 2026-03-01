import { safeReadFile } from '@agent/core/secure-io';
import fs from 'fs';
import path from 'path';

export interface ScorerResult { score: number; issues: string[]; }

function loadCriteria() {
  const rootDir = process.cwd();
  const criteriaPath = path.resolve(rootDir, 'knowledge/skills/utilities/completeness-scorer/criteria.json');
  if (!fs.existsSync(criteriaPath)) throw new Error(`Criteria missing: ${criteriaPath}`);
  return JSON.parse(safeReadFile(criteriaPath, 'utf8'));
}

export function scoreCompleteness(content: string, requiredKeywords: string[] = []): ScorerResult {
  const criteria = loadCriteria();
  let score = criteria.base_score;
  const issues: string[] = [];
  if (!content.trim()) return { score: criteria.min_score, issues: ['Content is empty'] };
  const todoCount = (content.match(/TODO/g) || []).length;
  if (todoCount > 0) { score -= todoCount * criteria.deductions.todo_per_item; issues.push('Found ' + todoCount + ' TODOs'); }
  requiredKeywords.forEach((keyword) => { if (!content.includes(keyword)) { score -= criteria.deductions.missing_keyword; issues.push('Missing keyword: ' + keyword); } });
  return { score: Math.max(criteria.min_score, score), issues };
}
