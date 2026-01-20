import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IConfigurationItemDnsRecords {
    id?: number;
    [key: string]: any;
}
export interface IConfigurationItemDnsRecordsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ConfigurationItemDnsRecords entity class for Autotask API
 *
 * DNS records for configuration items
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemDnsRecordsEntity.htm}
 */
export declare class ConfigurationItemDnsRecords extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new configurationitemdnsrecords
     * @param configurationItemDnsRecords - The configurationitemdnsrecords data to create
     * @returns Promise with the created configurationitemdnsrecords
     */
    create(configurationItemDnsRecords: IConfigurationItemDnsRecords): Promise<ApiResponse<IConfigurationItemDnsRecords>>;
    /**
     * Get a configurationitemdnsrecords by ID
     * @param id - The configurationitemdnsrecords ID
     * @returns Promise with the configurationitemdnsrecords data
     */
    get(id: number): Promise<ApiResponse<IConfigurationItemDnsRecords>>;
    /**
     * Update a configurationitemdnsrecords
     * @param id - The configurationitemdnsrecords ID
     * @param configurationItemDnsRecords - The updated configurationitemdnsrecords data
     * @returns Promise with the updated configurationitemdnsrecords
     */
    update(id: number, configurationItemDnsRecords: Partial<IConfigurationItemDnsRecords>): Promise<ApiResponse<IConfigurationItemDnsRecords>>;
    /**
     * Partially update a configurationitemdnsrecords
     * @param id - The configurationitemdnsrecords ID
     * @param configurationItemDnsRecords - The partial configurationitemdnsrecords data to update
     * @returns Promise with the updated configurationitemdnsrecords
     */
    patch(id: number, configurationItemDnsRecords: Partial<IConfigurationItemDnsRecords>): Promise<ApiResponse<IConfigurationItemDnsRecords>>;
    /**
     * Delete a configurationitemdnsrecords
     * @param id - The configurationitemdnsrecords ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List configurationitemdnsrecords with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemdnsrecords
     */
    list(query?: IConfigurationItemDnsRecordsQuery): Promise<ApiResponse<IConfigurationItemDnsRecords[]>>;
}
//# sourceMappingURL=configurationitemdnsrecords.d.ts.map