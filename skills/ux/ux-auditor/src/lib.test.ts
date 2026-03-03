import { describe, it, expect } from 'vitest';
import { auditAccessibility } from './lib';

describe('ux-auditor lib', () => {
  it('should detect missing alt attributes', () => {
    const html = '<img src="logo.png">';
    const findings = auditAccessibility(html);
    expect(findings).toContainEqual(expect.objectContaining({ element: 'img', issue: 'Missing alt attribute' }));
  });

  it('should detect missing lang attribute', () => {
    const html = '<html><body></body></html>';
    const findings = auditAccessibility(html);
    expect(findings).toContainEqual(expect.objectContaining({ element: 'html', issue: 'Missing lang attribute' }));
  });

  it('should be clean for accessible HTML', () => {
    const html = '<html lang="en"><img src="a.png" alt="logo"><button>Submit</button></html>';
    const findings = auditAccessibility(html);
    expect(findings).toHaveLength(0);
  });
});
