/**
 * MovementRepository - Repository Pattern implementation for MovementRecord storage and queries.
 *
 * Responsibilities:
 * - store MovementRecord references (no repeated cloning for performance)
 * - provide query API (find*, groupBy*, top*, search, statistics)
 * - hide internal storage and indexes
 * - use Map indexes for fast lookups
 *
 * Usage example:
 * const repo = new MovementRepository();
 * repo.load(records); // records normalized by ExcelService
 * repo.findByOperator('John Doe');
 *
 * Note: methods that return arrays always return shallow copies to preserve immutability.
 */

/**
 * @typedef {Object} MovementRecord
 * @property {string|Date} date - movement timestamp or date-string
 * @property {string} [article] - article name
 * @property {string} [articleCode] - article code
 * @property {string} [articleName] - article name (alternative)
 * @property {string} [operator] - operator name
 * @property {string} [warehouse]
 * @property {string} [zone]
 * @property {string} [shelf]
 * @property {string} [movementType]
 * @property {string} [document]
 * @property {string} [batch]
 * @property {string} [barcode]
 * @property {string} [code]
 */

class MovementRepository {
  constructor() {
    /** @private {MovementRecord[]} */
    this._records = [];

    /**
     * Indexes: Map<key, MovementRecord[]>
     * @private
     */
    this._indexes = {
      date: new Map(),
      operator: new Map(),
      article: new Map(),
      articleName: new Map(),
      articleCode: new Map(),
      warehouse: new Map(),
      zone: new Map(),
      shelf: new Map(),
      movementType: new Map(),
      document: new Map(),
      batch: new Map(),
      barcode: new Map(),
    };

    this._loaded = false;
  }

  /* ------------------------------ Helpers ------------------------------- */

  /**
   * Normalize a date value to YYYY-MM-DD (local) string used as date-index key.
   * Accepts Date or date-string. Returns null for invalid values.
   * @private
   * @param {string|Date} d
   * @returns {string|null}
   */
  _toDateKey(d) {
    if (!d) return null;
    const dt = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    // Use ISO date part (UTC) to avoid timezone surprises in indexing
    return dt.toISOString().slice(0, 10);
  }

  /**
   * Safe-get map array, creating it if missing.
   * @private
   * @param {Map} map
   * @param {string} key
   * @returns {MovementRecord[]}
   */
  _ensureMapArray(map, key) {
    let arr = map.get(key);
    if (!arr) {
      arr = [];
      map.set(key, arr);
    }
    return arr;
  }

  /**
   * Add a record to a given index map under key (if key defined).
   * @private
   * @param {Map} map
   * @param {string|undefined} key
   * @param {MovementRecord} record
   */
  _indexAdd(map, key, record) {
    if (key === undefined || key === null) return;
    const k = String(key);
    this._ensureMapArray(map, k).push(record);
  }

  /**
   * Iterate all records once and build indexes.
   * @private
   */
  _buildIndexes() {
    // clear indexes
    Object.values(this._indexes).forEach((m) => m.clear());

    for (const r of this._records) {
      const dateKey = this._toDateKey(r.date);
      if (dateKey) this._indexAdd(this._indexes.date, dateKey, r);

      if (r.operator) this._indexAdd(this._indexes.operator, r.operator, r);

      // Article code/name variants
      if (r.articleCode) this._indexAdd(this._indexes.articleCode, r.articleCode, r);
      if (r.article) this._indexAdd(this._indexes.article, r.article, r);
      if (r.articleName) this._indexAdd(this._indexes.articleName, r.articleName, r);

      if (r.warehouse) this._indexAdd(this._indexes.warehouse, r.warehouse, r);
      if (r.zone) this._indexAdd(this._indexes.zone, r.zone, r);
      if (r.shelf) this._indexAdd(this._indexes.shelf, r.shelf, r);
      if (r.movementType) this._indexAdd(this._indexes.movementType, r.movementType, r);
      if (r.document) this._indexAdd(this._indexes.document, r.document, r);
      if (r.batch) this._indexAdd(this._indexes.batch, r.batch, r);
      if (r.barcode) this._indexAdd(this._indexes.barcode, r.barcode, r);

      // fallback code field
      if (r.code) this._indexAdd(this._indexes.articleCode, r.code, r);
    }
  }

