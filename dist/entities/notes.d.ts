import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';
export interface Note {
    id?: number;
    ticketId?: number;
    title?: string;
    description?: string;
    [key: string]: any;
}
export interface NoteQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
export declare class Notes {
    private axios;
    private logger;
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    static getMetadata(): MethodMetadata[];
    private requestWithRetry;
    create(note: Note): Promise<ApiResponse<Note>>;
    get(id: number): Promise<ApiResponse<Note>>;
    update(id: number, note: Partial<Note>): Promise<ApiResponse<Note>>;
    delete(id: number): Promise<void>;
    list(query?: NoteQuery): Promise<ApiResponse<Note[]>>;
}
//# sourceMappingURL=notes.d.ts.map