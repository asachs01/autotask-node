import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractMilestones {
    id?: number;
    [key: string]: any;
}
export interface IContractMilestonesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractMilestones entity class for Autotask API
 *
 * Milestones for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractMilestonesEntity.htm}
 */
export declare class ContractMilestones extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractmilestones
     * @param contractMilestones - The contractmilestones data to create
     * @returns Promise with the created contractmilestones
     */
    create(contractMilestones: IContractMilestones): Promise<ApiResponse<IContractMilestones>>;
    /**
     * Get a contractmilestones by ID
     * @param id - The contractmilestones ID
     * @returns Promise with the contractmilestones data
     */
    get(id: number): Promise<ApiResponse<IContractMilestones>>;
    /**
     * Update a contractmilestones
     * @param id - The contractmilestones ID
     * @param contractMilestones - The updated contractmilestones data
     * @returns Promise with the updated contractmilestones
     */
    update(id: number, contractMilestones: Partial<IContractMilestones>): Promise<ApiResponse<IContractMilestones>>;
    /**
     * Partially update a contractmilestones
     * @param id - The contractmilestones ID
     * @param contractMilestones - The partial contractmilestones data to update
     * @returns Promise with the updated contractmilestones
     */
    patch(id: number, contractMilestones: Partial<IContractMilestones>): Promise<ApiResponse<IContractMilestones>>;
    /**
     * Delete a contractmilestones
     * @param id - The contractmilestones ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractmilestones with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractmilestones
     */
    list(query?: IContractMilestonesQuery): Promise<ApiResponse<IContractMilestones[]>>;
}
//# sourceMappingURL=contractmilestones.d.ts.map