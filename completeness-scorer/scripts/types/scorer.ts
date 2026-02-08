/**
 * Type definitions for the completeness-scorer skill.
 *
 * The completeness-scorer evaluates how complete a document is by checking
 * for empty content, counting TODO markers, and optionally verifying the
 * presence of required keywords defined in an external criteria file.
 *
 * Usage:
 *   import type { ScorerResult, ScorerConfig } from './types/scorer.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the completeness-scorer skill. */
export interface ScorerConfig {
  /** Path to the file whose content is evaluated for completeness. */
  input: string;
  /** Optional path to a JSON file containing required keyword criteria. */
  criteria?: string;
}

// ---------------------------------------------------------------------------
// Criteria Schema
// ---------------------------------------------------------------------------

/**
 * Shape of the external criteria JSON file that can be provided via
 * the --criteria flag. Lists required keywords that must appear.
 */
export interface CompletenessCriteria {
  /** Keywords that must be present in the content. */
  required?: string[];
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the completeness-scorer skill. */
export interface ScorerResult {
  /**
   * Completeness score from 0 to 100. Starts at 100 and is reduced by
   * 5 points per TODO found and 10 points per missing required keyword.
   * A score of 0 indicates empty content.
   */
  score: number;
  /**
   * Human-readable descriptions of each detected issue that reduced the
   * score (e.g. "Found 3 TODOs", "Missing keyword: summary").
   */
  issues: string[];
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the completeness-scorer result. */
export type CompletenessScorerOutput = SkillOutput<ScorerResult>;
