"use strict";
/**
 * Autotask PSA Migration Framework
 * Complete migration solution for importing data from various PSA systems to Autotask
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_SYSTEMS = exports.VERSION = exports.DEFAULT_MAPPINGS = exports.MigrationConfigBuilder = exports.generateMigrationReport = exports.createMappingRules = exports.validateMigrationConfig = exports.createMigrationConfig = exports.PreMigrationValidator = exports.MappingEngine = exports.CSVImportConnector = exports.ServiceDeskPlusConnector = exports.FreshServiceConnector = exports.KaseyaVSAConnector = exports.ServiceNowConnector = exports.ConnectWiseManageConnector = exports.ConnectorFactory = exports.BaseConnector = exports.MigrationEngine = void 0;
exports.createSimpleMigration = createSimpleMigration;
exports.createCSVImport = createCSVImport;
// Core Migration Engine
var MigrationEngine_1 = require("./core/MigrationEngine");
Object.defineProperty(exports, "MigrationEngine", { enumerable: true, get: function () { return MigrationEngine_1.MigrationEngine; } });
// Migration Types
__exportStar(require("./types/MigrationTypes"), exports);
// Connectors
var BaseConnector_1 = require("./connectors/BaseConnector");
Object.defineProperty(exports, "BaseConnector", { enumerable: true, get: function () { return BaseConnector_1.BaseConnector; } });
var ConnectorFactory_1 = require("./connectors/ConnectorFactory");
Object.defineProperty(exports, "ConnectorFactory", { enumerable: true, get: function () { return ConnectorFactory_1.ConnectorFactory; } });
var ConnectWiseManageConnector_1 = require("./connectors/ConnectWiseManageConnector");
Object.defineProperty(exports, "ConnectWiseManageConnector", { enumerable: true, get: function () { return ConnectWiseManageConnector_1.ConnectWiseManageConnector; } });
var ServiceNowConnector_1 = require("./connectors/ServiceNowConnector");
Object.defineProperty(exports, "ServiceNowConnector", { enumerable: true, get: function () { return ServiceNowConnector_1.ServiceNowConnector; } });
var KaseyaVSAConnector_1 = require("./connectors/KaseyaVSAConnector");
Object.defineProperty(exports, "KaseyaVSAConnector", { enumerable: true, get: function () { return KaseyaVSAConnector_1.KaseyaVSAConnector; } });
var FreshServiceConnector_1 = require("./connectors/FreshServiceConnector");
Object.defineProperty(exports, "FreshServiceConnector", { enumerable: true, get: function () { return FreshServiceConnector_1.FreshServiceConnector; } });
var ServiceDeskPlusConnector_1 = require("./connectors/ServiceDeskPlusConnector");
Object.defineProperty(exports, "ServiceDeskPlusConnector", { enumerable: true, get: function () { return ServiceDeskPlusConnector_1.ServiceDeskPlusConnector; } });
var CSVImportConnector_1 = require("./connectors/CSVImportConnector");
Object.defineProperty(exports, "CSVImportConnector", { enumerable: true, get: function () { return CSVImportConnector_1.CSVImportConnector; } });
// Mapping Engine
var MappingEngine_1 = require("./mapping/MappingEngine");
Object.defineProperty(exports, "MappingEngine", { enumerable: true, get: function () { return MappingEngine_1.MappingEngine; } });
// Validation
var PreMigrationValidator_1 = require("./validation/PreMigrationValidator");
Object.defineProperty(exports, "PreMigrationValidator", { enumerable: true, get: function () { return PreMigrationValidator_1.PreMigrationValidator; } });
// CLI Components are executable scripts, not exports
// Utility Functions
var configHelpers_1 = require("./utils/configHelpers");
Object.defineProperty(exports, "createMigrationConfig", { enumerable: true, get: function () { return configHelpers_1.createMigrationConfig; } });
Object.defineProperty(exports, "validateMigrationConfig", { enumerable: true, get: function () { return configHelpers_1.validateMigrationConfig; } });
var mappingHelpers_1 = require("./utils/mappingHelpers");
Object.defineProperty(exports, "createMappingRules", { enumerable: true, get: function () { return mappingHelpers_1.createMappingRules; } });
var reportHelpers_1 = require("./utils/reportHelpers");
Object.defineProperty(exports, "generateMigrationReport", { enumerable: true, get: function () { return reportHelpers_1.generateMigrationReport; } });
/**
 * Quick start function for simple migrations
 */
