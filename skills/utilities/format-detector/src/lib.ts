export interface DetectResult {
  format: string;
  confidence: number;
}

export function detectFormat(content: string): DetectResult {
  let format = 'unknown';
  let confidence = 0.0;

  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(content);
      format = 'json';
      confidence = 1.0;
    } catch {
      // not JSON
    }
  }

  if (format === 'unknown') {
    if (content.includes('---') || content.includes(': ')) {
      format = 'yaml';
      confidence = 0.7;
    } else if (content.includes(',')) {
      const lines = content.split(/\r?\n/);
      if (lines.length > 0 && lines[0].split(',').length > 1) {
        format = 'csv';
        confidence = 0.6;
      }
    }
  }

  return { format, confidence };
}
