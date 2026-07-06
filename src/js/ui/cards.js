/**
 * Cards UI Module
 * Handles KPI card rendering
 */

import { Logger } from '../utils/logger.js';
import { AppState } from '../state.js';
import { formatNumber, formatPercent } from '../utils/format.js';

const logger = new Logger();

/**
 * Cards module for rendering KPI cards
 */
export class Cards {
  /**
   * Render KPI cards
   * @returns {Promise<void>}
   */
  static async render() {
    try {
      if (!AppState.report || !AppState.report.kpis) {
        logger.warn('No KPI data available for rendering cards');
        return;
      }

      const container = document.querySelector('.kpi-cards-container');
      if (!container) {
        logger.warn('KPI cards container not found');
        return;
      }

      const kpis = AppState.report.kpis;
      container.innerHTML = '';

      Object.entries(kpis).forEach(([key, value]) => {
        const card = this.createCard(key, value);
        container.appendChild(card);
      });

      logger.info('KPI cards rendered successfully');
    } catch (error) {
      logger.error('Error rendering KPI cards:', error);
      throw error;
    }
  }

  /**
   * Create a single KPI card
   * @param {string} title - Card title
   * @param {*} value - Card value
   * @returns {HTMLElement} Card element
   * @private
   */
  static createCard(title, value) {
    const card = document.createElement('div');
    card.className = 'kpi-card';
    
    let displayValue = value;
    if (typeof value === 'number') {
      displayValue = value > 1 ? formatPercent(value) : formatNumber(value);
    }

    card.innerHTML = `
      <div class="card-header">${title}</div>
      <div class="card-value">${displayValue}</div>
    `;

    return card;
  }
}