class ExcelFileError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExcelFileError';
  }
}

class WorksheetNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WorksheetNotFoundError';
  }
}

class MissingColumnError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MissingColumnError';
  }
}

class InvalidDateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidDateError';
  }
}

class InvalidQuantityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidQuantityError';
  }
}

class InvalidFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidFormatError';
  }
}

module.exports = {
  ExcelFileError,
  WorksheetNotFoundError,
  MissingColumnError,
  InvalidDateError,
  InvalidQuantityError,
  InvalidFormatError,
};
