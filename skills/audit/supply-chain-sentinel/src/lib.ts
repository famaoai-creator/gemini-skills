export const SUSPICIOUS_PATTERNS = [
  { pattern: /postinstall.*curl|wget|fetch/i, risk: 'Network call in postinstall (Potential Data Exfiltration)' },
  { pattern: /eval\s*\(\s*(?:Buffer|atob|decode)/i, risk: 'Obfuscated code execution (Payload Hide)' },
];

export interface SBOMComponent {
  name: string;
  version: string;
  type: string;
  purl?: string;
}

export interface CycloneDX {
  bomFormat: 'CycloneDX';
  specVersion: '1.5';
  metadata: any;
  components: SBOMComponent[];
}

export function generateSBOM(pkgContent: string): CycloneDX {
  const pkg = JSON.parse(pkgContent);
  const components = parsePackageJson(pkgContent);
  
  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    metadata: {
      timestamp: new Date().toISOString(),
      component: {
        name: pkg.name,
        version: pkg.version,
        type: 'application'
      }
    },
    components: components.map(c => ({
      name: c.name,
      version: c.version,
      type: 'library',
      purl: `pkg:npm/${c.name}@${c.version}`
    }))
  };
}

export function detectDependencyConfusion(components: any[], internalPrefixes: string[]): any[] {
  const findings: any[] = [];
  for (const comp of components) {
    // If a dependency doesn't have an internal scope but matches an internal pattern
    const isScoped = comp.name.startsWith('@');
    const matchesInternalPattern = internalPrefixes.some(p => comp.name.includes(p));
    
    if (matchesInternalPattern && !isScoped) {
      findings.push({
        name: comp.name,
        risk: 'Potential Dependency Confusion',
        recommendation: 'Use scoped packages (e.g., @company/name) to prevent hijack from public registries.'
      });
    }
  }
  return findings;
}

export function scanForSuspicious(content: string, fileName: string): any[] {
  const findings: any[] = [];
  for (const rule of SUSPICIOUS_PATTERNS) {
    if (rule.pattern.test(content)) {
      findings.push({ file: fileName, risk: rule.risk });
    }
  }
  return findings;
}

export function parsePackageJson(content: string): any[] {
  const components: any[] = [];
  try {
    const pkg = JSON.parse(content);
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    for (const [name, version] of Object.entries(allDeps)) {
      components.push({
        name,
        version: (version as string).replace(/[\^~>=<]/g, ''),
        ecosystem: 'npm',
      });
    }
  } catch {}
  return components;
}
