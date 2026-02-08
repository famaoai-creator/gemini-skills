/**
 * Type definitions for the dataset-curator skill.
 *
 * The dataset-curator reads a data file (JSON, CSV, or plain text),
 * detects encoding issues, removes duplicates and empty entries,
 * and produces a quality report with cleanup statistics.
 *
 * Usage:
 *   import type { CurateResult, CurateConfig } from './types/curator.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Supported input data formats. */
export type DataFormat = 'json' | 'csv' | 'text';

/** CLI arguments accepted by the dataset-curator skill. */
export interface CurateConfig {
  /** Path to the input data file (JSON, CSV, or text). */
  input: string;
  /** Optional output file path for the cleaned data. */
  out?: string;
  /** Explicit data format override; auto-detected from extension if omitted. */
  format?: DataFormat;
}

// ---------------------------------------------------------------------------
// Quality Report
// ---------------------------------------------------------------------------

/** Quality metrics produced during the curation process. */
export interface QualityReport {
  /** Count of null, undefined, or empty field values detected. */
  nulls: number;
  /** Number of duplicate records/lines removed. */
  duplicates: number;
  /** Human-readable issue descriptions (duplicates, encoding problems, etc.). */
  issues: string[];
}

// ---------------------------------------------------------------------------
// Internal Curate Result (per-format)
// ---------------------------------------------------------------------------

/**
 * Internal result produced by each format-specific curation function
 * (curateJson, curateCsv, curateText).
 */
export interface FormatCurateResult {
  /** Cleaned records (objects for JSON, strings for CSV/text). */
  records: unknown[];
  /** Number of records before cleaning. */
  originalCount: number;
  /** Number of records after cleaning. */
  cleanedCount: number;
  /** Number of records removed during cleaning. */
  removed: number;
  /** Column/field names detected (empty array for plain text). */
  columns: string[];
  /** Quality metrics from the cleaning process. */
  qualityReport: QualityReport;
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the dataset-curator skill. */
export interface CurateResult {
  /** Absolute path to the input file that was curated. */
  inputFile: string;
  /** Detected or specified data format. */
  format: DataFormat;
  /** Number of records in the original file. */
  originalRecords: number;
  /** Number of records after cleaning. */
  cleanedRecords: number;
  /** Number of records removed. */
  removed: number;
  /** Quality metrics from the cleaning process. */
  qualityReport: QualityReport;
  /** Path where the cleaned data was written (present when --out is used). */
  outputPath?: string;
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the dataset-curator result. */
export type DatasetCuratorOutput = SkillOutput<CurateResult>;
