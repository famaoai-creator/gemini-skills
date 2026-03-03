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
      '          if (e) {', // 5th level (indentation 10)
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
    const code = 'total = price * 1.08; factor = 1234;';
    const result = analyzeCode(code, 'test.js');
    expect(result.summary.byType['magic-number']).toBeGreaterThan(0);
  });

  it('detects console.log', () => {
    const code = 'function test() { console.log("debug"); }';
    const result = analyzeCode(code, 'test.js');
    expect(result.smells).toContainEqual(expect.objectContaining({ type: 'console-log' }));
  });
});
