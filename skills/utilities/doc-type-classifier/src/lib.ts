export interface Category {
  name: string;
  keywords: string[];
}

export function classifyDocType(content: string, categories: Category[]): string {
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
