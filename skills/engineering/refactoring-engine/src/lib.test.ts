import { describe, it, expect } from 'vitest';
import { analyzeCode, THRESHOLDS } from './lib';

describe('refactoring-engine', () => {
  it('detects long functions', () => {
    const lines = ['function long() {'];
    for (let i = 0; i < THRESHOLDS.maxFunctionLength + 5; i++) {
      lines.push('  // line ' + i);
    }
    lines.push('}');
    const result = analyzeCode(lines.join('\n'), 'test.js');
    expect(result.smells).toContainEqual(expect.objectContaining({ type: 'long-function' }));
  });

  it('detects deep nesting', () => {
    const lines = [
      'function deep() {',
      '  if (a) {',
      '    if (b) {',
      '      if (c) {',
      '        if (d) {',
      '          if (e) {', // 5th level
      '            return;',
      '          }',
      '        }',
      '      }',
      '    }',
      '  }',
      '}',
    ];
    const result = analyzeCode(lines.join('\n'), 'test.js');
    expect(result.smells).toContainEqual(expect.objectContaining({ type: 'deep-nesting' }));
  });

  it('detects magic numbers', () => {
    const result = analyzeCode('const x = 9999;', 'test.js');
    expect(result.smells).toContainEqual(expect.objectContaining({ type: 'magic-number' }));
  });

  it('detects console logs', () => {
    const result = analyzeCode('console.log("debug")', 'test.js');
    expect(result.smells).toContainEqual(expect.objectContaining({ type: 'console-log' }));
  });
});
