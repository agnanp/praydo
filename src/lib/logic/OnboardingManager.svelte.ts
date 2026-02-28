export class OnboardingManager {
  currentStep = $state(0);
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

  get isFirstStep() {
    return this.currentStep === 0;
  }
  get isLastStep() {
    return this.currentStep === this.totalSteps - 1;
  }
}
