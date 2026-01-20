import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractNotes {
    id?: number;
    [key: string]: any;
}
export interface IContractNotesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractNotes entity class for Autotask API
 *
 * Notes for contracts
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractNotesEntity.htm}
 */
export declare class ContractNotes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractnotes
     * @param contractNotes - The contractnotes data to create
     * @returns Promise with the created contractnotes
     */
    create(contractNotes: IContractNotes): Promise<ApiResponse<IContractNotes>>;
    /**
     * Get a contractnotes by ID
     * @param id - The contractnotes ID
     * @returns Promise with the contractnotes data
     */
    get(id: number): Promise<ApiResponse<IContractNotes>>;
    /**
     * Update a contractnotes
     * @param id - The contractnotes ID
     * @param contractNotes - The updated contractnotes data
     * @returns Promise with the updated contractnotes
     */
    update(id: number, contractNotes: Partial<IContractNotes>): Promise<ApiResponse<IContractNotes>>;
    /**
     * Partially update a contractnotes
     * @param id - The contractnotes ID
     * @param contractNotes - The partial contractnotes data to update
     * @returns Promise with the updated contractnotes
     */
    patch(id: number, contractNotes: Partial<IContractNotes>): Promise<ApiResponse<IContractNotes>>;
    /**
     * List contractnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractnotes
     */
    list(query?: IContractNotesQuery): Promise<ApiResponse<IContractNotes[]>>;
}
//# sourceMappingURL=contractnotes.d.ts.map