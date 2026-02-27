import { describe, it, expect } from 'vitest';
import { extractFAQsFromMarkdown } from './lib';

describe('automated-support-architect lib', () => {
  it('should extract FAQs from markdown sections', () => {
    const nl = String.fromCharCode(10);
    // ensure starting with ##
    const md = '## Usage' + nl + 'How to use.' + nl + '## Setup' + nl + 'Steps.';
    const faqs = extractFAQsFromMarkdown(md);
    expect(faqs.length).toBeGreaterThan(0);
    expect(faqs[0].q).toContain('usage');
  });
});
