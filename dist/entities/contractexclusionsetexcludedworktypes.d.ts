import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractExclusionSetExcludedWorkTypes {
    id?: number;
    [key: string]: any;
}
export interface IContractExclusionSetExcludedWorkTypesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractExclusionSetExcludedWorkTypes entity class for Autotask API
 *
 * Excluded work types within contract exclusion sets
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionSetExcludedWorkTypesEntity.htm}
 */
export declare class ContractExclusionSetExcludedWorkTypes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractexclusionsetexcludedworktypes
     * @param contractExclusionSetExcludedWorkTypes - The contractexclusionsetexcludedworktypes data to create
     * @returns Promise with the created contractexclusionsetexcludedworktypes
     */
    create(contractExclusionSetExcludedWorkTypes: IContractExclusionSetExcludedWorkTypes): Promise<ApiResponse<IContractExclusionSetExcludedWorkTypes>>;
    /**
     * Get a contractexclusionsetexcludedworktypes by ID
     * @param id - The contractexclusionsetexcludedworktypes ID
     * @returns Promise with the contractexclusionsetexcludedworktypes data
     */
    get(id: number): Promise<ApiResponse<IContractExclusionSetExcludedWorkTypes>>;
    /**
     * Delete a contractexclusionsetexcludedworktypes
     * @param id - The contractexclusionsetexcludedworktypes ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractexclusionsetexcludedworktypes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractexclusionsetexcludedworktypes
     */
    list(query?: IContractExclusionSetExcludedWorkTypesQuery): Promise<ApiResponse<IContractExclusionSetExcludedWorkTypes[]>>;
}
//# sourceMappingURL=contractexclusionsetexcludedworktypes.d.ts.map