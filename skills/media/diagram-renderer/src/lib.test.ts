import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyDesignerStyle, loadDesignerKnowledge, ADF } from './lib';
import * as fs from 'node:fs';
import { safeReadFile } from '@agent/core/secure-io';

vi.mock('node:fs');
vi.mock('@agent/core/secure-io');

describe('diagram-renderer lib', () => {
  const mockKnowledge = {
    registry: {
      themes: {
        base: { theme: 'default', variables: { mainBkg: '#fff' } },
        dark: { theme: 'dark', variables: { mainBkg: '#000' } }
      }
    },
    styles: {
      professional_base: { shadow: '.shadow { filter: blur(2px); }' },
      tech_dark: { glow: '.glow { color: cyan; }' }
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should apply designer styles to mermaid content', () => {
    const adf: ADF = {
      protocol: 'gemini-diagram-v1',
      intent: 'system_architecture',
      elements: { diagram: 'graph LR\nA-->B' }
    };
    
    const styled = applyDesignerStyle('graph LR\nA-->B', adf, mockKnowledge);
    expect(styled).toContain('%%{init:');
    expect(styled).toContain('"theme":"default"');
    expect(styled).toContain('filter: blur(2px);');
  });

  it('should use dark theme when requested', () => {
    const adf: ADF = {
      protocol: 'gemini-diagram-v1',
      intent: 'api_sequence',
      theme: 'dark',
      elements: { diagram: 'sequenceDiagram\nA->>B: hi' }
    };
    
    const styled = applyDesignerStyle('sequenceDiagram\nA->>B: hi', adf, mockKnowledge);
    expect(styled).toContain('"theme":"dark"');
    expect(styled).toContain('color: cyan;');
  });

  it('should load knowledge files correctly', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(safeReadFile).mockReturnValue(JSON.stringify({ rules: {}, themes: {}, styles: {}, icons: {} }));
    
    const knowledge = loadDesignerKnowledge();
    expect(knowledge).toHaveProperty('registry');
    expect(knowledge).toHaveProperty('icons');
  });
});
