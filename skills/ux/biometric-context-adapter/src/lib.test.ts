import { describe, it, expect } from 'vitest';
import { generateNikoNikoMarkdown } from './lib';

describe('biometric-context-adapter lib', () => {
  it('should generate markdown table', () => {
    const sessions = [{ date: '2026-01-01', mood: 'Happy', icon: '🙂', note: 'Good' }];
    const md = generateNikoNikoMarkdown(sessions);
    expect(md).toContain('| 2026-01-01 | 🙂 | **Happy** | Good |');
  });
});
