/**
 * Core Migration Engine for Autotask PSA Migration Framework
 * Orchestrates the entire migration process with enterprise-grade reliability
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

import {
  MigrationConfig,
  MigrationState,
  MigrationStatus,
  MigrationProgress,
  MigrationCheckpoint,
  MigrationError,
  MigrationReport,
  PSASystem,
  ValidationResult,
  MigrationPlan
} from '../types/MigrationTypes';

import { BaseConnector } from '../connectors/BaseConnector';
import { ConnectorFactory } from '../connectors/ConnectorFactory';
import { MappingEngine } from '../mapping/MappingEngine';
import { PreMigrationValidator } from '../validation/PreMigrationValidator';
import { PostMigrationValidator } from '../validation/PostMigrationValidator';
import { ProgressTracker } from '../enterprise/ProgressTracker';
import { CheckpointManager } from '../enterprise/CheckpointManager';
import { ParallelProcessor } from '../enterprise/ParallelProcessor';
import { AutotaskClient } from '../../client/AutotaskClient';
import { Logger } from 'winston';
import { createLogger } from '../../utils/logger';

export class MigrationEngine extends EventEmitter {
  private state: MigrationState;
  private config: MigrationConfig;
  private sourceConnector: BaseConnector;
  private targetClient: AutotaskClient;
  private mappingEngine: MappingEngine;
  private preValidator: PreMigrationValidator;
  private postValidator: PostMigrationValidator;
  private progressTracker: ProgressTracker;
  private checkpointManager: CheckpointManager;
  private parallelProcessor: ParallelProcessor;
  private logger: Logger;
  private stateFile: string;

  constructor() {
    super();
    this.logger = createLogger('MigrationEngine');
  }

  /**
   * Initialize migration with configuration
   */
  async initialize(config: MigrationConfig): Promise<void> {
    try {
      this.config = config;
      this.stateFile = path.join(process.cwd(), 'migration-state.json');

      // Initialize migration state
      this.state = {
        id: uuidv4(),
        status: MigrationStatus.INITIALIZING,
        startTime: new Date(),
        progress: {
          totalEntities: 0,
          processedEntities: 0,
          successfulEntities: 0,
          failedEntities: 0,
          skippedEntities: 0,
          percentComplete: 0
        },
        checkpoints: [],
        errors: [],
        metrics: {
          recordsProcessed: 0,
          recordsMigrated: 0,
          recordsFailed: 0,
          averageProcessingTime: 0,
          peakMemoryUsage: 0,
          networkRequests: 0,
          cacheHitRate: 0,
          dataTransferred: 0
        },
        config
      };

      // Initialize components
      await this.initializeComponents();

      // Check for resume from checkpoint
      if (config.options?.resumeFromCheckpoint) {
        await this.loadStateFromCheckpoint(config.options.resumeFromCheckpoint);
      }

      this.logger.info('Migration engine initialized', { migrationId: this.state.id });
      this.emit('initialized', this.state);

    } catch (error) {
      this.logger.error('Failed to initialize migration engine', error);
      this.state.status = MigrationStatus.FAILED;
      throw error;
    }
  }

  /**
   * Execute the complete migration process
   */
  async execute(): Promise<MigrationReport> {
    try {
      this.logger.info('Starting migration execution', { migrationId: this.state.id });
      this.state.status = MigrationStatus.PROCESSING;
      this.emit('started', this.state);

      // Create migration plan
      const migrationPlan = await this.createMigrationPlan();
      this.logger.info('Migration plan created', { phases: migrationPlan.phases.length });

      // Pre-validation
      if (this.config.validation.preValidation) {
        await this.performPreValidation();
      }

      // Execute migration phases
      for (const phase of migrationPlan.phases) {
        await this.executePhase(phase);
      }

      // Post-validation
      if (this.config.validation.postValidation) {
        await this.performPostValidation();
      }

      // Generate final report
      const report = await this.generateMigrationReport();

      this.state.status = MigrationStatus.COMPLETED;
      this.state.endTime = new Date();
      await this.saveState();

      this.logger.info('Migration completed successfully', { 
        migrationId: this.state.id,
        duration: this.state.endTime.getTime() - this.state.startTime.getTime()
      });

      this.emit('completed', this.state, report);
      return report;

    } catch (error) {
      this.logger.error('Migration failed', error);
      this.state.status = MigrationStatus.FAILED;
      this.state.endTime = new Date();
      await this.saveState();

      this.emit('failed', this.state, error);
      throw error;
    }
  }

  /**
   * Pause the migration
   */
  async pause(): Promise<void> {
    this.logger.info('Pausing migration', { migrationId: this.state.id });
    this.state.status = MigrationStatus.PAUSED;
    await this.createCheckpoint('manual_pause');
    await this.saveState();
    this.emit('paused', this.state);
  }

  /**
   * Resume paused migration
   */
  async resume(): Promise<void> {
    this.logger.info('Resuming migration', { migrationId: this.state.id });
    this.state.status = MigrationStatus.PROCESSING;
    await this.saveState();
    this.emit('resumed', this.state);
  }

  /**
   * Cancel the migration
   */
  async cancel(): Promise<void> {
    this.logger.info('Cancelling migration', { migrationId: this.state.id });
    this.state.status = MigrationStatus.CANCELLED;
    this.state.endTime = new Date();
    await this.saveState();
    this.emit('cancelled', this.state);
  }

  /**
   * Get current migration state
   */
  getState(): MigrationState {
    return { ...this.state };
  }

  /**
   * Get migration progress
   */
  getProgress(): MigrationProgress {
    return { ...this.state.progress };
  }

  private async initializeComponents(): Promise<void> {
    // Initialize source connector
    this.sourceConnector = ConnectorFactory.createConnector(
      this.config.source.system,
      this.config.source.connectionConfig
    );

    // Initialize target Autotask client
    this.targetClient = new AutotaskClient(this.config.target.autotaskConfig);

    // Initialize mapping engine
    this.mappingEngine = new MappingEngine(this.config.mapping);

    // Initialize validators
    this.preValidator = new PreMigrationValidator(this.sourceConnector);
    this.postValidator = new PostMigrationValidator(this.targetClient);

    // Initialize enterprise components
    this.progressTracker = new ProgressTracker();
    this.checkpointManager = new CheckpointManager();
    this.parallelProcessor = new ParallelProcessor({
      maxConcurrency: this.config.source.parallelism || 3,
      batchSize: this.config.source.batchSize || 100
    });

    // Connect to systems
    await this.sourceConnector.connect();
    await this.targetClient.initialize();

    this.logger.info('All components initialized successfully');
  }

  private async createMigrationPlan(): Promise<MigrationPlan> {
    const entities = this.config.source.entities;
    
    // Analyze entity dependencies
    const dependencies = await this.analyzeDependencies(entities);
    
    // Create phases based on dependencies
    const phases = this.createPhasesFromDependencies(dependencies);
    
    // Estimate duration
    const estimatedDuration = await this.estimateMigrationDuration(phases);
    
    // Assess risks
    const riskAssessment = await this.assessMigrationRisks(entities, phases);

    const plan: MigrationPlan = {
      phases,
      dependencies,
      estimatedDuration,
      riskAssessment,
      resourceRequirements: {
        memory: this.estimateMemoryRequirements(),
        cpu: 2, // cores
        storage: this.estimateStorageRequirements(),
        networkBandwidth: 10, // Mbps
        estimatedCost: 0, // TBD
        duration: estimatedDuration
      }
    };

    this.logger.info('Migration plan created', { plan });
    return plan;
  }

  private async executePhase(phase: any): Promise<void> {
    this.logger.info('Executing migration phase', { phase: phase.name });
    
    for (const entityType of phase.entities) {
      await this.migrateEntity(entityType);
      
      // Create checkpoint after each entity
      await this.createCheckpoint(`entity_${entityType}_completed`);
    }
  }

  private async migrateEntity(entityType: string): Promise<void> {
    try {
      this.logger.info('Starting entity migration', { entityType });
      
      // Get total record count
      const totalRecords = await this.sourceConnector.getRecordCount(entityType);
      this.state.progress.totalEntities += totalRecords;

      // Process in batches
      const batchSize = this.config.source.batchSize || 100;
      let offset = 0;
      let processedCount = 0;

      while (offset < totalRecords) {
        // Check if migration is paused/cancelled
        if (this.state.status === MigrationStatus.PAUSED || 
            this.state.status === MigrationStatus.CANCELLED) {
          break;
        }

        // Fetch batch
        const batch = await this.sourceConnector.fetchBatch(entityType, offset, batchSize);
        
        if (batch.length === 0) break;

        // Process batch
        await this.processBatch(entityType, batch);

        offset += batchSize;
        processedCount += batch.length;
        
        // Update progress
        this.updateProgress(batch.length);
        
        // Emit progress event
        this.emit('progress', this.state.progress);
      }

      this.logger.info('Entity migration completed', { 
        entityType, 
        processedCount,
        totalRecords 
      });

    } catch (error) {
      this.logger.error('Entity migration failed', { entityType, error });
      this.addError(entityType, undefined, error);
      
      if (!this.config.options?.skipErrors) {
        throw error;
      }
    }
  }

  private async processBatch(entityType: string, batch: any[]): Promise<void> {
    const startTime = Date.now();

    try {
      // Transform data using mapping engine
      const transformedBatch = await this.mappingEngine.transformBatch(entityType, batch);

      // Validate transformed data
      const validationResults = await this.validateBatch(entityType, transformedBatch);

      // Filter out invalid records if configured
      const validRecords = this.config.options?.skipErrors 
        ? transformedBatch.filter((_, index) => validationResults[index].isValid)
        : transformedBatch;

      // Migrate valid records
      if (validRecords.length > 0) {
        await this.migrateRecords(entityType, validRecords);
      }

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateMetrics(batch.length, validRecords.length, processingTime);

    } catch (error) {
      this.logger.error('Batch processing failed', { entityType, batchSize: batch.length, error });
      
      // Process individual records if batch fails
      if (this.config.options?.skipErrors) {
        await this.processIndividualRecords(entityType, batch);
      } else {
        throw error;
      }
    }
  }

  private async processIndividualRecords(entityType: string, records: any[]): Promise<void> {
    for (const record of records) {
      try {
        await this.processBatch(entityType, [record]);
      } catch (error) {
        this.addError(entityType, record.id, error);
      }
    }
  }

  private async migrateRecords(entityType: string, records: any[]): Promise<void> {
    // Use parallel processor for better performance
    await this.parallelProcessor.processInParallel(
      records,
      async (record) => {
        try {
          const result = await this.targetClient.createEntity(entityType, record);
          this.state.metrics.recordsMigrated++;
          return result;
        } catch (error) {
          this.state.metrics.recordsFailed++;
          this.addError(entityType, record.id, error);
          throw error;
        }
      }
    );
  }

  private async validateBatch(entityType: string, batch: any[]): Promise<ValidationResult[]> {
    return Promise.all(
      batch.map(record => this.mappingEngine.validateRecord(entityType, record))
    );
  }

  private async performPreValidation(): Promise<void> {
    this.logger.info('Performing pre-migration validation');
    this.state.status = MigrationStatus.VALIDATING;

    const validationResult = await this.preValidator.validate(
      this.config.source.entities,
      this.config
    );

    if (!validationResult.isValid && !this.config.options?.skipErrors) {
      throw new Error(`Pre-validation failed: ${validationResult.errors.join(', ')}`);
    }

    this.logger.info('Pre-validation completed', { 
      isValid: validationResult.isValid,
      errorCount: validationResult.errors.length 
    });
  }

  private async performPostValidation(): Promise<void> {
    this.logger.info('Performing post-migration validation');
    
    const validationResult = await this.postValidator.validate(
      this.config.source.entities,
      this.state
    );

    this.logger.info('Post-validation completed', { 
      isValid: validationResult.isValid,
      errorCount: validationResult.errors.length 
    });
  }

  private async createCheckpoint(name: string): Promise<void> {
    const checkpoint: MigrationCheckpoint = {
      id: uuidv4(),
      timestamp: new Date(),
      entityType: this.state.progress.currentEntity || 'unknown',
      lastProcessedId: 'current_position',
      state: this.state,
      canRollback: true
    };

    this.state.checkpoints.push(checkpoint);
    await this.checkpointManager.saveCheckpoint(checkpoint);
    
    this.logger.info('Checkpoint created', { checkpointId: checkpoint.id, name });
  }

  private updateProgress(processedCount: number): void {
    this.state.progress.processedEntities += processedCount;
    this.state.progress.successfulEntities += processedCount;
    
    if (this.state.progress.totalEntities > 0) {
      this.state.progress.percentComplete = 
        (this.state.progress.processedEntities / this.state.progress.totalEntities) * 100;
    }
  }

  private updateMetrics(totalRecords: number, migratedRecords: number, processingTime: number): void {
    this.state.metrics.recordsProcessed += totalRecords;
    this.state.metrics.recordsMigrated += migratedRecords;
    this.state.metrics.recordsFailed += totalRecords - migratedRecords;
    
    // Update average processing time
    const totalTime = this.state.metrics.averageProcessingTime * 
      (this.state.metrics.recordsProcessed - totalRecords) + processingTime;
    this.state.metrics.averageProcessingTime = totalTime / this.state.metrics.recordsProcessed;
  }

  private addError(entityType: string, entityId: string | undefined, error: any): void {
    const migrationError: MigrationError = {
      id: uuidv4(),
      timestamp: new Date(),
      entityType,
      entityId,
      error: error.message || error.toString(),
      stack: error.stack,
      context: { config: this.config },
      retryCount: 0,
      resolved: false
    };

    this.state.errors.push(migrationError);
    this.logger.error('Migration error added', migrationError);
  }

  private async generateMigrationReport(): Promise<MigrationReport> {
    // Implementation details for generating comprehensive migration report
    const report: MigrationReport = {
      migrationId: this.state.id,
      summary: {
        totalEntities: this.state.progress.totalEntities,
        successfulEntities: this.state.progress.successfulEntities,
        failedEntities: this.state.progress.failedEntities,
        skippedEntities: this.state.progress.skippedEntities,
        duration: this.state.endTime 
          ? this.state.endTime.getTime() - this.state.startTime.getTime()
          : 0,
        dataTransferred: this.state.metrics.dataTransferred,
        errorRate: this.state.metrics.recordsFailed / this.state.metrics.recordsProcessed * 100,
        successRate: this.state.metrics.recordsMigrated / this.state.metrics.recordsProcessed * 100
      },
      entityReports: [], // Will be populated with entity-specific reports
      validationReport: {}, // Will be populated with validation results
      performanceReport: {
        duration: this.state.endTime 
          ? this.state.endTime.getTime() - this.state.startTime.getTime()
          : 0,
        throughput: this.state.metrics.recordsProcessed / 
          (this.state.endTime ? this.state.endTime.getTime() - this.state.startTime.getTime() : 1),
        memoryUsage: {
          peak: this.state.metrics.peakMemoryUsage,
          average: 0,
          gcEvents: 0,
          memoryLeaks: false
        },
        networkMetrics: {
          totalRequests: this.state.metrics.networkRequests,
          averageResponseTime: 0,
          errorRate: 0,
          retryCount: 0,
          dataTransferred: this.state.metrics.dataTransferred
        },
        bottlenecks: []
      },
      recommendations: [],
      generatedAt: new Date()
    };

    return report;
  }

  private async saveState(): Promise<void> {
    try {
      await fs.writeFile(this.stateFile, JSON.stringify(this.state, null, 2));
    } catch (error) {
      this.logger.error('Failed to save migration state', error);
    }
  }

  private async loadStateFromCheckpoint(checkpointId: string): Promise<void> {
    try {
      const checkpoint = await this.checkpointManager.loadCheckpoint(checkpointId);
      this.state = checkpoint.state as MigrationState;
      this.logger.info('State loaded from checkpoint', { checkpointId });
    } catch (error) {
      this.logger.error('Failed to load state from checkpoint', { checkpointId, error });
      throw error;
    }
  }

  // Helper methods for migration planning
  private async analyzeDependencies(entities: string[]): Promise<any[]> {
    // Analyze entity dependencies based on Autotask relationships
    return [];
  }

  private createPhasesFromDependencies(dependencies: any[]): any[] {
    // Create migration phases based on dependencies
    return [
      {
        id: 'phase1',
        name: 'Core Entities',
        entities: ['companies', 'contacts'],
        order: 1,
        estimatedDuration: 3600000, // 1 hour
        dependencies: [],
        parallelizable: true
      }
    ];
  }

  private async estimateMigrationDuration(phases: any[]): Promise<number> {
    return phases.reduce((total, phase) => total + phase.estimatedDuration, 0);
  }

  private async assessMigrationRisks(entities: string[], phases: any[]): Promise<any> {
    return {
      overallRisk: 'medium',
      risks: [],
      mitigationStrategies: []
    };
  }

  private estimateMemoryRequirements(): number {
    return 2048; // MB
  }

  private estimateStorageRequirements(): number {
    return 10240; // MB
  }
}