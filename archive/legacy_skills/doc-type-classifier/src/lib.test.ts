import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadRules, classifyDocument } from './lib';
import * as fs from 'node:fs';
import * as classifier from '@agent/core/classifier';

vi.mock('node:fs');
vi.mock('@agent/core/classifier');

describe('doc-type-classifier lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should load rules and classify', () => {
    const mockYaml = 'resultKey: type\ncategories: { spec: [api] }';
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);

    const rules = loadRules('rules.yml');
    classifyDocument('test.md', rules);

    expect(classifier.classifyFile).toHaveBeenCalledWith('test.md', rules.categories, {
      resultKey: 'type',
    });
  });
});
