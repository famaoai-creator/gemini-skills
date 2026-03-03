import { describe, it, expect, vi, beforeEach } from 'vitest';
import { diagnoseConnection } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('connection-manager lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockInventory = {
    systems: {
      jira: { credential_ref: 'knowledge/personal/connections/jira.json' },
      slack: { credential_ref: 'knowledge/personal/connections/slack.json' }
    }
  };

  it('should diagnose system readiness when credentials exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const result = diagnoseConnection('jira', mockInventory, '/root');
    expect(result.system).toBe('jira');
    expect(result.ready).toBe(true);
    expect(result.credential_status).toBe('found');
  });

  it('should report not ready when credentials are missing', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = diagnoseConnection('slack', mockInventory, '/root');
    expect(result.system).toBe('slack');
    expect(result.ready).toBe(false);
    expect(result.credential_status).toBe('missing');
  });

  it('should throw for undefined system', () => {
    expect(() => diagnoseConnection('nonexistent', mockInventory, '/root')).toThrow('System nonexistent not defined');
  });
});
