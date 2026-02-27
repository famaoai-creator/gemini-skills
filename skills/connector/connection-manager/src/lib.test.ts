import { describe, it, expect, vi, beforeEach } from 'vitest';
import { diagnoseConnection } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('connection-manager lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should diagnose system readiness', () => {
    const inventory = { systems: { jira: { credential_ref: 'secrets/jira.md' } } };
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const result = diagnoseConnection('jira', inventory, '/root');
    expect(result.system).toBe('jira');
    expect(result.ready).toBe(true);
  });
});
