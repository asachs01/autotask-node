import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractExclusionBillingCodes {
    id?: number;
    [key: string]: any;
}
export interface IContractExclusionBillingCodesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractExclusionBillingCodes entity class for Autotask API
 *
 * Billing codes excluded from contracts
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionBillingCodesEntity.htm}
 */
export declare class ContractExclusionBillingCodes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractexclusionbillingcodes
     * @param contractExclusionBillingCodes - The contractexclusionbillingcodes data to create
     * @returns Promise with the created contractexclusionbillingcodes
     */
    create(contractExclusionBillingCodes: IContractExclusionBillingCodes): Promise<ApiResponse<IContractExclusionBillingCodes>>;
    /**
     * Get a contractexclusionbillingcodes by ID
     * @param id - The contractexclusionbillingcodes ID
     * @returns Promise with the contractexclusionbillingcodes data
     */
    get(id: number): Promise<ApiResponse<IContractExclusionBillingCodes>>;
    /**
     * Delete a contractexclusionbillingcodes
     * @param id - The contractexclusionbillingcodes ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractexclusionbillingcodes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractexclusionbillingcodes
     */
    list(query?: IContractExclusionBillingCodesQuery): Promise<ApiResponse<IContractExclusionBillingCodes[]>>;
}
//# sourceMappingURL=contractexclusionbillingcodes.d.ts.map