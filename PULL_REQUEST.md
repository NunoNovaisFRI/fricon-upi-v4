# Pull Request: feat(excel-import): implement Excel Import Engine (Issue #6)

This PR implements the Excel Import Engine described in Issue #6.

Summary
- Adds ExcelService (src/services/excel.service.js) that reads XLSX files using SheetJS and returns normalized MovementRecord objects only.
- Adds MovementRecord model (src/models/MovementRecord.js).
- Adds validator (src/utils/excel-validator.js) and normalizer (src/utils/excel-normalizer.js).
- Adds custom errors (src/errors/index.js).
- Adds README_EXCEL_IMPORT.md documenting usage and requirements.

Files changed
- src/services/excel.service.js
- src/models/MovementRecord.js
- src/utils/excel-validator.js
- src/utils/excel-normalizer.js
- src/errors/index.js
- README_EXCEL_IMPORT.md

Testing
- Install SheetJS: npm install xlsx
- Run basic integration with a Fricon XLSX sample file as described in the README_EXCEL_IMPORT.md

Notes
- The service processes rows in a streaming-friendly loop but uses SheetJS which loads the workbook into memory; for extremely large Excel files consider switching to a streaming parser.
- Header mappings in the validator contain Portuguese variants used by Fricon. Add more mappings if needed.

Closes #6
