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
export abstract class BaseSubClient implements ISubClient {
  protected isInitialized = false;
  
  constructor(
    protected axios: AxiosInstance,
    protected logger: winston.Logger,
    protected name: string
  ) {}

  abstract getName(): string;

  /**
   * Initialize the sub-client - can be overridden for lazy loading
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    this.logger.debug(`Initializing ${this.getName()} sub-client`);
    await this.onInitialize();
    this.isInitialized = true;
  }

  /**
   * Override this method to implement initialization logic
   */
  protected async onInitialize(): Promise<void> {
    // Default implementation - no-op
  }

  /**
   * Test connectivity by attempting a simple request to a representative entity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.doConnectionTest();
      return true;
    } catch (error) {
      this.logger.error(`Connection test failed for ${this.getName()}:`, error);
      return false;
    }
  }

  /**
   * Override this method to implement connection testing logic
   */
  protected abstract doConnectionTest(): Promise<void>;

  /**
   * Ensure the sub-client is initialized before use
   */
  protected async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Get initialization status
   */
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}