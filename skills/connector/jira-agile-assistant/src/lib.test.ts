import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JiraClient } from './jira-client';
import * as fs from 'node:fs';
import { safeReadFile } from '@agent/core/secure-io';

vi.mock('node:fs');
vi.mock('@agent/core/secure-io');
vi.mock('node:https');

describe('jira-agile-assistant lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize client if config exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(safeReadFile).mockReturnValue(
      JSON.stringify({ email: 'a@b.com', api_token: 'tk', host: 'https://h.atlassian.net' })
    );
    
    const client = new JiraClient('/root');
    expect(client).toBeDefined();
  });

  it('should throw if config is missing', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(() => new JiraClient('/root')).toThrow('Jira config not found');
  });
});
