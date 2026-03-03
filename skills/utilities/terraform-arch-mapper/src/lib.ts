/**
 * Terraform Architecture Mapper Core Library.
 */

export interface ResourceInfo {
  type: string;
  name: string;
  provider: string;
}

export function parseHCL(content: string): ResourceInfo[] {
  const resources: ResourceInfo[] = [];
  const lines = content.split('\n');

  lines.forEach((line) => {
    const match = line.match(/resource\s+['"]([^'"]+)['"]\s+['"]([^'"]+)['"]/);
    if (match) {
      resources.push({
        type: match[1],
        name: match[2],
        provider: match[1].split('_')[0]
      });
    }
  });

  return resources;
}

export function generateSummary(resources: ResourceInfo[]): string {
  const counts: Record<string, number> = {};
  resources.forEach(r => {
    counts[r.type] = (counts[r.type] || 0) + 1;
  });

  let summary = 'Architecture Summary:\n';
  for (const [type, count] of Object.entries(counts)) {
    summary += `- ${type}: ${count}\n`;
  }
  return summary.trim();
}
