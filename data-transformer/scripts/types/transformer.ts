/**
 * Type definitions for the data-transformer skill.
 *
 * The data-transformer reads a file in one structured format (JSON, YAML, or
 * CSV), converts it to a target format, and optionally writes the result to an
 * output file. When no output path is provided the converted content is
 * returned inline.
 *
 * Usage:
 *   import type { TransformerResult, TransformerConfig } from './types/transformer.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the data-transformer skill. */
export interface TransformerConfig {
  /** Path to the input file to convert (.json, .yaml/.yml, or .csv). */
  input: string;
  /** Target output format. */
  to: OutputFormat;
  /** Optional path to write the converted output. */
  out?: string;
}

// ---------------------------------------------------------------------------
// Format Types
// ---------------------------------------------------------------------------

/** Supported data formats for both input detection and output conversion. */
export type DataFormat = 'json' | 'yaml' | 'csv';

/** Alias constraining the --to flag to the set of supported output formats. */
export type OutputFormat = DataFormat;

// ---------------------------------------------------------------------------
// Skill Result — File Output
// ---------------------------------------------------------------------------

/** Result returned when the converted content is written to a file. */
export interface TransformerFileResult {
  /** Absolute or relative path to the written output file. */
  output: string;
  /** Format the data was converted to. */
  format: OutputFormat;
  /** Size in characters of the converted output. */
  size: number;
}

// ---------------------------------------------------------------------------
// Skill Result — Inline Output
// ---------------------------------------------------------------------------

/** Result returned when no --out path is given (content returned inline). */
export interface TransformerInlineResult {
  /** Format the data was converted to. */
  format: OutputFormat;
  /** The converted content as a string. */
  content: string;
}

// ---------------------------------------------------------------------------
// Skill Result Union
// ---------------------------------------------------------------------------

/** Full result data returned by the data-transformer skill. */
export type TransformerResult = TransformerFileResult | TransformerInlineResult;

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the data-transformer result. */
export type DataTransformerOutput = SkillOutput<TransformerResult>;
