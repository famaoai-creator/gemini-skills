/**
 * Onboarding Wizard Core Library.
 */

export interface OnboardingState {
  step: number;
  completedSteps: string[];
}

export function nextStep(state: OnboardingState): OnboardingState {
  return {
    ...state,
    step: state.step + 1
  };
}

export function generateWelcomeMessage(userName: string): string {
  return `Welcome to the Gemini Skills Ecosystem, ${userName}! Let's get you started.`;
}
