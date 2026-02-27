export interface DataSource {
  file: string;
  type: string;
  flow: 'input' | 'output' | 'bidirectional';
}

export function scanForDataFlows(content: string, fileName: string): DataSource[] {
  const sources: DataSource[] = [];
  if (/(?:readFile|fs\.read|open\()/i.test(content))
    sources.push({ file: fileName, type: 'file_read', flow: 'input' });
  if (/(?:writeFile|fs\.write)/i.test(content))
    sources.push({ file: fileName, type: 'file_write', flow: 'output' });
  if (/(?:SELECT|INSERT|UPDATE|DELETE)/i.test(content))
    sources.push({ file: fileName, type: 'database', flow: 'bidirectional' });
  return sources;
}
