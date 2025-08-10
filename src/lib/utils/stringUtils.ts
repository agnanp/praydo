export function formattedLocation(str: string): string {
  if (!str) return "";
  const result = str
    .split(',')
    .slice(0, 2)
    .map(part => part.trim())
    .join(', ');

  return result.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}