  /* ------------------------------ Public API --------------------------- */

  /**
   * Load records into repository. This stores a reference to the provided array
   * (no deep clone for performance). The caller (ExcelService) is expected to
   * normalize values before calling load.
   * Emits: console.log('Repository loaded')
   * @param {MovementRecord[]} records
   */
  load(records) {
    if (!Array.isArray(records)) throw new TypeError('records must be an array');
    this._records = records; // store reference (fast)
    this._buildIndexes();
    this._loaded = true;
    console.log('Repository loaded');
  }

  /**
   * Clear repository and indexes.
   * Emits: console.log('Repository cleared')
   */
  clear() {
    this._records = [];
    Object.values(this._indexes).forEach((m) => m.clear());
    this._loaded = false;
    console.log('Repository cleared');
  }

  /**
   * Get number of loaded records.
   * @returns {number}
   */
  count() {
    return this._records.length;
  }

  /**
   * Returns true if repository has any records loaded.
   * @returns {boolean}
   */
  exists() {
    return this.count() > 0;
  }

  /**
   * Return a shallow copy of all records.
   * @returns {MovementRecord[]}
   */
  findAll() {
    // return a new array to preserve immutability
    return this._records.slice();
  }

  /**
   * Find records by exact date (Date or date-string). Date matching is by day.
   * @param {string|Date} date
   * @returns {MovementRecord[]}
   */
  findByDate(date) {
    const key = this._toDateKey(date);
    if (!key) return [];
    const arr = this._indexes.date.get(key) || [];
    return arr.slice();
  }

  /**
   * Find records between two dates (inclusive). start/end can be Date or string.
   * @param {string|Date} start
   * @param {string|Date} end
   * @returns {MovementRecord[]}
   */
  findBetweenDates(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return [];
    const startTime = s.getTime();
    const endTime = e.getTime();
    // single-pass scan (dates might be sparse); this avoids cloning index buckets
    const out = [];
    for (const r of this._records) {
      const rt = new Date(r.date).getTime();
      if (rt >= startTime && rt <= endTime) out.push(r);
    }
    return out.slice();
  }

  /**
   * Find by operator.
   * @param {string} operator
   * @returns {MovementRecord[]}
   */
  findByOperator(operator) {
    if (!operator) return [];
    const arr = this._indexes.operator.get(String(operator)) || [];
    return arr.slice();
  }

  /**
   * Find by article code.
   * @param {string} articleCode
   * @returns {MovementRecord[]}
   */
  findByArticle(articleCode) {
    if (!articleCode) return [];
    const arr = this._indexes.articleCode.get(String(articleCode)) || [];
    return arr.slice();
  }

  /**
   * Find by article name (article or articleName fields).
   * @param {string} articleName
   * @returns {MovementRecord[]}
   */
  findByArticleName(articleName) {
    if (!articleName) return [];
    const a1 = this._indexes.article.get(String(articleName)) || [];
    const a2 = this._indexes.articleName.get(String(articleName)) || [];
    // merge without duplicates
    const set = new Set();
    const out = [];
    for (const r of a1.concat(a2)) {
      if (!set.has(r)) {
        set.add(r);
        out.push(r);
      }
    }
    return out.slice();
  }

  findByWarehouse(warehouse) {
    if (!warehouse) return [];
    const arr = this._indexes.warehouse.get(String(warehouse)) || [];
    return arr.slice();
  }

  findByZone(zone) {
    if (!zone) return [];
    const arr = this._indexes.zone.get(String(zone)) || [];
    return arr.slice();
  }

