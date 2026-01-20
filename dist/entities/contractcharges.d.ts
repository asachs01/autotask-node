import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractCharges {
    id?: number;
    [key: string]: any;
}
export interface IContractChargesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractCharges entity class for Autotask API
 *
 * Charges associated with contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractChargesEntity.htm}
 */
export declare class ContractCharges extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractcharges
     * @param contractCharges - The contractcharges data to create
     * @returns Promise with the created contractcharges
     */
    create(contractCharges: IContractCharges): Promise<ApiResponse<IContractCharges>>;
    /**
     * Get a contractcharges by ID
     * @param id - The contractcharges ID
     * @returns Promise with the contractcharges data
     */
    get(id: number): Promise<ApiResponse<IContractCharges>>;
    /**
     * Update a contractcharges
     * @param id - The contractcharges ID
     * @param contractCharges - The updated contractcharges data
     * @returns Promise with the updated contractcharges
     */
    update(id: number, contractCharges: Partial<IContractCharges>): Promise<ApiResponse<IContractCharges>>;
    /**
     * Partially update a contractcharges
     * @param id - The contractcharges ID
     * @param contractCharges - The partial contractcharges data to update
     * @returns Promise with the updated contractcharges
     */
    patch(id: number, contractCharges: Partial<IContractCharges>): Promise<ApiResponse<IContractCharges>>;
    /**
     * Delete a contractcharges
     * @param id - The contractcharges ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractcharges with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractcharges
     */
    list(query?: IContractChargesQuery): Promise<ApiResponse<IContractCharges[]>>;
}
//# sourceMappingURL=contractcharges.d.ts.map