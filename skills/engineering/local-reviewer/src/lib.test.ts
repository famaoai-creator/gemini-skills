import { describe, it, expect } from 'vitest';
import { reviewFile } from './lib';

describe('local-reviewer lib', () => {
  it('should find issues in code', () => {
    const code = 'const x = 1;\neval("alert(1)");\n// TODO: fix this\n' + 'a'.repeat(130);
    const findings = reviewFile('test.js', code);
    
    expect(findings).toHaveLength(3);
    expect(findings.some(f => f.type === 'security')).toBe(true);
    expect(findings.some(f => f.type === 'logic')).toBe(true);
    expect(findings.some(f => f.type === 'style')).toBe(true);
  });

  it('should be clean for good code', () => {
    const code = 'const x = 1;\nfunction test() { return x; }';
    const findings = reviewFile('test.js', code);
    expect(findings).toHaveLength(0);
  });
});
