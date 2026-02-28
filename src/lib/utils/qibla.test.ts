import { describe, it, expect } from 'vitest';
import { calculateQiblaBearing } from './qibla';

describe('qibla utility', () => {
  it('should calculate correct bearing for Jakarta', () => {
    // Jakarta: -6.2088, 106.8456
    const bearing = calculateQiblaBearing(-6.2088, 106.8456);
    expect(bearing).toBeCloseTo(295.15, 1);
  });

  it('should calculate correct bearing for London', () => {
    // London: 51.5074, -0.1278
    const bearing = calculateQiblaBearing(51.5074, -0.1278);
    expect(bearing).toBeCloseTo(118.99, 1);
  });

  it('should handle location very close to Mecca', () => {
    // Exact Mecca coordinates from utility
    const bearing = calculateQiblaBearing(21.422487, 39.826206);
    // When exactly at the point, atan2(0,0) is undefined but JS returns 0 usually.
    // However, the formula might yield small numbers due to float precision.
    expect(bearing % 360).toBeCloseTo(0, 1);
  });
});
