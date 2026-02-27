import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBacklogApiKey } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('backlog-connector lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should extract API key from markdown', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('API_KEY: abc123');
    const apiKey = getBacklogApiKey('path.md', 'API_KEY: ([a-z0-9]+)');
    expect(apiKey).toBe('abc123');
  });
});
