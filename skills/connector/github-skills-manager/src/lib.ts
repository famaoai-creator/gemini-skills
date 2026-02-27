import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface GitStatus {
  branch: string;
  hasChanges: boolean;
  remote: boolean;
}

export function getGitStatus(dir: string): GitStatus | null {
  try {
    const gitDir = path.join(dir, '.git');
    if (!fs.existsSync(gitDir)) return null;

    const status = execSync('git status --short', { cwd: dir }).toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: dir }).toString().trim();
    const remote = execSync('git remote -v', { cwd: dir }).toString().trim();

    return {
      branch,
      hasChanges: status.length > 0,
      remote: remote.length > 0,
    };
  } catch {
    return null;
  }
}
