/**
 * Type definitions for the security-scanner skill.
 *
 * The security-scanner walks a project directory, skips ignored directories
 * and binary file extensions, and reports the scan configuration together
 * with the overall scan status. Individual file results indicate whether
 * each file was scanned or skipped.
 *
 * Usage:
 *   import type { ScannerResult, ScannerConfig } from './types/scanner.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Runtime configuration used by the security-scanner skill. */
export interface ScannerConfig {
  /** Absolute path to the project root being scanned. */
  projectRoot: string;
}

// ---------------------------------------------------------------------------
// Severity & Finding Types
// ---------------------------------------------------------------------------

/** Severity level assigned to a security finding. */
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/** A single security finding detected during a file scan. */
export interface ScanFinding {
  /** Relative file path where the finding was detected. */
  file: string;
  /** Severity level of the finding. */
  severity: FindingSeverity;
  /** Short description of the detected issue. */
  message: string;
  /** Line number in the file, if applicable. */
  line?: number;
}

// ---------------------------------------------------------------------------
// Per-File Scan Result
// ---------------------------------------------------------------------------

/** Result of scanning a single file. */
export interface FileScanResult {
  /** Relative path to the scanned file. */
  file: string;
  /** Whether the file was successfully scanned. */
  scanned: boolean;
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the security-scanner skill. */
export interface ScannerResult {
  /** Absolute path to the scanned project root. */
  projectRoot: string;
  /** Directory names excluded from the scan. */
  ignoreDirs: string[];
  /** File extensions excluded from the scan. */
  ignoreExtensions: string[];
  /** Overall scan completion status. */
  status: string;
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the security-scanner result. */
export type SecurityScannerOutput = SkillOutput<ScannerResult>;