  findByShelf(shelf) {
    if (!shelf) return [];
    const arr = this._indexes.shelf.get(String(shelf)) || [];
    return arr.slice();
  }

  findByMovementType(type) {
    if (!type) return [];
    const arr = this._indexes.movementType.get(String(type)) || [];
    return arr.slice();
  }

  findByDocument(document) {
    if (!document) return [];
    const arr = this._indexes.document.get(String(document)) || [];
    return arr.slice();
  }

  findByBatch(batch) {
    if (!batch) return [];
    const arr = this._indexes.batch.get(String(batch)) || [];
    return arr.slice();
  }

  findByDepartment(department) {
    if (!department) return [];
    // department may be stored in 'department' property on records
    // fallback to filtering if not indexed
    const out = [];
    for (const r of this._records) {
      if (r.department && String(r.department) === String(department)) out.push(r);
    }
    return out.slice();
  }

  findByBarcode(barcode) {
    if (!barcode) return [];
    const arr = this._indexes.barcode.get(String(barcode)) || [];
    return arr.slice();
  }

  /* ------------------------- Aggregations / Groups ---------------------- */

  /**
   * Generic group-by helper returning a Map<key, MovementRecord[]>
   * @private
   * @param {Map} indexMap
   * @returns {Map<string, MovementRecord[]>}
   */
  _groupByIndex(indexMap) {
    const out = new Map();
    for (const [k, arr] of indexMap.entries()) {
      out.set(k, arr.slice()); // return copies of arrays
    }
    return out;
  }

  groupByOperator() {
    return this._groupByIndex(this._indexes.operator);
  }

  groupByArticle() {
    // combine articleCode + article + articleName into a single map keyed by code/name
    const combined = new Map();
    for (const [k, arr] of this._indexes.articleCode.entries()) combined.set(k, arr.slice());
    for (const [k, arr] of this._indexes.article.entries()) {
      const prev = combined.get(k) || [];
      combined.set(k, prev.concat(arr));
    }
    for (const [k, arr] of this._indexes.articleName.entries()) {
      const prev = combined.get(k) || [];
      combined.set(k, prev.concat(arr));
    }
    // dedupe arrays per key
    const out = new Map();
    for (const [k, arr] of combined.entries()) {
      const set = new Set();
      const dedup = [];
      for (const r of arr) {
        if (!set.has(r)) {
          set.add(r);
          dedup.push(r);
        }
      }
      out.set(k, dedup);
    }
    return out;
  }

  groupByZone() {
    return this._groupByIndex(this._indexes.zone);
  }

  groupByWarehouse() {
    return this._groupByIndex(this._indexes.warehouse);
  }

  groupByShelf() {
    return this._groupByIndex(this._indexes.shelf);
  }

  groupByDepartment() {
    // not indexed -> build from records
    const m = new Map();
    for (const r of this._records) {
      if (!r.department) continue;
      this._ensureMapArray(m, String(r.department)).push(r);
    }
    return this._groupByIndex(m);
  }

  groupByMovementType() {
    return this._groupByIndex(this._indexes.movementType);
  }

  /* ------------------------------ Statistics ---------------------------- */

  /**
   * Calculate and return repository statistics.
   * Emits: console.log('Statistics calculated')
   * @returns {Object}
   */
  getStatistics() {
    const totalRecords = this.count();
    const totalArticles = new Set(
      this._records.map((r) => r.articleCode || r.code || r.article || r.articleName).filter(Boolean)
    ).size;
    const totalOperators = new Set(this._records.map((r) => r.operator).filter(Boolean)).size;
    const totalZones = new Set(this._records.map((r) => r.zone).filter(Boolean)).size;
    const totalWarehouses = new Set(this._records.map((r) => r.warehouse).filter(Boolean)).size;
    const totalShelves = new Set(this._records.map((r) => r.shelf).filter(Boolean)).size;
    const totalDepartments = new Set(this._records.map((r) => r.department).filter(Boolean)).size;

    // firstMovement / lastMovement
    let first = null;
    let last = null;
    for (const r of this._records) {
      const t = new Date(r.date);
      if (Number.isNaN(t.getTime())) continue;
      if (!first || t < first) first = t;
      if (!last || t > last) last = t;
    }

    const result = {
      totalRecords,
      totalArticles,
      totalOperators,
      totalZones,
      totalWarehouses,
      totalShelves,
      totalDepartments,
      firstMovement: first ? first.toISOString() : null,
      lastMovement: last ? last.toISOString() : null,
    };

    console.log('Statistics calculated');
    return result;
  }

