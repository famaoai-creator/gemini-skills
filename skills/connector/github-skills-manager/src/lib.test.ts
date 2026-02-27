import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGitStatus } from './lib';
import * as fs from 'node:fs';
import { execSync } from 'node:child_process';

vi.mock('node:fs');
vi.mock('node:child_process');

describe('github-skills-manager lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return null if not a git repo', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(getGitStatus('.')).toBeNull();
  });

  it('should return status if git repo', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(execSync).mockReturnValue(Buffer.from('main'));
    const status = getGitStatus('.');
    expect(status).not.toBeNull();
    expect(status?.branch).toBe('main');
  });
});
