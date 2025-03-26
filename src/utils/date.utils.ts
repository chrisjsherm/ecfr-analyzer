import { DateTime } from "luxon";

/**
 * Validates if a date string is in the format YYYY-MM-DD
 * @param {string} dateString
 * @returns {boolean}
 */
export function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get all dates in a range
 * @param start - Start date
 * @param end - End date
 * @returns Array of formatted date strings
 */
export function getDatesInRange(
  start: DateTime,
  end: DateTime,
  format: string
): string[] {
  const dates: string[] = [];
  let current = start;

  while (current <= end) {
    dates.push(current.toFormat(format));
    current = current.plus({ days: 1 });
  }

  return dates;
}
