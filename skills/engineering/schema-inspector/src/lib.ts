import path from 'path';
import { walk } from '@agent/core/fs-utils';

export interface SchemaFile {
  name: string;
  path: string;
}

export interface InspectionResult {
  rootDir: string;
  schemas: SchemaFile[];
  count: number;
}

export function inspectSchemas(rootDir: string): InspectionResult {
  const schemas: SchemaFile[] = [];

  for (const filePath of walk(rootDir)) {
    const name = path.basename(filePath);
    if (name.endsWith('.schema.json') || name.endsWith('prisma.schema') || name.endsWith('.sql')) {
      schemas.push({ name, path: path.relative(rootDir, filePath) });
    }
  }

  return { rootDir, schemas, count: schemas.length };
}
