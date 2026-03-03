import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadRules, classifyDomain } from './lib';
import * as fs from 'node:fs';
import * as classifier from '@agent/core/classifier';

vi.mock('node:fs');
vi.mock('@agent/core/classifier');

describe('domain-classifier lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should load rules and classify domain', () => {
    const mockYaml = 'resultKey: domain\ncategories: { tech: [api, server] }';
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);

    const rules = loadRules('domain-rules.yml');
    classifyDomain('input.txt', rules);

    expect(classifier.classifyFile).toHaveBeenCalledWith('input.txt', rules.categories, {
      resultKey: 'domain',
    });
  });
});