  /* ------------------------------- Top Lists --------------------------- */

  /**
   * Generic top-N helper from an index map
   * @private
   * @param {Map} indexMap
   * @param {number} limit
   * @returns {{key:string, count:number}[]}
   */
  _topFromIndex(indexMap, limit = 10) {
    const arr = [];
    for (const [k, v] of indexMap.entries()) arr.push({ key: k, count: v.length });
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, limit);
  }

  topArticles(limit = 10) {
    // combine articleCode + article + articleName counts
    const map = new Map();
    const addCounts = (idx) => {
      for (const [k, v] of idx.entries()) {
        map.set(k, (map.get(k) || 0) + v.length);
      }
    };
    addCounts(this._indexes.articleCode);
    addCounts(this._indexes.article);
    addCounts(this._indexes.articleName);
    const arr = [];
    for (const [k, c] of map.entries()) arr.push({ key: k, count: c });
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, limit);
  }

  topOperators(limit = 10) {
    return this._topFromIndex(this._indexes.operator, limit);
  }

  topZones(limit = 10) {
    return this._topFromIndex(this._indexes.zone, limit);
  }

  topWarehouses(limit = 10) {
    return this._topFromIndex(this._indexes.warehouse, limit);
  }

  topShelves(limit = 10) {
    return this._topFromIndex(this._indexes.shelf, limit);
  }

  /* ------------------------------- Search ------------------------------ */

  /**
   * Search text across several fields: article, operator, document, batch, code, barcode
   * Returns unique records that match (case-insensitive substring match).
   * Emits: console.log('Search executed')
   * @param {string} text
   * @returns {MovementRecord[]}
   */
  search(text) {
    console.log('Search executed');
    if (!text || typeof text !== 'string') return [];
    const q = text.toLowerCase();
    const results = new Set();

    // Search in indexed keys first for speed
    const tryIndexKeys = (map) => {
      for (const [k, arr] of map.entries()) {
        if (String(k).toLowerCase().includes(q)) {
          for (const r of arr) results.add(r);
        }
      }
    };

    tryIndexKeys(this._indexes.articleCode);
    tryIndexKeys(this._indexes.article);
    tryIndexKeys(this._indexes.articleName);
    tryIndexKeys(this._indexes.operator);
    tryIndexKeys(this._indexes.document);
    tryIndexKeys(this._indexes.batch);
    tryIndexKeys(this._indexes.barcode);

    // fallback: scan records for fields that might not be indexed
    if (results.size === 0) {
      for (const r of this._records) {
        if (
          (r.article && String(r.article).toLowerCase().includes(q)) ||
          (r.articleCode && String(r.articleCode).toLowerCase().includes(q)) ||
          (r.articleName && String(r.articleName).toLowerCase().includes(q)) ||
          (r.operator && String(r.operator).toLowerCase().includes(q)) ||
          (r.document && String(r.document).toLowerCase().includes(q)) ||
          (r.batch && String(r.batch).toLowerCase().includes(q)) ||
          (r.code && String(r.code).toLowerCase().includes(q)) ||
          (r.barcode && String(r.barcode).toLowerCase().includes(q))
        ) {
          results.add(r);
        }
      }
    }

    return Array.from(results);
  }
}

module.exports = MovementRepository;
