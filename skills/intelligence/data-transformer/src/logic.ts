/**
 * Data Transformer Logic v2
 * Zero-dependency robust implementation for JSON/YAML/CSV.
 */

export type DataFormat = 'json' | 'yaml' | 'csv' | 'unknown';

export function parseData(content: string, format: string): any {
  if (format === 'json') return JSON.parse(content);
  
  if (format === 'yaml' || format === 'yml') {
    const result: any = {};
    const lines = content.split('\n');
    let currentKey: string | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (trimmed.startsWith('- ')) {
        if (currentKey && Array.isArray(result[currentKey])) {
          result[currentKey].push(trimmed.slice(2).trim());
        }
        continue;
      }

      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        currentKey = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        if (value === '' || value === '[]' || value === '{}') {
          result[currentKey] = [];
        } else {
          if (value === 'true') result[currentKey] = true;
          else if (value === 'false') result[currentKey] = false;
          else if (!isNaN(Number(value)) && value !== '') result[currentKey] = Number(value);
          else result[currentKey] = value.replace(/^['"]|['"]$/g, '');
        }
      }
    }
    return result;
  }

  if (format === 'csv') {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((h, i) => {
        const val = values[i] ? values[i].trim() : '';
        if (!isNaN(Number(val)) && val !== '') obj[h] = Number(val);
        else obj[h] = val;
      });
      return obj;
    });
  }

  throw new Error(`Unsupported or unknown format: ${format}`);
}

export function stringifyData(data: any, format: DataFormat): string {
  if (format === 'json') return JSON.stringify(data, null, 2);
  if (format === 'yaml') {
    let yaml = '';
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        yaml += `${key}:\n`;
        value.forEach(item => { yaml += `  - ${item}\n`; });
      } else {
        yaml += `${key}: ${value}\n`;
      }
    }
    return yaml.trim();
  }
  if (format === 'csv') {
    const rows = Array.isArray(data) ? data : [data];
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => { csv += headers.map(h => row[h]).join(',') + '\n'; });
    return csv.trim();
  }
  return '';
}

export function detectFormat(filePath: string): DataFormat {
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (ext === 'yaml' || ext === 'yml') return 'yaml';
  if (ext === 'csv') return 'csv';
  if (ext === 'json') return 'json';
  return 'unknown';
}
