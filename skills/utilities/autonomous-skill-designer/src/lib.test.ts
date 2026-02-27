import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSkillStructure } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('autonomous-skill-designer lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create directory structure', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const path = createSkillStructure('new-skill', 'desc', '/root');
    expect(path).toContain('new-skill');
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
