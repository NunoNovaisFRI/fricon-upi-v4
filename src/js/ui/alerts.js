/**
 * Alerts UI Module
 * Handles alert rendering and management
 */

import { Logger } from '../utils/logger.js';
import { AppState } from '../state.js';
import { config } from '../config.js';

const logger = new Logger();

/**
 * Alerts module for managing and rendering alerts
 */
export class Alerts {
  /**
   * Show alert notification
   * @param {string} message - Alert message
   * @param {string} type - Alert type (info, success, warning, danger)
   * @param {number} duration - Duration in milliseconds (0 = persistent)
   */
  static show(message, type = 'info', duration = 5000) {
    try {
      const alertElement = this.createAlert(message, type);
      document.body.appendChild(alertElement);

      if (duration > 0) {
        setTimeout(() => {
          alertElement.remove();
        }, duration);
      }

      logger.info(`Alert shown: ${type} - ${message}`);
    } catch (error) {
      logger.error('Error showing alert:', error);
    }
  }

  /**
   * Create alert element
   * @param {string} message - Alert message
   * @param {string} type - Alert type
   * @returns {HTMLElement} Alert element
   * @private
   */
  static createAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    return alertDiv;
  }

  /**
   * Display alerts from report
   * @returns {Promise<void>}
   */
  static async displayReportAlerts() {
    try {
      if (!AppState.report || !AppState.report.alertas) {
        return;
      }

      const alerts = AppState.report.alertas.slice(0, config.alertLimit);
      alerts.forEach(alert => {
        this.show(alert.message, alert.type || 'warning', 0);
      });

      logger.info(`Displayed ${alerts.length} report alerts`);
    } catch (error) {
      logger.error('Error displaying report alerts:', error);
    }
  }

  /**
   * Clear all alerts
   */
  static clearAll() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
    logger.info('All alerts cleared');
  }
}