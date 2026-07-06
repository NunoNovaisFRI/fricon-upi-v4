/**
 * Chart Service
 * Handles all Chart.js integration and chart lifecycle
 */

import { Logger } from '../utils/logger.js';
import { config } from '../config.js';

const logger = new Logger();
const charts = new Map();

/**
 * Chart Service for managing Chart.js instances
 */
export class ChartService {
  /**
   * Create a new chart
   * @param {string} chartId - Chart container element ID
   * @param {Object} config - Chart.js configuration
   * @returns {Object} Chart instance
   */
  static createChart(chartId, config) {
    try {
      if (!window.Chart) {
        throw new Error('Chart.js not loaded');
      }

      const ctx = document.getElementById(chartId);
      if (!ctx) {
        throw new Error(`Chart container not found: ${chartId}`);
      }

      // Destroy existing chart if present
      if (charts.has(chartId)) {
        this.destroyChart(chartId);
      }

      const chartConfig = this.mergeConfig(config);
      const chart = new window.Chart(ctx, chartConfig);
      charts.set(chartId, chart);

      logger.info(`Chart created: ${chartId}`);
      return chart;
    } catch (error) {
      logger.error(`Error creating chart: ${chartId}`, error);
      throw error;
    }
  }

  /**
   * Update chart data
   * @param {string} chartId - Chart ID
   * @param {Object} data - New chart data
   */
  static updateChart(chartId, data) {
    try {
      const chart = charts.get(chartId);
      if (!chart) {
        throw new Error(`Chart not found: ${chartId}`);
      }

      chart.data = data;
      chart.update();
      logger.info(`Chart updated: ${chartId}`);
    } catch (error) {
      logger.error(`Error updating chart: ${chartId}`, error);
      throw error;
    }
  }

  /**
   * Destroy a chart
   * @param {string} chartId - Chart ID
   */
  static destroyChart(chartId) {
    try {
      const chart = charts.get(chartId);
      if (chart) {
        chart.destroy();
        charts.delete(chartId);
        logger.info(`Chart destroyed: ${chartId}`);
      }
    } catch (error) {
      logger.error(`Error destroying chart: ${chartId}`, error);
    }
  }

  /**
   * Get chart instance
   * @param {string} chartId - Chart ID
   * @returns {Object|null} Chart instance or null
   */
  static getChart(chartId) {
    return charts.get(chartId) || null;
  }

  /**
   * Merge custom config with default config
   * @param {Object} customConfig - Custom configuration
   * @returns {Object} Merged configuration
   * @private
   */
  static mergeConfig(customConfig) {
    return {
      ...config.charts,
      ...customConfig
    };
  }

  /**
   * Destroy all charts
   */
  static destroyAllCharts() {
    try {
      charts.forEach((chart, chartId) => {
        this.destroyChart(chartId);
      });
      logger.info('All charts destroyed');
    } catch (error) {
      logger.error('Error destroying all charts', error);
    }
  }
}