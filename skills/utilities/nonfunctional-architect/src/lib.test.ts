import { describe, it, expect } from 'vitest';
import { cleanRequirementText } from './lib';

describe('nonfunctional-architect lib', () => {
  it('should clean text', () => {
    const nl = String.fromCharCode(10);
    const raw = '  line1 ' + nl + '  line2  ';
    expect(cleanRequirementText(raw)).toBe('line1 line2');
  });
});
