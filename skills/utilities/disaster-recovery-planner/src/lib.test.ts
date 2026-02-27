import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectInfrastructure } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('disaster-recovery-planner lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should detect containerization', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => p.toString().endsWith('Dockerfile'));
    const result = detectInfrastructure('.');
    expect(result.containerized).toBe(true);
  });
});
