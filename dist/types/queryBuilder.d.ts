/**
 * Advanced Query Builder Types for Autotask API
 * Provides type-safe query building with fluent API
 */
/**
 * Comparison operators for filtering
 */
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn' | 'isNull' | 'isNotNull' | 'between';
/**
 * Logical operators for combining conditions
 */
export type LogicalOperator = 'and' | 'or';
/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';
/**
 * Filter condition
 */
export interface FilterCondition {
    field: string;
    operator: ComparisonOperator;
    value?: any;
    values?: any[];
}
/**
 * Logical group of conditions
 */
export interface FilterGroup {
    operator: LogicalOperator;
    conditions: (FilterCondition | FilterGroup)[];
}
/**
 * Sort specification
 */
export interface SortSpec {
    field: string;
    direction: SortDirection;
}
/**
 * Include specification for related entities
 */
export interface IncludeSpec {
    entity: string;
    fields?: string[];
    alias?: string;
}
/**
 * Pagination options
 */
export interface PaginationOptions {
    page?: number;
    pageSize?: number;
    cursor?: string;
    useCursor?: boolean;
}
/**
 * Query execution options
 */
export interface QueryOptions {
    timeout?: number;
    retries?: number;
    cache?: boolean;
    cacheTtl?: number;
}
/**
 * Complete query specification
 */
export interface QuerySpec {
    filters?: FilterGroup;
    sorts?: SortSpec[];
    includes?: IncludeSpec[];
    fields?: string[];
    pagination?: PaginationOptions;
    options?: QueryOptions;
}
/**
 * Query result metadata
 */
export interface QueryMetadata {
    totalCount?: number;
    pageCount?: number;
    currentPage?: number;
    pageSize?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    previousCursor?: string;
    executionTime?: number;
    fromCache?: boolean;
}
/**
 * Query result with data and metadata
 */
export interface QueryResult<T> {
    data: T[];
    metadata: QueryMetadata;
}
/**
 * Type-safe field names for entities
 */
export type FieldName<T> = keyof T | string;
/**
 * Value type for a specific field
 */
export type FieldValue<T, K extends keyof T> = T[K];
/**
 * Query builder interface
 */
export interface IQueryBuilder<T> {
    where<K extends keyof T>(field: K, operator: ComparisonOperator, value?: FieldValue<T, K>): IQueryBuilder<T>;
    where(field: string, operator: ComparisonOperator, value?: any): IQueryBuilder<T>;
    whereIn<K extends keyof T>(field: K, values: FieldValue<T, K>[]): IQueryBuilder<T>;
    whereIn(field: string, values: any[]): IQueryBuilder<T>;
    whereNotIn<K extends keyof T>(field: K, values: FieldValue<T, K>[]): IQueryBuilder<T>;
    whereNotIn(field: string, values: any[]): IQueryBuilder<T>;
    whereBetween<K extends keyof T>(field: K, min: FieldValue<T, K>, max: FieldValue<T, K>): IQueryBuilder<T>;
    whereBetween(field: string, min: any, max: any): IQueryBuilder<T>;
    whereNull<K extends keyof T>(field: K): IQueryBuilder<T>;
    whereNull(field: string): IQueryBuilder<T>;
    whereNotNull<K extends keyof T>(field: K): IQueryBuilder<T>;
    whereNotNull(field: string): IQueryBuilder<T>;
    and(callback: (builder: IQueryBuilder<T>) => void): IQueryBuilder<T>;
    or(callback: (builder: IQueryBuilder<T>) => void): IQueryBuilder<T>;
    orderBy<K extends keyof T>(field: K, direction?: SortDirection): IQueryBuilder<T>;
    orderBy(field: string, direction?: SortDirection): IQueryBuilder<T>;
    orderByDesc(field: string | keyof T): IQueryBuilder<T>;
    select<K extends keyof T>(...fields: K[]): IQueryBuilder<T>;
    select(...fields: string[]): IQueryBuilder<T>;
    include(entity: string, fields?: string[], alias?: string): IQueryBuilder<T>;
    page(pageNumber: number): IQueryBuilder<T>;
    pageSize(size: number): IQueryBuilder<T>;
    limit(count: number): IQueryBuilder<T>;
    offset(count: number): IQueryBuilder<T>;
    cursor(cursorValue: string): IQueryBuilder<T>;
    execute(options?: QueryOptions): Promise<QueryResult<T>>;
    first(options?: QueryOptions): Promise<T | null>;
    count(options?: QueryOptions): Promise<number>;
    exists(options?: QueryOptions): Promise<boolean>;
    toQuerySpec(): QuerySpec;
    clone(): IQueryBuilder<T>;
    reset(): IQueryBuilder<T>;
}
/**
 * Custom field definition for UDFs
 */
export interface CustomFieldDefinition {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'picklist';
    isRequired?: boolean;
    picklistValues?: string[];
    defaultValue?: any;
}
/**
 * Entity schema definition
 */
export interface EntitySchema {
    entityName: string;
    fields: Record<string, {
        type: string;
        required?: boolean;
        readonly?: boolean;
    }>;
    customFields?: CustomFieldDefinition[];
    relationships?: Record<string, {
        type: 'hasOne' | 'hasMany' | 'belongsTo';
        entity: string;
        foreignKey?: string;
    }>;
}
//# sourceMappingURL=queryBuilder.d.ts.map