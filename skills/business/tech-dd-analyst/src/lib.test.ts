import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { assessCodeQuality, assessArchitecture, calculateDDScore, processTechDD, assessTeamMaturity } from './lib';
import * as fs from 'node:fs';
import * as fsUtils from '@agent/core/fs-utils';
import { execSync } from 'node:child_process';
import { KnowledgeProvider } from '@agent/core/knowledge-provider';

vi.mock('node:fs');
vi.mock('@agent/core/fs-utils');
vi.mock('node:child_process');

describe('tech-dd-analyst lib', () => {
  const mockRules = {
    thresholds: { bus_factor_critical: 1, top_contributor_share_critical: 80, git_since: '1 year ago' },
    scoring: { base_score: 50, rules: [{ path: 'team.busFactor', op: '>', value: 2, points: 20 }] },
    verdicts: { strong_pass: 80, pass: 60 }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    KnowledgeProvider.enableMockMode({
      'skills/business/tech-dd-analyst/rules.json': mockRules
    });
    vi.mocked(fs.existsSync).mockImplementation((p: any) => p.includes('jest.config.js'));
  });

  afterEach(() => {
    KnowledgeProvider.disableMockMode();
  });

  it('should assess code quality statistics', () => {
    vi.mocked(fsUtils.getAllFiles).mockReturnValue(['/test/a.ts', '/test/b.js']);
    vi.mocked(fs.readFileSync).mockReturnValue('line1\nline2\nline3');
    
    const stats = assessCodeQuality('/test');
    expect(stats.totalFiles).toBe(2);
    expect(stats.totalLines).toBe(6);
  });

  it('should detect architecture signals', () => {
    const arch = assessArchitecture('/test');
    expect(arch.testFramework).toBe('jest');
  });

  it('should calculate DD score correctly', () => {
    const code = { totalFiles: 10, totalLines: 1000, avgFileSize: 100, languages: {} };
    const team = { contributors: 5, topContributors: [], busFactor: 3, risk: 'low' as const };
    const arch = { languages: [], frameworks: [], tools: [], hasMonorepo: false, hasMicroservices: false, hasDockerCompose: false, hasTerraform: false, hasK8s: false, testFramework: 'none', cicd: 'none' };
    
    const score = calculateDDScore(code, team, arch);
    expect(score).toBe(70);
  });

  it('should process full DD and give verdict', () => {
    vi.mocked(fsUtils.getAllFiles).mockReturnValue([]);
    vi.mocked(execSync).mockReturnValue('10 author1\n5 author2' as any);
    
    const result = processTechDD('/test');
    expect(result.score).toBeDefined();
    expect(result.verdict).toBeDefined();
  });
});
