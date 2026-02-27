import { describe, it, expect } from 'vitest';
import { auditRequirements } from './lib';

describe('requirements-wizard lib', () => {
  it('should score based on criteria', () => {
    const adf = { project_name: 'test', security: 'high' };
    const checklist = ['Security', 'Performance'];
    const result = auditRequirements(adf, checklist);
    expect(result.score).toBe(50);
    expect(result.results[0].status).toBe('passed');
  });
});
