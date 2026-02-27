import * as fs from 'fs';

export interface BinaryAnalysis {
  size: number;
  format: string;
  magic: string;
  stringsFound: number;
  imports: string[];
  sampleStrings: string[];
}

export function detectFormat(magic: string, buffer: Buffer): string {
  if (magic === '7f454c46') return 'ELF (Linux executable)';
  if (magic.startsWith('4d5a')) return 'PE (Windows executable)';
  if (magic.startsWith('cafebabe')) return 'Java class / Mach-O fat binary';
  if (magic.startsWith('feedface') || magic.startsWith('feedfacf'))
    return 'Mach-O (macOS executable)';
  if (magic.startsWith('504b0304')) return 'ZIP archive (JAR/APK/WASM)';
  if (buffer.toString('utf8', 0, 2) === '#!') return 'Script with shebang';
  if (buffer.toString('utf8', 0, 20).includes('<?xml')) return 'XML document';
  return 'Unknown binary format';
}

export function extractStrings(buffer: Buffer): string[] {
  const strings: string[] = [];
  let current = '';
  for (let i = 0; i < buffer.length; i++) {
    const c = buffer[i];
    if (c >= 32 && c < 127) {
      current += String.fromCharCode(c);
    } else {
      if (current.length >= 4) strings.push(current);
      current = '';
    }
  }
  if (current.length >= 4) strings.push(current);
  return strings;
}

export function detectImports(strings: string[]): string[] {
  const libs: string[] = [];
  for (const s of strings) {
    if (/\.so\b|\.dll\b|\.dylib\b/i.test(s)) libs.push(s);
    if (/^lib[a-z]/i.test(s) && s.length < 50) libs.push(s);
  }
  return [...new Set(libs)].slice(0, 20);
}

export function analyzeBinaryFile(filePath: string): BinaryAnalysis {
  const stat = fs.statSync(filePath);
  const buffer = Buffer.alloc(Math.min(8192, stat.size));
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, buffer.length, 0);
  fs.closeSync(fd);

  const magic = buffer.slice(0, 4).toString('hex');
  const format = detectFormat(magic, buffer);
  const strings = extractStrings(buffer);
  const imports = detectImports(strings);

  return {
    size: stat.size,
    format,
    magic,
    stringsFound: strings.length,
    imports,
    sampleStrings: strings.slice(0, 20),
  };
}
