import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditSkillQuality } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('skill-quality-auditor lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should check for SKILL.md and package.json', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const result = auditSkillQuality('/path/to/skill');
    expect(result.checks.every((c: any) => c.passed)).toBe(true);
    expect(result.score).toBe(2);
  });
});
