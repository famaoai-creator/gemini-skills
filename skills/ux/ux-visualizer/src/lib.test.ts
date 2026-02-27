import { describe, it, expect } from 'vitest';
import { generateMermaidUX } from './lib';

describe('ux-visualizer lib', () => {
  it('should generate low fidelity mermaid', () => {
    const mermaid = generateMermaidUX('Test', 'low');
    expect(mermaid).toContain('Start --> End');
  });
  it('should generate high fidelity mermaid', () => {
    const mermaid = generateMermaidUX('Test', 'high');
    expect(mermaid).toContain('S1');
  });
});
