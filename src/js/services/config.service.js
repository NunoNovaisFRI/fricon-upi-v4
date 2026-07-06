/**
 * Configuration Service
 * Provides centralized configuration management: load defaults, apply overrides from localStorage,
 * validate against JSON Schema, and persist user overrides.
 *
 * Exports:
 *  - ConfigServiceClass (class) for unit tests/instantiation
 *  - ConfigService (default singleton instance)
 */

import { logger } from '../utils/logger.js';

/**
 * Lightweight JSON Schema validator helper (supports core keywords used here).
 * Returns { valid: boolean, errors: string[] }
 * Note: intentionally small and synchronous (no external deps) for browser use and unit-testing.
 * @param {object} schema
 * @param {any} data
 * @returns {{valid:boolean,errors:string[]}}
 */
function validateAgainstSchema(schema, data, path = '') {
  const errors = [];

  function typeOf(value) {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
  }

  function check(schemaNode, node, currentPath) {
    const expectedType = schemaNode.type;
    if (expectedType) {
      const got = typeOf(node);
      if (expectedType !== got && !(expectedType === 'number' && got === 'integer')) {
        errors.push(`${currentPath || 'root'}: expected type ${expectedType} but got ${got}`);
        // early return for type mismatch
        return;
      }
    }

    if (schemaNode.enum && Array.isArray(schemaNode.enum)) {
      if (!schemaNode.enum.includes(node)) {
        errors.push(`${currentPath || 'root'}: value ${JSON.stringify(node)} not in enum ${JSON.stringify(schemaNode.enum)}`);
      }
    }

    if (schemaNode.type === 'object' && schemaNode.properties && typeof node === 'object' && node !== null) {
      // check required
      if (Array.isArray(schemaNode.required)) {
        schemaNode.required.forEach((req) => {
          if (node[req] === undefined) {
            errors.push(`${currentPath ? currentPath + '.' : ''}${req}: is required`);
          }
        });
      }
      // check children
      Object.keys(schemaNode.properties).forEach((key) => {
        if (node[key] !== undefined) {
          check(schemaNode.properties[key], node[key], currentPath ? `${currentPath}.${key}` : key);
        }
      });
    }

    if (schemaNode.type === 'array' && Array.isArray(node)) {
      if (schemaNode.minItems !== undefined && node.length < schemaNode.minItems) {
        errors.push(`${currentPath || 'root'}: array length ${node.length} < minItems ${schemaNode.minItems}`);
      }
      if (schemaNode.maxItems !== undefined && node.length > schemaNode.maxItems) {
        errors.push(`${currentPath || 'root'}: array length ${node.length} > maxItems ${schemaNode.maxItems}`);
      }
      if (schemaNode.items) {
        node.forEach((item, idx) => {
          check(schemaNode.items, item, `${currentPath || 'root'}[${idx}]`);
        });
      }
    }

    if ((schemaNode.type === 'number' || schemaNode.type === 'integer') && typeof node === 'number') {
      if (schemaNode.minimum !== undefined && node < schemaNode.minimum) {
        errors.push(`${currentPath || 'root'}: ${node} < minimum ${schemaNode.minimum}`);
      }
      if (schemaNode.maximum !== undefined && node > schemaNode.maximum) {
        errors.push(`${currentPath || 'root'}: ${node} > maximum ${schemaNode.maximum}`);
      }
    }

    if (schemaNode.type === 'string' && typeof node === 'string') {
      if (schemaNode.minLength !== undefined && node.length < schemaNode.minLength) {
        errors.push(`${currentPath || 'root'}: string length ${node.length} < minLength ${schemaNode.minLength}`);
      }
      if (schemaNode.maxLength !== undefined && node.length > schemaNode.maxLength) {
        errors.push(`${currentPath || 'root'}: string length ${node.length} > maxLength ${schemaNode.maxLength}`);
      }
      if (schemaNode.pattern) {
        const re = new RegExp(schemaNode.pattern);
        if (!re.test(node)) {
          errors.push(`${currentPath || 'root'}: string '${node}' does not match pattern ${schemaNode.pattern}`);
        }
      }
    }
  }

  check(schema, data, path);
  return { valid: errors.length === 0, errors };
}

/**
 * Merge two plain objects deeply (source overrides target).
 * Arrays are replaced, not merged.
 * Returns a new object.
 * @param {object} target
 * @param {object} source
 */
