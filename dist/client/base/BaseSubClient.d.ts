import { AxiosInstance } from 'axios';
import winston from 'winston';
/**
 * Interface defining the contract for all sub-clients
 */
export interface ISubClient {
    /**
     * Initialize the sub-client (lazy loading support)
     */
    initialize(): Promise<void>;
    /**
     * Test connectivity for this sub-client's entities
     */
    testConnection(): Promise<boolean>;
    /**
     * Get the name/identifier of this sub-client
     */
    getName(): string;
    /**
     * Get initialization status
     */
    getInitializationStatus(): boolean;
}
/**
 * Abstract base class for all Autotask sub-clients
 * Provides common functionality and dependency injection
 */
export declare abstract class BaseSubClient implements ISubClient {
    protected axios: AxiosInstance;
    protected logger: winston.Logger;
    protected name: string;
    protected isInitialized: boolean;
    constructor(axios: AxiosInstance, logger: winston.Logger, name: string);
    abstract getName(): string;
    /**
     * Initialize the sub-client - can be overridden for lazy loading
     */
    initialize(): Promise<void>;
    /**
     * Override this method to implement initialization logic
     */
    protected onInitialize(): Promise<void>;
    /**
     * Test connectivity by attempting a simple request to a representative entity
     */
    testConnection(): Promise<boolean>;
    /**
     * Override this method to implement connection testing logic
     */
    protected abstract doConnectionTest(): Promise<void>;
    /**
     * Ensure the sub-client is initialized before use
     */
    protected ensureInitialized(): Promise<void>;
    /**
     * Get initialization status
     */
    getInitializationStatus(): boolean;
}
//# sourceMappingURL=BaseSubClient.d.ts.map