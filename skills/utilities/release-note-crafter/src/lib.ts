/**
 * Release Note Crafter Core Library.
 */

export interface ReleaseNoteData {
  version: string;
  changes: { type: 'feat' | 'fix' | 'chore'; message: string }[];
}

export function craftReleaseNote(data: ReleaseNoteData): string {
  let note = `# Release ${data.version}\n\n`;
  
  const feats = data.changes.filter(c => c.type === 'feat');
  const fixes = data.changes.filter(c => c.type === 'fix');

  if (feats.length > 0) {
    note += `## 🚀 New Features\n`;
    feats.forEach(f => note += `- ${f.message}\n`);
    note += '\n';
  }

  if (fixes.length > 0) {
    note += `## 🐞 Bug Fixes\n`;
    fixes.forEach(f => note += `- ${f.message}\n`);
    note += '\n';
  }

  return note.trim();
}
