/**
 * Type definitions for the bug-predictor skill.
 *
 * The bug-predictor identifies high-risk source files in a Git repository
 * by combining churn frequency with cyclomatic-complexity heuristics.
 *
 * Usage:
 *   import type { PredictorResult, PredictorConfig } from './types/predictor.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the bug-predictor skill. */
export interface PredictorConfig {
  /** Repository directory path (default: "."). */
  dir?: string;
  /** Max hotspot entries (default: 10). */
  top?: number;
  /** Git log time range (default: "3 months ago"). */
  since?: string;
  /** Optional JSON report output path. */
  out?: string;
}

// ---------------------------------------------------------------------------
// Hotspot Entry
// ---------------------------------------------------------------------------

/** A source file identified as a potential bug hotspot. */
export interface HotspotEntry {
  /** Relative file path within the repository. */
  file: string;
  /** Commits touching this file in the period. */
  churn: number;
  /** Total lines in the file. */
  lines: number;
  /** Cyclomatic complexity estimate. */
  complexity: number;
  /** Composite risk score (0-100). */
  riskScore: number;
}

// ---------------------------------------------------------------------------
// Risk Summary
// ---------------------------------------------------------------------------

/** Aggregated file count per risk tier. */
export interface RiskSummary {
  high: number;
  medium: number;
  low: number;
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the bug-predictor skill. */
export interface PredictorResult {
  /** Absolute path to the analyzed repository. */
  repository: string;
  /** Time range used for the Git log query. */
  since: string;
  /** Total files found in Git log output. */
  totalFilesAnalyzed: number;
  /** Ranked list of highest-risk source files. */
  hotspots: HotspotEntry[];
  /** Aggregate risk-tier breakdown. */
  riskSummary: RiskSummary;
  /** Human-readable recommendation. */
  recommendation: string;
}

/** Standard skill-wrapper envelope typed for the bug-predictor result. */
export type BugPredictorOutput = SkillOutput<PredictorResult>;
