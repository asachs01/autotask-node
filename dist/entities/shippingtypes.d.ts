import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IShippingTypes {
    id?: number;
    [key: string]: any;
}
export interface IShippingTypesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ShippingTypes entity class for Autotask API
 *
 * Available shipping methods
 * Supported Operations: GET
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ShippingTypesEntity.htm}
 */
export declare class ShippingTypes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a shippingtypes by ID
     * @param id - The shippingtypes ID
     * @returns Promise with the shippingtypes data
     */
    get(id: number): Promise<ApiResponse<IShippingTypes>>;
    /**
     * List shippingtypes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of shippingtypes
     */
    list(query?: IShippingTypesQuery): Promise<ApiResponse<IShippingTypes[]>>;
}
//# sourceMappingURL=shippingtypes.d.ts.map