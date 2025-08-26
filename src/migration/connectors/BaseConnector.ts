/**
 * Abstract base connector for PSA system integrations
 * Provides common interface and functionality for all PSA connectors
 */

import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { createLogger } from '../../utils/logger';

import {
  SourceConnectionConfig,
  ConnectorCapabilities,
  PSASystem,
  ValidationResult,
  DataQualityReport
} from '../types/MigrationTypes';

export interface ConnectorOptions {
  timeout?: number;
  retryAttempts?: number;
  rateLimit?: number;
  batchSize?: number;
  parallelism?: number;
}

export interface EntitySchema {
  name: string;
  fields: FieldSchema[];
  relationships: RelationshipSchema[];
  constraints: string[];
}

export interface FieldSchema {
  name: string;
  type: string;
  required: boolean;
  maxLength?: number;
  format?: string;
  values?: string[];
}

export interface RelationshipSchema {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  targetEntity: string;
  foreignKey: string;
  required: boolean;
}

export interface FetchOptions {
  filters?: Record<string, any>;
  sorting?: { field: string; direction: 'asc' | 'desc' }[];
  fields?: string[];
  includeRelated?: string[];
  modifiedSince?: Date;
}

export interface SyncResult {
  totalRecords: number;
  fetchedRecords: number;
  errors: Array<{ record: any; error: string }>;
  warnings: string[];
  metadata: Record<string, any>;
}

export abstract class BaseConnector extends EventEmitter {
  protected config: SourceConnectionConfig;
  protected options: ConnectorOptions;
  protected logger: Logger;
  protected isConnected: boolean = false;
  protected rateLimitRemaining: number = 0;
  protected rateLimitReset: Date = new Date();

  constructor(
    protected system: PSASystem,
    config: SourceConnectionConfig,
    options: ConnectorOptions = {}
  ) {
    super();
    this.config = config;
    this.options = {
      timeout: 30000,
      retryAttempts: 3,
      rateLimit: 10,
      batchSize: 100,
      parallelism: 3,
      ...options
    };
    this.logger = createLogger(`${system}Connector`);
  }

  /**
   * Connect to the PSA system
   */
  abstract connect(): Promise<void>;

  /**
   * Disconnect from the PSA system
   */
  abstract disconnect(): Promise<void>;

  /**
   * Test the connection
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Get connector capabilities
   */
  abstract getCapabilities(): ConnectorCapabilities;

  /**
   * Get available entities
   */
  abstract getAvailableEntities(): Promise<string[]>;

  /**
   * Get entity schema
   */
  abstract getEntitySchema(entityType: string): Promise<EntitySchema>;

  /**
   * Get record count for an entity
   */
  abstract getRecordCount(entityType: string, filters?: Record<string, any>): Promise<number>;

  /**
   * Fetch records in batches
   */
  abstract fetchBatch(
    entityType: string,
    offset: number,
    limit: number,
    options?: FetchOptions
  ): Promise<any[]>;

