/**
 * Type definitions for the schema-validator skill.
 *
 * The schema-validator loads a JSON data file and a JSON Schema file, then
 * validates the data against the schema using Ajv. It returns a boolean
 * validity flag and, when validation fails, the array of Ajv error objects
 * describing each violation.
 *
 * Usage:
 *   import type { ValidatorResult, ValidatorConfig } from './types/validator.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the schema-validator skill. */
export interface ValidatorConfig {
  /** Path to the JSON data file to validate. */
  input: string;
  /** Path to the JSON Schema file to validate against. */
  schema: string;
}

// ---------------------------------------------------------------------------
// Validation Error Detail
// ---------------------------------------------------------------------------

/** A single validation error reported by the Ajv schema validator. */
export interface SchemaError {
  /** JSON Pointer to the failing property (e.g. "/name"). */
  instancePath: string;
  /** Keyword of the JSON Schema rule that failed (e.g. "required", "type"). */
  keyword: string;
  /** Human-readable description of the validation failure. */
  message?: string;
  /** Schema path indicating which schema rule triggered the error. */
  schemaPath: string;
  /** Additional parameters specific to the failing keyword. */
  params: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Result returned when the data passes validation. */
export interface ValidatorPassResult {
  /** Indicates the data is valid against the schema. */
  valid: true;
}

/** Result returned when the data fails validation. */
export interface ValidatorFailResult {
  /** Indicates the data is not valid against the schema. */
  valid: false;
  /** Array of Ajv error objects describing each violation. */
  errors: SchemaError[];
}

/** Full result data returned by the schema-validator skill. */
export type ValidatorResult = ValidatorPassResult | ValidatorFailResult;

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the schema-validator result. */
export type SchemaValidatorOutput = SkillOutput<ValidatorResult>;
