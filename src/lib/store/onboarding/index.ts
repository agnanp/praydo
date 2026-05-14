import { RuneStore } from '@tauri-store/svelte';

export interface OnboardingState {
  completed: boolean;
  hydrated: boolean;
  [key: string]: any;
}

export const onboardingState = new RuneStore<OnboardingState>(
  'onboarding',
  { completed: false, hydrated: false },
  {
    saveOnChange: true,
    saveStrategy: 'debounce',
    saveInterval: 1000,
    autoStart: true,
    hooks: {
      beforeFrontendSync: (state) => ({ ...state, hydrated: true }),
    },
  }
);
