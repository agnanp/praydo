import { onboardingState } from '$lib/store/onboarding';

export class OnboardingManager {
  currentStep = $state(0);
  isComplete = $state(false);
  totalSteps = 3; // 0: Location, 1: Method, 2: Notifications

  nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep += 1;
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
    }
  }

  complete() {
    onboardingState.state.completed = true;
    this.isComplete = true;
  }

  get isFirstStep() {
    return this.currentStep === 0;
  }
  get isLastStep() {
    return this.currentStep === this.totalSteps - 1;
  }
}
