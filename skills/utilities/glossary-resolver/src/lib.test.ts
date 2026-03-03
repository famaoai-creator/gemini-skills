import { describe, it, expect } from 'vitest';
import { resolveTerms } from './lib';

describe('glossary-resolver lib', () => {
  it('should inject definitions into text', () => {
    const text = 'The API is secured by OAuth.';
    const glossary = {
      terms: {
        'API': 'Application Programming Interface',
        'OAuth': 'Open Authorization'
      }
    };
    const result = resolveTerms(text, glossary);
    expect(result).toContain('API (Application Programming Interface)');
    expect(result).toContain('OAuth (Open Authorization)');
  });
});
