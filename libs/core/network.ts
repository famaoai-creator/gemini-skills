import axios, { AxiosRequestConfig } from 'axios';

/**
 * Standardized network utilities for Gemini Skills.
 */

export async function secureFetch<T = any>(options: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axios({
      timeout: 10000,
      headers: {
        'User-Agent': 'Gemini-Agent/1.0.0',
      },
      ...options,
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Network Error: ${err.message}${err.response ? ` (${err.response.status})` : ''}`
    );
  }
}
