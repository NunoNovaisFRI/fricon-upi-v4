# Fricon UPI v4

... (project README)

## Repository Layer

A Repository Layer has been added to centralize data access and indexing for
Movement records. The implementation lives in `src/repositories/movement.repository.js`.

Goals:
- Hide internal storage from services (KPIService, ReportService, Dashboard)
- Provide a fast, indexed API for common queries
- Keep ExcelService responsible only for reading and normalizing data
- Prepare for large datasets (100k+ records) by using Map indexes

Quick usage example:

```javascript
const MovementRepository = require('./src/repositories/movement.repository');

const repo = new MovementRepository();
// ExcelService should normalize raw Excel rows into MovementRecord objects
// then call repo.load(records)
repo.load(records);

console.log('Total records:', repo.count());
console.log('Top articles:', repo.topArticles(5));
console.log('Statistics:', repo.getStatistics());

// Queries always return new arrays (shallow copies):
const operatorRecords = repo.findByOperator('John Doe');
```

Notes:
- Do not access raw arrays from services; use the repository API exclusively.
- The repository stores a reference to the provided records array for performance
  (avoids extra cloning). Query methods return copies to ensure immutability.

