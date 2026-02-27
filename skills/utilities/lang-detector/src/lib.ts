// @ts-ignore
import LanguageDetect from 'languagedetect';

const lngDetector = new LanguageDetect();

export interface LangDetectResult {
  language: string;
  confidence: number;
}

export function detectLanguage(content: string): LangDetectResult {
  const results = lngDetector.detect(content, 1);
  if (results.length > 0) {
    return { language: results[0][0], confidence: results[0][1] };
  }
  return { language: 'unknown', confidence: 0 };
}