async function createSimpleMigration(options) {
    const { MigrationEngine } = await Promise.resolve().then(() => __importStar(require('./core/MigrationEngine')));
    const config = {
        source: {
            system: options.sourceSystem,
            connectionConfig: options.sourceConfig,
            entities: options.entities
        },
        target: {
            autotaskConfig: options.autotaskConfig,
            zoneId: options.autotaskConfig.zoneId || 'zone1'
        },
        mapping: {
            rules: options.mappingRules || []
        },
        validation: {
            preValidation: true,
            postValidation: true,
            qualityChecks: true,
            duplicateDetection: true
        },
        options: {
            dryRun: false,
            skipErrors: false,
            maxRetries: 3
        }
    };
    const engine = new MigrationEngine();
    await engine.initialize(config);
    return engine;
}
/**
 * Create a CSV import migration
 */
async function createCSVImport(options) {
    const mappingRules = [{
            sourceEntity: 'generic',
            targetEntity: options.targetEntity,
            fieldMappings: Object.entries(options.fieldMapping).map(([source, target]) => ({
                sourceField: source,
                targetField: target,
                required: false,
                dataType: 'string'
            })),
            conditions: [],
            transformations: []
        }];
    return createSimpleMigration({
        sourceSystem: 'csv_import',
        sourceConfig: {
            baseUrl: '',
            credentials: {},
            filePath: options.filePath,
            format: 'csv',
            hasHeaders: options.hasHeaders !== false,
            delimiter: options.delimiter || ',',
            mapping: options.fieldMapping
        },
        autotaskConfig: options.autotaskConfig,
        entities: ['generic'],
        mappingRules
    });
}
/**
 * Migration configuration builder
 */
class MigrationConfigBuilder {
    constructor() {
        this.config = {
            source: {},
            target: {},
            mapping: { rules: [] },
            validation: {
                preValidation: true,
                postValidation: true,
                qualityChecks: true,
                duplicateDetection: true
            },
            options: {
                dryRun: false,
                skipErrors: false,
                maxRetries: 3
            }
        };
    }
    sourceSystem(system) {
        this.config.source.system = system;
        return this;
    }
    sourceConnection(config) {
        this.config.source.connectionConfig = config;
        return this;
    }
    entities(entities) {
        this.config.source.entities = entities;
        return this;
    }
    autotaskConfig(config) {
        this.config.target.autotaskConfig = config;
        this.config.target.zoneId = config.zoneId || 'zone1';
        return this;
    }
    mappingRules(rules) {
        this.config.mapping.rules = rules;
        return this;
    }
    validation(options) {
        Object.assign(this.config.validation, options);
        return this;
    }
    options(options) {
        Object.assign(this.config.options, options);
        return this;
    }
    build() {
        return this.config;
    }
}
exports.MigrationConfigBuilder = MigrationConfigBuilder;
/**
 * Default field mappings for common PSA systems
 */
exports.DEFAULT_MAPPINGS = {
    connectwise: {
        companies: {
            'name': 'companyName',
            'identifier': 'companyNumber',
            'addressLine1': 'addressLine1',
            'city': 'city',
            'state': 'state',
            'zip': 'postalCode',
            'phoneNumber': 'phone',
            'website': 'webAddress'
        },
        contacts: {
            'firstName': 'firstName',
            'lastName': 'lastName',
            'communicationItems[0].value': 'emailAddress',
            'title': 'title'
        },
        tickets: {
            'summary': 'title',
            'initialDescription': 'description',
            'status.name': 'status',
            'priority.name': 'priority'
        }
    },
    servicenow: {
        companies: {
            'name': 'companyName',
            'street': 'addressLine1',
            'city': 'city',
            'state': 'state',
            'zip': 'postalCode',
            'phone': 'phone',
            'website': 'webAddress'
        },
        contacts: {
            'first_name': 'firstName',
            'last_name': 'lastName',
            'email': 'emailAddress',
            'title': 'title'
        },
        tickets: {
            'short_description': 'title',
            'description': 'description',
            'state': 'status',
            'priority': 'priority'
        }
    }
};
// Version information
exports.VERSION = '1.0.0';
exports.SUPPORTED_SYSTEMS = [
    'connectwise_manage',
    'servicenow',
    'kaseya_vsa',
    'freshservice',
    'servicedesk_plus',
    'csv_import',
    'excel_import'
];
// Import for default export
const MigrationEngine_2 = require("./core/MigrationEngine");
const ConnectorFactory_2 = require("./connectors/ConnectorFactory");
const MappingEngine_2 = require("./mapping/MappingEngine");
exports.default = {
    MigrationEngine: MigrationEngine_2.MigrationEngine,
    ConnectorFactory: ConnectorFactory_2.ConnectorFactory,
    MappingEngine: MappingEngine_2.MappingEngine,
    createSimpleMigration,
    createCSVImport,
    MigrationConfigBuilder,
    DEFAULT_MAPPINGS: exports.DEFAULT_MAPPINGS,
    VERSION: exports.VERSION,
    SUPPORTED_SYSTEMS: exports.SUPPORTED_SYSTEMS
};
//# sourceMappingURL=index.js.map