import { describe, it, expect } from 'vitest';
import { generateRunbook } from './lib';

describe('operational-runbook-generator lib', () => {
  it('should generate a runbook markdown', () => {
    const incident = {
      name: 'DB Connection Failure',
      steps: [
        'Check network connectivity',
        'Verify RDS status',
        'Restart application pods'
      ]
    };
    const rb = generateRunbook(incident);
    expect(rb).toContain('# Operational Runbook: DB Connection Failure');
    expect(rb).toContain('1. Check network connectivity');
    expect(rb).toContain('3. Restart application pods');
  });
});
