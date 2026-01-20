import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractExclusionRoles {
    id?: number;
    [key: string]: any;
}
export interface IContractExclusionRolesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractExclusionRoles entity class for Autotask API
 *
 * Roles excluded from contracts
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionRolesEntity.htm}
 */
export declare class ContractExclusionRoles extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractexclusionroles
     * @param contractExclusionRoles - The contractexclusionroles data to create
     * @returns Promise with the created contractexclusionroles
     */
    create(contractExclusionRoles: IContractExclusionRoles): Promise<ApiResponse<IContractExclusionRoles>>;
    /**
     * Get a contractexclusionroles by ID
     * @param id - The contractexclusionroles ID
     * @returns Promise with the contractexclusionroles data
     */
    get(id: number): Promise<ApiResponse<IContractExclusionRoles>>;
    /**
     * Delete a contractexclusionroles
     * @param id - The contractexclusionroles ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractexclusionroles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractexclusionroles
     */
    list(query?: IContractExclusionRolesQuery): Promise<ApiResponse<IContractExclusionRoles[]>>;
}
//# sourceMappingURL=contractexclusionroles.d.ts.map