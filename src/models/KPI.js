/**
 * KPI (Key Performance Indicator)
 *
 * Represents a business indicator calculated from repository data.
 */

class KPI {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.id = options.id ?? "";
    this.title = options.title ?? "";
    this.description = options.description ?? "";

    this.value = options.value ?? 0;
    this.unit = options.unit ?? "";

    this.category = options.category ?? "General";

    this.icon = options.icon ?? "";

    this.color = options.color ?? "primary";

    this.trend = options.trend ?? null;

    this.previousValue = options.previousValue ?? null;

    this.variation = options.variation ?? null;
  }
}

module.exports = { KPI };
