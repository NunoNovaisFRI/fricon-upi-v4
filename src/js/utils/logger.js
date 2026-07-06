/**
 * Logger Utility
 * Provides consistent logging across the application
 */

import { config } from '../config.js';

/**
 * Logger utility class for application logging
 */
export class Logger {
  /**
   * Log info level message
   * @param {string} message - Log message
   * @param {*} data - Optional data to log
   */
  static info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, data || '');
    
    if (config.debugMode) {
      this.persistLog('info', message, data);
    }
  }

  /**
   * Log warn level message
   * @param {string} message - Log message
   * @param {*} data - Optional data to log
   */
  static warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, data || '');
    
    if (config.debugMode) {
      this.persistLog('warn', message, data);
    }
  }

  /**
   * Log error level message
   * @param {string} message - Log message
   * @param {*} error - Error object or data
   */
  static error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error || '');
    
    if (config.debugMode) {
      this.persistLog('error', message, error);
    }
  }

  /**
   * Persist log to storage for debugging
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {*} data - Log data
   * @private
   */
  static persistLog(level, message, data) {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        level,
        message,
        data
      });
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (e) {
      // Silently fail if storage is unavailable
    }
  }
}

// Export singleton instance
export const logger = new Logger();