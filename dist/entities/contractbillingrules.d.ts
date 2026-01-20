import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractBillingRules {
    id?: number;
    [key: string]: any;
}
export interface IContractBillingRulesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractBillingRules entity class for Autotask API
 *
 * Billing rules for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractBillingRulesEntity.htm}
 */
export declare class ContractBillingRules extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractbillingrules
     * @param contractBillingRules - The contractbillingrules data to create
     * @returns Promise with the created contractbillingrules
     */
    create(contractBillingRules: IContractBillingRules): Promise<ApiResponse<IContractBillingRules>>;
    /**
     * Get a contractbillingrules by ID
     * @param id - The contractbillingrules ID
     * @returns Promise with the contractbillingrules data
     */
    get(id: number): Promise<ApiResponse<IContractBillingRules>>;
    /**
     * Update a contractbillingrules
     * @param id - The contractbillingrules ID
     * @param contractBillingRules - The updated contractbillingrules data
     * @returns Promise with the updated contractbillingrules
     */
    update(id: number, contractBillingRules: Partial<IContractBillingRules>): Promise<ApiResponse<IContractBillingRules>>;
    /**
     * Partially update a contractbillingrules
     * @param id - The contractbillingrules ID
     * @param contractBillingRules - The partial contractbillingrules data to update
     * @returns Promise with the updated contractbillingrules
     */
    patch(id: number, contractBillingRules: Partial<IContractBillingRules>): Promise<ApiResponse<IContractBillingRules>>;
    /**
     * Delete a contractbillingrules
     * @param id - The contractbillingrules ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractbillingrules with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractbillingrules
     */
    list(query?: IContractBillingRulesQuery): Promise<ApiResponse<IContractBillingRules[]>>;
}
//# sourceMappingURL=contractbillingrules.d.ts.map