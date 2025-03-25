/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Debounce a function
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to wait before calling the function
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  let timeout: NodeJS.Timeout;

  // Explicitly define `this` as `any`
  return function executedFunction(this: any, ...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
