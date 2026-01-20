"use strict";
/**
 * CSV/Excel Import connector for generic data migration to Autotask
 * Supports flexible column mapping and data transformation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVImportConnector = void 0;
const fs = __importStar(require("fs/promises"));
const csv_parse_1 = require("csv-parse");
const BaseConnector_1 = require("./BaseConnector");
class CSVImportConnector extends BaseConnector_1.BaseConnector {
    constructor(system, config, options = {}) {
        super(system, config, options);
        this.records = [];
        this.headers = [];
        this.totalRecords = 0;
        this.config = config;
    }
    async connect() {
        try {
            this.logger.info('Loading data from file', { filePath: this.config.filePath });
            // Check if file exists
            await fs.access(this.config.filePath);
            // Load data based on format
            if (this.config.format === 'excel') {
                await this.loadExcelData();
            }
            else {
                await this.loadCSVData();
            }
            this.isConnected = true;
            this.totalRecords = this.records.length;
            this.logger.info('Data loaded successfully', {
                records: this.totalRecords,
                headers: this.headers.length
            });
        }
        catch (error) {
            this.logger.error('Failed to load data from file', error);
            throw error;
        }
    }
    async disconnect() {
        this.records = [];
        this.headers = [];
        this.totalRecords = 0;
        this.isConnected = false;
        this.logger.info('CSV Import connector disconnected');
    }
    async testConnection() {
        try {
            await fs.access(this.config.filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    getCapabilities() {
        return {
            supportedEntities: [
                'companies',
                'contacts',
                'tickets',
                'projects',
                'time_entries',
                'products',
                'invoices',
                'contracts',
                'opportunities',
                'generic' // For any custom entity mapping
            ],
            supportsIncrementalSync: false,
            supportsRealTimeSync: false,
            maxBatchSize: 10000,
            rateLimits: {
                requestsPerSecond: 1000, // No network limitations
                requestsPerHour: 3600000
            },
            authenticationTypes: ['none'],
            apiVersion: 'file-import-1.0'
        };
    }
    async getAvailableEntities() {
        // For CSV imports, we typically work with a single entity type
        // or generic data that gets mapped to specific entities
        return ['generic'];
    }
    async getEntitySchema(entityType) {
        // Generate schema based on loaded data
        if (!this.isConnected || this.records.length === 0) {
            throw new Error('No data loaded. Call connect() first.');
        }
        const fields = this.headers.map(header => ({
            name: header,
            type: this.inferFieldType(header),
            required: false,
            maxLength: this.getMaxLength(header)
        }));
        return {
            name: entityType,
            fields,
            relationships: [],
            constraints: []
        };
    }
    async getRecordCount(entityType, filters) {
        if (!this.isConnected) {
            throw new Error('Not connected. Call connect() first.');
        }
        if (filters && Object.keys(filters).length > 0) {
            return this.filterRecords(filters).length;
        }
        return this.totalRecords;
    }
    async fetchBatch(entityType, offset, limit, options) {
        if (!this.isConnected) {
            throw new Error('Not connected. Call connect() first.');
        }
        let filteredRecords = this.records;
        // Apply filters if provided
        if (options?.filters && Object.keys(options.filters).length > 0) {
            filteredRecords = this.filterRecords(options.filters);
        }
        // Apply sorting if provided
        if (options?.sorting && options.sorting.length > 0) {
            filteredRecords = this.sortRecords(filteredRecords, options.sorting);
        }
        // Apply field selection if provided
        let result = filteredRecords.slice(offset, offset + limit);
        if (options?.fields && options.fields.length > 0) {
            result = result.map(record => {
                const filtered = {};
                for (const field of options.fields) {
                    if (Object.prototype.hasOwnProperty.call(record, field)) {
                        filtered[field] = record[field];
                    }
                }
                return filtered;
            });
        }
        // Apply data transformations and mappings
        result = this.applyMappings(result);
        return result;
    }
    async loadCSVData() {
        const fileContent = await fs.readFile(this.config.filePath, { encoding: (this.config.encoding || 'utf8') });
        return new Promise((resolve, reject) => {
            const records = [];
            let headers = [];
            let isFirstRow = true;
            const parser = (0, csv_parse_1.parse)(fileContent, {
                delimiter: this.config.delimiter || ',',
                skip_empty_lines: true,
                trim: true,
                from_line: (this.config.skipRows || 0) + 1
            });
            parser.on('data', (row) => {
                if (isFirstRow && (this.config.hasHeaders !== false)) {
                    headers = row;
                    isFirstRow = false;
                }
                else {
                    const record = {};
                    if (headers.length > 0) {
                        // Use headers as keys
                        headers.forEach((header, index) => {
                            record[header] = this.parseValue(row[index] || '', header);
                        });
                    }
                    else {
                        // Use column indices as keys
                        row.forEach((value, index) => {
                            record[`column_${index}`] = this.parseValue(value, `column_${index}`);
                        });
                    }
                    records.push(record);
                }
            });
            parser.on('error', (error) => {
                this.logger.error('CSV parsing error', error);
                reject(error);
            });
            parser.on('end', () => {
                this.records = records;
                this.headers = headers.length > 0 ? headers :
                    Array.from({ length: records[0] ? Object.keys(records[0]).length : 0 }, (_, i) => `column_${i}`);
                resolve();
            });
        });
    }
    async loadExcelData() {
        try {
            const ExcelJS = await Promise.resolve().then(() => __importStar(require('exceljs')));
            const workbook = new ExcelJS.default.Workbook();
            await workbook.xlsx.readFile(this.config.filePath);
            const worksheet = workbook.worksheets[0];
            if (!worksheet) {
                throw new Error('No worksheets found in Excel file');
            }
            const skipRows = this.config.skipRows || 0;
            const hasHeaders = this.config.hasHeaders !== false;
            const data = [];
            let headers = [];
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber <= skipRows)
                    return;
                const rowValues = row.values;
                // ExcelJS row.values is 1-indexed, so slice from index 1
                const values = rowValues.slice(1);
                if (hasHeaders && rowNumber === skipRows + 1) {
                    headers = values.map((v, i) => String(v ?? `column_${i}`));
                    return;
                }
                const record = {};
                const effectiveHeaders = headers.length > 0 ? headers :
                    values.map((_, i) => `column_${i}`);
                values.forEach((value, index) => {
                    const key = effectiveHeaders[index] || `column_${index}`;
                    record[key] = value;
                });
                data.push(record);
            });
            this.records = data.map(record => this.processExcelRecord(record));
            this.headers = headers.length > 0 ? headers :
                (this.records.length > 0 ? Object.keys(this.records[0]) : []);
        }
        catch (error) {
            this.logger.warn('Excel library not available, falling back to CSV parsing');
            await this.loadCSVData();
        }
    }
    processExcelRecord(record) {
        const processed = {};
        for (const [key, value] of Object.entries(record)) {
            const stringKey = key.toString();
            processed[stringKey] = this.parseValue(value, stringKey);
        }
        return processed;
    }
    parseValue(value, fieldName) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const stringValue = value.toString().trim();
        // Check for custom date formats
        if (this.config.dateFormats && this.config.dateFormats[fieldName]) {
            const dateValue = this.parseDate(stringValue, this.config.dateFormats[fieldName]);
            if (dateValue)
                return dateValue;
        }
        // Auto-detect data types
        // Boolean
        if (['true', 'false', 'yes', 'no', '1', '0'].includes(stringValue.toLowerCase())) {
            return ['true', 'yes', '1'].includes(stringValue.toLowerCase());
        }
        // Number
        if (/^\d+\.?\d*$/.test(stringValue)) {
            const num = parseFloat(stringValue);
            return isNaN(num) ? stringValue : num;
        }
        // Date (common formats)
        const datePatterns = [
            /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
            /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
            /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
        ];
        for (const pattern of datePatterns) {
            if (pattern.test(stringValue)) {
                const dateValue = new Date(stringValue);
                if (!isNaN(dateValue.getTime())) {
                    return dateValue.toISOString();
                }
            }
        }
        // Email
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
            return stringValue;
        }
        // Phone (basic pattern)
        if (/^[+]?[1-9][\d]{0,15}$/.test(stringValue.replace(/\D/g, ''))) {
            return stringValue;
        }
        // Default to string
        return stringValue;
    }
    parseDate(value, format) {
        // Simple date parsing implementation
        // In production, you'd want to use a library like moment.js or date-fns
        try {
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date.toISOString();
        }
        catch {
            return null;
        }
    }
    inferFieldType(fieldName) {
        if (!this.records.length)
            return 'string';
        const sampleValues = this.records
            .slice(0, Math.min(100, this.records.length))
            .map(record => record[fieldName])
            .filter(value => value != null);
        if (sampleValues.length === 0)
            return 'string';
        // Check types of sample values
        const types = sampleValues.map(value => {
            if (typeof value === 'boolean')
                return 'boolean';
            if (typeof value === 'number')
                return 'number';
            if (typeof value === 'string') {
                if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value))
                    return 'datetime';
                if (/^\d{4}-\d{2}-\d{2}$/.test(value))
                    return 'date';
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    return 'email';
                if (/^[+]?[1-9][\d]{0,15}$/.test(value.replace(/\D/g, '')))
                    return 'phone';
            }
            return 'string';
        });
        // Return most common type
        const typeCounts = types.reduce((counts, type) => {
            counts[type] = (counts[type] || 0) + 1;
            return counts;
        }, {});
        return Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);
    }
    getMaxLength(fieldName) {
        if (!this.records.length)
            return undefined;
        const stringValues = this.records
            .map(record => record[fieldName])
            .filter(value => typeof value === 'string')
            .map(value => value.length);
        return stringValues.length > 0 ? Math.max(...stringValues) : undefined;
    }
    filterRecords(filters) {
        return this.records.filter(record => {
            for (const [field, value] of Object.entries(filters)) {
                if (Array.isArray(value)) {
                    if (!value.includes(record[field]))
                        return false;
                }
                else if (record[field] !== value) {
                    return false;
                }
            }
            return true;
        });
    }
    sortRecords(records, sorting) {
        return [...records].sort((a, b) => {
            for (const sort of sorting) {
                const aVal = a[sort.field];
                const bVal = b[sort.field];
                if (aVal < bVal)
                    return sort.direction === 'asc' ? -1 : 1;
                if (aVal > bVal)
                    return sort.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    applyMappings(records) {
        if (!this.config.mapping || Object.keys(this.config.mapping).length === 0) {
            return records;
        }
        return records.map(record => {
            const mapped = {};
            for (const [sourceField, targetField] of Object.entries(this.config.mapping)) {
                if (Object.prototype.hasOwnProperty.call(record, sourceField)) {
                    mapped[targetField] = record[sourceField];
                }
            }
            // Include unmapped fields
            for (const [key, value] of Object.entries(record)) {
                if (!this.config.mapping[key]) {
                    mapped[key] = value;
                }
            }
            return mapped;
        });
    }
    /**
     * Preview data for mapping configuration
     */
    async previewData(limit = 10) {
        if (!this.isConnected) {
            await this.connect();
        }
        const sampleRecords = this.records.slice(0, limit);
        const statistics = {};
        // Calculate basic statistics for each field
        for (const header of this.headers) {
            const values = this.records.map(r => r[header]).filter(v => v != null);
            const uniqueValues = [...new Set(values)];
            statistics[header] = {
                totalValues: values.length,
                uniqueValues: uniqueValues.length,
                nullValues: this.records.length - values.length,
                type: this.inferFieldType(header),
                sampleValues: uniqueValues.slice(0, 10)
            };
            if (typeof values[0] === 'number') {
                const numbers = values.filter(v => typeof v === 'number');
                statistics[header].min = Math.min(...numbers);
                statistics[header].max = Math.max(...numbers);
                statistics[header].avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
            }
            if (typeof values[0] === 'string') {
                statistics[header].maxLength = Math.max(...values.map(v => v.length));
                statistics[header].avgLength = values.reduce((a, b) => a + b.length, 0) / values.length;
            }
        }
        return {
            headers: this.headers,
            sampleRecords,
            statistics
        };
    }
}
exports.CSVImportConnector = CSVImportConnector;
//# sourceMappingURL=CSVImportConnector.js.map