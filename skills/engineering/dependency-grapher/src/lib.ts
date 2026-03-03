import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Dependency Grapher Core Library.
 * Generates Mermaid-format dependency graphs from package.json.
 */

export function generateMermaidGraph(projectDir: string): { mermaid: string; skillCount: number } {
  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`package.json not found in ${projectDir}`);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const skillName = pkg.name || path.basename(projectDir);

  let mermaid = 'graph TD\n';
  let skillCount = 0;

  for (const dep of Object.keys(deps)) {
    mermaid += `  ${skillName} --> ${dep}\n`;
    skillCount++;
  }

  if (skillCount === 0) {
    mermaid += `  ${skillName}[${skillName} (No Dependencies)]\n`;
  }

  return { mermaid, skillCount };
}
