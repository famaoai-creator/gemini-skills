import yaml from 'js-yaml';
import Papa from 'papaparse';

export type DataFormat = 'json' | 'yaml' | 'csv';

export function parseData(content: string, format: string): any {
  if (format === 'json') return JSON.parse(content);
  if (format === 'yaml' || format === 'yml') return yaml.load(content);
  if (format === 'csv') return Papa.parse(content, { header: true, dynamicTyping: true }).data;
  throw new Error(`Unsupported input format: ${format}`);
}

export function stringifyData(data: any, format: DataFormat): string {
  if (format === 'json') return JSON.stringify(data, null, 2);
  if (format === 'yaml') return yaml.dump(data);
  if (format === 'csv') return Papa.unparse(data);
  throw new Error(`Unsupported output format: ${format}`);
}

export function detectFormat(filePath: string): string {
  if (filePath.endsWith('.json')) return 'json';
  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) return 'yaml';
  if (filePath.endsWith('.csv')) return 'csv';
  return 'unknown';
}