function deepMerge(target = {}, source = {}) {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return source;
  const out = Array.isArray(target) ? [...target] : { ...target };
  Object.keys(source).forEach((k) => {
    const sv = source[k];
    const tv = out[k];
    if (typeof sv === 'object' && sv !== null && !Array.isArray(sv) && typeof tv === 'object' && tv !== null && !Array.isArray(tv)) {
      out[k] = deepMerge(tv, sv);
    } else {
      out[k] = sv;
    }
  });
  return out;
}

/**
 * Get value by dot-path from object.
 * @param {object} obj
 * @param {string} path
 */
function getByPath(obj, path) {
  if (!path) return obj;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/**
 * Set value by dot-path on object. Mutates obj.
 * @param {object} obj
 * @param {string} path
 * @param {any} value
 */
function setByPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (i === parts.length - 1) {
      cur[p] = value;
    } else {
      if (cur[p] === undefined || cur[p] === null) cur[p] = {};
      cur = cur[p];
    }
  }
}

/**
 * Configuration service responsible for loading, validating and persisting application configuration.
 * Exported as class (for tests) and as default singleton instance.
 */
export class ConfigServiceClass {
  /**
   * Create the service.
   * @param {object} [options]
   * @param {string} [options.configUrl='/src/config/config.json'] - path to default configuration JSON (served file)
   * @param {string} [options.schemaUrl='/src/config/settings.schema.json'] - path to JSON Schema file
   * @param {string} [options.storageKey='fricon_config_overrides'] - localStorage key for overrides
   * @param {boolean} [options.autoLoad=true] - whether to auto-load on construct
   */
  constructor(options = {}) {
    this.configUrl = options.configUrl || '/src/config/config.json';
    this.schemaUrl = options.schemaUrl || '/src/config/settings.schema.json';
    this.storageKey = options.storageKey || 'fricon_config_overrides';
    this._defaultConfig = {};
    this._schema = null;
    this._overrides = {};
    this._config = {};
    this._loaded = false;
    if (options.autoLoad !== false) {
      // do not await here; callers can await load()
      this.load().catch((err) => {
        logger.error('ConfigService load failed', err);
      });
    }
  }

  /**
   * Load configuration from config.json, schema and apply overrides from localStorage.
   * Returns a promise that resolves to the current config object.
   * @returns {Promise<object>}
   */
  async load() {
    try {
      // fetch schema
      const schemaResp = await fetch(this.schemaUrl);
      if (!schemaResp.ok) {
        throw new Error(`Failed to fetch schema: ${schemaResp.status} ${schemaResp.statusText}`);
      }
      this._schema = await schemaResp.json();

      // fetch default config
      const resp = await fetch(this.configUrl);
      if (!resp.ok) {
        throw new Error(`Failed to fetch config: ${resp.status} ${resp.statusText}`);
      }
      this._defaultConfig = await resp.json();

      // load overrides from localStorage
      try {
        const raw = localStorage.getItem(this.storageKey);
        this._overrides = raw ? JSON.parse(raw) : {};
      } catch (e) {
        this._overrides = {};
      }

      // merge and validate
      this._config = deepMerge(this._defaultConfig, this._overrides);
      const { valid, errors } = this.validate(this._config);
      if (!valid) {
        logger.error('Configuration validation failed. Using defaults. Errors:', errors);
        // fallback to defaults and clear overrides
        this._config = deepMerge({}, this._defaultConfig);
        this._overrides = {};
        localStorage.removeItem(this.storageKey);
      } else {
        logger.info('Configuration loaded');
      }
      this._loaded = true;
      return this._config;
    } catch (err) {
      logger.error('ConfigService.load error', err);
      // fallback: attempt to use existing defaults if available
      if (!this._loaded) {
        this._config = this._defaultConfig || {};
        this._overrides = {};
      }
      return this._config;
    }
  }

  /**
   * Persist current overrides to localStorage.
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this._overrides || {}));
      logger.info('Configuration saved to localStorage');
    } catch (e) {
      logger.warn('Failed to persist configuration overrides', e);
    }
  }

  /**
   * Reload configuration from disk (config.json) and re-apply overrides.
   * @returns {Promise<object>}
   */
  async reload() {
    this._loaded = false;
    return this.load();
  }

