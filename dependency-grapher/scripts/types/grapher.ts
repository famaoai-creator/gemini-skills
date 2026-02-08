/**
 * Type definitions for the dependency-grapher skill.
 *
 * The dependency-grapher reads a project package.json and generates a
 * Mermaid-format directed graph of its production dependencies. The output
 * can be written to a file or returned as inline content.
 *
 * Usage:
 *   import type { GrapherResult, GrapherConfig } from './types/grapher.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the dependency-grapher skill. */
export interface GrapherConfig {
  /** Path to the directory containing package.json. */
  dir: string;
  /** Optional path to write the Mermaid graph output file. */
  out?: string;
}

// ---------------------------------------------------------------------------
// Skill Result Variants
// ---------------------------------------------------------------------------

/**
 * Result shape when --out is provided: the Mermaid graph is written to
 * disk and the output path is returned instead of inline content.
 */
export interface GrapherFileResult {
  /** Absolute path to the generated Mermaid output file. */
  output: string;
  /** Total number of nodes in the dependency graph (root + dependencies). */
  nodeCount: number;
}

/**
 * Result shape when --out is omitted: the Mermaid graph is returned
 * as an inline string in the content field.
 */
export interface GrapherInlineResult {
  /** Mermaid-format graph definition string. */
  content: string;
  /** Total number of nodes in the dependency graph (root + dependencies). */
  nodeCount: number;
}

/**
 * Union of possible result shapes. The actual variant depends on whether
 * the --out CLI flag was supplied.
 */
export type GrapherResult = GrapherFileResult | GrapherInlineResult;

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the dependency-grapher result. */
export type DependencyGrapherOutput = SkillOutput<GrapherResult>;
