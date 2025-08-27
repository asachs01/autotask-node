/**
 * Main entry point for the Autotask relationship mapping and cascade operations system
 * Provides a unified interface for all relationship functionality
 */

// Core types
export * from './types/RelationshipTypes';

// Core components
export { RelationshipMapper } from './core/RelationshipMapper';
export { AutotaskRelationshipDefinitions } from './mapping/AutotaskRelationshipDefinitions';

// Cascade operations
export { CascadeEngine } from './cascade/CascadeEngine';

// Graph traversal
export { 
  GraphTraversalEngine,
  type GraphTraversalResult,
  type DependencyAnalysis
} from './graph/GraphTraversalEngine';

// Smart loading
export { 
  SmartLoadingEngine,
  type LoadingContext,
  type LoadingResult,
  type LoadingProfile
} from './loading/SmartLoadingEngine';

// Data integrity
export { 
  DataIntegrityManager,
  type IntegrityCheckOptions,
  type IntegrityReport,
  type IntegrityRepairPlan
} from './integrity/DataIntegrityManager';

// Batch processing
export { 
  BatchRelationshipProcessor,
  type BatchProcessingOptions,
  type BatchResult
} from './batch/BatchRelationshipProcessor';

import { RelationshipMapper } from './core/RelationshipMapper';
import { CascadeEngine } from './cascade/CascadeEngine';
import { GraphTraversalEngine } from './graph/GraphTraversalEngine';
import { SmartLoadingEngine } from './loading/SmartLoadingEngine';
import { DataIntegrityManager } from './integrity/DataIntegrityManager';
import { BatchRelationshipProcessor } from './batch/BatchRelationshipProcessor';
import { AutotaskClient } from '../client/AutotaskClient';
import { RelationshipSystemConfig } from './types/RelationshipTypes';

/**
 * Main relationship system manager - provides unified access to all relationship functionality
 */
export class AutotaskRelationshipSystem {
  public readonly mapper: RelationshipMapper;
  public readonly cascade: CascadeEngine;
  public readonly traversal: GraphTraversalEngine;
  public readonly loading: SmartLoadingEngine;
  public readonly integrity: DataIntegrityManager;
  public readonly batch: BatchRelationshipProcessor;

  private client: AutotaskClient;
  private config: RelationshipSystemConfig;

  constructor(client: AutotaskClient, config?: Partial<RelationshipSystemConfig>) {
    this.client = client;
    this.config = this.buildConfig(config);

    // Initialize core components
    this.mapper = new RelationshipMapper();
    this.cascade = new CascadeEngine(client);
    this.traversal = new GraphTraversalEngine(this.mapper);
    this.loading = new SmartLoadingEngine(client, this.mapper);
    this.integrity = new DataIntegrityManager(client, this.mapper);
    this.batch = new BatchRelationshipProcessor(client, this.mapper, this.cascade, this.config);
  }

  /**
   * Initialize the relationship system with validation
   */
  public async initialize(): Promise<void> {
    console.log('Initializing Autotask Relationship System...');

    try {
      // Validate relationship definitions
      await this.validateRelationshipDefinitions();

      // Build entity graph
      console.log('Building entity relationship graph...');
      const graph = this.mapper.getEntityGraph();
      console.log(`Built graph with ${graph.nodes.size} entities and ${graph.edges.size} relationships`);

      // Check for circular dependencies
      const circular = this.mapper.getCircularDependencies();
      if (circular.size > 0) {
        console.warn(`Found ${circular.size} circular dependencies:`, Array.from(circular));
      }

      // Initialize loading patterns
      console.log('Initializing smart loading patterns...');
      await this.initializeLoadingPatterns();

      console.log('Relationship system initialized successfully');

    } catch (error) {
      console.error('Failed to initialize relationship system:', error);
      throw error;
    }
  }

  /**
   * Get system health and statistics
   */
  public getSystemHealth(): {
    status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
    metrics: any;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    try {
      // Check relationship mapper health
      const metrics = this.mapper.getMetrics();
      
      // Check for circular dependencies
      const circularDeps = this.mapper.getCircularDependencies();
      if (circularDeps.size > 0) {
        warnings.push(`${circularDeps.size} circular dependencies detected`);
      }

      // Check active batch operations
      const activeBatch = this.batch.getActiveOperations();
      if (activeBatch.size > 10) {
        warnings.push(`High number of active batch operations: ${activeBatch.size}`);
      }

      const status = errors.length > 0 ? 'ERROR' : 
                    warnings.length > 0 ? 'DEGRADED' : 'HEALTHY';

      return {
        status,
        metrics: {
          totalRelationships: metrics.totalRelationships,
          relationshipsByType: Object.fromEntries(metrics.relationshipsByType),
          averageCascadeDepth: metrics.averageCascadeDepth,
          cacheHitRate: metrics.cacheHitRate,
          activeBatchOperations: activeBatch.size
        },
        warnings,
        errors
      };

    } catch (error) {
      errors.push(`Health check failed: ${(error as Error).message}`);
      return {
        status: 'ERROR',
        metrics: {},
        warnings,
        errors
      };
    }
  }

