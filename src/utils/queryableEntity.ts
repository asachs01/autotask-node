/**
 * Queryable Entity Base Class
 * Provides query builder functionality to entity classes
 */

import { AxiosInstance } from 'axios';
import winston from 'winston';
import { QueryBuilder } from './queryBuilder';
import { IQueryBuilder } from '../types/queryBuilder';

/**
 * Base class for entities that support advanced querying
 */
export abstract class QueryableEntity<T> {
  protected abstract endpoint: string;
  protected abstract entityName: string;

  constructor(
    protected axios: AxiosInstance,
    protected logger: winston.Logger
  ) {}

  /**
   * Create a new query builder for this entity
   */
  query(): IQueryBuilder<T> {
    return new QueryBuilder<T>(
      this.axios,
      this.logger,
      this.endpoint,
      this.entityName
    );
  }

  /**
   * Convenience method for simple queries
   */
  where(field: keyof T | string, operator: any, value?: any): IQueryBuilder<T> {
    return this.query().where(field as any, operator, value);
  }

  /**
   * Convenience method for finding by ID
   */
  async findById(id: number | string): Promise<T | null> {
    return this.query().where('id', 'eq', id).first();
  }

  /**
   * Convenience method for finding all records
   */
  async findAll(): Promise<T[]> {
    const result = await this.query().execute();
    return result.data;
  }

  /**
   * Convenience method for finding with pagination
   */
  async findPaginated(page: number = 1, pageSize: number = 50) {
    return this.query().page(page).pageSize(pageSize).execute();
  }

  /**
   * Convenience method for counting records
   */
  async countAll(): Promise<number> {
    return this.query().count();
  }

  /**
   * Convenience method for checking if records exist
   */
  async exists(field: keyof T | string, value: any): Promise<boolean> {
    return this.query()
      .where(field as any, 'eq', value)
      .exists();
  }
}
