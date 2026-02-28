import { describe, it, expect, beforeEach } from 'vitest';
import { OnboardingManager } from './OnboardingManager.svelte';

describe('OnboardingManager', () => {
  let manager: OnboardingManager;

  beforeEach(() => {
    manager = new OnboardingManager();
  });

  it('should start at step 0', () => {
    expect(manager.currentStep).toBe(0);
  });

  it('should move to next step', () => {
    manager.nextStep();
    expect(manager.currentStep).toBe(1);
  });

  it('should move to previous step', () => {
    manager.nextStep();
    manager.prevStep();
    expect(manager.currentStep).toBe(0);
  });

  it('should not move below step 0', () => {
    manager.prevStep();
    expect(manager.currentStep).toBe(0);
  });

  it('should not move beyond total steps', () => {
    manager.nextStep(); // 1
    manager.nextStep(); // 2
    manager.nextStep(); // 3 (beyond total 3 steps: 0, 1, 2)
    expect(manager.currentStep).toBe(2);
  });

  it('should identify steps correctly', () => {
    expect(manager.isFirstStep).toBe(true);
    expect(manager.isLastStep).toBe(false);

    manager.nextStep();
    expect(manager.isFirstStep).toBe(false);
    expect(manager.isLastStep).toBe(false);

    manager.nextStep();
    expect(manager.isFirstStep).toBe(false);
    expect(manager.isLastStep).toBe(true);
  });
});