  /**
   * Get a configuration value by dot-path. If path is empty returns full config.
   * Example: get('dashboard.theme') -> 'light'
   * @param {string} path
   * @returns {any}
   */
  get(path = '') {
    if (!this._loaded) {
      // not loaded yet — caller might want to wait for load()
      return getByPath(this._config, path);
    }
    return getByPath(this._config, path);
  }

  /**
   * Set a configuration value by dot-path. This updates runtime config and persists override.
   * Example: set('dashboard.theme','dark')
   * @param {string} path
   * @param {any} value
   * @returns {{valid:boolean,errors?:string[]}} validation result for full config after substitution
   */
  set(path, value) {
    // update runtime config
    setByPath(this._config, path, value);
    // record override (diff against defaults)
    setByPath(this._overrides, path, value);
    // validate resulting config
    const result = this.validate(this._config);
    if (!result.valid) {
      logger.warn('Setting configuration produced validation errors', result.errors);
      // do not persist invalid overrides
      // revert runtime to last valid (reload defaults + overrides without this)
      // simple approach: revert by reloading baseline+overrides (excluding current override)
      // remove path from overrides
      this._removeOverridePath(path);
      this._config = deepMerge(this._defaultConfig, this._overrides);
      return result;
    }
    // save overrides
    this.save();
    logger.info(`Configuration updated: ${path}`);
    return result;
  }

  /**
   * Remove a path from overrides object.
   * @param {string} path
   * @private
   */
  _removeOverridePath(path) {
    const parts = path.split('.');
    let cur = this._overrides;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!cur[p]) return;
      cur = cur[p];
    }
    delete cur[parts[parts.length - 1]];
  }

  /**
   * Reset all overrides and persist (clears localStorage).
   * Then reloads the configuration from defaults.
   * @returns {Promise<object>}
   */
  async reset() {
    try {
      this._overrides = {};
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      // ignore
    }
    return this.reload();
  }

  /**
   * Validate an object against the loaded schema.
   * Returns { valid: boolean, errors: string[] }.
   * If schema is not loaded, returns valid:true.
   * @param {object} obj
   * @returns {{valid:boolean,errors:string[]}}
   */
  validate(obj) {
    if (!this._schema) return { valid: true, errors: [] };
    try {
      const res = validateAgainstSchema(this._schema, obj);
      if (!res.valid) {
        logger.warn('Configuration validation errors', res.errors);
      }
      return res;
    } catch (e) {
      logger.error('Validation failure', e);
      return { valid: false, errors: [e.message] };
    }
  }

  /**
   * Export current configuration (merged defaults + overrides) as JSON string.
   * @param {boolean} pretty - pretty-print when true
   * @returns {string}
   */
  export(pretty = true) {
    try {
      return pretty ? JSON.stringify(this._config, null, 2) : JSON.stringify(this._config);
    } catch (e) {
      logger.error('Failed to export configuration', e);
      return '';
    }
  }

  /**
   * Import configuration from a JSON string or object. This will validate the imported object
   * against schema and, if valid, persist it as overrides (replacing existing overrides).
   * @param {string|object} data
   * @returns {{valid:boolean,errors?:string[]}}
   */
  import(data) {
    let obj;
    if (typeof data === 'string') {
      try {
        obj = JSON.parse(data);
      } catch (e) {
        return { valid: false, errors: ['Invalid JSON'] };
      }
    } else if (typeof data === 'object' && data !== null) {
      obj = data;
    } else {
      return { valid: false, errors: ['Unsupported data type'] };
    }

    const result = this.validate(obj);
    if (!result.valid) {
      logger.warn('Imported configuration invalid', result.errors);
      return result;
    }
    // compute overrides as diff from defaults: simple approach -> store the whole object as overrides
    // (works as long as defaults exist; we keep a full object of user configuration)
    this._overrides = obj;
    this._config = deepMerge(this._defaultConfig, this._overrides);
    this.save();
    logger.info('Configuration imported and applied');
    return { valid: true };
  }

  /**
   * Returns a clone of the internal current config (safe for tests).
   * @returns {object}
   */
  toObject() {
    return JSON.parse(JSON.stringify(this._config || {}));
  }
}

// Default singleton instance
export const ConfigService = new ConfigServiceClass();
export default ConfigService;
