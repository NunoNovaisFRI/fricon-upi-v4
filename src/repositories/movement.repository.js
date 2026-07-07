const { RepositoryInterface } = require('../interfaces/repository.interface');

/**
 * MovementRepository
 * 
 * Implements the Repository Pattern for Movement records.
 * Centralized data access layer with Map-based indexing for performance.
 * 
 * Features:
 * - 13 different indexes for O(1) lookups
 * - Query API: find*, groupBy*, statistics, search, top*
 * - Optimized for 100k+ records
 * - Immutable query results (shallow copies)
 * - Complete logging
 */
class MovementRepository extends RepositoryInterface {
  constructor() {
    super();
    this._records = [];
    this._loaded = false;
    
    // Map-based indexes for fast lookups
    this._indexes = {
      date: new Map(),           // YYYY-MM-DD -> records[]
      operator: new Map(),       // operator name -> records[]
      article: new Map(),        // article code -> records[]
      articleName: new Map(),    // article name -> records[]
      warehouse: new Map(),      // warehouse name -> records[]
      zone: new Map(),           // zone name -> records[]
      shelf: new Map(),          // shelf name -> records[]
      movementType: new Map(),   // movement type -> records[]
      document: new Map(),       // document number -> records[]
      batch: new Map(),          // batch code -> records[]
      department: new Map(),     // department name -> records[]
      barcode: new Map(),        // barcode -> records[]
    };
  }

  /**
   * Load records into the repository and build indexes
   * @param {Array} records - Array of MovementRecord objects
   * @throws {Error} If records is not an array
   */
  load(records) {
    if (!Array.isArray(records)) {
      throw new Error('Records must be an array');
    }

    // Clear existing data
    this.clear();

    // Store records
    this._records = records;

    // Build indexes in a single pass
    this._buildIndexes();

    this._loaded = true;
    console.log(`Repository loaded with ${this._records.length} records`);
  }

  /**
   * Build all indexes from records (single pass)
   * @private
   */
  _buildIndexes() {
    for (const record of this._records) {
      // Date index (YYYY-MM-DD format)
      if (record.date) {
        const dateKey = this._formatDate(record.date);
        this._addToIndex('date', dateKey, record);
      }

      // Operator index
      if (record.operator) {
        this._addToIndex('operator', record.operator, record);
      }

      // Article indexes
      if (record.articleCode) {
        this._addToIndex('article', record.articleCode, record);
      }
      if (record.articleName) {
        this._addToIndex('articleName', record.articleName, record);
      }

      // Warehouse index
      if (record.warehouse) {
        this._addToIndex('warehouse', record.warehouse, record);
      }

      // Zone index
      if (record.zone) {
        this._addToIndex('zone', record.zone, record);
      }

      // Shelf index
      if (record.shelf) {
        this._addToIndex('shelf', record.shelf, record);
      }

      // Movement type index
      if (record.movementType) {
        this._addToIndex('movementType', record.movementType, record);
      }

      // Document index
      if (record.document) {
        this._addToIndex('document', record.document, record);
      }

      // Batch index
      if (record.batch) {
        this._addToIndex('batch', record.batch, record);
      }

      // Department index
      if (record.department) {
        this._addToIndex('department', record.department, record);
      }

      // Barcode index
      if (record.barcode) {
        this._addToIndex('barcode', record.barcode, record);
      }
    }
  }

  /**
   * Add a record to a specific index
   * @private
   */
  _addToIndex(indexName, key, record) {
    const index = this._indexes[indexName];
    if (!index.has(key)) {
      index.set(key, []);
    }
    index.get(key).push(record);
  }

  /**
   * Format date to YYYY-MM-DD string
   * @private
   */
  _formatDate(date) {
    if (typeof date === 'string') {
      return date.substring(0, 10); // Assume already in YYYY-MM-DD or ISO format
    }
    if (date instanceof Date) {
      return date.toISOString().substring(0, 10);
    }
    return String(date).substring(0, 10);
  }

  /**
   * Parse date string to Date object
   * @private
   */
  _parseDate(dateStr) {
    if (dateStr instanceof Date) {
      return dateStr;
    }
    return new Date(String(dateStr));
  }

  /**
   * Clear all records and indexes
   */
  clear() {
    this._records = [];
    this._loaded = false;

    // Clear all indexes
    for (const index of Object.values(this._indexes)) {
      index.clear();
    }

    console.log('Repository cleared');
  }

  /**
   * Get total count of records
   * @returns {number}
   */
  count() {
    return this._records.length;
  }

