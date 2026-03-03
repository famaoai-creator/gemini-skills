import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { calculateRiskScore, predict } from './lib';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execSync } from 'node:child_process';

describe('bug-predictor', () => {
  it('calculateRiskScore should return weighted score', () => {
    const score = calculateRiskScore(10, 5, 100);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  describe('Integration with Git', () => {
    let tmpRepo: string;

    beforeEach(() => {
      tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'bug-predictor-git-'));
      execSync('git init', { cwd: tmpRepo, stdio: 'ignore' });
      execSync('git config user.email "test@example.com"', { cwd: tmpRepo });
      execSync('git config user.name "Test"', { cwd: tmpRepo });
    });

    afterEach(() => {
      fs.rmSync(tmpRepo, { recursive: true, force: true });
    });

    it('analyzes hotspots based on churn', () => {
      const fileA = path.join(tmpRepo, 'active.js');
      const fileB = path.join(tmpRepo, 'stable.js');
      
      // Create churn for fileA
      fs.writeFileSync(fileA, 'console.log(1);');
      execSync('git add active.js && git commit -m "initial"', { cwd: tmpRepo });
      
      fs.writeFileSync(fileA, 'console.log(2);');
      execSync('git add active.js && git commit -m "update"', { cwd: tmpRepo });

      // fileB only one commit
      fs.writeFileSync(fileB, 'const x = 1;');
      execSync('git add stable.js && git commit -m "add b"', { cwd: tmpRepo });

      const report = predict(tmpRepo, { top: 5 });
      
      expect(report.totalFilesAnalyzed).toBeGreaterThanOrEqual(2);
      const hotspotA = report.hotspots.find(h => h.file === 'active.js');
      const hotspotB = report.hotspots.find(h => h.file === 'stable.js');
      
      expect(hotspotA!.churn).toBe(2);
      expect(hotspotB!.churn).toBe(1);
      expect(hotspotA!.riskScore).toBeGreaterThan(hotspotB!.riskScore);
    });
  });
});
