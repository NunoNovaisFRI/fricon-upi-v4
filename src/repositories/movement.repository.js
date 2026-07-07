const { RepositoryInterface } = require('../interfaces/repository.interface');

/**
 * MovementRepository
 * 
 * Core data access layer for inventory movements.
 * 
 * Single source of truth for all MovementRecord data.
 * 
 * Responsibilities:
 * - Store and manage MovementRecord instances
 * - Build and maintain indexes for fast lookups
 * - Provide query methods
 * - Calculate statistics and aggregations
 * - Hide internal data structure completely
 * 
 * Architecture:
 * - Internal storage: array of MovementRecord
 * - Indexes: Map objects for O(1) lookups on key fields
 * - Immutability: All public find methods return new arrays
 * 
 * Performance:
 * - Optimized for 100k+ records
 * - Index-based lookups instead of array iterations
 * - Lazy aggregation (calculated on demand)
 * - No unnecessary array clones
 */
class MovementRepository extends RepositoryInterface {
  constructor() {
    super();

    // Primary storage
    this._records = [];

    // Indexes for fast lookups (Map for O(1) access)
    this._indexOperator = new Map();
    this._indexArticleCode = new Map();
    this._indexArticleName = new Map();
    this._indexWarehouse = new Map();
    this._indexZone = new Map();
    this._indexShelf = new Map();
    this._indexMovementType = new Map();
    this._indexDocument = new Map();
    this._indexBatch = new Map();
    this._indexDepartment = new Map();
    this._indexBarcode = new Map();
    this._indexDate = new Map();

    // Cached statistics (invalidated on load/clear)
    this._statsCache = null;

    this._logger = console; // TODO: inject logger
  }

  /**
   * Load records into the repository.
   * Builds all indexes and invalidates cached statistics.
   * @param {MovementRecord[]} records - Array of MovementRecord objects
   * @throws {Error} If records is not an array
   */
  load(records) {
    if (!Array.isArray(records)) {
      throw new Error('Records must be an array');
    }

    // Clear existing data
    this._clearIndexes();
    this._records = [];
    this._statsCache = null;

    // Store records and build indexes
    for (const record of records) {
      this._records.push(record);
      this._indexRecord(record);
    }

    this._logger.log(
      `[MovementRepository] Loaded ${records.length} records`,
    );
  }

  /**
   * Clear all records and indexes from the repository.
   */
  clear() {
    this._records = [];
    this._clearIndexes();
    this._statsCache = null;
    this._logger.log('[MovementRepository] Cleared');
  }

  /**
   * Get total count of records.
   * @returns {number} Total number of records
   */
  count() {
    return this._records.length;
  }

  /**
   * Check if repository is loaded and has records.
   * @returns {boolean} True if repository has records
   */
  exists() {
    return this._records.length > 0;
  }

  /**
   * Get all records (new array).
   * @returns {MovementRecord[]} Copy of all records
   */
  findAll() {
    return [...this._records];
  }

  /**
   * Find records by exact date.
   * @param {string|Date} date - Date to search (YYYY-MM-DD or Date object)
   * @returns {MovementRecord[]} Records for that date
   */
  findByDate(date) {
    const dateStr = this._normalizeDate(date);
    return this._indexDate.get(dateStr) ? [...this._indexDate.get(dateStr)] : [];
  }

  /**
   * Find records between dates (inclusive).
   * @param {string|Date} start - Start date
   * @param {string|Date} end - End date
   * @returns {MovementRecord[]} Records in date range
   */
  findBetweenDates(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    return this._records.filter((record) => {
      if (!record.movementDate) return false;
      return record.movementDate >= startDate && record.movementDate <= endDate;
    });
  }

  /**
   * Find records by operator name.
   * @param {string} operator - Operator name
   * @returns {MovementRecord[]} Records for operator
   */
  findByOperator(operator) {
    return this._indexOperator.get(operator)
      ? [...this._indexOperator.get(operator)]
      : [];
  }

  /**
   * Find records by article code.
   * @param {string} articleCode - Article code
   * @returns {MovementRecord[]} Records for article
   */
  findByArticle(articleCode) {
    return this._indexArticleCode.get(articleCode)
      ? [...this._indexArticleCode.get(articleCode)]
      : [];
  }

  /**
   * Find records by article name.
   * @param {string} articleName - Article name
   * @returns {MovementRecord[]} Records for article name
   */
  findByArticleName(articleName) {
    return this._indexArticleName.get(articleName)
      ? [...this._indexArticleName.get(articleName)]
      : [];
  }

  /**
   * Find records by warehouse.
   * @param {string} warehouse - Warehouse name/code
   * @returns {MovementRecord[]} Records for warehouse
   */
  findByWarehouse(warehouse) {
    return this._indexWarehouse.get(warehouse)
      ? [...this._indexWarehouse.get(warehouse)]
      : [];
  }

