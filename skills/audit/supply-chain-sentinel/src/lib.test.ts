import { describe, it, expect } from 'vitest';
import { scanForSuspicious, parsePackageJson } from './lib';

describe('supply-chain-sentinel lib', () => {
  it('should detect suspicious patterns', () => {
    const content = 'eval(Buffer.from("abc", "base64"))';
    const findings = scanForSuspicious(content, 'test.js');
    expect(findings.length).toBeGreaterThan(0);
  });

  it('should parse package.json', () => {
    const content = JSON.stringify({ dependencies: { express: '^4.17.1' } });
    const components = parsePackageJson(content);
    expect(components[0].name).toBe('express');
    expect(components[0].version).toBe('4.17.1');
  });
});
