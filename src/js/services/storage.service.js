/**
 * Storage Service
 * Handles data persistence to localStorage
 */

import { Logger } from '../utils/logger.js';
import { config } from '../config.js';

const logger = new Logger();

/**
 * Storage Service for persisting application state
 */
export class StorageService {
  /**
   * Save application state to localStorage
   * @param {Object} state - Application state to save
   * @returns {Promise<void>}
   */
  static async saveAppState(state) {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(config.storageKey, serialized);
      logger.info('Application state saved to storage');
    } catch (error) {
      logger.error('Error saving application state:', error);
      if (error.name === 'QuotaExceededError') {
        logger.warn('localStorage quota exceeded');
      }
      throw error;
    }
  }

  /**
   * Load application state from localStorage
   * @returns {Promise<Object|null>} Loaded state or null if not found
   */
  static async loadAppState() {
    try {
      const serialized = localStorage.getItem(config.storageKey);
      if (serialized) {
        const state = JSON.parse(serialized);
        logger.info('Application state loaded from storage');
        return state;
      }
      return null;
    } catch (error) {
      logger.error('Error loading application state:', error);
      throw error;
    }
  }

  /**
   * Clear application state from storage
   * @returns {Promise<void>}
   */
  static async clearAppState() {
    try {
      localStorage.removeItem(config.storageKey);
      logger.info('Application state cleared from storage');
    } catch (error) {
      logger.error('Error clearing application state:', error);
      throw error;
    }
  }

  /**
   * Save custom data to storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {Promise<void>}
   */
  static async saveItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      logger.info(`Saved item to storage: ${key}`);
    } catch (error) {
      logger.error(`Error saving item to storage: ${key}`, error);
      throw error;
    }
  }

  /**
   * Load custom data from storage
   * @param {string} key - Storage key
   * @returns {Promise<*|null>} Loaded value or null if not found
   */
  static async loadItem(key) {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized) {
        return JSON.parse(serialized);
      }
      return null;
    } catch (error) {
      logger.error(`Error loading item from storage: ${key}`, error);
      throw error;
    }
  }

  /**
   * Remove custom data from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  static async removeItem(key) {
    try {
      localStorage.removeItem(key);
      logger.info(`Removed item from storage: ${key}`);
    } catch (error) {
      logger.error(`Error removing item from storage: ${key}`, error);
      throw error;
    }
  }
}