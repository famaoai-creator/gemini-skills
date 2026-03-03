import { describe, it, expect } from 'vitest';
import { nextStep, generateWelcomeMessage } from './lib';

describe('onboarding-wizard lib', () => {
  it('should increment onboarding step', () => {
    const state = { step: 1, completedSteps: [] };
    const next = nextStep(state);
    expect(next.step).toBe(2);
  });

  it('should generate personalized welcome message', () => {
    const msg = generateWelcomeMessage('Alice');
    expect(msg).toContain('Welcome');
    expect(msg).toContain('Alice');
  });
});
