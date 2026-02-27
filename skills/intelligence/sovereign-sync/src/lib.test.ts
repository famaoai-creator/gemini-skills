import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncTier } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('sovereign-sync lib', () => {
  it('should throw if tier dir not found', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(() => syncTier('personal', 'repo', '/base')).toThrow('Tier directory not found');
  });

  it('should return simulated success', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const result = syncTier('public', 'repo', '/base');
    expect(result.status).toBe('simulated_success');
    expect(result.tier).toBe('public');
  });
});