  /**
   * Check if repository is loaded and has records
   * @returns {boolean}
   */
  exists() {
    return this._loaded && this._records.length > 0;
  }

  /**
   * Get all records (shallow copy)
   * @returns {Array}
   */
  findAll() {
    return [...this._records];
  }

  /**
   * Find records by date
   * @param {string|Date} date - Date (YYYY-MM-DD or Date object)
   * @returns {Array}
   */
  findByDate(date) {
    const dateKey = this._formatDate(date);
    const records = this._indexes.date.get(dateKey);
    return records ? [...records] : [];
  }

  /**
   * Find records between dates (inclusive)
   * @param {string|Date} start - Start date
   * @param {string|Date} end - End date
   * @returns {Array}
   */
  findBetweenDates(start, end) {
    const startDate = this._parseDate(start);
    const endDate = this._parseDate(end);

    return this._records.filter(record => {
      const recordDate = this._parseDate(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  /**
   * Find records by operator name
   * @param {string} operator
   * @returns {Array}
   */
  findByOperator(operator) {
    const records = this._indexes.operator.get(operator);
    return records ? [...records] : [];
  }

  /**
   * Find records by article code
   * @param {string} articleCode
   * @returns {Array}
   */
  findByArticle(articleCode) {
    const records = this._indexes.article.get(articleCode);
    return records ? [...records] : [];
  }

  /**
   * Find records by article name
   * @param {string} articleName
   * @returns {Array}
   */
  findByArticleName(articleName) {
    const records = this._indexes.articleName.get(articleName);
    return records ? [...records] : [];
  }

  /**
   * Find records by warehouse
   * @param {string} warehouse
   * @returns {Array}
   */
  findByWarehouse(warehouse) {
    const records = this._indexes.warehouse.get(warehouse);
    return records ? [...records] : [];
  }

  /**
   * Find records by zone
   * @param {string} zone
   * @returns {Array}
   */
  findByZone(zone) {
    const records = this._indexes.zone.get(zone);
    return records ? [...records] : [];
  }

  /**
   * Find records by shelf
   * @param {string} shelf
   * @returns {Array}
   */
  findByShelf(shelf) {
    const records = this._indexes.shelf.get(shelf);
    return records ? [...records] : [];
  }

  /**
   * Find records by movement type
   * @param {string} type - Movement type (IN, OUT, ADJUST, etc.)
   * @returns {Array}
   */
  findByMovementType(type) {
    const records = this._indexes.movementType.get(type);
    return records ? [...records] : [];
  }

  /**
   * Find records by document number
   * @param {string|number} document
   * @returns {Array}
   */
  findByDocument(document) {
    const records = this._indexes.document.get(document);
    return records ? [...records] : [];
  }

  /**
   * Find records by batch code
   * @param {string} batch
   * @returns {Array}
   */
  findByBatch(batch) {
    const records = this._indexes.batch.get(batch);
    return records ? [...records] : [];
  }

  /**
   * Find records by department
   * @param {string} department
   * @returns {Array}
   */
  findByDepartment(department) {
    const records = this._indexes.department.get(department);
    return records ? [...records] : [];
  }

  /**
   * Find records by barcode
   * @param {string} barcode
   * @returns {Array}
   */
  findByBarcode(barcode) {
    const records = this._indexes.barcode.get(barcode);
    return records ? [...records] : [];
  }

  /**
   * Group records by operator, returning count map
   * @returns {Map} Map of operator -> count
   */
  groupByOperator() {
    const grouped = new Map();
    for (const [operator, records] of this._indexes.operator.entries()) {
      grouped.set(operator, records.length);
    }
    return grouped;
  }

  /**
   * Group records by article, returning count map
   * @returns {Map} Map of article -> count
   */
  groupByArticle() {
    const grouped = new Map();
    for (const [article, records] of this._indexes.article.entries()) {
      grouped.set(article, records.length);
    }
    return grouped;
  }

  /**
   * Group records by zone, returning count map
   * @returns {Map} Map of zone -> count
   */
  groupByZone() {
    const grouped = new Map();
    for (const [zone, records] of this._indexes.zone.entries()) {
      grouped.set(zone, records.length);
    }
    return grouped;
  }

  /**
   * Group records by warehouse, returning count map
   * @returns {Map} Map of warehouse -> count
   */
  groupByWarehouse() {
    const grouped = new Map();
    for (const [warehouse, records] of this._indexes.warehouse.entries()) {
      grouped.set(warehouse, records.length);
    }
    return grouped;
  }

  /**
   * Group records by shelf, returning count map
   * @returns {Map} Map of shelf -> count
   */
  groupByShelf() {
    const grouped = new Map();
    for (const [shelf, records] of this._indexes.shelf.entries()) {
      grouped.set(shelf, records.length);
    }
    return grouped;
  }

  /**
   * Group records by department, returning count map
   * @returns {Map} Map of department -> count
   */
  groupByDepartment() {
    const grouped = new Map();
    for (const [department, records] of this._indexes.department.entries()) {
      grouped.set(department, records.length);
    }
    return grouped;
  }

  /**
   * Group records by movement type, returning count map
   * @returns {Map} Map of type -> count
   */
  groupByMovementType() {
    const grouped = new Map();
    for (const [type, records] of this._indexes.movementType.entries()) {
      grouped.set(type, records.length);
    }
    return grouped;
  }

  /**
   * Get statistics about the repository
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const stats = {
      totalRecords: this._records.length,
      totalArticles: this._indexes.article.size,
      totalOperators: this._indexes.operator.size,
      totalZones: this._indexes.zone.size,
      totalWarehouses: this._indexes.warehouse.size,
      totalShelves: this._indexes.shelf.size,
      totalDepartments: this._indexes.department.size,
      totalMovementTypes: this._indexes.movementType.size,
      firstMovement: null,
      lastMovement: null,
    };

    if (this._records.length > 0) {
      // Find first and last movement dates
      let firstDate = this._parseDate(this._records[0].date);
      let lastDate = firstDate;

      for (const record of this._records) {
        const recordDate = this._parseDate(record.date);
        if (recordDate < firstDate) firstDate = recordDate;
        if (recordDate > lastDate) lastDate = recordDate;
      }

      stats.firstMovement = firstDate.toISOString().substring(0, 10);
      stats.lastMovement = lastDate.toISOString().substring(0, 10);
    }

    console.log('Statistics calculated');
    return stats;
  }

  /**
   * Get top N articles by frequency
   * @param {number} limit - Number of items to return
   * @returns {Array} Array of {key, count} objects sorted by count desc
   */
  topArticles(limit = 10) {
    return this._getTopItems(this._indexes.article, limit);
  }

  /**
   * Get top N operators by frequency
   * @param {number} limit - Number of items to return
   * @returns {Array} Array of {key, count} objects sorted by count desc
   */
  topOperators(limit = 10) {
    return this._getTopItems(this._indexes.operator, limit);
  }

  /**
   * Get top N zones by frequency
   * @param {number} limit - Number of items to return
   * @returns {Array} Array of {key, count} objects sorted by count desc
   */
  topZones(limit = 10) {
    return this._getTopItems(this._indexes.zone, limit);
  }

  /**
   * Get top N warehouses by frequency
   * @param {number} limit - Number of items to return
   * @returns {Array} Array of {key, count} objects sorted by count desc
   */
  topWarehouses(limit = 10) {
    return this._getTopItems(this._indexes.warehouse, limit);
  }

  /**
   * Get top N shelves by frequency
   * @param {number} limit - Number of items to return
   * @returns {Array} Array of {key, count} objects sorted by count desc
   */
  topShelves(limit = 10) {
    return this._getTopItems(this._indexes.shelf, limit);
  }

  /**
   * Helper to get top N items from any index
   * @private
   */
  _getTopItems(index, limit) {
    const items = [];
    for (const [key, records] of index.entries()) {
      items.push({
        key,
        count: records.length,
      });
    }

    // Sort by count descending and limit
    return items
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Full-text search across multiple fields
   * Searches: articleCode, articleName, operator, document, batch, barcode
   * @param {string} text - Search text
   * @returns {Array} Matching records
   */
  search(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const searchText = text.toLowerCase();
    const results = [];
    const seen = new Set();

    // Search in each index
    const indexesToSearch = [
      this._indexes.article,
      this._indexes.articleName,
      this._indexes.operator,
      this._indexes.document,
      this._indexes.batch,
      this._indexes.barcode,
    ];

    for (const index of indexesToSearch) {
      for (const [key, records] of index.entries()) {
        if (String(key).toLowerCase().includes(searchText)) {
          for (const record of records) {
            // Use record reference as unique identifier
            const recordId = this._records.indexOf(record);
            if (!seen.has(recordId)) {
              seen.add(recordId);
              results.push(record);
            }
          }
        }
      }
    }

    console.log(`Search executed: "${text}" - ${results.length} results`);
    return results;
  }
}

module.exports = { MovementRepository };
