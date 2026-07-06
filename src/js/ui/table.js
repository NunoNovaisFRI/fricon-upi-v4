/**
 * Table UI Module
 * Handles data table rendering and interactions
 */

import { Logger } from '../utils/logger.js';
import { AppState } from '../state.js';
import { config } from '../config.js';

const logger = new Logger();

/**
 * Table module for rendering data tables
 */
export class Table {
  /**
   * Render data table
   * @param {string} tableId - Table container ID
   * @param {Array} data - Data to display
   * @returns {Promise<void>}
   */
  static async render(tableId = 'data-table', data = null) {
    try {
      const displayData = data || AppState.filteredData || AppState.rawData;
      if (!Array.isArray(displayData) || displayData.length === 0) {
        logger.warn('No data available for table rendering');
        return;
      }

      const container = document.getElementById(tableId);
      if (!container) {
        logger.warn(`Table container not found: ${tableId}`);
        return;
      }

      const table = this.createTable(displayData);
      container.innerHTML = '';
      container.appendChild(table);

      logger.info(`Table rendered: ${tableId}`);
    } catch (error) {
      logger.error(`Error rendering table: ${tableId}`, error);
      throw error;
    }
  }

  /**
   * Create table HTML element
   * @param {Array} data - Data to display
   * @returns {HTMLTableElement} Table element
   * @private
   */
  static createTable(data) {
    const table = document.createElement('table');
    table.className = 'data-table table table-striped';

    // Create header
    const thead = this.createTableHeader(data[0]);
    table.appendChild(thead);

    // Create body
    const tbody = this.createTableBody(data);
    table.appendChild(tbody);

    return table;
  }

  /**
   * Create table header
   * @param {Object} firstRow - First data row (for column names)
   * @returns {HTMLTableSectionElement} Table head element
   * @private
   */
  static createTableHeader(firstRow) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    Object.keys(firstRow).forEach(key => {
      const th = document.createElement('th');
      th.textContent = key;
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    return thead;
  }

  /**
   * Create table body
   * @param {Array} data - Data rows
   * @returns {HTMLTableSectionElement} Table body element
   * @private
   */
  static createTableBody(data) {
    const tbody = document.createElement('tbody');

    data.forEach(row => {
      const tr = document.createElement('tr');
      
      Object.values(row).forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    return tbody;
  }

  /**
   * Sort table by column
   * @param {string} columnName - Column to sort by
   * @param {string} order - Sort order (asc, desc)
   */
  static sort(columnName, order = 'asc') {
    const data = AppState.filteredData || AppState.rawData;
    if (!Array.isArray(data)) return;

    data.sort((a, b) => {
      const aVal = a[columnName];
      const bVal = b[columnName];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    logger.info(`Table sorted by ${columnName} (${order})`);
  }
}