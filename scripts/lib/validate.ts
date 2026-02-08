/**
 * TypeScript version of the lightweight JSON Schema validation utility.
 *
 * Validates data against schemas in the schemas/ directory without external dependencies.
 * Supports required fields, type constraints, and enum values.
 *
 * Usage:
 *   import { validateInput, validateOutput } from '../../scripts/lib/validate.js';
 *   const result = validateInput({ skill: 'my-skill', action: 'run' });
 *   if (!result.valid) console.error(result.errors);
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ValidationResult, ValidationError, JsonSchema } from './types.js';

const schemasDir: string = path.resolve(__dirname, '../../schemas');

/** Schema cache to avoid re-reading files from disk. */
const schemaCache: Record<string, JsonSchema> = {};

/**
 * Load a JSON Schema by name from the schemas/ directory.
 *
 * @param schemaName - Schema name without the `.schema.json` extension
 * @returns Parsed JSON Schema object
 * @throws {Error} If the schema file cannot be read or parsed
 */
export function loadSchema(schemaName: string): JsonSchema {
  if (schemaCache[schemaName]) return schemaCache[schemaName];
  const filePath = path.join(schemasDir, `${schemaName}.schema.json`);
  const schema: JsonSchema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  schemaCache[schemaName] = schema;
  return schema;
}

/**
 * Validate data against a named schema.
 *
 * Checks required fields, type constraints, and enum values.
 *
 * @param data       - Data object to validate
 * @param schemaName - Schema name (e.g. 'skill-input', 'skill-output')
 * @returns Validation result with a `valid` flag and an array of errors
 */
export function validate(data: Record<string, unknown>, schemaName: string): ValidationResult {
  const schema = loadSchema(schemaName);
  const errors: ValidationError[] = [];

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (data[field] === undefined || data[field] === null) {
        errors.push({ field, message: `Required field "${field}" is missing` });
      }
    }
  }

  // Check property-level constraints
  if (schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (data[key] !== undefined && data[key] !== null) {
        // Type check (primitive types only; object/array skipped)
        if (
          prop.type &&
          typeof data[key] !== prop.type &&
          prop.type !== 'object' &&
          prop.type !== 'array'
        ) {
          errors.push({
            field: key,
            message: `Expected type "${prop.type}", got "${typeof data[key]}"`,
          });
        }
        // Enum check
        if (prop.enum && !prop.enum.includes(data[key] as string)) {
          errors.push({
            field: key,
            message: `Value "${String(data[key])}" not in allowed values: ${prop.enum.join(', ')}`,
          });
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate data against the `skill-input` schema.
 *
 * @param data - Input data to validate
 * @returns Validation result
 */
export function validateInput(data: Record<string, unknown>): ValidationResult {
  return validate(data, 'skill-input');
}

/**
 * Validate data against the `skill-output` schema.
 *
 * @param data - Output data to validate
 * @returns Validation result
 */
export function validateOutput(data: Record<string, unknown>): ValidationResult {
  return validate(data, 'skill-output');
}
