# Fricon UPI v4.0.0

Production KPI Management System

## Overview

Fricon UPI v4 is a refactored and modularized version of the production KPI management application. This version implements a modern, service-oriented architecture while maintaining 100% backward c[...]

## Features

- **Modular Architecture**: Services, UI components, utilities separated for maintainability
- **Centralized State Management**: Single source of truth with AppState
- **Data Services**: Excel parsing, report generation, storage, and export
- **UI Components**: Dashboard, cards, filters, tables, and alerts
- **Utility Functions**: Formatting, logging, date manipulation, and helpers
- **ES Modules**: Modern JavaScript module system
- **JSDoc Documentation**: Complete function documentation

## Project Structure

```
src/
├── assets/                    # Static assets
├── css/                       # Stylesheets
│   ├── main.css              # Main styles
│   ├── dashboard.css         # Dashboard styles
│   ├── cards.css             # KPI cards styles
│   ├── tables.css            # Table styles
│   ├── email.css             # Email template styles
│   └── responsive.css        # Responsive design
├── js/
│   ├── app.js                # Application entry point
│   ├── config.js             # Legacy / compatibility configuration
│   ├── state.js              # Global application state
│   ├── services/
│   │   ├── excel.service.js          # Excel file handling
│   │   ├── report.service.js         # Report generation
│   │   ├── storage.service.js        # Data persistence
│   │   └── export.service.js         # Data export
│   ├── ui/
│   │   ├── dashboard.js      # Dashboard component
│   │   ├── cards.js          # KPI cards component
│   │   ├── filters.js        # Filters component
│   │   ├── table.js          # Table component
│   │   └── alerts.js         # Alerts component
│   ├── charts/
│   │   └── chart.service.js  # Chart.js integration
│   └── utils/
│       ├── logger.js         # Logging utility
│       ├── format.js         # Formatting utilities
│       ├── dates.js          # Date utilities
│       └── helpers.js        # General helpers
├── index.html                # Main HTML file
└── package.json              # Project configuration
```

## Getting Started

### Prerequisites

- Web browser (Chrome, Firefox, Safari, Edge)
- Python 3+ (for local development server)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Start development server:
   ```bash
   npm start
   ```
   Or with Python:
   ```bash
   python -m http.server 8000 --directory src
   ```

4. Open browser and navigate to `http://localhost:8000`

## Usage

### Uploading Excel Files

1. Click "Upload Excel" button
2. Select a valid Excel file
3. Application will parse, process, and display data

### Exporting Data

- Click "Export Excel" to download in Excel format
- Click "Export CSV" to download in CSV format
- Additional formats (JSON, PDF) available through code

### Configuration

Edit `src/js/config.js` to customize legacy configuration used by older modules. For the new centralized Configuration Engine (recommended), see the "Configuration Engine" section below.

## Architecture

### Service-Oriented Design

```
Excel File
    ↓
ExcelService (Parse & Transform)
    ↓
AppState (Store Raw Data)
    ↓
ReportService (Generate Report)
    ↓
AppState (Store Report)
    ↓
Dashboard/Export (Consume Report)
```

### State Management

All application state is managed through `AppState` object:
- `rawData`: Original data from Excel
- `filteredData`: Filtered data based on active filters
- `report`: Generated report with KPIs and metrics
- `charts`: Chart instances
- `config`: Application configuration
- `ui`: UI state (filters, theme, layout)

### Logging

Use the Logger utility for consistent logging:

```javascript
import { Logger } from './utils/logger.js';

const logger = new Logger();
logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message');
```

## Configuration Engine (centralized)

Starting in this branch, the project includes a centralized Configuration Engine that replaces the need to scatter configuration values across the codebase. The legacy `src/js/config.js` file is kept for backward compatibility but new development should use the ConfigService.

Files added
- `src/config/config.json` — default configuration (loaded at runtime)
- `src/config/settings.schema.json` — JSON Schema used to validate configuration
- `src/config/themes.json` — theme palette definitions (light and dark)
- `src/js/services/config.service.js` — ConfigService implementation (ES module)

Local persistence
- User overrides are stored in `localStorage` under key: `fricon_config_overrides`.

API (ConfigService)
- `load(): Promise<object>` — Load defaults + schema and apply overrides from localStorage.
- `save(): void` — Persist current overrides.
- `reload(): Promise<object>` — Reload defaults and reapply overrides.
- `get(path: string): any` — Read value by dot-path (e.g. `dashboard.theme`).
- `set(path: string, value: any): {valid:boolean, errors?:string[]}` — Set a value (validates full config and persists override on success).
- `reset(): Promise<object>` — Clear overrides and reload defaults.
- `validate(obj: object): {valid:boolean, errors:string[]}` — Validate an object against the JSON Schema.
- `export(pretty = true): string` — Export current merged configuration as JSON.
- `import(jsonOrObj): {valid:boolean, errors?:string[]}` — Import a full configuration (validated and applied as overrides).

Usage examples

```javascript
import ConfigService from './js/services/config.service.js';

// Ensure configuration is loaded (async)
await ConfigService.load();

// Read value
const theme = ConfigService.get('dashboard.theme'); // 'light'

// Set and persist an override
const res = ConfigService.set('dashboard.theme', 'dark');
if (!res.valid) console.warn('Validation errors', res.errors);

// Export current config
const json = ConfigService.export();

// Reset to defaults
await ConfigService.reset();
```

Notes for developers
- The service exports both the default singleton and the class (for unit-testing):
  `import ConfigService, { ConfigServiceClass } from './js/services/config.service.js';`
- For unit tests instantiate with `new ConfigServiceClass({ autoLoad: false, configUrl: '/test/fixtures/config.json', schemaUrl: '/test/fixtures/schema.json' })` and mock `fetch` and `localStorage` as needed.

## Compatibility

- ✅ 100% backward compatible with existing Excel files
- ✅ Same user interface and experience
- ✅ All existing features preserved
- ✅ All existing charts and filters work

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Modular code splitting for faster loading
- Lazy loading of components
- Efficient state management
- Optimized chart rendering

## Future Enhancements (Sprint 2+)

- Executive Dashboard
- Advanced Report Engine
- Power Automate Integration
- PDF Generation
- Historical Data Tracking
- Additional KPIs
- Email Report Distribution

## Version History

### v4.0.0 - Foundation Architecture
- Complete refactor to modular architecture
- Service-oriented design
- Centralized state management
- 100% backward compatibility maintained

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
