import { describe, it, expect } from 'vitest';
import { extractSnippets, distillKnowledge } from './lib';

describe('knowledge-harvester lib', () => {
  it('should extract snippets from markdown headers', () => {
    const text = '# Rule 1\nThis is about #security.\n# Rule 2\nThis is about #performance.';
    const snippets = extractSnippets(text);
    expect(snippets).toHaveLength(2);
    expect(snippets[0].title).toBe('Rule 1');
    expect(snippets[0].tags).toContain('security');
  });

  it('should distill knowledge into report', () => {
    const snippets = [
      { title: 'API', tags: ['web', 'REST'], content: '...' }
    ];
    const report = distillKnowledge(snippets);
    expect(report).toContain('Distilled Knowledge Report');
    expect(report).toContain('### API');
    expect(report).toContain('web, REST');
  });
});
