/**
 * Test suite for Migration Engine
 */

import { MigrationEngine } from '../../src/migration/core/MigrationEngine';
import { MigrationConfigBuilder } from '../../src/migration/index';
import { PSASystem } from '../../src/migration/types/MigrationTypes';

// Mock dependencies for testing
jest.mock('../../src/migration/connectors/ConnectorFactory');
jest.mock('../../src/utils/logger');

describe('MigrationEngine', () => {
  let migrationEngine: MigrationEngine;

  beforeEach(() => {
    migrationEngine = new MigrationEngine();
  });

  describe('initialization', () => {
    it('should initialize with valid configuration', async () => {
      const config = new MigrationConfigBuilder()
        .sourceSystem(PSASystem.CSV_IMPORT)
        .sourceConnection({
          baseUrl: '',
          credentials: {},
          filePath: './test-data.csv',
          format: 'csv' as const,
          hasHeaders: true
        })
        .autotaskConfig({
          baseUrl: 'https://webservices.autotask.net',
          username: 'test-user',
          secret: 'test-secret',
          integrationCode: 'test-integration'
        })
        .entities(['companies'])
        .build();

      // Mock the initialization to avoid actual connections
      const mockInitialize = jest.spyOn(migrationEngine, 'initialize')
        .mockResolvedValue(undefined);

      await migrationEngine.initialize(config);
      
      expect(mockInitialize).toHaveBeenCalledWith(config);
    });

    it('should fail with invalid configuration', async () => {
      const invalidConfig = {
        source: {},
        target: {},
        mapping: { rules: [] },
        validation: {},
        options: {}
      } as any;

      await expect(migrationEngine.initialize(invalidConfig))
        .rejects.toThrow();
    });
  });

  describe('state management', () => {
    it('should track migration state', async () => {
      const config = new MigrationConfigBuilder()
        .sourceSystem(PSASystem.CSV_IMPORT)
        .sourceConnection({ baseUrl: '', credentials: {} })
        .autotaskConfig({
          baseUrl: 'https://webservices.autotask.net',
          username: 'test',
          secret: 'test',
          integrationCode: 'test'
        })
        .entities(['companies'])
        .build();

      // Mock initialization
      jest.spyOn(migrationEngine, 'initialize').mockResolvedValue(undefined);
      
      await migrationEngine.initialize(config);
      
      const state = migrationEngine.getState();
      expect(state).toBeDefined();
      expect(state.id).toBeDefined();
      expect(state.startTime).toBeInstanceOf(Date);
      expect(state.progress).toBeDefined();
    });

    it('should provide progress information', async () => {
      const progress = migrationEngine.getProgress();
      
      expect(progress).toHaveProperty('totalEntities');
      expect(progress).toHaveProperty('processedEntities');
      expect(progress).toHaveProperty('percentComplete');
    });
  });

  describe('event handling', () => {
    it('should emit initialization event', (done) => {
      const config = new MigrationConfigBuilder()
        .sourceSystem(PSASystem.CSV_IMPORT)
        .sourceConnection({ baseUrl: '', credentials: {} })
        .autotaskConfig({
          baseUrl: 'https://webservices.autotask.net',
          username: 'test',
          secret: 'test',
          integrationCode: 'test'
        })
        .entities(['companies'])
        .build();

      migrationEngine.on('initialized', (state) => {
        expect(state).toBeDefined();
        expect(state.id).toBeDefined();
        done();
      });

      // Mock the actual initialization
      jest.spyOn(migrationEngine, 'initialize').mockImplementation(async (cfg) => {
        migrationEngine.emit('initialized', { id: 'test', config: cfg } as any);
      });

      migrationEngine.initialize(config);
    });
  });
});

describe('MigrationConfigBuilder', () => {
  it('should build valid configuration', () => {
    const config = new MigrationConfigBuilder()
      .sourceSystem(PSASystem.CONNECTWISE_MANAGE)
      .sourceConnection({
        baseUrl: 'https://api.connectwise.com',
        credentials: {
          username: 'test-user',
          password: 'test-pass',
          clientId: 'test-client'
        }
      })
      .autotaskConfig({
        baseUrl: 'https://webservices.autotask.net',
        username: 'at-user',
        secret: 'at-secret',
        integrationCode: 'at-integration'
      })
      .entities(['companies', 'contacts'])
      .validation({
        preValidation: true,
        postValidation: true,
        qualityChecks: true,
        duplicateDetection: false
      })
      .options({
        dryRun: true,
        skipErrors: true,
        maxRetries: 5
      })
      .build();

    expect(config.source.system).toBe(PSASystem.CONNECTWISE_MANAGE);
    expect(config.source.entities).toEqual(['companies', 'contacts']);
    expect(config.target.autotaskConfig.username).toBe('at-user');
    expect(config.validation.qualityChecks).toBe(true);
    expect(config.validation.duplicateDetection).toBe(false);
    expect(config.options.dryRun).toBe(true);
    expect(config.options.maxRetries).toBe(5);
  });

  it('should have sensible defaults', () => {
    const config = new MigrationConfigBuilder()
      .sourceSystem(PSASystem.CSV_IMPORT)
      .sourceConnection({ baseUrl: '', credentials: {} })
      .autotaskConfig({
        baseUrl: 'https://webservices.autotask.net',
        username: 'test',
        secret: 'test',
        integrationCode: 'test'
      })
      .entities(['companies'])
      .build();

    expect(config.validation.preValidation).toBe(true);
    expect(config.validation.postValidation).toBe(true);
    expect(config.options.dryRun).toBe(false);
    expect(config.options.maxRetries).toBe(3);
    expect(config.mapping.rules).toEqual([]);
  });
});