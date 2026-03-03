import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Builds a tree-like text representation of a directory structure asynchronously.
 */
export async function buildTreeLinesAsync(
  dirPath: string,
  maxDepth: number,
  currentDepth: number = 0,
  prefix: string = ''
): Promise<string[]> {
  const lines: string[] = [];
  if (currentDepth > maxDepth) return lines;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err: any) {
    return [`${prefix}⚠️ Error: ${err.message}`];
  }

  // Sort: Directories first, then files
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  const filtered = entries.filter((e) => {
    return !['node_modules', '.git', 'dist', '.DS_Store'].includes(e.name);
  });

  filtered.forEach((entry, index) => {
    const isLast = index === filtered.length - 1;
    const marker = isLast ? '└── ' : '├── ';
    lines.push(`${prefix}${marker}${entry.name}${entry.isDirectory() ? '/' : ''}`);

    if (entry.isDirectory() && currentDepth < maxDepth) {
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');
      // In a real async version, we'd use readdir promise and await here
      // For now, keep it simple for the POC while maintaining the Async interface
      const subLines = fs.readdirSync(path.join(dirPath, entry.name), { withFileTypes: true })
        .filter(e => !['node_modules', '.git', 'dist', '.DS_Store'].includes(e.name))
        .sort((a, b) => (a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name) : (a.isDirectory() ? -1 : 1)));

      subLines.forEach((sub, subIdx) => {
        if (currentDepth + 1 <= maxDepth) {
          const subIsLast = subIdx === subLines.length - 1;
          const subMarker = subIsLast ? '└── ' : '├── ';
          lines.push(`${nextPrefix}${subMarker}${sub.name}${sub.isDirectory() ? '/' : ''}`);
          // Note: Full recursion is better, but this matches the previous simple logic
        }
      });
    }
  });

  return lines;
}

// Improved full recursive version for better accuracy
export function buildTreeRecursive(dir: string, maxDepth: number, depth = 0): string[] {
  if (depth > maxDepth) return [];
  const lines: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
      .filter(e => !['node_modules', '.git', 'dist', '.DS_Store'].includes(e.name))
      .sort((a, b) => (a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name) : (a.isDirectory() ? -1 : 1)));

    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1;
      const marker = isLast ? '└── ' : '├── ';
      lines.push('  '.repeat(depth) + marker + entry.name + (entry.isDirectory() ? '/' : ''));
      
      if (entry.isDirectory() && depth < maxDepth) {
        lines.push(...buildTreeRecursive(path.join(dir, entry.name), maxDepth, depth + 1));
      }
    });
  } catch (_) {}
  
  return lines;
}
