import { describe, it, expect } from 'vitest';
import { analyzeLogs } from './lib';

describe('log-to-requirement-bridge lib', () => {
  it('should detect patterns and generate REQs', () => {
    const lines = ['ERROR: Connection timeout', 'CRITICAL: OOM error'];
    const reqs = analyzeLogs(lines);
    expect(reqs).toContain('REQ: Implement retry logic with exponential backoff.');
    expect(reqs).toContain('REQ: Conduct memory profiling and add safeguards.');
  });
});
