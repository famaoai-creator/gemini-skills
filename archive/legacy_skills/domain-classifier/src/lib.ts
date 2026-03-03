import * as fs from 'node:fs';
import * as yaml from 'js-yaml';
import * as classifier from '@agent/core/classifier';

export interface ClassifierRules {
  resultKey: string;
  categories: Record<string, string[]>;
}

export function loadRules(filePath: string): ClassifierRules {
  if (!fs.existsSync(filePath)) throw new Error(`Rules file not found: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content) as ClassifierRules;
}

export function classifyDomain(filePath: string, rules: ClassifierRules) {
  return classifier.classifyFile(filePath, rules.categories, {
    resultKey: rules.resultKey,
  });
}
