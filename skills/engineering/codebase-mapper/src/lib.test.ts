import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildTreeRecursive } from './lib';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('codebase-mapper', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codebase-mapper-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('maps a directory structure correctly', () => {
    fs.mkdirSync(path.join(tmpDir, 'src'));
    fs.mkdirSync(path.join(tmpDir, 'lib'));
    fs.writeFileSync(path.join(tmpDir, 'src', 'index.js'), 'console.log("hello");');
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}');
    
    const tree = buildTreeRecursive(tmpDir, 2);
    expect(tree).toContain('├── lib/');
    expect(tree).toContain('├── src/');
    expect(tree).toContain('  └── index.js');
    expect(tree).toContain('└── package.json');
  });

  it('respects max depth', () => {
    fs.mkdirSync(path.join(tmpDir, 'a', 'b', 'c'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'a', 'b', 'c', 'deep.txt'), 'deep');
    
    const tree = buildTreeRecursive(tmpDir, 1);
    const treeText = tree.join('\n');
    expect(treeText).toContain('a/');
    expect(treeText).not.toContain('deep.txt');
  });

  it('ignores standard excluded directories', () => {
    fs.mkdirSync(path.join(tmpDir, 'node_modules'));
    fs.mkdirSync(path.join(tmpDir, '.git'));
    fs.writeFileSync(path.join(tmpDir, 'safe.js'), 'code');
    
    const tree = buildTreeRecursive(tmpDir, 1);
    const treeText = tree.join('\n');
    expect(treeText).toContain('safe.js');
    expect(treeText).not.toContain('node_modules');
    expect(treeText).not.toContain('.git');
  });
});
