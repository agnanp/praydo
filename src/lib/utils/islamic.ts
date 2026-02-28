export const hijriMonths = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhul-Qadah',
  'Dhul-Hijjah',
];

/**
 * Formats a Hijri date object into a string.
 *
 * @param hijriDate - The Hijri date object (with day, month, year).
 * @returns A formatted Hijri date string.
 */
export function formatHijriDate(hijriDate: {
  day: number;
  month: number;
  year: number;
}): string {
  return `${hijriDate.day} ${hijriMonths[hijriDate.month - 1]} ${hijriDate.year} AH`;
}
