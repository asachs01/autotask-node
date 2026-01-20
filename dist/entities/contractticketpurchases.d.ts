import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractTicketPurchases {
    id?: number;
    [key: string]: any;
}
export interface IContractTicketPurchasesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractTicketPurchases entity class for Autotask API
 *
 * Ticket purchases for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractTicketPurchasesEntity.htm}
 */
export declare class ContractTicketPurchases extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractticketpurchases
     * @param contractTicketPurchases - The contractticketpurchases data to create
     * @returns Promise with the created contractticketpurchases
     */
    create(contractTicketPurchases: IContractTicketPurchases): Promise<ApiResponse<IContractTicketPurchases>>;
    /**
     * Get a contractticketpurchases by ID
     * @param id - The contractticketpurchases ID
     * @returns Promise with the contractticketpurchases data
     */
    get(id: number): Promise<ApiResponse<IContractTicketPurchases>>;
    /**
     * Update a contractticketpurchases
     * @param id - The contractticketpurchases ID
     * @param contractTicketPurchases - The updated contractticketpurchases data
     * @returns Promise with the updated contractticketpurchases
     */
    update(id: number, contractTicketPurchases: Partial<IContractTicketPurchases>): Promise<ApiResponse<IContractTicketPurchases>>;
    /**
     * Partially update a contractticketpurchases
     * @param id - The contractticketpurchases ID
     * @param contractTicketPurchases - The partial contractticketpurchases data to update
     * @returns Promise with the updated contractticketpurchases
     */
    patch(id: number, contractTicketPurchases: Partial<IContractTicketPurchases>): Promise<ApiResponse<IContractTicketPurchases>>;
    /**
     * Delete a contractticketpurchases
     * @param id - The contractticketpurchases ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractticketpurchases with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractticketpurchases
     */
    list(query?: IContractTicketPurchasesQuery): Promise<ApiResponse<IContractTicketPurchases[]>>;
}
//# sourceMappingURL=contractticketpurchases.d.ts.map