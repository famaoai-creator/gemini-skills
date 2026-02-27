import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchApi } from './lib';
import * as network from '@agent/core/network';

vi.mock('@agent/core/network');

describe('api-fetcher lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call secureFetch', async () => {
    vi.mocked(network.secureFetch).mockResolvedValue({ ok: true });
    const result = await fetchApi('http://test.com');
    expect(result.ok).toBe(true);
    expect(network.secureFetch).toHaveBeenCalled();
  });
});
