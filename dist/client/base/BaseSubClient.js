"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSubClient = void 0;
/**
 * Abstract base class for all Autotask sub-clients
 * Provides common functionality and dependency injection
 */
class BaseSubClient {
    constructor(axios, logger, name) {
        this.axios = axios;
        this.logger = logger;
        this.name = name;
        this.isInitialized = false;
    }
    /**
     * Initialize the sub-client - can be overridden for lazy loading
     */
    async initialize() {
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
    async onInitialize() {
        // Default implementation - no-op
    }
    /**
     * Test connectivity by attempting a simple request to a representative entity
     */
    async testConnection() {
        try {
            await this.doConnectionTest();
            return true;
        }
        catch (error) {
            this.logger.error(`Connection test failed for ${this.getName()}:`, error);
            return false;
        }
    }
    /**
     * Ensure the sub-client is initialized before use
     */
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }
    /**
     * Get initialization status
     */
    getInitializationStatus() {
        return this.isInitialized;
    }
}
exports.BaseSubClient = BaseSubClient;
//# sourceMappingURL=BaseSubClient.js.map