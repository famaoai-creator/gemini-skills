/**
 * Type definitions for the prompt-optimizer skill.
 *
 * The prompt-optimizer analyzes a SKILL.md file and scores it against a set
 * of quality checks (frontmatter fields, required sections, clarity
 * indicators, actionable language, vague word avoidance, etc.). It produces
 * a numeric score, individual check results, and improvement suggestions.
 *
 * Usage:
 *   import type { OptimizeResult, OptimizeConfig } from './types/optimizer.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the prompt-optimizer skill. */
export interface OptimizeConfig {
  /** Path to the SKILL.md file to analyze. */
  input: string;
  /** Optional output file path for the JSON report. */
  out?: string;
}

// ---------------------------------------------------------------------------
// Check Results
// ---------------------------------------------------------------------------

/**
 * Name identifiers for individual quality checks.
 *
 * Each value corresponds to a specific validation performed against the
 * SKILL.md content.
 */
export type CheckName =
  | 'frontmatter-name'
  | 'frontmatter-description'
  | 'description-length'
  | 'section-usage'
  | 'section-troubleshooting'
  | 'section-options'
  | 'clarity-indicators'
  | 'actionable-language'
  | 'no-vague-words'
  | 'knowledge-protocol'
  | 'has-examples'
  | 'sufficient-content';

/** Result of a single quality check. */
export interface CheckResult {
  /** Identifier of the check that was performed. */
  name: CheckName;
  /** Whether the check passed. */
  passed: boolean;
  /** Human-readable detail about the check outcome. */
  detail: string;
}

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

/** Parsed YAML frontmatter fields from a SKILL.md file. */
export interface SkillFrontmatter {
  /** Skill name declared in frontmatter. */
  name?: string;
  /** Short description declared in frontmatter. */
  description?: string;
  /** Any additional key-value pairs from the frontmatter block. */
  [key: string]: string | undefined;
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

/** Full result data returned by the prompt-optimizer skill. */
export interface OptimizeResult {
  /** Absolute path to the analyzed SKILL.md file. */
  file: string;
  /** Number of checks that passed. */
  score: number;
  /** Total number of checks performed. */
  maxScore: number;
  /** Score as a percentage (0-100). */
  percentage: number;
  /** Individual check results in evaluation order. */
  checks: CheckResult[];
  /** Actionable improvement suggestions for checks that failed. */
  suggestions: string[];
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the prompt-optimizer result. */
export type PromptOptimizerOutput = SkillOutput<OptimizeResult>;
