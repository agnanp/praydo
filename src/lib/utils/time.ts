/**
 * Parses a time string (e.g., '5:30 AM', '17:45') into a Date object for the given base date.
 *
 * @param timeString - The time string to parse.
 * @param baseDate - The Date object to use for the year, month, and day.
 * @returns A new Date object with the parsed time.
 */
export function parseTimeString(timeString: string, baseDate: Date): Date {
  const date = new Date(baseDate);
  if (!timeString) return date;

  // Handle formats like '5:30 AM', '12:00 PM', '17:45', '5:30'
  const parts = timeString.trim().split(/\s+/);
  const timePart = parts[0];
  const amPmPart = parts[1]?.toUpperCase();

  let [hours, minutes] = timePart.split(':').map(Number);

  if (amPmPart === 'PM' && hours < 12) {
    hours += 12;
  } else if (amPmPart === 'AM' && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
}
