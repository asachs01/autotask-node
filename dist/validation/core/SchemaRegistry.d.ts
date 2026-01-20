/**
 * Central registry for all Autotask entity validation schemas
 * Manages 210+ entity schemas with caching and lazy loading
 */
import { EntitySchema } from '../types/ValidationTypes';
import winston from 'winston';
export declare class SchemaRegistry {
    private schemas;
    private schemaVersions;
    private loadedSchemas;
    private logger;
    private cacheEnabled;
    constructor(logger: winston.Logger);
    /**
     * Register a schema for an entity type
     */
    registerSchema(schema: EntitySchema): void;
    /**
     * Get schema for entity type (latest version by default)
     */
    getSchema(entityType: string, version?: string): EntitySchema | undefined;
    /**
     * Get all available versions for an entity type
     */
    getVersions(entityType: string): string[];
    /**
     * Get latest version for an entity type
     */
    getLatestVersion(entityType: string): string | null;
    /**
     * Check if schema exists for entity type
     */
    hasSchema(entityType: string, version?: string): boolean;
    /**
     * Get all registered entity types
     */
    getEntityTypes(): string[];
    /**
     * Clear cache and reload schemas
     */
    reloadSchemas(): void;
    /**
     * Get schema statistics
     */
    getStatistics(): {
        totalSchemas: number;
        entityTypes: number;
        loadedSchemas: number;
        cacheHitRate: number;
    };
    /**
     * Initialize core schemas for primary Autotask entities
     */
    private initializeCoreSchemas;
    /**
     * Register schemas for core Autotask entities
     */
    private registerCoreEntitySchemas;
    /**
     * Create Account entity schema
     */
    private createAccountSchema;
    /**
     * Create Company entity schema
     */
    private createCompanySchema;
    private createContactSchema;
    private createTicketSchema;
    private createProjectSchema;
    private createTaskSchema;
    private createTimeEntrySchema;
    private createContractSchema;
    private createConfigurationItemSchema;
    private createResourceSchema;
    /**
     * Lazy load schema from external source
     */
    private loadSchema;
    /**
     * Check if schema can be loaded
     */
    private canLoadSchema;
    /**
     * Generate basic schema for unknown entity types
     */
    private generateBasicSchema;
    /**
     * Generate schema key
     */
    private getSchemaKey;
}
//# sourceMappingURL=SchemaRegistry.d.ts.map