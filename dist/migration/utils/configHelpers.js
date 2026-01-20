"use strict";
/**
 * Configuration helpers for migration setup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMigrationConfig = createMigrationConfig;
exports.validateMigrationConfig = validateMigrationConfig;
exports.createDefaultMappingRules = createDefaultMappingRules;
exports.mergeConfigurations = mergeConfigurations;
exports.getRecommendedBatchSize = getRecommendedBatchSize;
exports.getRecommendedParallelism = getRecommendedParallelism;
exports.createConfigFromEnv = createConfigFromEnv;
const MigrationTypes_1 = require("../types/MigrationTypes");
/**
 * Create a basic migration configuration
 */
function createMigrationConfig(options) {
    return {
        source: {
            system: options.sourceSystem,
            connectionConfig: options.sourceConnection,
            entities: options.entities,
            batchSize: 100,
            parallelism: 3
        },
        target: {
            autotaskConfig: options.autotaskConfig,
            zoneId: options.autotaskConfig.zoneId || 'zone1'
        },
        mapping: {
            rules: options.mappingRules || [],
            aiAssisted: false
        },
        validation: {
            preValidation: true,
            postValidation: true,
            qualityChecks: true,
            duplicateDetection: true
        },
        options: {
            incremental: false,
            dryRun: false,
            skipErrors: false,
            maxRetries: 3
        }
    };
}
/**
 * Validate migration configuration
 */
function validateMigrationConfig(config) {
    const errors = [];
    const warnings = [];
    // Validate source configuration
    if (!config.source.system) {
        errors.push({
            field: 'source.system',
            message: 'Source system is required',
            code: 'MISSING_SOURCE_SYSTEM',
            severity: 'critical'
        });
    }
    if (!config.source.connectionConfig) {
        errors.push({
            field: 'source.connectionConfig',
            message: 'Source connection configuration is required',
            code: 'MISSING_CONNECTION_CONFIG',
            severity: 'critical'
        });
    }
    if (!config.source.entities || config.source.entities.length === 0) {
        errors.push({
            field: 'source.entities',
            message: 'At least one entity must be specified',
            code: 'NO_ENTITIES',
            severity: 'high'
        });
    }
    // Validate target configuration
    if (!config.target.autotaskConfig) {
        errors.push({
            field: 'target.autotaskConfig',
            message: 'Autotask configuration is required',
            code: 'MISSING_AUTOTASK_CONFIG',
            severity: 'critical'
        });
    }
    else {
        const autotaskConfig = config.target.autotaskConfig;
        if (!autotaskConfig.username || !autotaskConfig.secret) {
            errors.push({
                field: 'target.autotaskConfig',
                message: 'Autotask username and secret are required',
                code: 'MISSING_AUTOTASK_CREDENTIALS',
                severity: 'critical'
            });
        }
    }
    // Validate mapping rules
    if (!config.mapping.rules || config.mapping.rules.length === 0) {
        warnings.push({
            field: 'mapping.rules',
            message: 'No mapping rules defined - data may not be transformed correctly',
            code: 'NO_MAPPING_RULES',
            recommendation: 'Define mapping rules for better data transformation'
        });
    }
    else {
        for (const rule of config.mapping.rules) {
            if (!rule.sourceEntity || !rule.targetEntity) {
                errors.push({
                    field: 'mapping.rules',
                    message: 'Mapping rule must have source and target entities',
                    code: 'INVALID_MAPPING_RULE',
                    severity: 'high'
                });
            }
            if (!rule.fieldMappings || rule.fieldMappings.length === 0) {
                warnings.push({
                    field: 'mapping.rules',
                    message: `No field mappings for ${rule.sourceEntity} -> ${rule.targetEntity}`,
                    code: 'NO_FIELD_MAPPINGS',
                    recommendation: 'Add field mappings for data transformation'
                });
            }
        }
    }
    // Validate batch size and parallelism
    if (config.source.batchSize && (config.source.batchSize < 1 || config.source.batchSize > 10000)) {
        warnings.push({
            field: 'source.batchSize',
            message: 'Batch size should be between 1 and 10000',
            code: 'INVALID_BATCH_SIZE',
            recommendation: 'Use a batch size between 100-1000 for optimal performance'
        });
    }
    if (config.source.parallelism && (config.source.parallelism < 1 || config.source.parallelism > 10)) {
        warnings.push({
            field: 'source.parallelism',
            message: 'Parallelism should be between 1 and 10',
            code: 'INVALID_PARALLELISM',
            recommendation: 'Use 2-5 parallel threads for most migrations'
        });
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
    };
}
/**
 * Create default mapping rules based on common field patterns
 */
function createDefaultMappingRules(sourceSystem, sourceEntity, targetEntity) {
    const commonMappings = getCommonFieldMappings(sourceSystem, targetEntity);
    return {
        sourceEntity,
        targetEntity,
        fieldMappings: commonMappings,
        conditions: [],
        transformations: []
    };
}
/**
 * Get common field mappings for different PSA systems
 */
