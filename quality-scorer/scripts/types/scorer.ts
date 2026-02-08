/**
 * Type definitions for the quality-scorer skill.
 *
 * The quality-scorer evaluates text or code content quality by computing
 * character count, line count, and average sentence length, then derives
 * a heuristic quality score with accompanying issue descriptions.
 *
 * Usage:
 *   import type { QualityScorerResult, QualityScorerConfig } from './types/scorer.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the quality-scorer skill. */
export interface QualityScorerConfig {
  /** Path to the file to evaluate for quality. */
  input: string;
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

/** Quantitative measurements extracted from the input content. */
export interface QualityMetrics {
  /** Total number of characters in the content. */
  charCount: number;
  /** Total number of lines in the content. */
  lines: number;
  /** Average number of characters per sentence. */
  avgLen: number;
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the quality-scorer skill. */
export interface QualityScorerResult {
  /**
   * Heuristic quality score from 0 to 100. Starts at 100 and is reduced
   * by 20 for very short content (< 50 chars), 10 for very long content
   * (> 10,000 chars), and 10 for excessively long average sentence length.
   */
  score: number;
  /** Quantitative metrics computed from the input content. */
  metrics: QualityMetrics;
  /**
   * Human-readable descriptions of detected quality issues
   * (e.g. "Too short", "Sentences are too long on average").
   */
  issues: string[];
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the quality-scorer result. */
export type QualityScorerOutput = SkillOutput<QualityScorerResult>;
