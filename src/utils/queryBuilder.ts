/**
 * Advanced Query Builder Implementation for Autotask API
 * Provides fluent API for building complex queries
 */

import { AxiosInstance } from 'axios';
import winston from 'winston';
import {
  IQueryBuilder,
  QuerySpec,
  QueryResult,
  QueryOptions,
  FilterGroup,
  FilterCondition,
  SortSpec,
  IncludeSpec,
  PaginationOptions,
  ComparisonOperator,
  SortDirection,
  LogicalOperator,
  QueryMetadata,
} from '../types/queryBuilder';

/**
 * Main QueryBuilder class implementing fluent query API
 */
export class QueryBuilder<T> implements IQueryBuilder<T> {
  private spec: QuerySpec = {};
  private currentGroup: FilterGroup = { operator: 'and', conditions: [] };
  private groupStack: FilterGroup[] = [];

  constructor(
    private axios: AxiosInstance,
    private logger: winston.Logger,
    private endpoint: string,
    private entityName: string
  ) {
    this.spec.filters = this.currentGroup;
  }

  // WHERE CONDITIONS

  where<K extends keyof T>(
    field: K,
    operator: ComparisonOperator,
    value?: any
  ): IQueryBuilder<T>;
  where(
    field: string,
    operator: ComparisonOperator,
    value?: any
  ): IQueryBuilder<T>;
  where(
    field: string | keyof T,
    operator: ComparisonOperator,
    value?: any
  ): IQueryBuilder<T> {
    const condition: FilterCondition = {
      field: String(field),
      operator,
      value,
    };

    this.currentGroup.conditions.push(condition);
    return this;
  }

  whereIn<K extends keyof T>(field: K, values: any[]): IQueryBuilder<T>;
  whereIn(field: string, values: any[]): IQueryBuilder<T>;
  whereIn(field: string | keyof T, values: any[]): IQueryBuilder<T> {
    const condition: FilterCondition = {
      field: String(field),
      operator: 'in',
      values,
    };

    this.currentGroup.conditions.push(condition);
    return this;
  }

  whereNotIn<K extends keyof T>(field: K, values: any[]): IQueryBuilder<T>;
  whereNotIn(field: string, values: any[]): IQueryBuilder<T>;
  whereNotIn(field: string | keyof T, values: any[]): IQueryBuilder<T> {
    const condition: FilterCondition = {
      field: String(field),
      operator: 'notIn',
      values,
    };

    this.currentGroup.conditions.push(condition);
    return this;
  }

  whereBetween<K extends keyof T>(
    field: K,
    min: any,
    max: any
  ): IQueryBuilder<T>;
  whereBetween(field: string, min: any, max: any): IQueryBuilder<T>;
  whereBetween(field: string | keyof T, min: any, max: any): IQueryBuilder<T> {
    const condition: FilterCondition = {
      field: String(field),
      operator: 'between',
      values: [min, max],
    };

    this.currentGroup.conditions.push(condition);
    return this;
  }

  whereNull<K extends keyof T>(field: K): IQueryBuilder<T>;
  whereNull(field: string): IQueryBuilder<T>;
  whereNull(field: string | keyof T): IQueryBuilder<T> {
    const condition: FilterCondition = {
      field: String(field),
      operator: 'isNull',
    };

    this.currentGroup.conditions.push(condition);
    return this;
  }

  whereNotNull<K extends keyof T>(field: K): IQueryBuilder<T>;
  whereNotNull(field: string): IQueryBuilder<T>;
  whereNotNull(field: string | keyof T): IQueryBuilder<T> {
    const condition: FilterCondition = {
      field: String(field),
      operator: 'isNotNull',
    };

    this.currentGroup.conditions.push(condition);
    return this;
  }

  // LOGICAL GROUPING

  and(callback: (builder: IQueryBuilder<T>) => void): IQueryBuilder<T> {
    return this.createGroup('and', callback);
  }

  or(callback: (builder: IQueryBuilder<T>) => void): IQueryBuilder<T> {
    return this.createGroup('or', callback);
  }

  private createGroup(
    operator: LogicalOperator,
    callback: (builder: IQueryBuilder<T>) => void
  ): IQueryBuilder<T> {
    // Save current group state
    this.groupStack.push(this.currentGroup);

    // Create new group
    const newGroup: FilterGroup = { operator, conditions: [] };
    this.currentGroup = newGroup;

    // Execute callback to build conditions in this group
    callback(this);

    // Restore previous group and add the new group as a condition
    const parentGroup = this.groupStack.pop()!;
    parentGroup.conditions.push(newGroup);
    this.currentGroup = parentGroup;

    return this;
  }

  // SORTING

