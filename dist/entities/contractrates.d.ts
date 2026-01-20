import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractRates {
    id?: number;
    [key: string]: any;
}
export interface IContractRatesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractRates entity class for Autotask API
 *
 * Billing rates for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractRatesEntity.htm}
 */
export declare class ContractRates extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractrates
     * @param contractRates - The contractrates data to create
     * @returns Promise with the created contractrates
     */
    create(contractRates: IContractRates): Promise<ApiResponse<IContractRates>>;
    /**
     * Get a contractrates by ID
     * @param id - The contractrates ID
     * @returns Promise with the contractrates data
     */
    get(id: number): Promise<ApiResponse<IContractRates>>;
    /**
     * Update a contractrates
     * @param id - The contractrates ID
     * @param contractRates - The updated contractrates data
     * @returns Promise with the updated contractrates
     */
    update(id: number, contractRates: Partial<IContractRates>): Promise<ApiResponse<IContractRates>>;
    /**
     * Partially update a contractrates
     * @param id - The contractrates ID
     * @param contractRates - The partial contractrates data to update
     * @returns Promise with the updated contractrates
     */
    patch(id: number, contractRates: Partial<IContractRates>): Promise<ApiResponse<IContractRates>>;
    /**
     * Delete a contractrates
     * @param id - The contractrates ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractrates with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractrates
     */
    list(query?: IContractRatesQuery): Promise<ApiResponse<IContractRates[]>>;
}
//# sourceMappingURL=contractrates.d.ts.map