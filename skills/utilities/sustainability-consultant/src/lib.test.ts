import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assessInfraEnergy } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('sustainability-consultant lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should estimate energy', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => p.toString().includes('docker-compose.yml'));
    const result = assessInfraEnergy('.');
    expect(result.totalKwh).toBe(50);
    expect(result.co2Kg).toBeGreaterThan(0);
  });
});
