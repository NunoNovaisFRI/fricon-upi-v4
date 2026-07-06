/**
 * Fricon UPI v4 - Global Application State
 * Centralized state management for the entire application
 */

/**
 * Global application state object
 * All modules communicate through this centralized state
 * @type {Object}
 */
export const AppState = {
  // Raw data from Excel file
  rawData: [],

  // Filtered data based on current filters
  filteredData: [],

  // Generated report with KPIs, metrics, alerts, etc.
  report: {
    kpis: {},
    producao: {},
    artigos: [],
    secoes: [],
    alertas: [],
    tendencias: {},
    medias: {},
    resumo: {}
  },

  // Chart instances
  charts: {},

  // Application configuration
  config: {},

  // UI state
  ui: {
    activeFilters: {},
    selectedCharts: [],
    theme: 'light',
    sidebarCollapsed: false
  },

  /**
   * Reset state to initial values
   */
  reset() {
    this.rawData = [];
    this.filteredData = [];
    this.report = {
      kpis: {},
      producao: {},
      artigos: [],
      secoes: [],
      alertas: [],
      tendencias: {},
      medias: {},
      resumo: {}
    };
    this.charts = {};
    this.ui.activeFilters = {};
  },

  /**
   * Update filtered data based on current filters
   * @param {Array} data - New filtered data
   */
  updateFilteredData(data) {
    this.filteredData = data;
  },

  /**
   * Get current filter value
   * @param {string} filterName - Name of the filter
   * @returns {*} Filter value
   */
  getFilter(filterName) {
    return this.ui.activeFilters[filterName];
  },

  /**
   * Set filter value
   * @param {string} filterName - Name of the filter
   * @param {*} value - Filter value
   */
  setFilter(filterName, value) {
    this.ui.activeFilters[filterName] = value;
  },

  /**
   * Clear all filters
   */
  clearFilters() {
    this.ui.activeFilters = {};
  }
};