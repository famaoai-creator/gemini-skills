import { describe, it, expect } from 'vitest';
import { analyzeLogs, getDetailedPatterns } from './lib';

describe('log-to-requirement-bridge lib', () => {
  it('should detect patterns and generate REQs', () => {
    const lines = [
      '2024-01-15 ERROR: Connection timeout on port 5432',
      '2024-01-15 WARN: Retry limit exceeded',
      '2024-01-16 ERROR: Connection timeout on port 5432',
    ];
    const reqs = analyzeLogs(lines);
    expect(reqs).toContain('REQ: Implement retry logic with exponential backoff.');
  });

  it('should detect detailed patterns with counts', () => {
    const lines = [
      'ERROR: timeout',
      'ERROR: timeout',
      'CRITICAL: OOM error',
    ];
    const patterns = getDetailedPatterns(lines);
    const timeout = patterns.find(p => p.pattern === 'timeout');
    const memory = patterns.find(p => p.pattern === 'memory');
    
    expect(timeout!.count).toBe(2);
    expect(memory!.count).toBe(1);
  });

  it('should handle clean logs with no recommendations', () => {
    const lines = ['INFO: app started', 'DEBUG: mode active'];
    const reqs = analyzeLogs(lines);
    expect(reqs).toHaveLength(0);
  });
});
