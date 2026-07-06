/**
 * MovementRecord model
 * Represents a normalized inventory movement record.
 */
class MovementRecord {
  constructor({
    shelf = null,
    location = null,
    zone = null,
    warehouse = null,
    articleCode = null,
    articleName = null,
    department = null,
    documentId = null,
    documentNumber = null,
    batch = null,
    movementDate = null,
    movementTime = null,
    movementType = null,
    unit = null,
    quantity = null,
    operator = null,
    barcode = null,
  } = {}) {
    this.shelf = shelf;
    this.location = location;
    this.zone = zone;
    this.warehouse = warehouse;

    this.articleCode = articleCode;
    this.articleName = articleName;

    this.department = department;

    this.documentId = documentId;
    this.documentNumber = documentNumber;

    this.batch = batch;

    this.movementDate = movementDate instanceof Date ? movementDate : movementDate ? new Date(movementDate) : null;
    this.movementTime = movementTime;

    this.movementType = movementType;

    this.unit = unit;

    this.quantity = typeof quantity === 'number' ? quantity : quantity ? Number(quantity) : null;

    this.operator = operator;

    this.barcode = barcode;
  }
}

module.exports = { MovementRecord };
