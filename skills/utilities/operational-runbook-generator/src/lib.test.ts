import { describe, it, expect } from 'vitest';
import { generateRunbookMarkdown, TEMPLATES } from './lib';

describe('operational-runbook-generator lib', () => {
  it('should generate markdown from template', () => {
    const md = generateRunbookMarkdown('my-service', 'deploy', TEMPLATES.deploy);
    expect(md).toContain('# DEPLOY Runbook: my-service');
    expect(md).toContain('## Overview');
  });
});
