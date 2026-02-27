import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectPrerequisites } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('onboarding-wizard lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should detect node.js if package.json exists', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => p.toString().endsWith('package.json'));
    const result = detectPrerequisites('.');
    expect(result).toContain('Node.js');
  });
});
