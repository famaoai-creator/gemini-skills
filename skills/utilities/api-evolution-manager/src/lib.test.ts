import { describe, it, expect } from 'vitest';
import { extractEndpoints } from './lib';

describe('api-evolution-manager lib', () => {
  it('should extract endpoints from spec', () => {
    const spec = { paths: { '/users': { get: { summary: 'Get users' } } } };
    const endpoints = extractEndpoints(spec);
    expect(endpoints).toHaveLength(1);
    expect(endpoints[0].path).toBe('/users');
    expect(endpoints[0].method).toBe('GET');
  });
});
