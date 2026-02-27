import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findPlaybook } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('skill-bundle-packager lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return null if playbooks dir missing', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(findPlaybook('test', '.')).toBeNull();
  });
});
