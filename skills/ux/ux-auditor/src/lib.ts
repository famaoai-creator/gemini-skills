export const HEURISTICS: any = {
  web: {
    checks: [
      {
        id: 'img-alt',
        pattern: /<img(?![^>]*alt=)/gi,
        severity: 'error',
        message: 'Web (WCAG): Image missing alt attribute. Crucial for screen readers.',
      },
      {
        id: 'lang-attr',
        pattern: /<html(?![^>]*lang=)/gi,
        severity: 'error',
        message: 'Web (WCAG): HTML tag missing lang attribute. Impacts accessibility.',
      },
      {
        id: 'viewport-meta',
        pattern: /<meta[^>]*name=["']viewport["']/gi,
        severity: 'warning',
        message: 'Web: Missing responsive viewport meta tag. Required for mobile usability.',
      },
    ],
  },
  mobile: {
    checks: [
      {
        id: 'ios-tap-target',
        pattern: /style=["'][^"']*width:\s*(?:[1-3]\d|4[0-3])px/gi,
        severity: 'warning',
        message: 'iOS (HIG): Tap target width might be below 44px. Recommended minimum.',
      },
      {
        id: 'android-touch-target',
        pattern: /style=["'][^"']*height:\s*(?:[1-3]\d|4[0-7])px/gi,
        severity: 'warning',
        message: 'Android (Material): Touch target height might be below 48dp. Recommended minimum.',
      },
      {
        id: 'ios-tab-overload',
        pattern: /<nav[^>]*class=["'][^"']*tab-bar[^"']*["'][^>]*>(?:[\s\S]*?<li){6,}/gi,
        severity: 'error',
        message: 'iOS (HIG): Too many tabs detected (>5). Consider using "More" tab or a different hierarchy.',
      },
      {
        id: 'android-fixed-px',
        pattern: /font-size:\s*\d+px|width:\s*\d+px/gi,
        severity: 'warning',
        message: 'Android (Material): Hardcoded "px" values detected. Use relative units or tokens for better scaling.',
      },
    ],
  },
  design_system: {
    checks: [
      {
        id: 'hardcoded-color',
        pattern: /#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)/gi,
        severity: 'warning',
        message: 'Design System: Hardcoded color detected. Use Design Tokens (constants) instead for consistency.',
      },
      {
        id: 'native-hardcoded-spacing',
        pattern: /\.padding\(\s*\d+\s*\)|\.padding\(\.[^,]+,\s*\d+\s*\)/g,
        severity: 'warning',
        message: 'Design System (Native): Hardcoded padding detected. Use standardized spacing tokens.',
      },
    ],
  },
  accessibility: {
    checks: [
      {
        id: 'missing-aria-label',
        pattern: /<(?:button|a|input)[^>]*class=["'][^"']*icon[^"']*["'](?![^>]*aria-label=)/gi,
        severity: 'error',
        message: 'A11y: Icon-only button/link is missing aria-label. Invisible to screen readers.',
      },
      {
        id: 'native-a11y-label',
        pattern: /Image\([^)]+\)(?!\.accessibilityLabel\()/g,
        severity: 'warning',
        message: 'A11y (Native): SwiftUI Image might be missing accessibilityLabel.',
      },
      {
        id: 'tabindex-excessive',
        pattern: /tabindex=["'](?:[1-9]\d*)["']/gi,
        severity: 'warning',
        message: 'A11y: Positive tabindex detected. Can disrupt logical focus order.',
      },
      {
        id: 'non-semantic-role',
        pattern: /<(?:div|span)[^>]*onclick=(?![^>]*role=)/gi,
        severity: 'error',
        message: 'A11y: Interactive div/span found without ARIA role. Not keyboard navigable.',
      },
    ],
  },
};

export function auditHtmlContent(content: string): any[] {
  const findings: any[] = [];
  
  // Audit Web Heuristics
  for (const check of HEURISTICS.web.checks) {
    const matches = content.match(check.pattern);
    if (matches && matches.length > 0) {
      findings.push({
        id: check.id,
        platform: 'Web',
        severity: check.severity,
        message: check.message,
        count: matches.length,
      });
    }
  }

  // Audit Mobile Heuristics
  for (const check of HEURISTICS.mobile.checks) {
    const matches = content.match(check.pattern);
    if (matches && matches.length > 0) {
      findings.push({
        id: check.id,
        platform: 'Mobile',
        severity: check.severity,
        message: check.message,
        count: matches.length,
      });
    }
  }

  // Audit Design System Compliance
  for (const check of HEURISTICS.design_system.checks) {
    const matches = content.match(check.pattern);
    if (matches && matches.length > 0) {
      findings.push({
        id: check.id,
        platform: 'DesignSystem',
        severity: check.severity,
        message: check.message,
        count: matches.length,
      });
    }
  }

  // Audit Accessibility Standards
  for (const check of HEURISTICS.accessibility.checks) {
    const matches = content.match(check.pattern);
    if (matches && matches.length > 0) {
      findings.push({
        id: check.id,
        platform: 'A11y',
        severity: check.severity,
        message: check.message,
        count: matches.length,
      });
    }
  }

  return findings;
}