function getCommonFieldMappings(sourceSystem, targetEntity) {
    const mappings = {
        [MigrationTypes_1.PSASystem.CONNECTWISE_MANAGE]: {
            companies: [
                {
                    sourceField: 'name',
                    targetField: 'companyName',
                    required: true,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'identifier',
                    targetField: 'companyNumber',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'addressLine1',
                    targetField: 'addressLine1',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'city',
                    targetField: 'city',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'state',
                    targetField: 'state',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'zip',
                    targetField: 'postalCode',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'phoneNumber',
                    targetField: 'phone',
                    required: false,
                    dataType: MigrationTypes_1.DataType.PHONE
                }
            ],
            contacts: [
                {
                    sourceField: 'firstName',
                    targetField: 'firstName',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'lastName',
                    targetField: 'lastName',
                    required: true,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'title',
                    targetField: 'title',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                }
            ],
            tickets: [
                {
                    sourceField: 'summary',
                    targetField: 'title',
                    required: true,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'initialDescription',
                    targetField: 'description',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                }
            ]
        },
        [MigrationTypes_1.PSASystem.SERVICENOW]: {
            companies: [
                {
                    sourceField: 'name',
                    targetField: 'companyName',
                    required: true,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'street',
                    targetField: 'addressLine1',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'city',
                    targetField: 'city',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'state',
                    targetField: 'state',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'zip',
                    targetField: 'postalCode',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                }
            ],
            contacts: [
                {
                    sourceField: 'first_name',
                    targetField: 'firstName',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'last_name',
                    targetField: 'lastName',
                    required: true,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'email',
                    targetField: 'emailAddress',
                    required: false,
                    dataType: MigrationTypes_1.DataType.EMAIL
                }
            ],
            tickets: [
                {
                    sourceField: 'short_description',
                    targetField: 'title',
                    required: true,
                    dataType: MigrationTypes_1.DataType.STRING
                },
                {
                    sourceField: 'description',
                    targetField: 'description',
                    required: false,
                    dataType: MigrationTypes_1.DataType.STRING
                }
            ]
        }
    };
    return mappings[sourceSystem]?.[targetEntity] || [];
}
/**
 * Merge configuration files
 */
function mergeConfigurations(baseConfig, overrideConfig) {
    return {
        ...baseConfig,
        ...overrideConfig,
        source: {
            ...baseConfig.source,
            ...overrideConfig.source
        },
        target: {
            ...baseConfig.target,
            ...overrideConfig.target
        },
        mapping: {
            ...baseConfig.mapping,
            ...overrideConfig.mapping,
            rules: overrideConfig.mapping?.rules || baseConfig.mapping.rules
        },
        validation: {
            ...baseConfig.validation,
            ...overrideConfig.validation
        },
        options: {
            ...baseConfig.options,
            ...overrideConfig.options
        }
    };
}
/**
 * Get recommended batch sizes for different systems
 */
function getRecommendedBatchSize(sourceSystem) {
    const batchSizes = {
        [MigrationTypes_1.PSASystem.CONNECTWISE_MANAGE]: 500,
        [MigrationTypes_1.PSASystem.SERVICENOW]: 1000,
        [MigrationTypes_1.PSASystem.KASEYA_VSA]: 250,
        [MigrationTypes_1.PSASystem.FRESHSERVICE]: 100,
        [MigrationTypes_1.PSASystem.SERVICEDESK_PLUS]: 100,
        [MigrationTypes_1.PSASystem.CSV_IMPORT]: 1000,
        [MigrationTypes_1.PSASystem.EXCEL_IMPORT]: 1000
    };
    return batchSizes[sourceSystem] || 100;
}
/**
 * Get recommended parallelism for different systems
 */
function getRecommendedParallelism(sourceSystem) {
    const parallelism = {
        [MigrationTypes_1.PSASystem.CONNECTWISE_MANAGE]: 3,
        [MigrationTypes_1.PSASystem.SERVICENOW]: 5,
        [MigrationTypes_1.PSASystem.KASEYA_VSA]: 2,
        [MigrationTypes_1.PSASystem.FRESHSERVICE]: 2,
        [MigrationTypes_1.PSASystem.SERVICEDESK_PLUS]: 3,
        [MigrationTypes_1.PSASystem.CSV_IMPORT]: 5,
        [MigrationTypes_1.PSASystem.EXCEL_IMPORT]: 5
    };
    return parallelism[sourceSystem] || 3;
}
/**
 * Create configuration from environment variables
 */
function createConfigFromEnv() {
    return {
        source: {
            system: process.env.MIGRATION_SOURCE_SYSTEM || MigrationTypes_1.PSASystem.CSV_IMPORT,
            connectionConfig: {
                baseUrl: process.env.MIGRATION_SOURCE_URL || '',
                credentials: {
                    username: process.env.MIGRATION_SOURCE_USERNAME,
                    password: process.env.MIGRATION_SOURCE_PASSWORD,
                    apiKey: process.env.MIGRATION_SOURCE_API_KEY,
                    clientId: process.env.MIGRATION_SOURCE_CLIENT_ID,
                    clientSecret: process.env.MIGRATION_SOURCE_CLIENT_SECRET
                }
            },
            entities: (process.env.MIGRATION_ENTITIES || 'Company,Contact,Ticket').split(','),
            batchSize: parseInt(process.env.MIGRATION_BATCH_SIZE || '100', 10),
            parallelism: parseInt(process.env.MIGRATION_PARALLELISM || '3', 10)
        },
        target: {
            autotaskConfig: {
                baseUrl: process.env.AUTOTASK_BASE_URL || '',
                username: process.env.AUTOTASK_USERNAME || '',
                secret: process.env.AUTOTASK_SECRET || '',
                integrationCode: process.env.AUTOTASK_INTEGRATION_CODE || '',
                clientId: process.env.AUTOTASK_CLIENT_ID
            },
            zoneId: process.env.AUTOTASK_ZONE_ID || 'zone1'
        },
        options: {
            dryRun: process.env.MIGRATION_DRY_RUN === 'true',
            skipErrors: process.env.MIGRATION_SKIP_ERRORS === 'true',
            maxRetries: parseInt(process.env.MIGRATION_MAX_RETRIES || '3', 10)
        }
    };
}
//# sourceMappingURL=configHelpers.js.map