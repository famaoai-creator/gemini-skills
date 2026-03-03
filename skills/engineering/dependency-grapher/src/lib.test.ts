import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateMermaidGraph } from './lib';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('dependency-grapher', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dep-grapher-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('generates a mermaid graph from package.json', () => {
    const pkgData = {
      name: 'test-pkg',
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' }
    };
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkgData));

    const result = generateMermaidGraph(tmpDir);
    expect(result.mermaid).toContain('graph TD');
    expect(result.mermaid).toContain('test-pkg --> lodash');
    expect(result.mermaid).toContain('test-pkg --> vitest');
    expect(result.skillCount).toBe(2);
  });

  it('handles project with no dependencies', () => {
    const pkgData = { name: 'empty-pkg' };
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkgData));

    const result = generateMermaidGraph(tmpDir);
    expect(result.mermaid).toContain('empty-pkg (No Dependencies)');
    expect(result.skillCount).toBe(0);
  });

  it('throws error if package.json is missing', () => {
    expect(() => generateMermaidGraph(tmpDir)).toThrow('package.json not found');
  });
});
