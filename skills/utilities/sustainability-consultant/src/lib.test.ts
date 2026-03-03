import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { assessInfraEnergy } from './lib';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as pathResolver from '@agent/core/path-resolver';

vi.mock('@agent/core/path-resolver');

describe('sustainability-consultant lib', () => {
  let tmpDir: string;

  beforeEach(() => {
    vi.resetAllMocks();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sustainability-test-'));
    vi.mocked(pathResolver.knowledge).mockReturnValue('/nonexistent/thresholds.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should estimate energy usage for Docker and K8s', () => {
    fs.writeFileSync(path.join(tmpDir, 'docker-compose.yml'), 'version: "3"');
    fs.mkdirSync(path.join(tmpDir, 'k8s'));
    
    const result = assessInfraEnergy(tmpDir);
    expect(result.totalKwh).toBe(250); // 50 + 200
    expect(result.co2Kg).toBeGreaterThan(0);
    expect(result.efficiency_score).toBe(100);
  });

  it('should return zero for empty directory', () => {
    const result = assessInfraEnergy(tmpDir);
    expect(result.totalKwh).toBe(0);
  });
});
