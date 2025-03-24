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
