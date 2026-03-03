import { describe, it, expect, vi } from 'vitest';
import { scanFile, scanProject } from './lib';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('security-scanner', () => {
  describe('scanFile', () => {
    it('detects hardcoded API key', () => {
      const code = "const key = 'AIza12345678901234567890123456789012345';";
      const findings = scanFile('test.ts', code);
      expect(findings).toContainEqual(
        expect.objectContaining({
          pattern: 'Generic Hardcoded Secret',
        })
      );
    });

    it('detects eval', () => {
      const code = "eval('alert(1)');";
      const findings = scanFile('test.ts', code);
      expect(findings).toContainEqual(
        expect.objectContaining({
          pattern: 'Dangerous Eval',
        })
      );
    });

    it('detects insecure http', () => {
      const code = "const url = 'http://example.com';";
      const findings = scanFile('test.ts', code);
      expect(findings).toContainEqual(
        expect.objectContaining({
          pattern: 'Insecure HTTP',
        })
      );
    });
  });

  describe('scanProject', () => {
    it('scans a directory and finds vulnerabilities', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sec-scan-test-'));
      try {
        fs.writeFileSync(path.join(tmpDir, 'unsafe.js'), "const k = 'AIza12345678901234567890123456789012345';");
        fs.writeFileSync(path.join(tmpDir, 'safe.js'), "const x = 1;");
        
        const result = scanProject(tmpDir);
        expect(result.scannedFiles).toBe(2);
        expect(result.findings.length).toBe(1);
        expect(result.findings[0].pattern).toBe('Generic Hardcoded Secret');
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
