import { describe, it, expect } from 'vitest';
import { PrayTime } from './index';

describe('PrayTime', () => {
  describe('utcOffset', () => {
    it('should set offset in minutes when passing minutes', () => {
      const pt = new PrayTime();
      pt.utcOffset(420);
      // @ts-ignore
      expect(pt.settings.utcOffset).toBe(420);
    });

    it('should NOT convert small numbers to hours automatically (removing ambiguity)', () => {
      const pt = new PrayTime();
      pt.utcOffset(8);
      // @ts-ignore
      expect(pt.settings.utcOffset).toBe(8); // Now treated as 8 minutes, not 8 hours
    });

    it('should correctly handle "auto"', () => {
      const pt = new PrayTime();
      pt.utcOffset('auto');
      // @ts-ignore
      expect(pt.settings.utcOffset).toBe('auto');
    });
  });
});
