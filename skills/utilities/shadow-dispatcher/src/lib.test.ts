import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShadowTasks } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('shadow-dispatcher lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create shadow tasks in inbox', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const { idA, idB } = createShadowTasks('test intent', 'A', 'B', '/inbox');
    expect(idA).toContain('SHADOW-A');
    expect(idB).toContain('SHADOW-B');
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
  });
});
