import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchApi } from './lib';
import * as network from '@agent/core/network';

vi.mock('@agent/core/network', () => ({
  secureFetch: vi.fn(),
}));

describe('api-fetcher lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call secureFetch and return result', async () => {
    vi.mocked(network.secureFetch).mockResolvedValue({
      data: { success: true },
      status: 200,
      headers: {},
      statusText: 'OK'
    } as any);

    const result = await fetchApi('http://test.com');
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    expect(network.secureFetch).toHaveBeenCalledWith(expect.objectContaining({
      url: 'http://test.com',
      method: 'GET'
    }));
  });
});
