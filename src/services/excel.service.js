const XLSX = require('xlsx');
const { MovementRecord } = require('../models/MovementRecord');
const { validateWorksheet } = require('../utils/excel-validator');
const { normalizeRow } = require('../utils/excel-normalizer');
const {
  ExcelFileError,
  WorksheetNotFoundError,
  MissingColumnError,
  InvalidDateError,
  InvalidQuantityError,
  InvalidFormatError,
} = require('../errors');

/**
 * ExcelService
 * Responsible for reading, validating, normalizing and transforming Excel files
 * into an array of MovementRecord objects. It never exposes raw worksheet
 * objects outside of the service.
 */
class ExcelService {
  constructor(options = {}) {
    this.options = options;
    // expected header keys mapped to canonical model fields
    this.expectedColumns = [
      'prateleira',
      'localiz física',
      'localiz_fisica',
      'localiz',
      'zona',
      'arm',
      'código',
      'codigo',
      'nome',
      'depart',
      'doc_id',
      'doc num',
      'doc_num',
      'lote',
      'data',
      'hora',
      'e/s',
      'e_s',
      'unid',
      'qtd',
      'quantidade',
      'nomeutilizador',
      'nome utilizador',
      'codbarras',
      'cod barras',
    ];
  }

  /**
   * Load an Excel file from a Buffer or a path and parse it into MovementRecord[]
   * @param {Buffer|string} file - Buffer (recommended) or file path
   * @param {string} [fileName] - optional original file name for metadata
   * @returns {Promise<object>} import result
   */
  async load(file, fileName = 'unknown') {
    const startTime = Date.now();
    if (!file) throw new ExcelFileError('No file provided');

    let workbook;
    try {
      if (Buffer.isBuffer(file) || file instanceof ArrayBuffer) {
        workbook = XLSX.read(file, { type: 'buffer', cellDates: true });
      } else if (typeof file === 'string') {
        // assume path
        workbook = XLSX.readFile(file, { cellDates: true });
      } else {
        throw new ExcelFileError('Unsupported file input type');
      }
    } catch (err) {
      throw new ExcelFileError('Failed to read Excel file: ' + err.message);
    }

    const worksheetName = this._findDataWorksheet(workbook);
    if (!worksheetName) throw new WorksheetNotFoundError('Data worksheet not found');

    const sheet = workbook.Sheets[worksheetName];

    // Validate structure & headers
    const headerMap = validateWorksheet(sheet);
    if (!headerMap || Object.keys(headerMap).length === 0) {
      throw new MissingColumnError('Required columns not found');
    }

    const records = [];
    const errors = [];
    const warnings = [];

    const range = sheet['!ref'];
    if (!range) {
      throw new InvalidFormatError('Worksheet has no range');
    }

    const decoded = XLSX.utils.decode_range(range);
    const startRow = decoded.s.r + 1; // 0-based -> skip header row
    const endRow = decoded.e.r;

    // Process rows one by one to avoid large intermediates
    for (let r = startRow + 1; r <= endRow + 1; r++) {
      // Build a rawRow object with only needed columns
      const rawRow = {};
      let empty = true;
      for (const [colName, colId] of Object.entries(headerMap)) {
        const cellAddress = colId + r; // e.g., 'A' + '2'
        const cell = sheet[cellAddress];
        const val = cell ? cell.v : null;
        if (val !== null && val !== undefined && !(typeof val === 'string' && val.trim() === '')) empty = false;
        rawRow[colName] = val;
      }

      if (empty) continue; // ignore empty rows

      try {
        const normalized = normalizeRow(rawRow, { rowNumber: r });
        const movement = new MovementRecord(normalized);
        records.push(movement);
      } catch (err) {
        // Collect row-specific errors, but continue processing
        errors.push({ row: r, error: err.message });
      }
    }

    const duration = Date.now() - startTime;

    const result = {
      success: errors.length === 0,
      records,
      metadata: {
        fileName,
        worksheet: worksheetName,
        importedRows: records.length,
        ignoredRows: 0, // could compute if needed
        duration,
        generatedAt: new Date().toISOString(),
      },
      errors,
      warnings,
    };

    return result;
  }

  /**
   * Find the worksheet that most likely contains data rows matching expected headers.
   * @private
   */
  _findDataWorksheet(workbook) {
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) return null;

    // Prefer first sheet that contains any of the expected column names
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      try {
        const headerMap = validateWorksheet(sheet);
        if (headerMap && Object.keys(headerMap).length > 0) return name;
      } catch (err) {
        // ignore and continue
      }
    }

    // fallback to first sheet
    return workbook.SheetNames[0] || null;
  }
}

module.exports = { ExcelService };
