/**
 * ServiceNow ITSM connector for migration to Autotask
 * Provides data extraction from ServiceNow using REST API
 */

import axios, { AxiosInstance } from 'axios';
import { BaseConnector, EntitySchema, FetchOptions, ConnectorOptions } from './BaseConnector';
import {
  PSASystem,
  SourceConnectionConfig,
  ConnectorCapabilities
} from '../types/MigrationTypes';

export class ServiceNowConnector extends BaseConnector {
  private apiClient!: AxiosInstance;

  constructor(
    system: PSASystem,
    config: SourceConnectionConfig,
    options: ConnectorOptions = {}
  ) {
    super(system, config, options);
  }

  async connect(): Promise<void> {
    try {
      this.logger.info('Connecting to ServiceNow');

      this.apiClient = axios.create({
        baseURL: `${this.config.baseUrl}/api/now`,
        timeout: this.options.timeout || 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      this.setupAuthentication();
      await this.testConnection();
      
      this.isConnected = true;
      this.logger.info('Connected to ServiceNow successfully');
      
    } catch (error) {
      this.logger.error('Failed to connect to ServiceNow', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.logger.info('Disconnected from ServiceNow');
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/table/sys_user?sysparm_limit=1');
      return response.status === 200;
    } catch (error) {
      this.logger.error('ServiceNow connection test failed', error);
      return false;
    }
  }

  getCapabilities(): ConnectorCapabilities {
    return {
      supportedEntities: [
        'companies', // core_company
        'contacts',  // sys_user
        'tickets',   // incident
        'assets',    // cmdb_ci
        'contracts', // contract
        'requests',  // sc_request
        'changes',   // change_request
        'problems',  // problem
        'knowledge', // kb_knowledge
        'departments', // cmn_department
        'locations'  // cmn_location
      ],
      supportsIncrementalSync: true,
      supportsRealTimeSync: false,
      maxBatchSize: 10000,
      rateLimits: {
        requestsPerSecond: 10,
        requestsPerHour: 36000
      },
      authenticationTypes: ['basic_auth', 'oauth2'],
      apiVersion: 'v1'
    };
  }

  async getAvailableEntities(): Promise<string[]> {
    return this.getCapabilities().supportedEntities;
  }

  async getEntitySchema(entityType: string): Promise<EntitySchema> {
    const tableName = this.getTableName(entityType);
    
    try {
      // Get table schema from ServiceNow
      const response = await this.apiClient.get(`/table/sys_dictionary?sysparm_query=name=${tableName}&sysparm_fields=column_label,element,internal_type,mandatory`);
      
      const fields = response.data.result.map((field: any) => ({
        name: field.element,
        type: this.mapServiceNowType(field.internal_type),
        required: field.mandatory === 'true',
        maxLength: field.max_length,
        format: this.getFormatFromType(field.internal_type)
      }));

      return {
        name: entityType,
        fields,
        relationships: this.getRelationships(entityType),
        constraints: []
      };
      
    } catch (error) {
      this.logger.warn('Failed to fetch schema from ServiceNow, using default', { entityType, error });
      return this.getDefaultSchema(entityType);
    }
  }

  async getRecordCount(entityType: string, filters?: Record<string, any>): Promise<number> {
    try {
      const tableName = this.getTableName(entityType);
      const params: any = {
        sysparm_limit: 1,
        sysparm_query: this.buildQuery(filters)
      };

      const response = await this.apiClient.get(`/stats/${tableName}`, { params });
      return response.data.result?.stats?.count || 0;
      
    } catch (error) {
      this.logger.error('Failed to get record count', { entityType, error });
      throw error;
    }
  }

  async fetchBatch(
    entityType: string,
    offset: number,
    limit: number,
    options?: FetchOptions
  ): Promise<any[]> {
    try {
      await this.checkRateLimit();

      const tableName = this.getTableName(entityType);
      const params: any = {
        sysparm_offset: offset,
        sysparm_limit: Math.min(limit, 10000),
        sysparm_query: this.buildQuery(options?.filters),
        sysparm_fields: options?.fields?.join(','),
        sysparm_exclude_reference_link: 'true'
      };

      if (options?.sorting && options.sorting.length > 0) {
        params.sysparm_order_by = options.sorting
          .map(s => `${s.direction === 'desc' ? 'DESC' : ''}${s.field}`)
          .join(',');
      }

      if (options?.modifiedSince) {
        const dateFilter = `sys_updated_on>=${options.modifiedSince.toISOString()}`;
        params.sysparm_query = params.sysparm_query 
          ? `${params.sysparm_query}^${dateFilter}`
          : dateFilter;
      }

      const response = await this.apiClient.get(`/table/${tableName}`, { params });
      
      this.updateRateLimitFromHeaders(response);
      
      return this.transformRecords(entityType, response.data.result || []);
      
    } catch (error) {
      this.logger.error('Failed to fetch batch from ServiceNow', { entityType, offset, limit, error });
      throw error;
    }
  }

  private setupAuthentication(): void {
    const { username, password, token } = this.config.credentials;
    
    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      this.apiClient.defaults.headers.common['Authorization'] = `Basic ${auth}`;
    } else if (token) {
      this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  private getTableName(entityType: string): string {
    const tableMap: Record<string, string> = {
      'companies': 'core_company',
      'contacts': 'sys_user',
      'tickets': 'incident',
      'assets': 'cmdb_ci',
      'contracts': 'contract',
      'requests': 'sc_request',
      'changes': 'change_request',
      'problems': 'problem',
      'knowledge': 'kb_knowledge',
      'departments': 'cmn_department',
      'locations': 'cmn_location'
    };

    const tableName = tableMap[entityType];
    if (!tableName) {
      throw new Error(`Unsupported entity type: ${entityType}`);
    }

    return tableName;
  }

  private buildQuery(filters?: Record<string, any>): string {
    if (!filters || Object.keys(filters).length === 0) {
      return '';
    }

    const conditions: string[] = [];
    
    for (const [field, value] of Object.entries(filters)) {
      if (value != null) {
        if (typeof value === 'string') {
          conditions.push(`${field}=${value}`);
        } else if (typeof value === 'number') {
          conditions.push(`${field}=${value}`);
        } else if (typeof value === 'boolean') {
          conditions.push(`${field}=${value}`);
        } else if (Array.isArray(value)) {
          conditions.push(`${field}IN${value.join(',')}`);
        }
      }
    }

    return conditions.join('^');
  }

  private transformRecords(entityType: string, records: any[]): any[] {
    // Transform ServiceNow records to common format
    return records.map(record => {
      const transformed: any = {};
      
      // Copy all fields
      for (const [key, value] of Object.entries(record)) {
        transformed[key] = this.transformFieldValue(key, value);
      }

      // Add computed fields
      transformed._source_id = record.sys_id;
      transformed._source_updated = record.sys_updated_on;
      transformed._entity_type = entityType;

      return transformed;
    });
  }

  private transformFieldValue(fieldName: string, value: any): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Handle ServiceNow reference fields
    if (typeof value === 'object' && value.value) {
      return value.value;
    }

    // Handle date fields
    if (fieldName.includes('_on') || fieldName.includes('_at')) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString();
    }

    return value;
  }

  private mapServiceNowType(serviceNowType: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'integer': 'number',
      'decimal': 'number',
      'boolean': 'boolean',
      'glide_date': 'date',
      'glide_date_time': 'datetime',
      'reference': 'string',
      'choice': 'string',
      'email': 'email',
      'url': 'url',
      'phone_number': 'phone'
    };

    return typeMap[serviceNowType] || 'string';
  }

  private getFormatFromType(serviceNowType: string): string | undefined {
    const formatMap: Record<string, string> = {
      'email': 'email',
      'url': 'url',
      'phone_number': 'phone',
      'glide_date': 'date',
      'glide_date_time': 'datetime'
    };

    return formatMap[serviceNowType];
  }

  private getRelationships(entityType: string): any[] {
    const relationshipMap: Record<string, any[]> = {
      'tickets': [
        {
          name: 'caller',
          type: 'many-to-one',
          targetEntity: 'contacts',
          foreignKey: 'caller_id',
          required: false
        },
        {
          name: 'company',
          type: 'many-to-one',
          targetEntity: 'companies',
          foreignKey: 'company',
          required: false
        }
      ],
      'assets': [
        {
          name: 'company',
          type: 'many-to-one',
          targetEntity: 'companies',
          foreignKey: 'company',
          required: false
        }
      ]
    };

    return relationshipMap[entityType] || [];
  }

  private getDefaultSchema(entityType: string): EntitySchema {
    // Default schemas for common ServiceNow entities
    const defaultSchemas: Record<string, EntitySchema> = {
      tickets: {
        name: 'tickets',
        fields: [
          { name: 'sys_id', type: 'string', required: false },
          { name: 'number', type: 'string', required: true },
          { name: 'short_description', type: 'string', required: true, maxLength: 160 },
          { name: 'description', type: 'string', required: false },
          { name: 'state', type: 'string', required: true },
          { name: 'priority', type: 'string', required: false },
          { name: 'urgency', type: 'string', required: false },
          { name: 'impact', type: 'string', required: false },
          { name: 'caller_id', type: 'string', required: false },
          { name: 'assigned_to', type: 'string', required: false },
          { name: 'assignment_group', type: 'string', required: false },
          { name: 'category', type: 'string', required: false },
          { name: 'subcategory', type: 'string', required: false },
          { name: 'company', type: 'string', required: false },
          { name: 'opened_at', type: 'string', required: false, format: 'datetime' },
          { name: 'closed_at', type: 'string', required: false, format: 'datetime' },
          { name: 'resolved_at', type: 'string', required: false, format: 'datetime' },
          { name: 'sys_created_on', type: 'string', required: false, format: 'datetime' },
          { name: 'sys_updated_on', type: 'string', required: false, format: 'datetime' }
        ],
        relationships: this.getRelationships('tickets'),
        constraints: []
      }
    };

    return defaultSchemas[entityType] || {
      name: entityType,
      fields: [],
      relationships: [],
      constraints: []
    };
  }

  private updateRateLimitFromHeaders(response: any): void {
    // ServiceNow doesn't typically provide rate limit headers
    // Use default values
    this.updateRateLimit(1000, new Date(Date.now() + 60000));
  }
}