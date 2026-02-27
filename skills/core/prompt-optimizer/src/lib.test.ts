import { describe, it, expect } from 'vitest';
import { parseFrontmatter, hasSection, optimizePrompt } from './lib';

describe('prompt-optimizer lib', () => {
  const mockSkill = `---
name: test-skill
description: This is a test skill description that is long enough.
---
## Usage
You must run this command.
## Options
- \`--input\`: input file
## Troubleshooting
If it fails, check logs.
## Knowledge Protocol
Public tier.
\`\`\`bash
npm run cli
\`\`\`
`;

  it('should parse frontmatter', () => {
    const fm = parseFrontmatter(mockSkill);
    expect(fm.name).toBe('test-skill');
  });

  it('should detect sections', () => {
    expect(hasSection(mockSkill, 'Usage')).toBe(true);
    expect(hasSection(mockSkill, 'NonExistent')).toBe(false);
  });

  it('should optimize and score correctly', () => {
    const result = optimizePrompt(mockSkill, 'SKILL.md');
    expect(result.score).toBeGreaterThan(5);
    expect(result.percentage).toBeGreaterThan(50);
  });
});
