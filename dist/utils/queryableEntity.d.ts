/**
 * Queryable Entity Base Class
 * Provides query builder functionality to entity classes
 */
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { IQueryBuilder } from '../types/queryBuilder';
/**
 * Base class for entities that support advanced querying
 */
export declare abstract class QueryableEntity<T> {
    protected axios: AxiosInstance;
    protected logger: winston.Logger;
    protected abstract endpoint: string;
    protected abstract entityName: string;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    /**
     * Create a new query builder for this entity
     */
    query(): IQueryBuilder<T>;
    /**
     * Convenience method for simple queries
     */
    where(field: keyof T | string, operator: any, value?: any): IQueryBuilder<T>;
    /**
     * Convenience method for finding by ID
     */
    findById(id: number | string): Promise<T | null>;
    /**
     * Convenience method for finding all records
     */
    findAll(): Promise<T[]>;
    /**
     * Convenience method for finding with pagination
     */
    findPaginated(page?: number, pageSize?: number): Promise<import("../types/queryBuilder").QueryResult<T>>;
    /**
     * Convenience method for counting records
     */
    countAll(): Promise<number>;
    /**
     * Convenience method for checking if records exist
     */
    exists(field: keyof T | string, value: any): Promise<boolean>;
}
//# sourceMappingURL=queryableEntity.d.ts.map