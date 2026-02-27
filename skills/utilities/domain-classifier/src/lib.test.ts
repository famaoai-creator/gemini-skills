import { describe, it, expect, vi } from 'vitest';
import { classifyDomain } from './lib';
import * as classifier from '@agent/core/classifier';

vi.mock('@agent/core/classifier');

describe('domain-classifier lib', () => {
  it('should call core classifier', () => {
    const rules = { resultKey: 'domain', categories: { tech: ['api'] } };
    classifyDomain('test.txt', rules);
    expect(classifier.classifyFile).toHaveBeenCalled();
  });
});
