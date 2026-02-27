import Ajv, { ErrorObject } from 'ajv';

const ajv = new Ajv({ allErrors: true });

export interface ValidationResult {
  valid: boolean;
  message: string;
  errors?: ErrorObject[] | null;
  schema?: string;
}

export function validateData(data: any, schema: any, schemaPath?: string): ValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    return { valid: true, message: 'Validation successful', schema: schemaPath };
  } else {
    return { valid: false, message: 'Validation failed', errors: validate.errors };
  }
}
