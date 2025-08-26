/**
 * Configuration builder for migration setup
 */

import { MigrationConfig, PSASystem } from '../types/MigrationTypes';

export class ConfigBuilder {
  async createBasicConfig(system: PSASystem): Promise<MigrationConfig> {
    return {
      source: {
        system,
        connectionConfig: { baseUrl: '', credentials: {} },
        entities: ['companies']
      },
      target: {
        autotaskConfig: {
          baseUrl: '',
          username: '',
          secret: '',
          integrationCode: ''
        },
        zoneId: 'zone1'
      },
      mapping: {
        rules: []
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
  }
}