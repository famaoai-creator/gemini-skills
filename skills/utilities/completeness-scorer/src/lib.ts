export interface ScorerResult {
  score: number;
  issues: string[];
}

export function scoreCompleteness(content: string, requiredKeywords: string[] = []): ScorerResult {
  let score = 100;
  const issues: string[] = [];

  if (!content.trim()) {
    return { score: 0, issues: ['Content is empty'] };
  }

  const todoCount = (content.match(/TODO/g) || []).length;
  if (todoCount > 0) {
    score -= todoCount * 5;
    issues.push('Found ' + todoCount + ' TODOs');
  }

  requiredKeywords.forEach((keyword) => {
    if (!content.includes(keyword)) {
      score -= 10;
      issues.push('Missing keyword: ' + keyword);
    }
  });

  return { score: Math.max(0, score), issues };
}
