/**
 * Calculates the Qibla bearing (direction to Mecca) from a given latitude and longitude.
 *
 * @param latitude - The latitude of the location in degrees.
 * @param longitude - The longitude of the location in degrees.
 * @returns The Qibla bearing in degrees (0-360).
 */
export function calculateQiblaBearing(
  latitude: number,
  longitude: number
): number {
  const lat1 = latitude * (Math.PI / 180);
  const lon1 = longitude * (Math.PI / 180);

  // Makkah (Mecca) coordinates
  const MAKKAH_LAT = 21.422487 * (Math.PI / 180);
  const MAKKAH_LON = 39.826206 * (Math.PI / 180);

  const dLon = MAKKAH_LON - lon1;

  const y = Math.sin(dLon) * Math.cos(MAKKAH_LAT);
  const x =
    Math.cos(lat1) * Math.sin(MAKKAH_LAT) -
    Math.sin(lat1) * Math.cos(MAKKAH_LAT) * Math.cos(dLon);

  let bearing = Math.atan2(y, x);
  bearing = bearing * (180 / Math.PI);

  return (bearing + 360) % 360;
}
