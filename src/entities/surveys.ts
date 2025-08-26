import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ISurveys {
  id?: number;
  [key: string]: any;
}

export interface ISurveysQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Surveys entity class for Autotask API
 * 
 * Customer satisfaction surveys
 * Supported Operations: GET
 * Category: surveys
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SurveysEntity.htm}
 */
export class Surveys extends BaseEntity {
  private readonly endpoint = '/Surveys';

  constructor(
    axios: AxiosInstance,
    logger: winston.Logger,
    requestHandler?: RequestHandler
  ) {
    super(axios, logger, requestHandler);
  }

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'getSurveys',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ISurveys',
        endpoint: '/Surveys/{id}',
      },
      {
        operation: 'listSurveys',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ISurveys[]',
        endpoint: '/Surveys',
      }
    ];
  }

  /**
   * Get a surveys by ID
   * @param id - The surveys ID
   * @returns Promise with the surveys data
   */
  async get(id: number): Promise<ApiResponse<ISurveys>> {
    this.logger.info('Getting surveys', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List surveys with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of surveys
   */
  async list(query: ISurveysQuery = {}): Promise<ApiResponse<ISurveys[]>> {
    this.logger.info('Listing surveys', { query });
    const searchBody: Record<string, any> = {};

    // Set up basic filter if none provided
    if (!query.filter || Object.keys(query.filter).length === 0) {
      searchBody.filter = [
        {
          op: 'gte',
          field: 'id',
          value: 0,
        },
      ];
    } else {
      // Convert object filter to array format
      if (!Array.isArray(query.filter)) {
        const filterArray = [];
        for (const [field, value] of Object.entries(query.filter)) {
          filterArray.push({
            op: 'eq',
            field: field,
            value: value,
          });
        }
        searchBody.filter = filterArray;
      } else {
        searchBody.filter = query.filter;
      }
    }

    if (query.sort) searchBody.sort = query.sort;
    if (query.page) searchBody.page = query.page;
    if (query.pageSize) searchBody.pageSize = query.pageSize;

    return this.executeQueryRequest(
      async () => this.axios.get(`${this.endpoint}/query`, { params: searchBody }),
      `${this.endpoint}/query`,
      'GET'
    );
  }
}