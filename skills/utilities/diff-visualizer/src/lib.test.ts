import { describe, it, expect } from 'vitest';
import { generateDiff } from './lib';

describe('diff-visualizer lib', () => {
  it('should generate a patch diff', () => {
    const nl = String.fromCharCode(10);
    const oldText = ['line1', 'line2'].join(nl);
    const newText = ['line1', 'line2 modified'].join(nl);
    const result = generateDiff('old.txt', 'new.txt', oldText, newText);
    expect(result).toContain('--- old.txt');
    expect(result).toContain('+++ new.txt');
    expect(result).toContain('-line2');
    expect(result).toContain('+line2 modified');
  });
});
