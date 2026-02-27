import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAgentActivity } from './lib';
import { execSync } from 'node:child_process';

vi.mock('node:child_process');

describe('agent-activity-monitor lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should parse git log', () => {
    const nl = String.fromCharCode(10);
    vi.mocked(execSync).mockReturnValueOnce('commit1' + nl + 'commit2');
    vi.mocked(execSync).mockReturnValueOnce(' 1 file changed, 1 insertion(+)');
    const { commits } = getAgentActivity('user', '1 day ago', '.');
    expect(commits).toHaveLength(2);
  });
});
