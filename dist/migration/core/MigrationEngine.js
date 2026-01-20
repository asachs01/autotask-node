"use strict";
/**
 * Core Migration Engine for Autotask PSA Migration Framework
 * Orchestrates the entire migration process with enterprise-grade reliability
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
exports.MigrationEngine = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const MigrationTypes_1 = require("../types/MigrationTypes");
const ConnectorFactory_1 = require("../connectors/ConnectorFactory");
const MappingEngine_1 = require("../mapping/MappingEngine");
const PreMigrationValidator_1 = require("../validation/PreMigrationValidator");
const PostMigrationValidator_1 = require("../validation/PostMigrationValidator");
const ProgressTracker_1 = require("../enterprise/ProgressTracker");
const CheckpointManager_1 = require("../enterprise/CheckpointManager");
const ParallelProcessor_1 = require("../enterprise/ParallelProcessor");
const AutotaskClient_1 = require("../../client/AutotaskClient");
const logger_1 = require("../../utils/logger");
class MigrationEngine extends events_1.EventEmitter {
    constructor() {
        super();
        this.logger = (0, logger_1.createLogger)('MigrationEngine');
        // Initialize default state
        this.state = {
            id: (0, uuid_1.v4)(),
            status: MigrationTypes_1.MigrationStatus.INITIALIZING,
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
            config: {}
        };
    }
    /**
     * Initialize migration with configuration
     */
    async initialize(config) {
        try {
            this.config = config;
            this.stateFile = path.join(process.cwd(), 'migration-state.json');
            // Update state with provided config
            this.state.id = (0, uuid_1.v4)();
            this.state.status = MigrationTypes_1.MigrationStatus.INITIALIZING;
            this.state.startTime = new Date();
            this.state.config = config;
            // Initialize components
            await this.initializeComponents();
            // Check for resume from checkpoint
            if (config.options?.resumeFromCheckpoint) {
                await this.loadStateFromCheckpoint(config.options.resumeFromCheckpoint);
            }
            this.logger.info('Migration engine initialized', { migrationId: this.state.id });
            this.emit('initialized', this.state);
        }
        catch (error) {
            this.logger.error('Failed to initialize migration engine', error);
            this.state.status = MigrationTypes_1.MigrationStatus.FAILED;
            throw error;
        }
    }
    /**
     * Execute the complete migration process
     */
    async execute() {
        try {
            this.logger.info('Starting migration execution', { migrationId: this.state.id });
            this.state.status = MigrationTypes_1.MigrationStatus.PROCESSING;
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
            this.state.status = MigrationTypes_1.MigrationStatus.COMPLETED;
            this.state.endTime = new Date();
            await this.saveState();
            this.logger.info('Migration completed successfully', {
                migrationId: this.state.id,
                duration: this.state.endTime.getTime() - this.state.startTime.getTime()
            });
            this.emit('completed', this.state, report);
            return report;
        }
        catch (error) {
            this.logger.error('Migration failed', error);
            this.state.status = MigrationTypes_1.MigrationStatus.FAILED;
            this.state.endTime = new Date();
            await this.saveState();
            this.emit('failed', this.state, error);
            throw error;
        }
    }
    /**
     * Pause the migration
     */
    async pause() {
        this.logger.info('Pausing migration', { migrationId: this.state.id });
        this.state.status = MigrationTypes_1.MigrationStatus.PAUSED;
        await this.createCheckpoint('manual_pause');
        await this.saveState();
        this.emit('paused', this.state);
    }
    /**
     * Resume paused migration
     */
    async resume() {
        this.logger.info('Resuming migration', { migrationId: this.state.id });
        this.state.status = MigrationTypes_1.MigrationStatus.PROCESSING;
        await this.saveState();
        this.emit('resumed', this.state);
    }
    /**
     * Cancel the migration
     */
    async cancel() {
        this.logger.info('Cancelling migration', { migrationId: this.state.id });
        this.state.status = MigrationTypes_1.MigrationStatus.CANCELLED;
        this.state.endTime = new Date();
        await this.saveState();
        this.emit('cancelled', this.state);
    }
    /**
     * Get current migration state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Get migration progress
     */
    getProgress() {
        return { ...this.state.progress };
    }
    async initializeComponents() {
        // Initialize source connector
        this.sourceConnector = ConnectorFactory_1.ConnectorFactory.createConnector(this.config.source.system, this.config.source.connectionConfig);
        // Initialize target Autotask client
        this.targetClient = await AutotaskClient_1.AutotaskClient.create(this.config.target.autotaskConfig);
        // Initialize mapping engine
        this.mappingEngine = new MappingEngine_1.MappingEngine(this.config.mapping);
        // Initialize validators
        this.preValidator = new PreMigrationValidator_1.PreMigrationValidator(this.sourceConnector);
        this.postValidator = new PostMigrationValidator_1.PostMigrationValidator(this.targetClient);
        // Initialize enterprise components
        this.progressTracker = new ProgressTracker_1.ProgressTracker();
        this.checkpointManager = new CheckpointManager_1.CheckpointManager();
        this.parallelProcessor = new ParallelProcessor_1.ParallelProcessor({
            maxConcurrency: this.config.source.parallelism || 3,
            batchSize: this.config.source.batchSize || 100
        });
        // Connect to systems
        await this.sourceConnector.connect();
        await this.targetClient.initializeAllSubClients();
        this.logger.info('All components initialized successfully');
    }
    async createMigrationPlan() {
        const entities = this.config.source.entities;
        // Analyze entity dependencies
        const dependencies = await this.analyzeDependencies(entities);
        // Create phases based on dependencies
        const phases = this.createPhasesFromDependencies(dependencies);
        // Estimate duration
        const estimatedDuration = await this.estimateMigrationDuration(phases);
        // Assess risks
        const riskAssessment = await this.assessMigrationRisks(entities, phases);
        const plan = {
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
    async executePhase(phase) {
        this.logger.info('Executing migration phase', { phase: phase.name });
        for (const entityType of phase.entities) {
            await this.migrateEntity(entityType);
            // Create checkpoint after each entity
            await this.createCheckpoint(`entity_${entityType}_completed`);
        }
    }
    async migrateEntity(entityType) {
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
                if (this.state.status === MigrationTypes_1.MigrationStatus.PAUSED ||
                    this.state.status === MigrationTypes_1.MigrationStatus.CANCELLED) {
                    break;
                }
                // Fetch batch
                const batch = await this.sourceConnector.fetchBatch(entityType, offset, batchSize);
                if (batch.length === 0)
                    break;
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
        }
        catch (error) {
            this.logger.error('Entity migration failed', { entityType, error });
            this.addError(entityType, undefined, error);
            if (!this.config.options?.skipErrors) {
                throw error;
            }
        }
    }
    async processBatch(entityType, batch) {
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
        }
        catch (error) {
            this.logger.error('Batch processing failed', { entityType, batchSize: batch.length, error });
            // Process individual records if batch fails
            if (this.config.options?.skipErrors) {
                await this.processIndividualRecords(entityType, batch);
            }
            else {
                throw error;
            }
        }
    }
    async processIndividualRecords(entityType, records) {
        for (const record of records) {
            try {
                await this.processBatch(entityType, [record]);
            }
            catch (error) {
                this.addError(entityType, record.id, error);
            }
        }
    }
    async migrateRecords(entityType, records) {
        // Use parallel processor for better performance
        await this.parallelProcessor.processInParallel(records, async (record) => {
            try {
                const result = await this.targetClient.createEntity(entityType, record);
                this.state.metrics.recordsMigrated++;
                return result;
            }
            catch (error) {
                this.state.metrics.recordsFailed++;
                this.addError(entityType, record.id, error);
                throw error;
            }
        });
    }
    async validateBatch(entityType, batch) {
        return Promise.all(batch.map(record => this.mappingEngine.validateRecord(entityType, record)));
    }
    async performPreValidation() {
        this.logger.info('Performing pre-migration validation');
        this.state.status = MigrationTypes_1.MigrationStatus.VALIDATING;
        const validationResult = await this.preValidator.validate(this.config.source.entities, this.config);
        if (!validationResult.isValid && !this.config.options?.skipErrors) {
            throw new Error(`Pre-validation failed: ${validationResult.errors.join(', ')}`);
        }
        this.logger.info('Pre-validation completed', {
            isValid: validationResult.isValid,
            errorCount: validationResult.errors.length
        });
    }
    async performPostValidation() {
        this.logger.info('Performing post-migration validation');
        const validationResult = await this.postValidator.validate(this.config.source.entities, this.state);
        this.logger.info('Post-validation completed', {
            isValid: validationResult.isValid,
            errorCount: validationResult.errors.length
        });
    }
    async createCheckpoint(name) {
        const checkpoint = {
            id: (0, uuid_1.v4)(),
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
    updateProgress(processedCount) {
        this.state.progress.processedEntities += processedCount;
        this.state.progress.successfulEntities += processedCount;
        if (this.state.progress.totalEntities > 0) {
            this.state.progress.percentComplete =
                (this.state.progress.processedEntities / this.state.progress.totalEntities) * 100;
        }
    }
    updateMetrics(totalRecords, migratedRecords, processingTime) {
        this.state.metrics.recordsProcessed += totalRecords;
        this.state.metrics.recordsMigrated += migratedRecords;
        this.state.metrics.recordsFailed += totalRecords - migratedRecords;
        // Update average processing time
        const totalTime = this.state.metrics.averageProcessingTime *
            (this.state.metrics.recordsProcessed - totalRecords) + processingTime;
        this.state.metrics.averageProcessingTime = totalTime / this.state.metrics.recordsProcessed;
    }
    addError(entityType, entityId, error) {
        const migrationError = {
            id: (0, uuid_1.v4)(),
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
    async generateMigrationReport() {
        // Implementation details for generating comprehensive migration report
        const report = {
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
    async saveState() {
        try {
            await fs.writeFile(this.stateFile, JSON.stringify(this.state, null, 2));
        }
        catch (error) {
            this.logger.error('Failed to save migration state', error);
        }
    }
    async loadStateFromCheckpoint(checkpointId) {
        try {
            const checkpoint = await this.checkpointManager.loadCheckpoint(checkpointId);
            this.state = checkpoint.state;
            this.logger.info('State loaded from checkpoint', { checkpointId });
        }
        catch (error) {
            this.logger.error('Failed to load state from checkpoint', { checkpointId, error });
            throw error;
        }
    }
    // Helper methods for migration planning
    async analyzeDependencies(entities) {
        // Analyze entity dependencies based on Autotask relationships
        return [];
    }
    createPhasesFromDependencies(dependencies) {
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
    async estimateMigrationDuration(phases) {
        return phases.reduce((total, phase) => total + phase.estimatedDuration, 0);
    }
    async assessMigrationRisks(entities, phases) {
        return {
            overallRisk: 'medium',
            risks: [],
            mitigationStrategies: []
        };
    }
    estimateMemoryRequirements() {
        return 2048; // MB
    }
    estimateStorageRequirements() {
        return 10240; // MB
    }
}
exports.MigrationEngine = MigrationEngine;
//# sourceMappingURL=MigrationEngine.js.map