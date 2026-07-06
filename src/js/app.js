/**
 * Fricon UPI v4 - Main Application Entry Point
 * Initializes the application and orchestrates module loading
 */

import { AppState } from './state.js';
import { config } from './config.js';
import { Logger } from './utils/logger.js';
import { ExcelService } from './services/excel.service.js';
import { ReportService } from './services/report.service.js';
import { StorageService } from './services/storage.service.js';
import { Dashboard } from './ui/dashboard.js';
import { ExportService } from './services/export.service.js';

const logger = new Logger();

/**
 * Initialize application on DOM ready
 */
async function initializeApp() {
  try {
    logger.info(`Initializing Fricon UPI v${config.version}`);

    // Initialize state
    AppState.config = config;

    // Setup event listeners
    setupEventListeners();

    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    showErrorAlert('Failed to initialize application. Please refresh the page.');
  }
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
  // Excel file input
  const fileInput = document.getElementById('excelFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }

  // Export buttons
  const exportButtons = document.querySelectorAll('[data-export]');
  exportButtons.forEach(btn => {
    btn.addEventListener('click', (e) => handleExport(e.target.dataset.export));
  });
}

/**
 * Handle Excel file upload
 * @param {Event} event - File input change event
 */
async function handleFileUpload(event) {
  try {
    const file = event.target.files[0];
    if (!file) return;

    logger.info(`Processing Excel file: ${file.name}`);

    // Read Excel file
    const rawData = await ExcelService.parseExcelFile(file);
    AppState.rawData = rawData;

    // Generate report
    const report = await ReportService.generateReport(rawData);
    AppState.report = report;

    // Update dashboard
    await Dashboard.render();

    // Save to storage
    await StorageService.saveAppState(AppState);

    logger.info('Excel file processed successfully');
  } catch (error) {
    logger.error('Error processing Excel file:', error);
    showErrorAlert('Error processing Excel file. Please check the file format.');
  }
}

/**
 * Handle data export
 * @param {string} format - Export format (excel, csv, json)
 */
async function handleExport(format) {
  try {
    logger.info(`Exporting data as ${format}`);
    await ExportService.export(AppState.report, format);
    logger.info(`Export completed: ${format}`);
  } catch (error) {
    logger.error(`Export failed: ${format}`, error);
    showErrorAlert(`Failed to export as ${format}`);
  }
}

/**
 * Show error alert to user
 * @param {string} message - Error message
 */
function showErrorAlert(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-danger alert-dismissible fade show';
  alertDiv.setAttribute('role', 'alert');
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.insertBefore(alertDiv, document.body.firstChild);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

export { initializeApp };