  orderBy<K extends keyof T>(
    field: K,
    direction?: SortDirection
  ): IQueryBuilder<T>;
  orderBy(field: string, direction?: SortDirection): IQueryBuilder<T>;
  orderBy(
    field: string | keyof T,
    direction: SortDirection = 'asc'
  ): IQueryBuilder<T> {
    if (!this.spec.sorts) {
      this.spec.sorts = [];
    }

    const sortSpec: SortSpec = {
      field: String(field),
      direction,
    };

    this.spec.sorts.push(sortSpec);
    return this;
  }

  /**
   * Add descending sort order (convenience method)
   */
  orderByDesc(field: string | keyof T): IQueryBuilder<T> {
    return this.orderBy(field as string, 'desc');
  }

  // FIELD SELECTION

  select<K extends keyof T>(...fields: K[]): IQueryBuilder<T>;
  select(...fields: string[]): IQueryBuilder<T>;
  select(...fields: (string | keyof T)[]): IQueryBuilder<T> {
    this.spec.fields = fields.map(f => String(f));
    return this;
  }

  // RELATED ENTITIES

  include(entity: string, fields?: string[], alias?: string): IQueryBuilder<T> {
    if (!this.spec.includes) {
      this.spec.includes = [];
    }

    const includeSpec: IncludeSpec = {
      entity,
      fields,
      alias,
    };

    this.spec.includes.push(includeSpec);
    return this;
  }

  // PAGINATION

  page(pageNumber: number): IQueryBuilder<T> {
    if (!this.spec.pagination) {
      this.spec.pagination = {};
    }
    this.spec.pagination.page = pageNumber;
    return this;
  }

  pageSize(size: number): IQueryBuilder<T> {
    if (!this.spec.pagination) {
      this.spec.pagination = {};
    }
    this.spec.pagination.pageSize = size;
    return this;
  }

  limit(count: number): IQueryBuilder<T> {
    return this.pageSize(count);
  }

  offset(count: number): IQueryBuilder<T> {
    if (!this.spec.pagination) {
      this.spec.pagination = {};
    }
    const pageSize = this.spec.pagination.pageSize || 50;
    this.spec.pagination.page = Math.floor(count / pageSize) + 1;
    return this;
  }

  cursor(cursorValue: string): IQueryBuilder<T> {
    if (!this.spec.pagination) {
      this.spec.pagination = {};
    }
    this.spec.pagination.cursor = cursorValue;
    this.spec.pagination.useCursor = true;
    return this;
  }

  // EXECUTION

