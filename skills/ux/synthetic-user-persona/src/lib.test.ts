import { describe, it, expect } from 'vitest';
import { generatePersonas } from './lib';

describe('synthetic-user-persona lib', () => {
  it('should generate requested number of personas', () => {
    const personas = generatePersonas(2, 'Test Product');
    expect(personas).toHaveLength(2);
    expect(personas[0].testScenarios[0].scenario).toContain('Test Product');
  });
});
