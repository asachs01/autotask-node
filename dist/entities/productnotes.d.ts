import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IProductNotes {
    id?: number;
    [key: string]: any;
}
export interface IProductNotesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ProductNotes entity class for Autotask API
 *
 * Notes for products
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProductNotesEntity.htm}
 */
export declare class ProductNotes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new productnotes
     * @param productNotes - The productnotes data to create
     * @returns Promise with the created productnotes
     */
    create(productNotes: IProductNotes): Promise<ApiResponse<IProductNotes>>;
    /**
     * Get a productnotes by ID
     * @param id - The productnotes ID
     * @returns Promise with the productnotes data
     */
    get(id: number): Promise<ApiResponse<IProductNotes>>;
    /**
     * Update a productnotes
     * @param id - The productnotes ID
     * @param productNotes - The updated productnotes data
     * @returns Promise with the updated productnotes
     */
    update(id: number, productNotes: Partial<IProductNotes>): Promise<ApiResponse<IProductNotes>>;
    /**
     * Partially update a productnotes
     * @param id - The productnotes ID
     * @param productNotes - The partial productnotes data to update
     * @returns Promise with the updated productnotes
     */
    patch(id: number, productNotes: Partial<IProductNotes>): Promise<ApiResponse<IProductNotes>>;
    /**
     * List productnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of productnotes
     */
    list(query?: IProductNotesQuery): Promise<ApiResponse<IProductNotes[]>>;
}
//# sourceMappingURL=productnotes.d.ts.map