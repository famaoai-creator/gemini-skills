/**
 * Knowledge Harvester Core Library.
 */

export interface Snippet {
  title: string;
  tags: string[];
  content: string;
}

export function extractSnippets(text: string): Snippet[] {
  const snippets: Snippet[] = [];
  const sections = text.split(/^# /m).filter(Boolean);

  sections.forEach(s => {
    const lines = s.split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    
    // Simple tag extraction from content
    const tags = (content.match(/#(\w+)/g) || []).map(t => t.slice(1));

    snippets.push({ title, tags, content });
  });

  return snippets;
}

export function distillKnowledge(snippets: Snippet[]): string {
  let output = 'Distilled Knowledge Report\n\n';
  snippets.forEach(s => {
    output += `### ${s.title}\n- Tags: ${s.tags.join(', ') || 'none'}\n\n`;
  });
  return output.trim();
}
