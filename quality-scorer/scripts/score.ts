/**
 * TypeScript version of the quality-scorer skill.
 *
 * Scores document quality using heuristic metrics: character count,
 * line count, sentence count, and average sentence length.
 *
 * The CLI entry point remains in score.cjs; this module exports
 * typed helper functions for the core scoring logic.
 *
 * Usage:
 *   import { scoreQuality } from './score.js';
 *   const result = scoreQuality(content);
 *   console.log(result.score, result.metrics, result.issues);
 */

import type { SkillOutput } from '../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Quality metrics computed from document content. */
export interface QualityMetrics {
  charCount: number;
  lines: number;
  avgLen: number;
}

/** Result of quality scoring. */
export interface QualityResult {
  score: number;
  metrics: QualityMetrics;
  issues: string[];
}

// ---------------------------------------------------------------------------
// Core scoring
// ---------------------------------------------------------------------------

/**
 * Score the quality of document content using heuristic metrics.
 *
 * Scoring rules (matching the CJS implementation):
 * - Starts at 100
 * - charCount < 50: -20 points, "Too short" issue
 * - charCount > 10000: -10 points, "Very long" issue
 * - Average sentence length > 100 chars: -10 points, "Sentences are too long on average" issue
 *
 * @param content - The document text to score
 * @returns Scoring result with score (0-100), metrics, and issues
 */
export function scoreQuality(content: string): QualityResult {
  // Metrics
  const charCount = content.length;
  const lines = content.split('\n').length;
  const sentences = content.split(/[.?!。？！]/).length;

  // Heuristic scoring (0-100)
  let score = 100;
  const issues: string[] = [];

  if (charCount < 50) {
    score -= 20;
    issues.push('Too short');
  }
  if (charCount > 10000) {
    score -= 10;
    issues.push('Very long');
  }

  // Avg sentence length
  const avgLen = charCount / sentences;
  if (avgLen > 100) {
    score -= 10;
    issues.push('Sentences are too long on average');
  }

  return { score, metrics: { charCount, lines, avgLen }, issues };
}

// ---------------------------------------------------------------------------
// SkillOutput builder
// ---------------------------------------------------------------------------

/**
 * Build a SkillOutput envelope for the quality-scorer skill.
 *
 * @param result  - Quality scoring result data
 * @param startMs - Start timestamp from Date.now()
 * @returns Standard SkillOutput envelope
 */
export function buildQualityOutput(
  result: QualityResult,
  startMs: number,
): SkillOutput<QualityResult> {
  return {
    skill: 'quality-scorer',
    status: 'success',
    data: result,
    metadata: {
      duration_ms: Date.now() - startMs,
      timestamp: new Date().toISOString(),
    },
  };
}
