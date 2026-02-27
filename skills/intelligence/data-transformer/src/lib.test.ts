import { describe, it, expect } from 'vitest';
import { parseData, stringifyData, detectFormat } from './lib';

describe('data-transformer lib', () => {
  it('should detect formats from extensions', () => {
    expect(detectFormat('test.json')).toBe('json');
    expect(detectFormat('test.yaml')).toBe('yaml');
    expect(detectFormat('test.csv')).toBe('csv');
  });

  it('should parse and stringify JSON', () => {
    const data = { a: 1, b: 'test' };
    const json = JSON.stringify(data, null, 2);
    expect(parseData(json, 'json')).toEqual(data);
    expect(stringifyData(data, 'json')).toBe(json);
  });

  it('should convert between json and yaml', () => {
    const data = { name: 'gemini', version: 1 };
    const yamlStr = stringifyData(data, 'yaml');
    expect(yamlStr).toContain('name: gemini');
    expect(parseData(yamlStr, 'yaml')).toEqual(data);
  });
});
