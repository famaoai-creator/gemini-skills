import { secureFetch } from '@agent/core/network';

export async function fetchApi(url: string, options: any = {}): Promise<any> {
  const config = {
    method: options.method || 'GET',
    url,
    headers: options.headers || {},
    data: options.body || undefined,
  };
  return await secureFetch(config);
}
