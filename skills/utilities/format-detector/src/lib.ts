/**
 * Format Detector Core Library.
 * Detects text format (JSON, YAML, CSV) based on structural heuristics.
 */

export interface FormatResult {
  format: 'json' | 'yaml' | 'csv' | 'unknown';
  confidence: number;
}

export function detectFormat(content: string): FormatResult {
  const trimmed = content.trim();
  if (!trimmed) {
    return { format: 'unknown', confidence: 0 };
  }

  // 1. JSON Detection
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return { format: 'json', confidence: 1.0 };
    } catch (_) {
      // Fallback for malformed JSON that still looks like JSON
      return { format: 'json', confidence: 0.5 };
    }
  }

  // 2. CSV Detection (Look for header row with commas)
  const lines = trimmed.split('\n');
  if (lines.length > 0 && lines[0].includes(',') && lines[0].split(',').length > 1) {
    return { format: 'csv', confidence: 0.8 };
  }

  // 3. YAML Detection (Look for key-value pairs or document start)
  if (trimmed.includes(': ') || trimmed.startsWith('---')) {
    return { format: 'yaml', confidence: 0.7 };
  }

  return { format: 'unknown', confidence: 0 };
}