  /**
   * Perform comprehensive system validation
   */
  public async validateSystem(): Promise<{
    valid: boolean;
    issues: Array<{
      severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
      component: string;
      message: string;
      suggestion?: string;
    }>;
  }> {
    const issues: Array<{
      severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
      component: string;
      message: string;
      suggestion?: string;
    }> = [];

    try {
      // Validate relationship definitions
      console.log('Validating relationship definitions...');
      await this.validateRelationshipDefinitions();
      issues.push({
        severity: 'INFO',
        component: 'RelationshipMapper',
        message: 'Relationship definitions validated successfully'
      });

    } catch (error) {
      issues.push({
        severity: 'ERROR',
        component: 'RelationshipMapper',
        message: `Relationship validation failed: ${(error as Error).message}`,
        suggestion: 'Check relationship definitions for consistency'
      });
    }

    // Check data integrity
    try {
      console.log('Running data integrity check...');
      const integrityResult = await this.integrity.performIntegrityCheck({
        entities: ['Companies', 'Contacts', 'Tickets', 'Projects'],
        batchSize: 50
      });

      if (integrityResult.violations.length > 0) {
        const criticalViolations = integrityResult.violations.filter(v => v.severity === 'CRITICAL');
        if (criticalViolations.length > 0) {
          issues.push({
            severity: 'CRITICAL',
            component: 'DataIntegrity',
            message: `${criticalViolations.length} critical data integrity violations found`,
            suggestion: 'Run integrity repair immediately'
          });
        } else {
          issues.push({
            severity: 'WARNING',
            component: 'DataIntegrity',
            message: `${integrityResult.violations.length} data integrity issues found`,
            suggestion: 'Consider running integrity repair during maintenance window'
          });
        }
      }

    } catch (error) {
      issues.push({
        severity: 'WARNING',
        component: 'DataIntegrity',
        message: `Integrity check failed: ${(error as Error).message}`
      });
    }

    const valid = !issues.some(issue => issue.severity === 'ERROR' || issue.severity === 'CRITICAL');

    return { valid, issues };
  }

  /**
   * Get system configuration
   */
  public getConfiguration(): RelationshipSystemConfig {
    return { ...this.config };
  }

  /**
   * Update system configuration
   */
  public updateConfiguration(updates: Partial<RelationshipSystemConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Private helper methods
   */
  private buildConfig(config?: Partial<RelationshipSystemConfig>): RelationshipSystemConfig {
    return {
      maxCascadeDepth: config?.maxCascadeDepth || 10,
      defaultBatchSize: config?.defaultBatchSize || 50,
      enableCircularDependencyDetection: config?.enableCircularDependencyDetection !== false,
      enableIntegrityValidation: config?.enableIntegrityValidation !== false,
      defaultLoadingStrategy: config?.defaultLoadingStrategy || 'SELECTIVE',
      cacheEnabled: config?.cacheEnabled !== false,
      cacheTtl: config?.cacheTtl || 300000, // 5 minutes
      performanceMonitoring: config?.performanceMonitoring !== false,
      logLevel: config?.logLevel || 'INFO',
      retryPolicy: {
        maxRetries: config?.retryPolicy?.maxRetries || 3,
        baseDelay: config?.retryPolicy?.baseDelay || 1000,
        maxDelay: config?.retryPolicy?.maxDelay || 30000,
        exponentialBackoff: config?.retryPolicy?.exponentialBackoff !== false
      }
    };
  }

  private async validateRelationshipDefinitions(): Promise<void> {
    const relationships = this.mapper.getAllRelationships();
    
    // Validate each relationship
    for (const relationship of relationships) {
      // Check that source and target entities exist
      if (!relationship.sourceEntity || !relationship.targetEntity) {
        throw new Error(`Invalid relationship ${relationship.id}: missing source or target entity`);
      }

      // Check that fields are defined
      if (!relationship.sourceFields.length || !relationship.targetFields.length) {
        throw new Error(`Invalid relationship ${relationship.id}: missing field definitions`);
      }

      // Validate cascade options
      if (!relationship.cascadeOptions) {
        throw new Error(`Invalid relationship ${relationship.id}: missing cascade options`);
      }
    }
  }

  private async initializeLoadingPatterns(): Promise<void> {
    // Initialize common loading patterns based on usage
    const coreEntities = ['Companies', 'Contacts', 'Tickets', 'Projects', 'Tasks'];
    
    for (const entity of coreEntities) {
      try {
        // This would analyze usage patterns and create optimized loading patterns
        console.log(`Initializing loading patterns for ${entity}...`);
      } catch (error) {
        console.warn(`Failed to initialize loading patterns for ${entity}:`, error);
      }
    }
  }

  private getAllRelationships() {
    return this.mapper.getAllRelationships();
  }
}

// Default export for convenience
export default AutotaskRelationshipSystem;