  /**
   * Fetch all records for an entity
   */
  async fetchAll(entityType: string, options?: FetchOptions): Promise<any[]> {
    const allRecords: any[] = [];
    const batchSize = this.options.batchSize || 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        await this.checkRateLimit();
        
        const batch = await this.fetchBatch(entityType, offset, batchSize, options);
        
        if (batch.length === 0) {
          hasMore = false;
        } else {
          allRecords.push(...batch);
          offset += batchSize;
          
          this.emit('progress', {
            entityType,
            fetched: allRecords.length,
            batch: batch.length
          });
        }
      } catch (error) {
        this.logger.error('Error fetching batch', { entityType, offset, error });
        
        if (this.options.retryAttempts && this.options.retryAttempts > 0) {
          await this.sleep(1000 * Math.pow(2, 3 - this.options.retryAttempts));
          this.options.retryAttempts--;
          continue;
        }
        
        throw error;
      }
    }

    return allRecords;
  }

  /**
   * Fetch incremental changes since last sync
   */
  async fetchIncremental(
    entityType: string,
    since: Date,
    options?: FetchOptions
  ): Promise<SyncResult> {
    const incrementalOptions: FetchOptions = {
      ...options,
      modifiedSince: since
    };

    try {
      const records = await this.fetchAll(entityType, incrementalOptions);
      
      return {
        totalRecords: records.length,
        fetchedRecords: records.length,
        errors: [],
        warnings: [],
        metadata: {
          syncTime: new Date(),
          lastModified: since
        }
      };
    } catch (error) {
      this.logger.error('Incremental fetch failed', { entityType, since, error });
      throw error;
    }
  }

  /**
   * Validate data quality for an entity
   */
  async validateDataQuality(entityType: string): Promise<DataQualityReport> {
    try {
      const schema = await this.getEntitySchema(entityType);
      const sampleSize = Math.min(1000, await this.getRecordCount(entityType));
      const sampleRecords = await this.fetchBatch(entityType, 0, sampleSize);

      const issues = await this.analyzeDataQuality(schema, sampleRecords);
      
      const report: DataQualityReport = {
        entityType,
        totalRecords: sampleRecords.length,
        qualityScore: this.calculateQualityScore(issues),
        issues,
        recommendations: this.generateQualityRecommendations(issues),
        metrics: {
          completeness: this.calculateCompleteness(schema, sampleRecords),
          accuracy: this.calculateAccuracy(schema, sampleRecords),
          consistency: this.calculateConsistency(sampleRecords),
          validity: this.calculateValidity(schema, sampleRecords)
        }
      };

      return report;
    } catch (error) {
      this.logger.error('Data quality validation failed', { entityType, error });
      throw error;
    }
  }

  /**
   * Export entity data to various formats
   */
  async exportData(
    entityType: string,
    format: 'json' | 'csv' | 'xml',
    outputPath: string,
    options?: FetchOptions
  ): Promise<void> {
    const records = await this.fetchAll(entityType, options);
    
    switch (format) {
      case 'json':
        await this.exportToJSON(records, outputPath);
        break;
      case 'csv':
        await this.exportToCSV(records, outputPath);
        break;
      case 'xml':
        await this.exportToXML(records, outputPath);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isConnected: boolean;
    lastConnected?: Date;
    rateLimitRemaining: number;
    rateLimitReset: Date;
  } {
    return {
      isConnected: this.isConnected,
      rateLimitRemaining: this.rateLimitRemaining,
      rateLimitReset: this.rateLimitReset
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    details: Record<string, any>;
  }> {
    const startTime = Date.now();
    
    try {
      const isConnected = await this.testConnection();
      const latency = Date.now() - startTime;
      
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        latency,
        details: {
          connection: isConnected,
          rateLimitRemaining: this.rateLimitRemaining,
          system: this.system
        }
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        latency,
        details: {
          error: error.message,
          system: this.system
        }
      };
    }
  }

  // Protected helper methods

  protected async checkRateLimit(): Promise<void> {
    if (this.rateLimitRemaining <= 0 && this.rateLimitReset > new Date()) {
      const waitTime = this.rateLimitReset.getTime() - Date.now();
      this.logger.info('Rate limit exceeded, waiting', { waitTime });
      await this.sleep(waitTime);
    }
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected updateRateLimit(remaining: number, resetTime: Date): void {
    this.rateLimitRemaining = remaining;
    this.rateLimitReset = resetTime;
  }

  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    attempts: number = this.options.retryAttempts || 3
  ): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;
        
        const delay = Math.min(1000 * Math.pow(2, i), 30000);
        this.logger.warn('Operation failed, retrying', { attempt: i + 1, delay, error });
        await this.sleep(delay);
      }
    }
    
    throw new Error('All retry attempts exhausted');
  }

  // Data quality analysis methods

  protected async analyzeDataQuality(schema: EntitySchema, records: any[]): Promise<any[]> {
    const issues: any[] = [];
    
    // Check for missing required fields
    for (const field of schema.fields.filter(f => f.required)) {
      const missingCount = records.filter(r => !r[field.name] || r[field.name] === '').length;
      if (missingCount > 0) {
        issues.push({
          type: 'missing_value',
          field: field.name,
          count: missingCount,
          percentage: (missingCount / records.length) * 100,
          examples: records.filter(r => !r[field.name]).slice(0, 5),
          severity: 'error'
        });
      }
    }

    // Check for format violations
    for (const field of schema.fields) {
      if (field.format) {
        const invalidRecords = records.filter(r => 
          r[field.name] && !this.validateFieldFormat(r[field.name], field.format)
        );
        
        if (invalidRecords.length > 0) {
          issues.push({
            type: 'invalid_format',
            field: field.name,
            count: invalidRecords.length,
            percentage: (invalidRecords.length / records.length) * 100,
            examples: invalidRecords.slice(0, 5),
            severity: 'warning'
          });
        }
      }
    }

    return issues;
  }

  protected calculateQualityScore(issues: any[]): number {
    let score = 100;
    
    for (const issue of issues) {
      const penalty = issue.severity === 'error' ? issue.percentage * 0.5 : issue.percentage * 0.2;
      score -= penalty;
    }
    
    return Math.max(0, Math.round(score));
  }

  protected generateQualityRecommendations(issues: any[]): string[] {
    const recommendations: string[] = [];
    
    for (const issue of issues) {
      switch (issue.type) {
        case 'missing_value':
          recommendations.push(`Fill missing values for required field: ${issue.field}`);
          break;
        case 'invalid_format':
          recommendations.push(`Correct format violations for field: ${issue.field}`);
          break;
        default:
          recommendations.push(`Address ${issue.type} issues in field: ${issue.field}`);
      }
    }
    
    return recommendations;
  }

  protected calculateCompleteness(schema: EntitySchema, records: any[]): number {
    const requiredFields = schema.fields.filter(f => f.required);
    let totalRequired = requiredFields.length * records.length;
    let filled = 0;
    
    for (const record of records) {
      for (const field of requiredFields) {
        if (record[field.name] && record[field.name] !== '') {
          filled++;
        }
      }
    }
    
    return totalRequired > 0 ? (filled / totalRequired) * 100 : 100;
  }

  protected calculateAccuracy(schema: EntitySchema, records: any[]): number {
    // Simplified accuracy calculation based on format validation
    let totalFields = 0;
    let accurateFields = 0;
    
    for (const record of records) {
      for (const field of schema.fields) {
        if (record[field.name] != null) {
          totalFields++;
          if (this.validateFieldFormat(record[field.name], field.format || 'string')) {
            accurateFields++;
          }
        }
      }
    }
    
    return totalFields > 0 ? (accurateFields / totalFields) * 100 : 100;
  }

  protected calculateConsistency(records: any[]): number {
    // Simplified consistency calculation
    return 90; // Placeholder implementation
  }

  protected calculateValidity(schema: EntitySchema, records: any[]): number {
    // Simplified validity calculation
    return 85; // Placeholder implementation
  }

  protected validateFieldFormat(value: any, format: string): boolean {
    if (!value) return true;
    
    const str = value.toString();
    
    switch (format) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
      case 'phone':
        return /^[\+]?[1-9][\d]{0,15}$/.test(str.replace(/\D/g, ''));
      case 'url':
        try {
          new URL(str);
          return true;
        } catch {
          return false;
        }
      case 'date':
        return !isNaN(Date.parse(str));
      case 'number':
        return !isNaN(Number(str));
      default:
        return true;
    }
  }

  // Export methods

  protected async exportToJSON(records: any[], outputPath: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(outputPath, JSON.stringify(records, null, 2));
  }

  protected async exportToCSV(records: any[], outputPath: string): Promise<void> {
    if (records.length === 0) return;
    
    const fs = await import('fs/promises');
    const headers = Object.keys(records[0]);
    
    let csv = headers.join(',') + '\n';
    for (const record of records) {
      const values = headers.map(h => {
        const value = record[h];
        if (value == null) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value.toString();
      });
      csv += values.join(',') + '\n';
    }
    
    await fs.writeFile(outputPath, csv);
  }

  protected async exportToXML(records: any[], outputPath: string): Promise<void> {
    const fs = await import('fs/promises');
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<records>\n';
    for (const record of records) {
      xml += '  <record>\n';
      for (const [key, value] of Object.entries(record)) {
        xml += `    <${key}>${this.escapeXML(value?.toString() || '')}</${key}>\n`;
      }
      xml += '  </record>\n';
    }
    xml += '</records>';
    
    await fs.writeFile(outputPath, xml);
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}