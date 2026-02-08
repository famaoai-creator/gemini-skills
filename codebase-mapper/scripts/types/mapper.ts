/**
 * Type definitions for the codebase-mapper skill.
 *
 * The codebase-mapper recursively walks a directory up to a configurable
 * depth, ignoring common non-source directories (node_modules, .git, etc.),
 * and produces a tree-style text representation of the file structure along
 * with summary metadata.
 *
 * Usage:
 *   import type { MapperResult, MapperConfig } from './types/mapper.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI positional arguments accepted by the codebase-mapper skill. */
export interface MapperConfig {
  /** Root directory to map (default: current working directory). */
  rootDir?: string;
  /** Maximum directory depth to recurse into (default: 3). */
  maxDepth?: number;
}

// ---------------------------------------------------------------------------
// Ignore Patterns
// ---------------------------------------------------------------------------

/**
 * Directory and file name patterns that are excluded from the tree walk.
 * Represented as an array of literal name strings.
 */
export type IgnorePatterns = string[];

// ---------------------------------------------------------------------------
// Tree Entry
// ---------------------------------------------------------------------------

/** A single entry (line) in the generated directory tree output. */
export interface TreeEntry {
  /** Display string including tree-drawing characters and the file/dir name. */
  line: string;
  /** Nesting depth of this entry relative to the root. */
  depth: number;
  /** Whether this entry represents a directory (true) or a file (false). */
  isDirectory: boolean;
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the codebase-mapper skill. */
export interface MapperResult {
  /** Absolute path to the root directory that was mapped. */
  root: string;
  /** Maximum depth used for the tree walk. */
  maxDepth: number;
  /** Array of tree-formatted lines representing the directory structure. */
  tree: string[];
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the codebase-mapper result. */
export type CodebaseMapperOutput = SkillOutput<MapperResult>;
