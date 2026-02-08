/**
 * Type definitions for the operational-runbook-generator skill.
 *
 * The operational-runbook-generator creates structured Markdown runbooks from
 * built-in templates for common operational procedures such as deployments,
 * rollbacks, incident response, and scaling.
 *
 * Usage:
 *   import type { RunbookResult, RunbookConfig } from './types/generator.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Supported runbook template types. */
export type RunbookType = 'deploy' | 'rollback' | 'incident' | 'scaling';

/** CLI arguments accepted by the operational-runbook-generator skill. */
export interface RunbookConfig {
  /** Name of the service the runbook is generated for. */
  service: string;
  /** Type of runbook to generate (defaults to "deploy"). */
  type?: RunbookType;
  /** Optional output file path for the generated Markdown. */
  out?: string;
}

// ---------------------------------------------------------------------------
// Template Shape
// ---------------------------------------------------------------------------

/** Structure of a single runbook template. */
export interface RunbookTemplate {
  /** Function that returns an overview paragraph for the given service name. */
  overview: (service: string) => string;
  /** Prerequisite checklist items. */
  prerequisites: string[];
  /** Ordered procedure steps. */
  steps: string[];
  /** Rollback instructions. */
  rollback: string[];
  /** Monitoring guidance items. */
  monitoring: string[];
  /** Contact information entries. */
  contacts: string[];
}

/** Map of runbook type to its corresponding template. */
export type RunbookTemplateMap = Record<RunbookType, RunbookTemplate>;

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

/** Full result data returned by the operational-runbook-generator skill. */
export interface RunbookResult {
  /** Name of the service the runbook was generated for. */
  service: string;
  /** Runbook type that was generated. */
  type: RunbookType;
  /** List of section headings included in the generated runbook. */
  sections: string[];
  /** Complete generated Markdown content. */
  markdown: string;
  /** Path where the Markdown file was written (present when --out is used). */
  outputPath?: string;
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the runbook-generator result. */
export type RunbookGeneratorOutput = SkillOutput<RunbookResult>;
