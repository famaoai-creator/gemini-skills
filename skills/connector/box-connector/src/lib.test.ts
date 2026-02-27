import { describe, it, expect } from 'vitest';
import { simulateBoxAction } from './lib';

describe('box-connector lib', () => {
  it('should return simulated list results', () => {
    const result = simulateBoxAction('list', '123');
    expect(result.folderId).toBe('123');
    expect(result.items.length).toBeGreaterThan(0);
  });
});
