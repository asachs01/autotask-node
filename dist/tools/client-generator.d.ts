#!/usr/bin/env ts-node
declare class ClientGenerator {
    private readonly projectRoot;
    private readonly clientFile;
    private readonly dataFile;
    constructor();
    /**
     * Load entity metadata from JSON file
     */
    private loadEntityData;
    /**
     * Convert entity name to camelCase for property names
     */
    private toCamelCase;
    /**
     * Convert entity name to PascalCase for class names
     */
    private toPascalCase;
    /**
     * Generate imports for all entities
     */
    private generateImports;
    /**
     * Generate property declarations grouped by category
     */
    private generatePropertyDeclarations;
    /**
     * Generate entity initializations grouped by category
     */
    private generateEntityInitializations;
    /**
     * Generate the complete AutotaskClient with all entities
     */
    generateClient(): void;
}
export { ClientGenerator };
//# sourceMappingURL=client-generator.d.ts.map