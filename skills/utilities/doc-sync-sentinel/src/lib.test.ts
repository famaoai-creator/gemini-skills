import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkSync } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('doc-sync-sentinel lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should report synced if target is newer than source', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockImplementation((p: any) => {
      if (p === 'src.md') return { mtime: new Date(1000) } as any;
      if (p === 'dest.md') return { mtime: new Date(2000) } as any;
      return {} as any;
    });

    const status = checkSync('src.md', 'dest.md');
    expect(status.synced).toBe(true);
  });

  it('should report out of sync if source is newer', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockImplementation((p: any) => {
      if (p === 'src.md') return { mtime: new Date(3000) } as any;
      if (p === 'dest.md') return { mtime: new Date(2000) } as any;
      return {} as any;
    });

    const status = checkSync('src.md', 'dest.md');
    expect(status.synced).toBe(false);
  });
});
