const { InvalidDateError, InvalidQuantityError } = require('../errors');

/**
 * Normalize a raw row (object of columnKey -> raw value) into canonical fields.
 * This function is intentionally synchronous and lightweight to be used in tight loops.
 * @param {object} rawRow
 * @param {object} opts
 */
function normalizeRow(rawRow, opts = {}) {
  const rowNumber = opts.rowNumber || null;

  const get = (k) => {
    const v = rawRow[k];
    if (v === undefined) return null;
    if (v === null) return null;
    if (typeof v === 'string') return v.trim() === '' ? null : v.trim();
    return v;
  };

  // Date handling: accept Date objects or strings
  let movementDate = get('movementDate');
  if (movementDate !== null) {
    if (movementDate instanceof Date) {
      // ok
    } else if (typeof movementDate === 'number') {
      // Excel serial date
      movementDate = excelDateToJSDate(movementDate);
    } else {
      const parsed = new Date(String(movementDate).trim());
      if (isNaN(parsed)) throw new InvalidDateError('Invalid date on row ' + rowNumber + ': ' + movementDate);
      movementDate = parsed;
    }
  }

  // Quantity
  let quantity = get('quantity');
  if (quantity !== null) {
    const num = Number(String(quantity).replace(',', '.'));
    if (isNaN(num)) throw new InvalidQuantityError('Invalid quantity on row ' + rowNumber + ': ' + quantity);
    quantity = num;
  }

  return {
    shelf: get('shelf'),
    location: get('location'),
    zone: get('zone'),
    warehouse: get('warehouse'),

    articleCode: get('articleCode'),
    articleName: get('articleName'),

    department: get('department'),

    documentId: get('documentId'),
    documentNumber: get('documentNumber'),

    batch: get('batch'),

    movementDate,
    movementTime: get('movementTime'),

    movementType: get('movementType'),

    unit: get('unit'),

    quantity,

    operator: get('operator'),

    barcode: get('barcode'),
  };
}

/**
 * Convert Excel serial date to JS Date
 * @param {number} serial
 */
function excelDateToJSDate(serial) {
  // Excel's epoch: 1899-12-30
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400; // seconds
  const dateInfo = new Date(utcValue * 1000);
  return dateInfo;
}

module.exports = { normalizeRow };
