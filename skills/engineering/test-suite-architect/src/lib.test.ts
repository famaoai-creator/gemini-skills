import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isTestFile, isSourceFile, detectFrameworks, analyzeTestSuite } from './lib';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as pathResolver from '@agent/core/path-resolver';

vi.mock('@agent/core/path-resolver');

describe('test-suite-architect', () => {
  let tmpDir: string;

  beforeEach(() => {
    vi.resetAllMocks();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-suite-test-'));
    vi.mocked(pathResolver.knowledge).mockReturnValue('/nonexistent/standards.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('identifies test files', () => {
    expect(isTestFile('src/lib.test.ts')).toBe(true);
    expect(isTestFile('tests/unit.js')).toBe(true);
    expect(isTestFile('src/index.ts')).toBe(false);
  });

  it('identifies source files', () => {
    expect(isSourceFile('src/lib.ts')).toBe(true);
    expect(isSourceFile('src/lib.test.ts')).toBe(false);
  });

  it('detects frameworks from package.json', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      devDependencies: { vitest: '^1.0.0' }
    }));
    const frameworks = detectFrameworks(tmpDir, []);
    expect(frameworks).toContain('vitest');
  });

  it('analyzes test suite and returns metrics', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ 
      scripts: { test: 'jest' },
      devDependencies: { jest: '^29.0.0' }
    }));
    fs.writeFileSync(path.join(tmpDir, 'lib.ts'), 'export const a = 1;');
    fs.writeFileSync(path.join(tmpDir, 'lib.test.ts'), 'test();');
    
    const result = analyzeTestSuite(tmpDir);
    expect(result.frameworks).toContain('jest');
    expect(result.testFiles).toHaveLength(1);
    expect(result.sourceFiles).toHaveLength(1);
    expect(result.testRatio).toBe(1.0);
  });
});
