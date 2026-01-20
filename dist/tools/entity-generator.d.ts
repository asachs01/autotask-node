#!/usr/bin/env ts-node
/**
 * TypeScript Entity Code Generator
 * Generates entity classes and test files from autotask-entities.json
 */
declare class EntityGenerator {
    private readonly projectRoot;
    private readonly entitiesDir;
    private readonly testsDir;
    private readonly dataFile;
    constructor();
    /**
     * Load entity metadata from JSON file
     */
    private loadEntityData;
    /**
     * Check if entity file already exists
     */
    private entityExists;
    /**
     * Get the filename for an entity (camelCase)
     */
    private getEntityFileName;
    /**
     * Convert entity name to camelCase for use in class names
     */
    private toCamelCase;
    /**
     * Convert entity name to PascalCase for interfaces and classes
     */
    private toPascalCase;
    /**
     * Check if entity supports a specific operation
     */
    private supportsOperation;
    /**
     * Generate entity interface with I prefix to avoid naming conflicts
     */
    private generateInterface;
    /**
     * Generate query interface with I prefix to avoid naming conflicts
     */
    private generateQueryInterface;
    /**
     * Generate metadata method
     */
    private generateMetadata;
    /**
     * Generate CRUD methods
     */
    private generateMethods;
    /**
     * Generate standard list method
     */
    private generateStandardListMethod;
    /**
     * Generate special ticket list method with account validation
     */
    private generateTicketListMethod;
    /**
     * Generate complete entity class
     */
    private generateEntityClass;
    /**
     * Generate test file for entity
     */
    private generateTestFile;
    /**
     * Generate single entity
     */
    generateEntity(entityName: string, force?: boolean): Promise<void>;
    /**
     * Generate all entities
     */
    generateAllEntities(force?: boolean): Promise<void>;
    /**
     * Update the entities index.ts file
     */
    updateIndexFile(newEntities?: string[]): Promise<void>;
    /**
     * List entities and their status
     */
    listEntities(): void;
}
export { EntityGenerator };
//# sourceMappingURL=entity-generator.d.ts.map