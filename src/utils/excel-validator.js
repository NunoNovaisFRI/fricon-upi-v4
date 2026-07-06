const XLSX = require('xlsx');
const { MissingColumnError } = require('../errors');

// canonical mapping of common header labels (lowercased, trimmed) to column keys
const HEADER_KEY_MAP = {
  'prateleira': 'shelf',
  'prateleira ': 'shelf',
  'localiz física': 'location',
  'localiz_fisica': 'location',
  'localizacao': 'location',
  'localiz': 'location',
  'zona': 'zone',
  'arm': 'warehouse',
  'código': 'articleCode',
  'codigo': 'articleCode',
  'nome': 'articleName',
  'depart': 'department',
  'doc_id': 'documentId',
  'doc id': 'documentId',
  'doc_num': 'documentNumber',
  'doc num': 'documentNumber',
  'lote': 'batch',
  'data': 'movementDate',
  'hora': 'movementTime',
  'e/s': 'movementType',
  'e_s': 'movementType',
  'unid': 'unit',
  'qtd': 'quantity',
  'quantidade': 'quantity',
  'nomeutilizador': 'operator',
  'nome utilizador': 'operator',
  'nome utilizador ': 'operator',
  'codbarras': 'barcode',
  'cod barras': 'barcode',
};

const REQUIRED_COLUMNS = [
  'articleCode',
  'movementDate',
  'quantity',
  'operator',
];

/**
 * Validate a worksheet and return a header map mapping canonical header keys
 * to Excel column letters (e.g. { articleCode: 'B', movementDate: 'C', ... })
 * This function will not expose the sheet object outside; it only reads.
 * @param {object} sheet - worksheet object from SheetJS
 * @returns {object} headerMap
 */
function validateWorksheet(sheet) {
  if (!sheet || !sheet['!ref']) throw new MissingColumnError('Worksheet missing or empty');

  const range = XLSX.utils.decode_range(sheet['!ref']);
  const headerRow = range.s.r; // assume topmost row is header

  const headerMap = {};

  for (let c = range.s.c; c <= range.e.c; c++) {
    const cellAddress = XLSX.utils.encode_col(c) + (headerRow + 1);
    const cell = sheet[cellAddress];
    if (!cell || (typeof cell.v === 'string' && cell.v.trim() === '')) continue;
    const raw = String(cell.v).trim().toLowerCase();
    const key = HEADER_KEY_MAP[raw] || null;
    if (key) {
      headerMap[key] = XLSX.utils.encode_col(c);
    }
  }

  // Basic required column check
  const missing = REQUIRED_COLUMNS.filter((k) => !Object.prototype.hasOwnProperty.call(headerMap, k));
  if (missing.length > 0) {
    throw new MissingColumnError('Missing required columns: ' + missing.join(', '));
  }

  return headerMap;
}

module.exports = { validateWorksheet };
