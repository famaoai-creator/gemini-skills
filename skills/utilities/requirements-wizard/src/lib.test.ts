import { describe, it, expect } from 'vitest';
import { validateRequirements, exportToMarkdown, Requirement } from './lib';

describe('requirements-wizard lib', () => {
  const mockReqs: Requirement[] = [
    { id: '1', title: 'Login', description: 'Allow users to login', priority: 'must' },
    { id: '2', title: 'Dark Mode', description: 'Dark theme support', priority: 'should' }
  ];

  it('should validate requirements and find missing fields', () => {
    const invalid: any[] = [{ id: '3', title: '' }];
    const issues = validateRequirements(invalid);
    expect(issues).toContain('Requirement #1 is missing a title.');
    expect(issues).toContain('Requirement "#1" is missing a description.');
  });

  it('should export to markdown format', () => {
    const md = exportToMarkdown(mockReqs);
    expect(md).toContain('# Product Requirements Document');
    expect(md).toContain('[MUST] Login');
    expect(md).toContain('[SHOULD] Dark Mode');
  });
});