  /**
   * Find records by zone.
   * @param {string} zone - Zone name/code
   * @returns {MovementRecord[]} Records for zone
   */
  findByZone(zone) {
    return this._indexZone.get(zone)
      ? [...this._indexZone.get(zone)]
      : [];
  }

  /**
   * Find records by shelf.
   * @param {string} shelf - Shelf name/code
   * @returns {MovementRecord[]} Records for shelf
   */
  findByShelf(shelf) {
    return this._indexShelf.get(shelf)
      ? [...this._indexShelf.get(shelf)]
      : [];
  }

  /**
   * Find records by movement type.
   * @param {string} type - Movement type (IN, OUT, ADJUST, etc.)
   * @returns {MovementRecord[]} Records of type
   */
  findByMovementType(type) {
    return this._indexMovementType.get(type)
      ? [...this._indexMovementType.get(type)]
      : [];
  }

  /**
   * Find records by document number.
   * @param {string|number} document - Document number
   * @returns {MovementRecord[]} Records for document
   */
  findByDocument(document) {
    const docStr = String(document);
    return this._indexDocument.get(docStr)
      ? [...this._indexDocument.get(docStr)]
      : [];
  }

  /**
   * Find records by batch code.
   * @param {string} batch - Batch code
   * @returns {MovementRecord[]} Records for batch
   */
  findByBatch(batch) {
    return this._indexBatch.get(batch)
      ? [...this._indexBatch.get(batch)]
      : [];
  }

  /**
   * Find records by department.
   * @param {string} department - Department name/code
   * @returns {MovementRecord[]} Records for department
   */
  findByDepartment(department) {
    return this._indexDepartment.get(department)
      ? [...this._indexDepartment.get(department)]
      : [];
  }

  /**
   * Find records by barcode.
   * @param {string} barcode - Product barcode
   * @returns {MovementRecord[]} Records for barcode
   */
  findByBarcode(barcode) {
    return this._indexBarcode.get(barcode)
      ? [...this._indexBarcode.get(barcode)]
      : [];
  }

  /**
   * Group records by operator, returning counts.
   * @returns {Map<string, number>} Map of operator -> count
   */
  groupByOperator() {
    const result = new Map();
    for (const [key, records] of this._indexOperator.entries()) {
      result.set(key, records.length);
    }
    return result;
  }

  /**
   * Group records by article, returning counts.
   * @returns {Map<string, number>} Map of article -> count
   */
  groupByArticle() {
    const result = new Map();
    for (const [key, records] of this._indexArticleCode.entries()) {
      result.set(key, records.length);
    }
    return result;
  }

  /**
   * Group records by zone, returning counts.
   * @returns {Map<string, number>} Map of zone -> count
   */
  groupByZone() {
    const result = new Map();
    for (const [key, records] of this._indexZone.entries()) {
      result.set(key, records.length);
    }
    return result;
  }

  /**
   * Group records by warehouse, returning counts.
   * @returns {Map<string, number>} Map of warehouse -> count
   */
  groupByWarehouse() {
    const result = new Map();
    for (const [key, records] of this._indexWarehouse.entries()) {
      result.set(key, records.length);
    }
    return result;
  }

  /**
   * Group records by shelf, returning counts.
   * @returns {Map<string, number>} Map of shelf -> count
   */
  groupByShelf() {
    const result = new Map();
    for (const [key, records] of this._indexShelf.entries()) {
      result.set(key, records.length);
    }
    return result;
  }

  /**
   * Group records by department, returning counts.
   * @returns {Map<string, number>} Map of department -> count
   */
  groupByDepartment() {
    const result = new Map();
    for (const [key, records] of this._indexDepartment.entries()) {
      result.set(key, records.length);
    }
    return result;
  }

  /**
   * Group records by movement type, returning counts.
   * @returns {Map<string, number>} Map of type -> count
   */
  groupByMovementType() {
    const result = new Map();
    for (const [key, records] of this._indexMovementType.entries()) {
      result.set(key, records.length);
    }
    return result;
  }

  /**
   * Get statistics about the repository.
   * @returns {Object} Statistics object with key metrics
   */
  getStatistics() {
    // Return cached stats if available
    if (this._statsCache) {
      return { ...this._statsCache };
    }

    const stats = {
      totalRecords: this._records.length,
      totalArticles: this._indexArticleCode.size,
      totalOperators: this._indexOperator.size,
      totalZones: this._indexZone.size,
      totalWarehouses: this._indexWarehouse.size,
      totalShelves: this._indexShelf.size,
      totalDepartments: this._indexDepartment.size,
      firstMovement: this._records.length > 0
        ? this._records[0].movementDate
        : null,
      lastMovement: this._records.length > 0
        ? this._records[this._records.length - 1].movementDate
        : null,
    };

    // Cache stats
    this._statsCache = { ...stats };

    this._logger.log('[MovementRepository] Statistics calculated');

    return stats;
  }

  /**
   * Get top N items by frequency for articles.
   * @param {number} limit - Number of top items to return
   * @returns {Array<{key: string, count: number}>} Array sorted by count descending
   */
  topArticles(limit = 10) {
    return this._topFromIndex(this._indexArticleCode, limit);
  }

