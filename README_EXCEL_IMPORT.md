# Fricon UPI v4 - Excel Import Engine

This branch adds a production-ready Excel import engine using SheetJS (xlsx).

Features:

- Reads XLSX files (Buffer or path) using SheetJS.
- Finds the correct worksheet automatically.
- Validates required headers and columns.
- Normalizes rows and converts them into MovementRecord objects.
- Custom error classes for structured error handling.
- Optimized to process rows one-by-one (no large intermediate arrays), ready for big files (>100k rows).

Usage example:

```js
const fs = require('fs');
const { ExcelService } = require('./src/services/excel.service');

const buf = fs.readFileSync('./tests/fixtures/fricon-export.xlsx');
const svc = new ExcelService();
const result = await svc.load(buf, 'fricon-export.xlsx');

console.log(result.records.length, 'records imported');
```

Notes:

- This implementation expects the Fricon Excel column names (Portuguese variants). If your file uses different headers, update `src/utils/excel-validator.js` mappings.
- Install SheetJS dependency before using: `npm install xlsx`

