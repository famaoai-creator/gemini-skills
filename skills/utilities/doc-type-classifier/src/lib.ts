import fs from 'fs';
import path from 'path';

export interface Category { name: string; keywords: string[]; }

function loadCategories() {
  const root = process.cwd();
  const catPath = path.resolve(root, 'knowledge/skills/utilities/doc-type-classifier/categories.json');
  return JSON.parse(fs.readFileSync(catPath, 'utf8')).categories;
}

export function classifyDocType(content: string, customCategories?: Category[]): string {
  const categories = customCategories || loadCategories();
  let bestMatch = 'Unknown';
  let maxMatches = 0;
  const lowerContent = content.toLowerCase();

  for (const cat of categories) {
    let matches = 0;
    for (const k of cat.keywords) {
      if (lowerContent.includes(k.toLowerCase())) matches++;
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = cat.name;
    }
  }
  return bestMatch;
}
