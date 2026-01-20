import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContracts {
    id?: number;
    [key: string]: any;
}
export interface IContractsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Contracts entity class for Autotask API
 *
 * Service contracts and agreements
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractsEntity.htm}
 */
export declare class Contracts extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contracts
     * @param contracts - The contracts data to create
     * @returns Promise with the created contracts
     */
    create(contracts: IContracts): Promise<ApiResponse<IContracts>>;
    /**
     * Get a contracts by ID
     * @param id - The contracts ID
     * @returns Promise with the contracts data
     */
    get(id: number): Promise<ApiResponse<IContracts>>;
    /**
     * Update a contracts
     * @param id - The contracts ID
     * @param contracts - The updated contracts data
     * @returns Promise with the updated contracts
     */
    update(id: number, contracts: Partial<IContracts>): Promise<ApiResponse<IContracts>>;
    /**
     * Partially update a contracts
     * @param id - The contracts ID
     * @param contracts - The partial contracts data to update
     * @returns Promise with the updated contracts
     */
    patch(id: number, contracts: Partial<IContracts>): Promise<ApiResponse<IContracts>>;
    /**
     * Delete a contracts
     * @param id - The contracts ID to delete
     * @returns Promise with void response
     */
    delete(id: number): Promise<void>;
    /**
     * List contracts with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contracts
     */
    list(query?: IContractsQuery): Promise<ApiResponse<IContracts[]>>;
}
//# sourceMappingURL=contracts.d.ts.map