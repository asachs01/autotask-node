import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractExclusionSetExcludedRoles {
    id?: number;
    [key: string]: any;
}
export interface IContractExclusionSetExcludedRolesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractExclusionSetExcludedRoles entity class for Autotask API
 *
 * Excluded roles within contract exclusion sets
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionSetExcludedRolesEntity.htm}
 */
export declare class ContractExclusionSetExcludedRoles extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractexclusionsetexcludedroles
     * @param contractExclusionSetExcludedRoles - The contractexclusionsetexcludedroles data to create
     * @returns Promise with the created contractexclusionsetexcludedroles
     */
    create(contractExclusionSetExcludedRoles: IContractExclusionSetExcludedRoles): Promise<ApiResponse<IContractExclusionSetExcludedRoles>>;
    /**
     * Get a contractexclusionsetexcludedroles by ID
     * @param id - The contractexclusionsetexcludedroles ID
     * @returns Promise with the contractexclusionsetexcludedroles data
     */
    get(id: number): Promise<ApiResponse<IContractExclusionSetExcludedRoles>>;
    /**
     * Delete a contractexclusionsetexcludedroles
     * @param id - The contractexclusionsetexcludedroles ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractexclusionsetexcludedroles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractexclusionsetexcludedroles
     */
    list(query?: IContractExclusionSetExcludedRolesQuery): Promise<ApiResponse<IContractExclusionSetExcludedRoles[]>>;
}
//# sourceMappingURL=contractexclusionsetexcludedroles.d.ts.map