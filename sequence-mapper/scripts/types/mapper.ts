/**
 * Type definitions for the sequence-mapper skill.
 *
 * The sequence-mapper parses a source file, traces function definitions and
 * call sites, and generates a Mermaid sequence diagram that visualises the
 * execution flow between callers and callees.
 *
 * Usage:
 *   import type { MapperResult, MapperConfig } from './types/mapper.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the sequence-mapper skill. */
export interface MapperConfig {
  /** Path to the source file to analyze. */
  input: string;
  /** Optional output file path for the generated diagram. */
  out?: string;
}

// ---------------------------------------------------------------------------
// Call Chain
// ---------------------------------------------------------------------------

/** A single call relationship between a caller and a callee. */
export interface CallEdge {
  /** Name of the calling function or module. */
  from: string;
  /** Name of the called function. */
  to: string;
  /** Label displayed on the sequence arrow (e.g. "target()"). */
  label: string;
}

/** A function definition discovered in the source file. */
export interface FunctionNode {
  /** Name of the function. */
  name: string;
  /** 1-based line number where the function is defined. */
  line: number;
}

// ---------------------------------------------------------------------------
// Diagram Data
// ---------------------------------------------------------------------------

/** Structured representation of the generated sequence diagram. */
export interface DiagramData {
  /** Mermaid diagram source text. */
  content: string;
  /** Ordered list of call edges extracted from the source. */
  edges: CallEdge[];
  /** Function definitions discovered during parsing. */
  functions: FunctionNode[];
}

// ---------------------------------------------------------------------------
// Skill Result (file output mode)
// ---------------------------------------------------------------------------

/** Result returned when --out is specified (diagram written to disk). */
export interface MapperFileResult {
  /** Path where the diagram file was written. */
  output: string;
  /** Size of the generated diagram content in bytes. */
  size: number;
}

// ---------------------------------------------------------------------------
// Skill Result (inline mode)
// ---------------------------------------------------------------------------

/** Result returned when no --out flag is provided (diagram inline). */
export interface MapperInlineResult {
  /** Mermaid sequence diagram source text. */
  content: string;
}

// ---------------------------------------------------------------------------
// Unified Result
// ---------------------------------------------------------------------------

/** Full result data returned by the sequence-mapper skill. */
export type MapperResult = MapperFileResult | MapperInlineResult;

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the sequence-mapper result. */
export type SequenceMapperOutput = SkillOutput<MapperResult>;
