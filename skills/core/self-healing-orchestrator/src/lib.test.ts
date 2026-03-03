import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseInput, matchRunbook } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('self-healing-orchestrator lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should parse error patterns from JSON input', () => {
    const mockJson = JSON.stringify({
      error: { message: 'SyntaxError: Unexpected token' },
      logAnalysis: { recentErrors: ['ECONNREFUSED 127.0.0.1:5432'] }
    });
    vi.mocked(fs.readFileSync).mockReturnValue(mockJson);

    const errors = parseInput('report.json');
    expect(errors).toHaveLength(2);
    expect(errors).toContain('SyntaxError: Unexpected token');
    expect(errors).toContain('ECONNREFUSED 127.0.0.1:5432');
  });

  it('should match runbook rules and prioritize high severity', () => {
    const errors = [
      'Error: Cannot find module "lodash"',
      'FATAL: ENOSPC no space left on device'
    ];
    const actions = matchRunbook(errors);
    
    expect(actions).toHaveLength(2);
    expect(actions[0].ruleId).toBe('disk-full'); // high
    expect(actions[1].ruleId).toBe('npm-missing-module'); // medium
  });

  it('should handle permission denied errors', () => {
    const actions = matchRunbook(['EACCES: permission denied /var/log']);
    expect(actions[0].ruleId).toBe('permission');
    expect(actions[0].severity).toBe('high');
  });
});
