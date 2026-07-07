/**
 * RepositoryInterface
 * 
 * Defines the contract for all repository implementations.
 * Ensures all repositories provide consistent API for data access.
 */

class RepositoryInterface {
  /**
   * Load records into the repository
   * @param {Array} records - Array of records to load
   * @throws {Error} If records is not an array
   */
  load(records) {
    throw new Error('load() must be implemented');
  }

  /**
   * Clear all records from the repository
   */
  clear() {
    throw new Error('clear() must be implemented');
  }

  /**
   * Get total count of records
   * @returns {number} Total number of records
   */
  count() {
    throw new Error('count() must be implemented');
  }

  /**
   * Check if repository is loaded and has records
   * @returns {boolean} True if repository has records
   */
  exists() {
    throw new Error('exists() must be implemented');
  }

  /**
   * Get all records
   * @returns {Array} Copy of all records
   */
  findAll() {
    throw new Error('findAll() must be implemented');
  }

  /**
   * Find records by date
   * @param {string|Date} date - Date to search (YYYY-MM-DD or Date object)
   * @returns {Array} Records for that date
   */
  findByDate(date) {
    throw new Error('findByDate() must be implemented');
  }

  /**
   * Find records between dates (inclusive)
   * @param {string|Date} start - Start date
   * @param {string|Date} end - End date
   * @returns {Array} Records in date range
   */
  findBetweenDates(start, end) {
    throw new Error('findBetweenDates() must be implemented');
  }

  /**
   * Find records by operator name
   * @param {string} operator - Operator name
   * @returns {Array} Records for operator
   */
  findByOperator(operator) {
    throw new Error('findByOperator() must be implemented');
  }

  /**
   * Find records by article code
   * @param {string} articleCode - Article code
   * @returns {Array} Records for article
   */
  findByArticle(articleCode) {
    throw new Error('findByArticle() must be implemented');
  }

  /**
   * Find records by article name
   * @param {string} articleName - Article name
   * @returns {Array} Records for article name
   */
  findByArticleName(articleName) {
    throw new Error('findByArticleName() must be implemented');
  }

  /**
   * Find records by warehouse
   * @param {string} warehouse - Warehouse name/code
   * @returns {Array} Records for warehouse
   */
  findByWarehouse(warehouse) {
    throw new Error('findByWarehouse() must be implemented');
  }

  /**
   * Find records by zone
   * @param {string} zone - Zone name/code
   * @returns {Array} Records for zone
   */
  findByZone(zone) {
    throw new Error('findByZone() must be implemented');
  }

  /**
   * Find records by shelf
   * @param {string} shelf - Shelf name/code
   * @returns {Array} Records for shelf
   */
  findByShelf(shelf) {
    throw new Error('findByShelf() must be implemented');
  }

  /**
   * Find records by movement type
   * @param {string} type - Movement type (IN, OUT, ADJUST, etc.)
   * @returns {Array} Records of type
   */
  findByMovementType(type) {
    throw new Error('findByMovementType() must be implemented');
  }

  /**
   * Find records by document number
   * @param {string|number} document - Document number
   * @returns {Array} Records for document
   */
  findByDocument(document) {
    throw new Error('findByDocument() must be implemented');
  }

  /**
   * Find records by batch code
   * @param {string} batch - Batch code
   * @returns {Array} Records for batch
   */
  findByBatch(batch) {
    throw new Error('findByBatch() must be implemented');
  }

  /**
   * Find records by department
   * @param {string} department - Department name/code
   * @returns {Array} Records for department
   */
  findByDepartment(department) {
    throw new Error('findByDepartment() must be implemented');
  }

  /**
   * Find records by barcode
   * @param {string} barcode - Product barcode
   * @returns {Array} Records for barcode
   */
  findByBarcode(barcode) {
    throw new Error('findByBarcode() must be implemented');
  }

  /**
   * Group records by operator, returning counts
   * @returns {Map} Map of operator -> count
   */
  groupByOperator() {
    throw new Error('groupByOperator() must be implemented');
  }

  /**
   * Group records by article, returning counts
   * @returns {Map} Map of article -> count
   */
  groupByArticle() {
    throw new Error('groupByArticle() must be implemented');
  }

  /**
   * Group records by zone, returning counts
   * @returns {Map} Map of zone -> count
   */
  groupByZone() {
    throw new Error('groupByZone() must be implemented');
  }

  /**
   * Group records by warehouse, returning counts
   * @returns {Map} Map of warehouse -> count
   */
  groupByWarehouse() {
    throw new Error('groupByWarehouse() must be implemented');
  }

  /**
   * Group records by shelf, returning counts
   * @returns {Map} Map of shelf -> count
   */
  groupByShelf() {
    throw new Error('groupByShelf() must be implemented');
  }

  /**
   * Group records by department, returning counts
   * @returns {Map} Map of department -> count
   */
  groupByDepartment() {
    throw new Error('groupByDepartment() must be implemented');
  }

  /**
   * Group records by movement type, returning counts
   * @returns {Map} Map of type -> count
   */
  groupByMovementType() {
    throw new Error('groupByMovementType() must be implemented');
  }

  /**
   * Get statistics about the repository
   * @returns {Object} Statistics object
   */
  getStatistics() {
    throw new Error('getStatistics() must be implemented');
  }

  /**
   * Get top N items by frequency for articles
   * @param {number} limit - Number of top items to return
   * @returns {Array} Array of {key, count} objects sorted by count
   */
  topArticles(limit) {
    throw new Error('topArticles() must be implemented');
  }

  /**
   * Get top N items by frequency for operators
   * @param {number} limit - Number of top items to return
   * @returns {Array} Array of {key, count} objects sorted by count
   */
  topOperators(limit) {
    throw new Error('topOperators() must be implemented');
  }

  /**
   * Get top N items by frequency for zones
   * @param {number} limit - Number of top items to return
   * @returns {Array} Array of {key, count} objects sorted by count
   */
  topZones(limit) {
    throw new Error('topZones() must be implemented');
  }

  /**
   * Get top N items by frequency for warehouses
   * @param {number} limit - Number of top items to return
   * @returns {Array} Array of {key, count} objects sorted by count
   */
  topWarehouses(limit) {
    throw new Error('topWarehouses() must be implemented');
  }

  /**
   * Get top N items by frequency for shelves
   * @param {number} limit - Number of top items to return
   * @returns {Array} Array of {key, count} objects sorted by count
   */
  topShelves(limit) {
    throw new Error('topShelves() must be implemented');
  }

  /**
   * Full-text search across multiple fields
   * @param {string} text - Search text
   * @returns {Array} Records matching search
   */
  search(text) {
    throw new Error('search() must be implemented');
  }
}

module.exports = { RepositoryInterface };
