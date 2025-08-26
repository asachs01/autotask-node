/**
 * Autotask PSA Migration Framework
 * Complete migration solution for importing data from various PSA systems to Autotask
 */

// Core Migration Engine
export { MigrationEngine } from './core/MigrationEngine';

// Migration Types
export * from './types/MigrationTypes';

// Connectors
export { BaseConnector } from './connectors/BaseConnector';
export { ConnectorFactory } from './connectors/ConnectorFactory';
export { ConnectWiseManageConnector } from './connectors/ConnectWiseManageConnector';
export { ServiceNowConnector } from './connectors/ServiceNowConnector';
export { KaseyaVSAConnector } from './connectors/KaseyaVSAConnector';
export { FreshServiceConnector } from './connectors/FreshServiceConnector';
export { ServiceDeskPlusConnector } from './connectors/ServiceDeskPlusConnector';
export { CSVImportConnector } from './connectors/CSVImportConnector';

// Mapping Engine
export { MappingEngine } from './mapping/MappingEngine';

// Validation
export { PreMigrationValidator } from './validation/PreMigrationValidator';

// CLI Components
export { MigrationCLI } from './cli/MigrationCLI';

// Utility Functions
export { createMigrationConfig, validateMigrationConfig } from './utils/configHelpers';
export { createMappingRules } from './utils/mappingHelpers';
export { generateMigrationReport } from './utils/reportHelpers';

/**
 * Quick start function for simple migrations
 */
export async function createSimpleMigration(options: {
  sourceSystem: string;
  sourceConfig: any;
  autotaskConfig: any;
  entities: string[];
  mappingRules?: any[];
}) {
  const { MigrationEngine } = await import('./core/MigrationEngine');
  
  const config = {
    source: {
      system: options.sourceSystem as any,
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
export async function createCSVImport(options: {
  filePath: string;
  targetEntity: string;
  fieldMapping: Record<string, string>;
  autotaskConfig: any;
  hasHeaders?: boolean;
  delimiter?: string;
}) {
  const mappingRules = [{
    sourceEntity: 'generic',
    targetEntity: options.targetEntity,
    fieldMappings: Object.entries(options.fieldMapping).map(([source, target]) => ({
      sourceField: source,
      targetField: target,
      required: false,
      dataType: 'string' as any
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
      format: 'csv' as const,
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
export class MigrationConfigBuilder {
  private config: any = {
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

  sourceSystem(system: string) {
    this.config.source.system = system;
    return this;
  }

  sourceConnection(config: any) {
    this.config.source.connectionConfig = config;
    return this;
  }

  entities(entities: string[]) {
    this.config.source.entities = entities;
    return this;
  }

  autotaskConfig(config: any) {
    this.config.target.autotaskConfig = config;
    this.config.target.zoneId = config.zoneId || 'zone1';
    return this;
  }

  mappingRules(rules: any[]) {
    this.config.mapping.rules = rules;
    return this;
  }

  validation(options: any) {
    Object.assign(this.config.validation, options);
    return this;
  }

  options(options: any) {
    Object.assign(this.config.options, options);
    return this;
  }

  build() {
    return this.config;
  }
}

/**
 * Default field mappings for common PSA systems
 */
export const DEFAULT_MAPPINGS = {
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
export const VERSION = '1.0.0';
export const SUPPORTED_SYSTEMS = [
  'connectwise_manage',
  'servicenow',
  'kaseya_vsa',
  'freshservice',
  'servicedesk_plus',
  'csv_import',
  'excel_import'
];

export default {
  MigrationEngine,
  ConnectorFactory,
  MappingEngine,
  createSimpleMigration,
  createCSVImport,
  MigrationConfigBuilder,
  DEFAULT_MAPPINGS,
  VERSION,
  SUPPORTED_SYSTEMS
};