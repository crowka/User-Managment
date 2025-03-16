import { api } from '../api/axios';

/**
 * Data formats supported for export
 */
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf',
  XML = 'xml',
}

/**
 * Data categories that can be exported
 */
export enum ExportCategory {
  PROFILE = 'profile',
  ACTIVITY = 'activity',
  SETTINGS = 'settings',
  ALL = 'all',
}

/**
 * Options for data export
 */
export interface ExportOptions {
  format: ExportFormat;
  categories: ExportCategory[];
  includeTimestamp?: boolean;
  anonymize?: boolean;
  prettify?: boolean;
}

/**
 * Default export options
 */
export const defaultExportOptions: ExportOptions = {
  format: ExportFormat.JSON,
  categories: [ExportCategory.ALL],
  includeTimestamp: true,
  anonymize: false,
  prettify: true,
};

/**
 * Request data export from the API
 * @param options Export options
 * @returns Promise that resolves when the export is ready
 */
export async function requestDataExport(options: Partial<ExportOptions> = {}): Promise<string> {
  try {
    const exportOptions = { ...defaultExportOptions, ...options };
    
    const response = await api.post('/user/export', exportOptions);
    
    return response.data.downloadUrl;
  } catch (error) {
    console.error('Error requesting data export:', error);
    throw error;
  }
}

/**
 * Download exported data directly in the browser
 * @param options Export options
 */
export async function downloadDataExport(options: Partial<ExportOptions> = {}): Promise<void> {
  try {
    const exportOptions = { ...defaultExportOptions, ...options };
    
    // For direct download, we need to use a different endpoint with responseType: 'blob'
    const response = await api.post('/user/export/download', exportOptions, {
      responseType: 'blob',
    });
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { 
      type: getContentType(exportOptions.format) 
    });
    const url = window.URL.createObjectURL(blob);
    
    // Create filename with timestamp
    const timestamp = exportOptions.includeTimestamp 
      ? `_${new Date().toISOString().replace(/[:.]/g, '-')}` 
      : '';
    const filename = `user_data${timestamp}.${exportOptions.format}`;
    
    // Create a temporary link and click it to download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading data export:', error);
    throw error;
  }
}

/**
 * Get content type based on export format
 */
function getContentType(format: ExportFormat): string {
  switch (format) {
    case ExportFormat.JSON:
      return 'application/json';
    case ExportFormat.CSV:
      return 'text/csv';
    case ExportFormat.PDF:
      return 'application/pdf';
    case ExportFormat.XML:
      return 'application/xml';
    default:
      return 'application/octet-stream';
  }
} 