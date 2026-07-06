/**
 * Format Utility
 * Provides formatting functions for dates, numbers, and percentages
 */

import { config } from '../config.js';

/**
 * Format date according to configuration
 * @param {Date|string} date - Date to format
 * @param {string} format - Date format (optional, uses config default)
 * @returns {string} Formatted date
 */
export function formatDate(date, format = config.dateFormat) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
  if (format === 'MM/DD/YYYY') return `${month}/${day}/${year}`;

  return d.toLocaleDateString();
}

/**
 * Format number according to configuration
 * @param {number} value - Number to format
 * @param {number} decimals - Decimal places (optional)
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = config.numberDecimals) {
  if (value === null || value === undefined) return '';
  
  const num = parseFloat(value);
  if (isNaN(num)) return '';

  const fixed = num.toFixed(decimals);
  const parts = fixed.split('.');
  
  // Add thousand separator
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSeparator);
  
  // Replace decimal separator
  return parts.join(config.decimalSeparator);
}

/**
 * Format percentage according to configuration
 * @param {number} value - Percentage value (0-1 or 0-100)
 * @param {number} decimals - Decimal places (optional)
 * @returns {string} Formatted percentage
 */
export function formatPercent(value, decimals = config.percentDecimals) {
  if (value === null || value === undefined) return '';
  
  const num = parseFloat(value);
  if (isNaN(num)) return '';

  // Convert to percentage if value is between 0 and 1
  const percentage = num > 1 ? num : num * 100;
  
  return `${formatNumber(percentage, decimals)}%`;
}

/**
 * Format currency
 * @param {number} value - Currency value
 * @param {string} currency - Currency code (EUR, USD, etc.)
 * @returns {string} Formatted currency
 */
export function formatCurrency(value, currency = 'EUR') {
  if (value === null || value === undefined) return '';
  
  const num = parseFloat(value);
  if (isNaN(num)) return '';

  const formatter = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency
  });

  return formatter.format(num);
}