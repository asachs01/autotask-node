import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IChecklistLibraryChecklistItems {
    id?: number;
    [key: string]: any;
}
export interface IChecklistLibraryChecklistItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ChecklistLibraryChecklistItems entity class for Autotask API
 *
 * Items within checklist libraries
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: checklists
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ChecklistLibraryChecklistItemsEntity.htm}
 */
export declare class ChecklistLibraryChecklistItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new checklistlibrarychecklistitems
     * @param checklistLibraryChecklistItems - The checklistlibrarychecklistitems data to create
     * @returns Promise with the created checklistlibrarychecklistitems
     */
    create(checklistLibraryChecklistItems: IChecklistLibraryChecklistItems): Promise<ApiResponse<IChecklistLibraryChecklistItems>>;
    /**
     * Get a checklistlibrarychecklistitems by ID
     * @param id - The checklistlibrarychecklistitems ID
     * @returns Promise with the checklistlibrarychecklistitems data
     */
    get(id: number): Promise<ApiResponse<IChecklistLibraryChecklistItems>>;
    /**
     * Update a checklistlibrarychecklistitems
     * @param id - The checklistlibrarychecklistitems ID
     * @param checklistLibraryChecklistItems - The updated checklistlibrarychecklistitems data
     * @returns Promise with the updated checklistlibrarychecklistitems
     */
    update(id: number, checklistLibraryChecklistItems: Partial<IChecklistLibraryChecklistItems>): Promise<ApiResponse<IChecklistLibraryChecklistItems>>;
    /**
     * Partially update a checklistlibrarychecklistitems
     * @param id - The checklistlibrarychecklistitems ID
     * @param checklistLibraryChecklistItems - The partial checklistlibrarychecklistitems data to update
     * @returns Promise with the updated checklistlibrarychecklistitems
     */
    patch(id: number, checklistLibraryChecklistItems: Partial<IChecklistLibraryChecklistItems>): Promise<ApiResponse<IChecklistLibraryChecklistItems>>;
    /**
     * Delete a checklistlibrarychecklistitems
     * @param id - The checklistlibrarychecklistitems ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List checklistlibrarychecklistitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of checklistlibrarychecklistitems
     */
    list(query?: IChecklistLibraryChecklistItemsQuery): Promise<ApiResponse<IChecklistLibraryChecklistItems[]>>;
}
//# sourceMappingURL=checklistlibrarychecklistitems.d.ts.map