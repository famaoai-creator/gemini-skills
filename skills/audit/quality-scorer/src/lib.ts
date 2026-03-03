/**
 * Quality Scorer Core Library.
 * Evaluates technical and textual quality based on IPA benchmarks and readability standards.
 */

export interface QualityMetrics {
  charCount: number;
  wordCount: number;
  lines: number;
  complexity: number;
}

export interface QualityResult {
  score: number;
  grade: string;
  metrics: QualityMetrics;
  issues: string[];
}

export const DEFAULT_RULES = {
  min_length: { threshold: 50, penalty: 20, message: 'Content is too short for meaningful analysis.' },
  complexity: { threshold: 15, penalty: 15, message: 'Logic density is high; consider refactoring for readability.' },
};

/**
 * Heuristic logic to estimate code/text complexity.
 */
export function estimateComplexity(text: string): number {
  const complexityMarkers = [
    /\bif\b/g, /\belse\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcase\b/g,
    /\bcatch\b/g, /&&/g, /\|\|/g, /\?/g, /=>/g
  ];
  
  let score = 0;
  complexityMarkers.forEach(regex => {
    const matches = text.match(regex);
    if (matches) score += matches.length;
  });
  
  const lines = text.split('\n').length;
  return lines > 0 ? (score / lines) * 10 : 0;
}

export function calculateScore(content: string): QualityResult {
  const charCount = content.length;
  const lines = content.split('\n').length;
  const wordCount = content.trim().split(/\s+/).length;
  const complexity = estimateComplexity(content);

  let score = 100;
  const issues: string[] = [];

  if (charCount < DEFAULT_RULES.min_length.threshold && charCount > 0) {
    score -= DEFAULT_RULES.min_length.penalty;
    issues.push(DEFAULT_RULES.min_length.message);
  }

  if (complexity > DEFAULT_RULES.complexity.threshold) {
    score -= DEFAULT_RULES.complexity.penalty;
    issues.push(DEFAULT_RULES.complexity.message);
  }

  if (charCount === 0) {
    score = 0;
    issues.push('Content is empty.');
  }

  const finalScore = Math.max(0, score);
  let grade = 'F';
  if (finalScore >= 90) grade = 'S';
  else if (finalScore >= 80) grade = 'A';
  else if (finalScore >= 70) grade = 'B';
  else if (finalScore >= 60) grade = 'C';
  else if (finalScore >= 40) grade = 'D';

  return {
    score: finalScore,
    grade,
    metrics: { charCount, wordCount, lines, complexity },
    issues
  };
}
