import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface Account {
    id?: number;
    companyName?: string;
    companyType?: number;
    companyNumber?: string;
    phone?: string;
    fax?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryID?: number;
    webAddress?: string;
    isActive?: boolean;
    ownerResourceID?: number;
    parentCompanyID?: number;
    companyCategoryID?: number;
    territoryID?: number;
    marketSegmentID?: number;
    competitorID?: number;
    currencyID?: number;
    taxID?: string;
    taxRegionID?: number;
    isTaxExempt?: boolean;
    isClientPortalActive?: boolean;
    isTaskFireActive?: boolean;
    alternatePhone1?: string;
    alternatePhone2?: string;
    additionalAddressInformation?: string;
    sicCode?: string;
    stockSymbol?: string;
    stockMarket?: string;
    assetValue?: number;
    classification?: number;
    createDate?: string;
    lastActivityDate?: string;
    lastTrackedModifiedDateTime?: string;
    [key: string]: any;
}
export interface AccountQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
export declare class Accounts extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    create(account: Account): Promise<ApiResponse<Account>>;
    get(id: number): Promise<ApiResponse<Account>>;
    update(id: number, account: Partial<Account>): Promise<ApiResponse<Account>>;
    delete(id: number): Promise<void>;
    list(query?: AccountQuery): Promise<ApiResponse<Account[]>>;
}
//# sourceMappingURL=accounts.d.ts.map