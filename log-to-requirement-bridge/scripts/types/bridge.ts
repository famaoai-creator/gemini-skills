/**
 * Type definitions for the log-to-requirement-bridge skill.
 *
 * The log-to-requirement-bridge parses log files, classifies each line by
 * severity, detects recurring error categories, and generates actionable
 * improvement requirements from the discovered patterns.
 *
 * Usage:
 *   import type { BridgeResult, BridgeConfig } from './types/bridge.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the log-to-requirement-bridge skill. */
export interface BridgeConfig {
  /** Path to the log file to analyze. */
  input: string;
}

// ---------------------------------------------------------------------------
// Severity & Category
// ---------------------------------------------------------------------------

/** Log line severity levels detected by the classifier. */
export type LogSeverity = 'error' | 'warning' | 'info' | 'debug' | 'unknown';

/** Error category identifiers matched by pattern rules. */
export type ErrorCategory =
  | 'timeout'
  | 'connection-failure'
  | 'memory'
  | 'null-reference'
  | 'auth-permission'
  | 'not-found'
  | 'disk-space'
  | 'rate-limit'
  | 'deadlock'
  | 'parse-error'
  | 'ssl-tls'
  | 'database';

// ---------------------------------------------------------------------------
// Detected Pattern
// ---------------------------------------------------------------------------

/** A recurring error pattern discovered in the log file. */
export interface LogPattern {
  /** Category identifier for this error pattern. */
  pattern: ErrorCategory;
  /** Number of times this pattern was detected. */
  count: number;
  /** Highest severity level observed for this pattern. */
  severity: LogSeverity;
  /** Human-readable description of the error category. */
  description: string;
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the log-to-requirement-bridge skill. */
export interface BridgeResult {
  /** File name of the analyzed log file. */
  source: string;
  /** Total number of non-empty lines processed. */
  totalLines: number;
  /** Count of lines classified as error/fatal/critical. */
  errorCount: number;
  /** Count of lines classified as warning. */
  warningCount: number;
  /** Count of lines classified as info. */
  infoCount: number;
  /** Count of lines classified as debug/trace. */
  debugCount: number;
  /** Recurring error patterns sorted by frequency (descending). */
  patterns: LogPattern[];
  /** Generated improvement requirements derived from detected patterns. */
  suggestedRequirements: string[];
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the log-to-requirement-bridge result. */
export type LogToRequirementBridgeOutput = SkillOutput<BridgeResult>;
