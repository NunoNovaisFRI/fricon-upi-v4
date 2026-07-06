/**
 * Dates Utility
 * Provides date manipulation utilities
 */

/**
 * Get current date
 * @returns {Date} Current date
 */
export function getCurrentDate() {
  return new Date();
}

/**
 * Get date range
 * @param {number} days - Number of days in range
 * @returns {Object} Object with startDate and endDate
 */
export function getDateRange(days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate,
    endDate
  };
}

/**
 * Add days to date
 * @param {Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get difference between dates in days
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in days
 */
export function getDaysDifference(date1, date2) {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Get start of month
 * @param {Date} date - Reference date
 * @returns {Date} Start of month
 */
export function getStartOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get end of month
 * @param {Date} date - Reference date
 * @returns {Date} End of month
 */
export function getEndOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}