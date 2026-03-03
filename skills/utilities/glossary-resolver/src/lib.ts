/**
 * Glossary Resolver Core Library.
 */

export interface Glossary {
  terms: Record<string, string>;
}

export function resolveTerms(text: string, glossary: Glossary): string {
  let resolved = text;
  for (const [term, definition] of Object.entries(glossary.terms)) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    resolved = resolved.replace(regex, `${term} (${definition})`);
  }
  return resolved;
}
