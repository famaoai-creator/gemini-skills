import { describe, it, expect } from 'vitest';
import { generateArchitecturalGuardrails, validateDesign, NFRequirement } from './lib';

describe('nonfunctional-architect lib', () => {
  const mockReqs: NFRequirement[] = [
    { category: 'availability', level: 'high', detail: 'Must be multi-region' },
    { category: 'security', level: 'standard', detail: 'Encrypted at rest' }
  ];

  it('should generate architectural guardrails report', () => {
    const report = generateArchitecturalGuardrails(mockReqs);
    expect(report).toContain('# Non-Functional Architectural Guardrails');
    expect(report).toContain('[AVAILABILITY] Level: high');
  });

  it('should detect violations in design document', () => {
    const badDesign = 'Single node instance with local storage.';
    const violations = validateDesign(badDesign, mockReqs);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Availability violation');
  });

  it('should pass design with HA components', () => {
    const goodDesign = 'Redundant web servers behind LB with HA database.';
    const violations = validateDesign(goodDesign, mockReqs);
    expect(violations).toHaveLength(0);
  });
});
