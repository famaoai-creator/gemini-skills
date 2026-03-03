import * as classifier from '@agent/core/classifier';
import { KnowledgeProvider } from '@agent/core/knowledge-provider';
import { safeReadFile } from '@agent/core/secure-io';

export interface ClassifierRules {
  resultKey: string;
  categories: Record<string, string[]>;
}

export function classifyText(filePath: string, ruleSet: 'doc-type' | 'domain' | 'intent') {
  const rules = KnowledgeProvider.getJson<ClassifierRules>(`skills/utilities/${ruleSet}-classifier/rules.json`, {
    resultKey: ruleSet,
    categories: {}
  });

  return classifier.classifyFile(filePath, rules.categories, {
    resultKey: rules.resultKey,
  });
}
