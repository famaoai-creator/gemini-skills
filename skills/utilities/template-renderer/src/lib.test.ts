import { describe, it, expect } from 'vitest';
import { renderTemplate } from './lib';

describe('template-renderer lib', () => {
  it('should render mustache templates', () => {
    const template = 'Hello {{name}}';
    const data = { name: 'Gemini' };
    expect(renderTemplate(template, data)).toBe('Hello Gemini');
  });
});
