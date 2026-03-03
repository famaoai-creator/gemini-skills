import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { checkExistence, checkPackageJson, performAudit } from './lib';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('project-health-check', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'health-check-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('logic functions', () => {
    it('checkExistence matches file patterns', () => {
      fs.writeFileSync(path.join(tmpDir, 'README.md'), '# test');
      expect(checkExistence(tmpDir, ['README.md'])).toBe('README.md');
      expect(checkExistence(tmpDir, ['LICENSE'])).toBeNull();
    });

    it('checkPackageJson finds dependencies', () => {
      fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ devDependencies: { vitest: '1.0' } }));
      expect(checkPackageJson(tmpDir, 'test')).toBe(true);
      expect(checkPackageJson(tmpDir, 'lint')).toBe(false);
    });
  });

  describe('performAudit (Integration)', () => {
    it('calculates score for a full project structure', () => {
      fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ scripts: { test: 'vitest', lint: 'eslint' } }));
      fs.writeFileSync(path.join(tmpDir, 'README.md'), '# Title');
      fs.mkdirSync(path.join(tmpDir, '.github/workflows'), { recursive: true });
      
      const result = performAudit(tmpDir);
      // Documentation(20) + Test(30) + Lint(20) + CI/CD(30) = 100%
      expect(result.score).toBe(100);
      expect(result.grade).toBe('S');
    });

    it('returns low score for empty directory', () => {
      const result = performAudit(tmpDir);
      expect(result.score).toBe(0);
      expect(result.grade).toBe('F');
    });
  });
});
