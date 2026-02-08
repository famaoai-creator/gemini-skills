/**
 * Type definitions for the html-reporter skill.
 *
 * The html-reporter reads a Markdown input file, converts it to styled HTML
 * using the marked library, wraps it in a full HTML document with a responsive
 * CSS layout, and writes the result to an output file. It returns metadata
 * about the generated report.
 *
 * Usage:
 *   import type { ReporterResult, ReporterConfig } from './types/reporter.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the html-reporter skill. */
export interface ReporterConfig {
  /** Path to the Markdown input file to convert. */
  input: string;
  /** Title used in the HTML <title> element (default: "Report"). */
  title?: string;
  /** Path to the output HTML file to write. */
  out: string;
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the html-reporter skill. */
export interface ReporterResult {
  /** Absolute or relative path to the generated HTML file. */
  output: string;
  /** Title embedded in the HTML document. */
  title: string;
  /** Size in characters of the generated HTML content. */
  size: number;
}

// ---------------------------------------------------------------------------
// Report Sections (structural helpers)
// ---------------------------------------------------------------------------

/**
 * Describes the CSS theme applied to the generated HTML document.
 * Currently the skill uses a single built-in theme; this type is provided
 * for future extensibility.
 */
export interface ReportTheme {
  /** Maximum content width in CSS units (e.g. "800px"). */
  maxWidth: string;
  /** Font family stack applied to the body. */
  fontFamily: string;
  /** Line-height multiplier for body text. */
  lineHeight: number;
}

/** Metadata about the Markdown source that was converted. */
export interface MarkdownSource {
  /** Path to the original Markdown file. */
  path: string;
  /** Raw character count of the Markdown content. */
  charCount: number;
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the html-reporter result. */
export type HtmlReporterOutput = SkillOutput<ReporterResult>;
