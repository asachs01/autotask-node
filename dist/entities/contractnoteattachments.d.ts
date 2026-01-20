import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractNoteAttachments {
    id?: number;
    [key: string]: any;
}
export interface IContractNoteAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractNoteAttachments entity class for Autotask API
 *
 * File attachments for contract notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractNoteAttachmentsEntity.htm}
 */
export declare class ContractNoteAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractnoteattachments
     * @param contractNoteAttachments - The contractnoteattachments data to create
     * @returns Promise with the created contractnoteattachments
     */
    create(contractNoteAttachments: IContractNoteAttachments): Promise<ApiResponse<IContractNoteAttachments>>;
    /**
     * Get a contractnoteattachments by ID
     * @param id - The contractnoteattachments ID
     * @returns Promise with the contractnoteattachments data
     */
    get(id: number): Promise<ApiResponse<IContractNoteAttachments>>;
    /**
     * Delete a contractnoteattachments
     * @param id - The contractnoteattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractnoteattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractnoteattachments
     */
    list(query?: IContractNoteAttachmentsQuery): Promise<ApiResponse<IContractNoteAttachments[]>>;
}
//# sourceMappingURL=contractnoteattachments.d.ts.map