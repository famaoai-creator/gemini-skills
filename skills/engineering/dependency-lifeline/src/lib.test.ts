import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseSemver, compareVersions, analyzeDependencies } from './lib';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as pathResolver from '@agent/core/path-resolver';

vi.mock('@agent/core/path-resolver');

describe('dependency-lifeline', () => {
  let tmpDir: string;

  beforeEach(() => {
    vi.resetAllMocks();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dep-lifeline-test-'));
    vi.mocked(pathResolver.knowledge).mockReturnValue('/nonexistent/thresholds.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('parseSemver', () => {
    it('parses basic semver', () => {
      expect(parseSemver('1.2.3')).toEqual({ major: 1, minor: 2, patch: '3' });
    });
    it('strips prefix characters', () => {
      expect(parseSemver('^2.0.0')).toEqual({ major: 2, minor: 0, patch: '0' });
    });
  });

  describe('compareVersions', () => {
    it('detects major updates', () => {
      expect(compareVersions('1.0.0', '2.0.0').updateType).toBe('major');
    });
    it('detects minor updates', () => {
      expect(compareVersions('1.0.0', '1.1.0').updateType).toBe('minor');
    });
    it('detects patch updates', () => {
      expect(compareVersions('1.0.0', '1.0.1').updateType).toBe('patch');
    });
    it('detects up-to-date', () => {
      expect(compareVersions('1.0.0', '1.0.0').status).toBe('up-to-date');
    });
  });

  describe('analyzeDependencies', () => {
    it('analyzes dependencies correctly', () => {
      fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
        name: 'test-proj',
        dependencies: { lodash: '^4.17.21' }
      }));
      
      const report = analyzeDependencies(tmpDir);
      expect(report.project).toBe('test-proj');
      expect(report.healthScore).toBe(100);
    });
  });
});
