import { describe, it, expect } from 'vitest';
import { detectFormat, extractStrings, detectImports } from './lib';

describe('binary-archaeologist', () => {
  it('detects ELF format', () => {
    const buffer = Buffer.alloc(10);
    buffer.write('7f454c46', 0, 'hex');
    expect(detectFormat('7f454c46', buffer)).toContain('ELF');
  });

  it('detects shebang script', () => {
    const buffer = Buffer.from('#!/bin/bash' + String.fromCharCode(10));
    expect(detectFormat('23212f62', buffer)).toContain('Script');
  });

  it('extracts strings', () => {
    const buffer = Buffer.from('\x00Hello\x00World\x00');
    const strings = extractStrings(buffer);
    expect(strings).toContain('Hello');
    expect(strings).toContain('World');
  });

  it('detects imports', () => {
    const strings = ['libc.so.6', 'libm.so', 'not-a-lib', 'kernel32.dll'];
    const imports = detectImports(strings);
    expect(imports).toContain('libc.so.6');
    expect(imports).toContain('libm.so');
    expect(imports).toContain('kernel32.dll');
    expect(imports).not.toContain('not-a-lib');
  });
});