  /**
   * Get top N items by frequency for operators.
   * @param {number} limit - Number of top items to return
   * @returns {Array<{key: string, count: number}>} Array sorted by count descending
   */
  topOperators(limit = 10) {
    return this._topFromIndex(this._indexOperator, limit);
  }

  /**
   * Get top N items by frequency for zones.
   * @param {number} limit - Number of top items to return
   * @returns {Array<{key: string, count: number}>} Array sorted by count descending
   */
  topZones(limit = 10) {
    return this._topFromIndex(this._indexZone, limit);
  }

  /**
   * Get top N items by frequency for warehouses.
   * @param {number} limit - Number of top items to return
   * @returns {Array<{key: string, count: number}>} Array sorted by count descending
   */
  topWarehouses(limit = 10) {
    return this._topFromIndex(this._indexWarehouse, limit);
  }

  /**
   * Get top N items by frequency for shelves.
   * @param {number} limit - Number of top items to return
   * @returns {Array<{key: string, count: number}>} Array sorted by count descending
   */
  topShelves(limit = 10) {
    return this._topFromIndex(this._indexShelf, limit);
  }

  /**
   * Full-text search across multiple fields.
   * Searches: article, operator, document, batch, code, barcode.
   * @param {string} text - Search text
   * @returns {MovementRecord[]} Records matching search
   */
  search(text) {
    if (!text || typeof text !== 'string') return [];

    const searchLower = text.toLowerCase();
    const results = [];
    const seen = new Set();

    for (const record of this._records) {
      const recordId = `${record.articleCode}_${record.operator}_${record.documentNumber}_${record.batch}`;
      if (seen.has(recordId)) continue;

      const matches =
        (record.articleCode && record.articleCode.toLowerCase().includes(searchLower)) ||
        (record.articleName && record.articleName.toLowerCase().includes(searchLower)) ||
        (record.operator && record.operator.toLowerCase().includes(searchLower)) ||
        (record.documentNumber && String(record.documentNumber).toLowerCase().includes(searchLower)) ||
        (record.batch && record.batch.toLowerCase().includes(searchLower)) ||
        (record.barcode && record.barcode.toLowerCase().includes(searchLower));

      if (matches) {
        results.push(record);
        seen.add(recordId);
      }
    }

    this._logger.log(
      `[MovementRepository] Search executed for "${text}" found ${results.length} results`,
    );

    return results;
  }

  // ===== PRIVATE METHODS =====

  /**
   * Index a single record into all indexes.
   * @private
   */
  _indexRecord(record) {
    this._addToIndex(this._indexOperator, record.operator, record);
    this._addToIndex(this._indexArticleCode, record.articleCode, record);
    this._addToIndex(this._indexArticleName, record.articleName, record);
    this._addToIndex(this._indexWarehouse, record.warehouse, record);
    this._addToIndex(this._indexZone, record.zone, record);
    this._addToIndex(this._indexShelf, record.shelf, record);
    this._addToIndex(this._indexMovementType, record.movementType, record);
    this._addToIndex(this._indexDocument, String(record.documentNumber), record);
    this._addToIndex(this._indexBatch, record.batch, record);
    this._addToIndex(this._indexDepartment, record.department, record);
    this._addToIndex(this._indexBarcode, record.barcode, record);

    // Index by date string (YYYY-MM-DD)
    if (record.movementDate) {
      const dateStr = this._normalizeDate(record.movementDate);
      this._addToIndex(this._indexDate, dateStr, record);
    }
  }

  /**
   * Add a record to a specific index.
   * @private
   */
  _addToIndex(index, key, record) {
    if (key === null || key === undefined) return;

    const keyStr = String(key);
    if (!index.has(keyStr)) {
      index.set(keyStr, []);
    }
    index.get(keyStr).push(record);
  }

  /**
   * Clear all indexes.
   * @private
   */
  _clearIndexes() {
    this._indexOperator.clear();
    this._indexArticleCode.clear();
    this._indexArticleName.clear();
    this._indexWarehouse.clear();
    this._indexZone.clear();
    this._indexShelf.clear();
    this._indexMovementType.clear();
    this._indexDocument.clear();
    this._indexBatch.clear();
    this._indexDepartment.clear();
    this._indexBarcode.clear();
    this._indexDate.clear();
  }

  /**
   * Normalize date to YYYY-MM-DD format.
   * @private
   */
  _normalizeDate(date) {
    if (typeof date === 'string') {
      return date.split('T')[0]; // Remove time component
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return null;
  }

  /**
   * Extract top N items from an index by frequency.
   * @private
   */
  _topFromIndex(index, limit = 10) {
    const result = [];

    for (const [key, records] of index.entries()) {
      result.push({
        key,
        count: records.length,
      });
    }

    // Sort by count descending
    result.sort((a, b) => b.count - a.count);

    // Return top N
    return result.slice(0, limit);
  }
}

module.exports = { MovementRepository };
