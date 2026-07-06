/**
 * Fricon UPI v4 - Application Configuration
 * Centralized configuration for the entire application
 */

/**
 * Application configuration object
 * Contains all configurable values - no hardcoded values should exist elsewhere
 * @type {Object}
 */
export const config = {
  // Application version
  version: '4.0.0',

  // Company name
  company: 'Fricon',

  // Application title
  title: 'Fricon UPI - Production KPI Management',

  // Alert limit
  alertLimit: 10,

  // Theme (light, dark)
  theme: 'light',

  // Power Automate webhook URL
  powerAutomateUrl: process.env.REACT_APP_POWER_AUTOMATE_URL || '',

  // Report generation time (HH:mm format)
  reportTime: '08:00',

  // Date format
  dateFormat: 'DD/MM/YYYY',

  // Number decimal separator
  decimalSeparator: ',',

  // Number thousand separator
  thousandSeparator: '.',

  // Percentage decimal places
  percentDecimals: 2,

  // Number decimal places
  numberDecimals: 2,

  // Storage key for persisting state
  storageKey: 'fricon_upi_state',

  // Enable detailed logging
  debugMode: false,

  // Chart configuration
  charts: {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 750
    }
  },

  // KPI thresholds
  thresholds: {
    critical: 0.7,
    warning: 0.85,
    good: 0.95
  },

  // Export options
  exportFormats: ['excel', 'csv', 'json', 'pdf'],

  // Default items per page in tables
  itemsPerPage: 25,

  // Enable auto-save
  autoSave: true,

  // Auto-save interval in seconds
  autoSaveInterval: 300
};