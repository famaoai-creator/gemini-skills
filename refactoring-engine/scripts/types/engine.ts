/**
 * Type definitions for the refactoring-engine skill.
 *
 * The refactoring-engine statically analyzes a source file for common code
 * smells and reports each finding with a line number and severity.
 *
 * Usage:
 *   import type { EngineResult, EngineConfig } from './types/engine.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the refactoring-engine skill. */
export interface EngineConfig {
  /** Path to the source file to analyze. */
  input: string;
  /** Optional output file path for the JSON report. */
  out?: string;
}

// ---------------------------------------------------------------------------
// Smell Classification
// ---------------------------------------------------------------------------

/** Severity category for a detected code smell. */
export type SmellSeverity = 'high' | 'medium' | 'low';

/** Code smell type identifiers produced by the detectors. */
export type SmellType =
  | 'long-function'
  | 'deep-nesting'
  | 'long-line'
  | 'duplicate-code'
  | 'magic-number'
  | 'missing-error-handling'
  | 'console-log';

// ---------------------------------------------------------------------------
// Code Smell
// ---------------------------------------------------------------------------

/** A single code smell detected in the analyzed source file. */
export interface CodeSmell {
  /** Detector category that produced this finding. */
  type: SmellType;
  /** 1-based line number where the smell was detected. */
  line: number;
  /** Human-readable description of the issue. */
  detail: string;
  /** Severity classification for prioritization. */
  severity: SmellSeverity;
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

/** Aggregate counts of detected smells grouped by severity. */
export interface SeveritySummary {
  /** Number of high-severity smells. */
  high: number;
  /** Number of medium-severity smells. */
  medium: number;
  /** Number of low-severity smells. */
  low: number;
}

/** Top-level summary of the refactoring analysis. */
export interface AnalysisSummary {
  /** Total number of code smells detected. */
  total: number;
  /** Counts broken down by severity level. */
  bySeverity: SeveritySummary;
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the refactoring-engine skill. */
export interface EngineResult {
  /** Absolute path to the analyzed source file. */
  file: string;
  /** Detected code smells sorted by line number. */
  smells: CodeSmell[];
  /** Aggregate summary of detected smells. */
  summary: AnalysisSummary;
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the refactoring-engine result. */
export type RefactoringEngineOutput = SkillOutput<EngineResult>;
