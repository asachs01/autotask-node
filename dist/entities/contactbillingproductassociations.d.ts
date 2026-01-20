import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContactBillingProductAssociations {
    id?: number;
    [key: string]: any;
}
export interface IContactBillingProductAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContactBillingProductAssociations entity class for Autotask API
 *
 * Associations between contacts and billing products
 * Supported Operations: GET, POST, DELETE
 * Category: associations
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContactBillingProductAssociationsEntity.htm}
 */
export declare class ContactBillingProductAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contactbillingproductassociations
     * @param contactBillingProductAssociations - The contactbillingproductassociations data to create
     * @returns Promise with the created contactbillingproductassociations
     */
    create(contactBillingProductAssociations: IContactBillingProductAssociations): Promise<ApiResponse<IContactBillingProductAssociations>>;
    /**
     * Get a contactbillingproductassociations by ID
     * @param id - The contactbillingproductassociations ID
     * @returns Promise with the contactbillingproductassociations data
     */
    get(id: number): Promise<ApiResponse<IContactBillingProductAssociations>>;
    /**
     * Delete a contactbillingproductassociations
     * @param id - The contactbillingproductassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contactbillingproductassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contactbillingproductassociations
     */
    list(query?: IContactBillingProductAssociationsQuery): Promise<ApiResponse<IContactBillingProductAssociations[]>>;
}
//# sourceMappingURL=contactbillingproductassociations.d.ts.map