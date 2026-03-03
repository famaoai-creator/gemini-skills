import { describe, it, expect } from 'vitest';
import { parseData, stringifyData } from './logic';

describe('Data Transformer Logic v2', () => {
  it('parses basic YAML correctly', () => {
    const yaml = 'name: test\nvalue: 42\nitems:\n  - a\n  - b\n';
    const parsed = parseData(yaml, 'yaml');
    expect(parsed.name).toBe('test');
    expect(parsed.value).toBe(42);
    expect(parsed.items).toEqual(['a', 'b']);
  });

  it('parses CSV correctly', () => {
    const csv = 'a,b\n1,2\n3,4';
    const parsed = parseData(csv, 'csv');
    expect(parsed).toHaveLength(2);
    expect(parsed[0].a).toBe(1);
    expect(parsed[1].b).toBe(4);
  });

  it('transforms JSON to YAML', () => {
    const data = { name: 'test', list: [1, 2] };
    const yaml = stringifyData(data, 'yaml');
    expect(yaml).toContain('name: test');
    expect(yaml).toContain('- 1');
  });

  it('transforms JSON to CSV', () => {
    const data = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    const csv = stringifyData(data, 'csv');
    expect(csv).toContain('id,name');
    expect(csv).toContain('1,A');
  });
});
