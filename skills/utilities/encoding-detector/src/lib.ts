import * as jschardet from 'jschardet';

/**
 * Encoding Detector Core Library.
 */

export interface EncodingResult {
  encoding: string;
  confidence: number;
  lineEnding: 'LF' | 'CRLF' | 'CR' | 'unknown';
}

export function detectEncoding(buffer: Buffer): EncodingResult {
  const result = jschardet.detect(buffer);
  const content = buffer.toString('binary'); // Use binary to avoid messing up line ending detection

  let lineEnding: 'LF' | 'CRLF' | 'CR' | 'unknown' = 'unknown';
  if (content.includes('\r\n')) {
    lineEnding = 'CRLF';
  } else if (content.includes('\n')) {
    lineEnding = 'LF';
  } else if (content.includes('\r')) {
    lineEnding = 'CR';
  }

  return {
    encoding: result.encoding || 'UTF-8',
    confidence: result.confidence || 0,
    lineEnding,
  };
}
