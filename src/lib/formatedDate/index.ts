export const getCurrentDateFormatted = (): string => {
  const today = new Date();

  // Get the year (e.g., 2025)
  const year = today.getFullYear();

  // Get the month (0-indexed, so add 1 for actual month number)
  // Use padStart to ensure two digits (e.g., 01 for January, 12 for December)
  const month = String(today.getMonth() + 1).padStart(2, '0');

  // Get the day of the month
  // Use padStart to ensure two digits (e.g., 05 for 5th, 28 for 28th)
  const day = String(today.getDate()).padStart(2, '0');

  // Combine them into the yyyy-mm-dd format
  return `${year}-${month}-${day}`;
};

export const formatDateToIndonesian = (dateString: string): string => {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];

  // The input is like "Sabtu, 19/07/2025"
  const parts = dateString.split(', ');
  const dayName = parts[0];
  const datePart = parts[1];

  const [day, monthIndex, year] = datePart.split('/');
  
  const monthName = months[parseInt(monthIndex, 10) - 1];

  return `${dayName}, ${day} ${monthName} ${year}`;
};
