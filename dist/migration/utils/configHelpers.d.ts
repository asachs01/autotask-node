/**
 * Configuration helpers for migration setup
 */
import { MigrationConfig, PSASystem, MappingRule, ValidationResult } from '../types/MigrationTypes';
/**
 * Create a basic migration configuration
 */
export declare function createMigrationConfig(options: {
    sourceSystem: PSASystem;
    sourceConnection: any;
    autotaskConfig: any;
    entities: string[];
    mappingRules?: MappingRule[];
}): MigrationConfig;
/**
 * Validate migration configuration
 */
export declare function validateMigrationConfig(config: MigrationConfig): ValidationResult;
/**
 * Create default mapping rules based on common field patterns
 */
export declare function createDefaultMappingRules(sourceSystem: PSASystem, sourceEntity: string, targetEntity: string): MappingRule;
/**
 * Merge configuration files
 */
export declare function mergeConfigurations(baseConfig: MigrationConfig, overrideConfig: Partial<MigrationConfig>): MigrationConfig;
/**
 * Get recommended batch sizes for different systems
 */
export declare function getRecommendedBatchSize(sourceSystem: PSASystem): number;
/**
 * Get recommended parallelism for different systems
 */
export declare function getRecommendedParallelism(sourceSystem: PSASystem): number;
/**
 * Create configuration from environment variables
 */
export declare function createConfigFromEnv(): Partial<MigrationConfig>;
//# sourceMappingURL=configHelpers.d.ts.map