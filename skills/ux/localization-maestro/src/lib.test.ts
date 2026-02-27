import { describe, it, expect } from 'vitest';
import { calculateReadinessScore } from './lib';

describe('localization-maestro lib', () => {
  it('should return low score if not ready', () => {
    expect(calculateReadinessScore({ i18nReady: false })).toBe(20);
  });
  it('should return high score if ready', () => {
    expect(calculateReadinessScore({ i18nReady: true })).toBe(100);
  });
});
