/**
 * Filters UI Module
 * Handles filter UI and state management
 */

import { Logger } from '../utils/logger.js';
import { AppState } from '../state.js';

const logger = new Logger();

/**
 * Filters module for managing data filters
 */
export class Filters {
  /**
   * Apply filter to data
   * @param {string} filterName - Filter name
   * @param {*} filterValue - Filter value
   * @returns {Array} Filtered data
   */
  static applyFilter(filterName, filterValue) {
    try {
      AppState.setFilter(filterName, filterValue);
      const filtered = this.filterData();
      AppState.updateFilteredData(filtered);
      logger.info(`Filter applied: ${filterName} = ${filterValue}`);
      return filtered;
    } catch (error) {
      logger.error('Error applying filter:', error);
      throw error;
    }
  }

  /**
   * Clear filter
   * @param {string} filterName - Filter name
   * @returns {Array} Filtered data
   */
  static clearFilter(filterName) {
    try {
      AppState.ui.activeFilters = AppState.ui.activeFilters || {};
      delete AppState.ui.activeFilters[filterName];
      const filtered = this.filterData();
      AppState.updateFilteredData(filtered);
      logger.info(`Filter cleared: ${filterName}`);
      return filtered;
    } catch (error) {
      logger.error('Error clearing filter:', error);
      throw error;
    }
  }

  /**
   * Clear all filters
   * @returns {Array} Unfiltered data
   */
  static clearAllFilters() {
    try {
      AppState.clearFilters();
      AppState.updateFilteredData(AppState.rawData);
      logger.info('All filters cleared');
      return AppState.rawData;
    } catch (error) {
      logger.error('Error clearing all filters:', error);
      throw error;
    }
  }

  /**
   * Filter data based on active filters
   * @returns {Array} Filtered data
   * @private
   */
  static filterData() {
    if (!AppState.rawData || AppState.rawData.length === 0) {
      return [];
    }

    if (!AppState.ui.activeFilters || Object.keys(AppState.ui.activeFilters).length === 0) {
      return AppState.rawData;
    }

    return AppState.rawData.filter(row => {
      return Object.entries(AppState.ui.activeFilters).every(([key, value]) => {
        return row[key] === value;
      });
    });
  }

  /**
   * Get available filter values for a column
   * @param {string} columnName - Column name
   * @returns {Array} Unique values
   */
  static getAvailableValues(columnName) {
    if (!AppState.rawData || AppState.rawData.length === 0) {
      return [];
    }

    const values = new Set();
    AppState.rawData.forEach(row => {
      if (row[columnName] !== undefined && row[columnName] !== null) {
        values.add(row[columnName]);
      }
    });

    return Array.from(values).sort();
  }
}