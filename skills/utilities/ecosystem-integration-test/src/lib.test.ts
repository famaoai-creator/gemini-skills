import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkSkillMd } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('ecosystem-integration-test lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should find issues in SKILL.md', () => {
    const nl = String.fromCharCode(10);
    vi.mocked(fs.readFileSync).mockReturnValue('name: test' + nl + 'status: active');
    const issues = checkSkillMd('SKILL.md');
    expect(issues).toHaveLength(0);
  });
});
