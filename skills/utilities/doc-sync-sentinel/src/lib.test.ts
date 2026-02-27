import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecentChanges } from './lib';
import { execSync } from 'node:child_process';

vi.mock('node:child_process');

describe('doc-sync-sentinel lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return changed files from git', () => {
    const nl = String.fromCharCode(10);
    vi.mocked(execSync).mockReturnValue('file1.ts' + nl + 'file2.md');
    const result = getRecentChanges('.', '1 day ago');
    expect(result).toContain('file1.ts');
    expect(result).toContain('file2.md');
  });
});
