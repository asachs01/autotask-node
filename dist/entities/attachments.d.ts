import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';
export interface Attachment {
    id?: number;
    parentId?: number;
    fileName?: string;
    contentType?: string;
    [key: string]: any;
}
export interface AttachmentQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
export declare class Attachments {
    private axios;
    private logger;
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    static getMetadata(): MethodMetadata[];
    private requestWithRetry;
    create(attachment: Attachment): Promise<ApiResponse<Attachment>>;
    get(id: number): Promise<ApiResponse<Attachment>>;
    update(id: number, attachment: Partial<Attachment>): Promise<ApiResponse<Attachment>>;
    delete(id: number): Promise<void>;
    list(query?: AttachmentQuery): Promise<ApiResponse<Attachment[]>>;
}
//# sourceMappingURL=attachments.d.ts.map