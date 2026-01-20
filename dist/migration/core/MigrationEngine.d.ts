/**
 * Core Migration Engine for Autotask PSA Migration Framework
 * Orchestrates the entire migration process with enterprise-grade reliability
 */
import { EventEmitter } from 'events';
import { MigrationConfig, MigrationState, MigrationProgress, MigrationReport } from '../types/MigrationTypes';
export declare class MigrationEngine extends EventEmitter {
    private state;
    private config;
    private sourceConnector;
    private targetClient;
    private mappingEngine;
    private preValidator;
    private postValidator;
    private progressTracker;
    private checkpointManager;
    private parallelProcessor;
    private logger;
    private stateFile;
    constructor();
    /**
     * Initialize migration with configuration
     */
    initialize(config: MigrationConfig): Promise<void>;
    /**
     * Execute the complete migration process
     */
    execute(): Promise<MigrationReport>;
    /**
     * Pause the migration
     */
    pause(): Promise<void>;
    /**
     * Resume paused migration
     */
    resume(): Promise<void>;
    /**
     * Cancel the migration
     */
    cancel(): Promise<void>;
    /**
     * Get current migration state
     */
    getState(): MigrationState;
    /**
     * Get migration progress
     */
    getProgress(): MigrationProgress;
    private initializeComponents;
    private createMigrationPlan;
    private executePhase;
    private migrateEntity;
    private processBatch;
    private processIndividualRecords;
    private migrateRecords;
    private validateBatch;
    private performPreValidation;
    private performPostValidation;
    private createCheckpoint;
    private updateProgress;
    private updateMetrics;
    private addError;
    private generateMigrationReport;
    private saveState;
    private loadStateFromCheckpoint;
    private analyzeDependencies;
    private createPhasesFromDependencies;
    private estimateMigrationDuration;
    private assessMigrationRisks;
    private estimateMemoryRequirements;
    private estimateStorageRequirements;
}
//# sourceMappingURL=MigrationEngine.d.ts.map