  async execute(options?: QueryOptions): Promise<QueryResult<T>> {
    const startTime = Date.now();

    try {
      this.logger.debug('Executing query', {
        entity: this.entityName,
        endpoint: this.endpoint,
        spec: this.spec,
        options,
      });

      // Convert query spec to Autotask API parameters
      const params = this.buildApiParams();

      // Execute the request
      const response = await this.axios.get(this.endpoint, { params });

      const executionTime = Date.now() - startTime;

      // Build metadata from response
      const metadata: QueryMetadata = {
        executionTime,
        fromCache: false,
        ...this.extractMetadataFromResponse(response),
      };

      const result: QueryResult<T> = {
        data: response.data,
        metadata,
      };

      this.logger.debug('Query executed successfully', {
        entity: this.entityName,
        resultCount: result.data.length,
        executionTime,
        metadata,
      });

      return result;
    } catch (error) {
      this.logger.error('Query execution failed', {
        entity: this.entityName,
        endpoint: this.endpoint,
        spec: this.spec,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async first(options?: QueryOptions): Promise<T | null> {
    const originalPageSize = this.spec.pagination?.pageSize;
    this.pageSize(1);

    const result = await this.execute(options);

    // Restore original page size
    if (originalPageSize !== undefined) {
      this.pageSize(originalPageSize);
    }

    return result.data.length > 0 ? result.data[0] : null;
  }

  async count(options?: QueryOptions): Promise<number> {
    // For count queries, we typically need to use a different endpoint or parameter
    // This is a simplified implementation - actual implementation would depend on Autotask API
    const result = await this.execute(options);
    return result.metadata.totalCount || result.data.length;
  }

  async exists(options?: QueryOptions): Promise<boolean> {
    const result = await this.first(options);
    return result !== null;
  }

  // UTILITY METHODS

  toQuerySpec(): QuerySpec {
    return JSON.parse(JSON.stringify(this.spec));
  }

  clone(): IQueryBuilder<T> {
    const cloned = new QueryBuilder<T>(
      this.axios,
      this.logger,
      this.endpoint,
      this.entityName
    );
    cloned.spec = JSON.parse(JSON.stringify(this.spec));
    cloned.currentGroup = JSON.parse(JSON.stringify(this.currentGroup));
    cloned.groupStack = JSON.parse(JSON.stringify(this.groupStack));
    return cloned;
  }

  reset(): IQueryBuilder<T> {
    this.spec = {};
    this.currentGroup = { operator: 'and', conditions: [] };
    this.groupStack = [];
    this.spec.filters = this.currentGroup;
    return this;
  }

  // PRIVATE HELPER METHODS

  private buildApiParams(): Record<string, any> {
    const params: Record<string, any> = {};

    // Build filter string
    if (this.spec.filters && this.spec.filters.conditions.length > 0) {
      params.search = this.buildFilterString(this.spec.filters);
    }

    // Build sort string
    if (this.spec.sorts && this.spec.sorts.length > 0) {
      params.sort = this.spec.sorts
        .map(sort => `${sort.field} ${sort.direction}`)
        .join(',');
    }

    // Build field selection
    if (this.spec.fields && this.spec.fields.length > 0) {
      params.fields = this.spec.fields.join(',');
    }

    // Build includes
    if (this.spec.includes && this.spec.includes.length > 0) {
      params.include = this.spec.includes
        .map(inc => (inc.alias ? `${inc.entity} as ${inc.alias}` : inc.entity))
        .join(',');
    }

    // Build pagination
    if (this.spec.pagination) {
      if (this.spec.pagination.useCursor && this.spec.pagination.cursor) {
        params.cursor = this.spec.pagination.cursor;
      } else {
        if (this.spec.pagination.page) {
          params.page = this.spec.pagination.page;
        }
        if (this.spec.pagination.pageSize) {
          params.pageSize = this.spec.pagination.pageSize;
        }
      }
    }

    return params;
  }

  private buildFilterString(group: FilterGroup): string {
    const conditions = group.conditions.map(condition => {
      if ('operator' in condition && 'conditions' in condition) {
        // It's a nested group
        return `(${this.buildFilterString(condition as FilterGroup)})`;
      } else {
        // It's a filter condition
        const filterCondition = condition as FilterCondition;
        return this.buildConditionString(filterCondition);
      }
    });

    return conditions.join(` ${group.operator.toUpperCase()} `);
  }

  private buildConditionString(condition: FilterCondition): string {
    const { field, operator, value, values } = condition;

    switch (operator) {
      case 'eq':
        return `${field} eq ${this.formatValue(value)}`;
      case 'ne':
        return `${field} ne ${this.formatValue(value)}`;
      case 'gt':
        return `${field} gt ${this.formatValue(value)}`;
      case 'gte':
        return `${field} gte ${this.formatValue(value)}`;
      case 'lt':
        return `${field} lt ${this.formatValue(value)}`;
      case 'lte':
        return `${field} lte ${this.formatValue(value)}`;
      case 'contains':
        return `${field} contains ${this.formatValue(value)}`;
      case 'startsWith':
        return `${field} beginsWith ${this.formatValue(value)}`;
      case 'endsWith':
        return `${field} endsWith ${this.formatValue(value)}`;
      case 'in':
        return `${field} in (${values?.map(v => this.formatValue(v)).join(',')})`;
      case 'notIn':
        return `${field} notIn (${values?.map(v => this.formatValue(v)).join(',')})`;
      case 'isNull':
        return `${field} eq null`;
      case 'isNotNull':
        return `${field} ne null`;
      case 'between':
        return `${field} gte ${this.formatValue(values?.[0])} AND ${field} lte ${this.formatValue(values?.[1])}`;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }
    return String(value);
  }

  private extractMetadataFromResponse(response: any): Partial<QueryMetadata> {
    // Extract metadata from Autotask API response headers or body
    // This is a simplified implementation - actual implementation would depend on Autotask API response format
    const metadata: Partial<QueryMetadata> = {};

    // Check for pagination headers
    if (response.headers) {
      if (response.headers['x-total-count']) {
        metadata.totalCount = parseInt(response.headers['x-total-count'], 10);
      }
      if (response.headers['x-page-count']) {
        metadata.pageCount = parseInt(response.headers['x-page-count'], 10);
      }
      if (response.headers['x-current-page']) {
        metadata.currentPage = parseInt(response.headers['x-current-page'], 10);
      }
      if (response.headers['x-page-size']) {
        metadata.pageSize = parseInt(response.headers['x-page-size'], 10);
      }
    }

    // Calculate pagination flags
    if (metadata.currentPage && metadata.pageCount) {
      metadata.hasNextPage = metadata.currentPage < metadata.pageCount;
      metadata.hasPreviousPage = metadata.currentPage > 1;
    }

    return metadata;
  }
}
