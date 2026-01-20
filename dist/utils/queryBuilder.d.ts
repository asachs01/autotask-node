/**
 * Advanced Query Builder Implementation for Autotask API
 * Provides fluent API for building complex queries
 */
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { IQueryBuilder, QuerySpec, QueryResult, QueryOptions, ComparisonOperator, SortDirection } from '../types/queryBuilder';
/**
 * Main QueryBuilder class implementing fluent query API
 */
export declare class QueryBuilder<T> implements IQueryBuilder<T> {
    private axios;
    private logger;
    private endpoint;
    private entityName;
    private spec;
    private currentGroup;
    private groupStack;
    constructor(axios: AxiosInstance, logger: winston.Logger, endpoint: string, entityName: string);
    where<K extends keyof T>(field: K, operator: ComparisonOperator, value?: any): IQueryBuilder<T>;
    where(field: string, operator: ComparisonOperator, value?: any): IQueryBuilder<T>;
    whereIn<K extends keyof T>(field: K, values: any[]): IQueryBuilder<T>;
    whereIn(field: string, values: any[]): IQueryBuilder<T>;
    whereNotIn<K extends keyof T>(field: K, values: any[]): IQueryBuilder<T>;
    whereNotIn(field: string, values: any[]): IQueryBuilder<T>;
    whereBetween<K extends keyof T>(field: K, min: any, max: any): IQueryBuilder<T>;
    whereBetween(field: string, min: any, max: any): IQueryBuilder<T>;
    whereNull<K extends keyof T>(field: K): IQueryBuilder<T>;
    whereNull(field: string): IQueryBuilder<T>;
    whereNotNull<K extends keyof T>(field: K): IQueryBuilder<T>;
    whereNotNull(field: string): IQueryBuilder<T>;
    and(callback: (builder: IQueryBuilder<T>) => void): IQueryBuilder<T>;
    or(callback: (builder: IQueryBuilder<T>) => void): IQueryBuilder<T>;
    private createGroup;
    orderBy<K extends keyof T>(field: K, direction?: SortDirection): IQueryBuilder<T>;
    orderBy(field: string, direction?: SortDirection): IQueryBuilder<T>;
    /**
     * Add descending sort order (convenience method)
     */
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
    private buildApiParams;
    private buildFilterString;
    private buildConditionString;
    private formatValue;
    private extractMetadataFromResponse;
}
//# sourceMappingURL=queryBuilder.d.ts.map