/**
 * Usage examples for the Autotask Relationship System
 * Demonstrates various relationship operations and patterns
 */

import { AutotaskClient } from '../../client/AutotaskClient';
import { 
  AutotaskRelationshipSystem,
  RelationshipQueryOptions,
  CascadeResult,
  IntegrityReport,
  GraphTraversalResult,
  LoadingResult,
  BatchResult
} from '../index';

export class RelationshipUsageExamples {
  private client: AutotaskClient;
  private relationshipSystem: AutotaskRelationshipSystem;

  constructor(client: AutotaskClient) {
    this.client = client;
    this.relationshipSystem = new AutotaskRelationshipSystem(client, {
      maxCascadeDepth: 5,
      defaultBatchSize: 25,
      defaultLoadingStrategy: 'SELECTIVE',
      cacheEnabled: true,
      performanceMonitoring: true,
      logLevel: 'INFO'
    });
  }

  /**
   * Initialize the relationship system
   */
  public async initialize(): Promise<void> {
    await this.relationshipSystem.initialize();
    console.log('Relationship system initialized and ready for use');
  }

  /**
   * Example 1: Create company with related contacts and configuration items
   */
  public async createCompanyWithRelatedData(): Promise<void> {
    console.log('\n=== Example 1: Cascade Create Company with Related Data ===');

    try {
      const companyData = {
        companyName: 'Tech Solutions Inc.',
        companyType: 'Customer',
        phone: '555-123-4567',
        city: 'New York',
        state: 'NY',
        country: 'United States'
      };

      const relatedData = new Map([
        ['Contacts', [
          {
            firstName: 'John',
            lastName: 'Smith',
            emailAddress: 'john.smith@techsolutions.com',
            title: 'IT Manager',
            isActive: true
          },
          {
            firstName: 'Sarah',
            lastName: 'Johnson',
            emailAddress: 'sarah.johnson@techsolutions.com',
            title: 'System Administrator',
            isActive: true
          }
        ]],
        ['CompanyLocations', [
          {
            name: 'Main Office',
            address1: '123 Business Ave',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            isPrimary: true
          }
        ]]
      ]);

      const result: CascadeResult = await this.relationshipSystem.cascade.cascadeCreate(
        'Companies',
        companyData,
        relatedData,
        {
          maxDepth: 3,
          dryRun: false,
          continueOnError: false
        }
      );

      if (result.success) {
        console.log('✅ Company created successfully with related data');
        console.log(`   Execution time: ${result.executionTime}ms`);
        console.log(`   Operations count: ${result.operationsCount}`);
        
        result.affectedEntities.forEach((entityResult, entityName) => {
          console.log(`   Created ${entityResult.recordIds.length} ${entityName} records`);
        });
      } else {
        console.log('❌ Company creation failed');
        result.errors.forEach(error => {
          console.log(`   Error: ${error.message}`);
        });
      }

    } catch (error) {
      console.error('Cascade create failed:', error);
    }
  }

  /**
   * Example 2: Smart loading of entity with relationships
   */
  public async loadEntityWithSmartRelationships(): Promise<void> {
    console.log('\n=== Example 2: Smart Loading with Relationships ===');

    try {
      // Load a company with its most commonly accessed relationships
      const loadingOptions: RelationshipQueryOptions = {
        includeRelationships: ['contacts', 'tickets', 'projects', 'contracts'],
        loadingStrategy: 'SELECTIVE',
        maxDepth: 2,
        batchSize: 20,
        cacheResults: true
      };

      const result: LoadingResult = await this.relationshipSystem.loading.loadWithRelationships(
        'Companies',
        123, // Company ID
        loadingOptions
      );

      console.log('✅ Entity loaded with relationships');
      console.log(`   Primary entity: ${result.entity?.companyName || 'Unknown'}`);
      console.log(`   Relationships loaded: ${result.relatedData.size}`);
      console.log(`   Queries executed: ${result.loadingStatistics.queriesExecuted}`);
      console.log(`   Cache hit rate: ${result.loadingStatistics.cacheHitRate.toFixed(1)}%`);
      console.log(`   Total query time: ${result.loadingStatistics.totalQueryTime}ms`);

      // Display loaded relationships
      result.relatedData.forEach((data, relationshipName) => {
        console.log(`   ${relationshipName}: ${data.length} records`);
      });

      // Show optimization suggestions
      if (result.optimizationSuggestions.length > 0) {
        console.log('💡 Optimization suggestions:');
        result.optimizationSuggestions.forEach(suggestion => {
          console.log(`   - ${suggestion}`);
        });
      }

    } catch (error) {
      console.error('Smart loading failed:', error);
    }
  }

  /**
   * Example 3: Graph traversal and dependency analysis
   */
  public async analyzeEntityDependencies(): Promise<void> {
    console.log('\n=== Example 3: Entity Dependency Analysis ===');

    try {
      // Analyze dependencies for a critical entity
      const entityName = 'Companies';
      const analysis = this.relationshipSystem.traversal.analyzeDependencies(entityName);

      console.log(`📊 Dependency analysis for ${entityName}:`);
      console.log(`   Direct dependencies: ${analysis.directDependencies.length}`);
      console.log(`   Transitive dependencies: ${analysis.transiteDependencies.length}`);
      console.log(`   Direct dependents: ${analysis.dependents.length}`);
      console.log(`   Transitive dependents: ${analysis.transiteDependents.length}`);
      console.log(`   Isolation risk: ${analysis.isolationRisk}`);

      // Show some specific dependencies
      if (analysis.directDependencies.length > 0) {
        console.log('   Direct dependencies:', analysis.directDependencies.slice(0, 5).join(', '));
      }

      if (analysis.dependents.length > 0) {
        console.log('   Direct dependents:', analysis.dependents.slice(0, 5).join(', '));
      }

      // Check for circular dependencies
      if (analysis.circularDependencies.length > 0) {
        console.log('⚠️  Circular dependencies detected:', analysis.circularDependencies.join(', '));
      }

      // Find relationship paths
      const pathResult: GraphTraversalResult = this.relationshipSystem.traversal.breadthFirstSearch(
        'Companies',
        'TimeEntries',
        {
          direction: 'FORWARD',
          maxDepth: 4,
          strategy: 'SHORTEST_PATH'
        }
      );

      if (pathResult.paths.length > 0) {
        const shortestPath = pathResult.paths[0];
        console.log(`🔗 Shortest path from Companies to TimeEntries:`);
        console.log(`   Distance: ${shortestPath.distance} relationships`);
        console.log(`   Cost: ${shortestPath.cost.toFixed(2)}`);
        
        const pathString = [shortestPath.source, ...shortestPath.path.map(rel => rel.targetEntity)].join(' → ');
        console.log(`   Path: ${pathString}`);
      }

    } catch (error) {
      console.error('Dependency analysis failed:', error);
    }
  }

  /**
   * Example 4: Data integrity check and repair
   */
  public async performDataIntegrityCheck(): Promise<void> {
    console.log('\n=== Example 4: Data Integrity Check ===');

    try {
      // Perform comprehensive integrity check
      const integrityResult: IntegrityReport = await this.relationshipSystem.integrity.performIntegrityCheck({
        entities: ['Companies', 'Contacts', 'Tickets', 'Projects', 'Tasks'],
        checkOrphans: true,
        checkReferences: true,
        checkCircularDependencies: true,
        checkConstraints: true,
        batchSize: 100,
        generateReport: true
      });

      console.log('🔍 Integrity check completed');
      console.log(`   Check ID: ${integrityResult.checkId}`);
      console.log(`   Duration: ${integrityResult.duration}ms`);
      console.log(`   Entities checked: ${integrityResult.entitiesChecked.length}`);
      console.log(`   Records checked: ${integrityResult.recordsChecked}`);
      console.log(`   Violations found: ${integrityResult.violations.length}`);

      // Categorize violations by severity
      const violationsBySeverity = integrityResult.violations.reduce((acc, violation) => {
        acc[violation.severity] = (acc[violation.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(violationsBySeverity).forEach(([severity, count]) => {
        console.log(`   ${severity}: ${count} violations`);
      });

      // Show orphaned records
      if (integrityResult.orphanedRecords.length > 0) {
        console.log(`🔗 Found ${integrityResult.orphanedRecords.length} orphaned records`);
        integrityResult.orphanedRecords.slice(0, 3).forEach(orphan => {
          console.log(`   ${orphan.entityName}:${orphan.recordId} (missing ${orphan.expectedParentEntity})`);
        });
      }

      // Show recommendations
      if (integrityResult.recommendations.length > 0) {
        console.log('💡 Recommendations:');
        integrityResult.recommendations.forEach(rec => {
          console.log(`   - ${rec}`);
        });
      }

      // Execute repair plan if available
      if (integrityResult.repairPlan && integrityResult.violations.length > 0) {
        console.log(`🔧 Repair plan available with ${integrityResult.repairPlan.steps.length} steps`);
        console.log(`   Risk assessment: ${integrityResult.repairPlan.riskAssessment}`);
        console.log(`   Estimated impact: ${integrityResult.repairPlan.estimatedImpact.recordsToDelete} deletes, ${integrityResult.repairPlan.estimatedImpact.recordsToUpdate} updates`);

        // Execute repair (dry run for demo)
        const repairResult = await this.relationshipSystem.integrity.executeRepairPlan(
          integrityResult.repairPlan.repairId,
          {
            dryRun: true,
            stepByStep: false,
            backupData: true
          }
        );

        console.log(`   Repair simulation: ${repairResult.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`   Steps executed: ${repairResult.executedSteps.length}`);
        if (repairResult.errors.length > 0) {
          console.log(`   Errors: ${repairResult.errors.length}`);
        }
      }

    } catch (error) {
      console.error('Integrity check failed:', error);
    }
  }

  /**
   * Example 5: Batch cascade delete with safety checks
   */
  public async performBatchCascadeDelete(): Promise<void> {
    console.log('\n=== Example 5: Batch Cascade Delete ===');

    try {
      // Delete multiple tickets with cascade operations
      const ticketIds = [1001, 1002, 1003, 1004, 1005];

      const batchResult: BatchResult = await this.relationshipSystem.batch.batchCascadeDelete(
        'Tickets',
        ticketIds,
        {
          maxConcurrency: 3,
          batchSize: 2,
          continueOnError: true,
          force: false, // Perform safety checks
          safetyChecks: true,
          rollbackOnFailure: true
        }
      );

      console.log('🗑️  Batch cascade delete completed');
      console.log(`   Operation ID: ${batchResult.operationId}`);
      console.log(`   Success: ${batchResult.success ? '✅' : '❌'}`);
      console.log(`   Execution time: ${batchResult.executionTime}ms`);

      // Show processed entities
      batchResult.processedEntities.forEach((stats, entityName) => {
        console.log(`   ${entityName}: ${stats.processed} processed, ${stats.successful} successful, ${stats.failed} failed`);
        if (stats.errors.length > 0) {
          stats.errors.slice(0, 2).forEach(error => {
            console.log(`     Error: ${error}`);
          });
        }
      });

      // Show performance statistics
      console.log(`   Performance:`);
      console.log(`     Queries executed: ${batchResult.statistics?.totalBytesProcessed || 0}`);
      console.log(`     Peak memory usage: ${batchResult.statistics?.peakMemoryUsage || 0} bytes`);

      if (batchResult.rollbackPlan) {
        console.log(`   Rollback plan available: ${batchResult.rollbackPlan}`);
      }

    } catch (error) {
      console.error('Batch cascade delete failed:', error);
    }
  }

  /**
   * Example 6: System health monitoring
   */
  public async monitorSystemHealth(): Promise<void> {
    console.log('\n=== Example 6: System Health Monitoring ===');

    try {
      // Get current system health
      const health = this.relationshipSystem.getSystemHealth();

      console.log(`🏥 System Health: ${health.status}`);
      console.log(`   Total relationships: ${health.metrics.totalRelationships}`);
      console.log(`   Average cascade depth: ${health.metrics.averageCascadeDepth?.toFixed(2)}`);
      console.log(`   Cache hit rate: ${health.metrics.cacheHitRate?.toFixed(1)}%`);
      console.log(`   Active batch operations: ${health.metrics.activeBatchOperations}`);

      // Show relationship types
      if (health.metrics.relationshipsByType) {
        console.log('   Relationships by type:');
        Object.entries(health.metrics.relationshipsByType).forEach(([type, count]) => {
          console.log(`     ${type}: ${count}`);
        });
      }

      // Show warnings
      if (health.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        health.warnings.forEach(warning => {
          console.log(`   - ${warning}`);
        });
      }

      // Show errors
      if (health.errors.length > 0) {
        console.log('❌ Errors:');
        health.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }

      // Perform full system validation
      const validation = await this.relationshipSystem.validateSystem();
      
      console.log(`🔍 System validation: ${validation.valid ? '✅ Valid' : '❌ Invalid'}`);
      validation.issues.forEach(issue => {
        const icon = issue.severity === 'CRITICAL' ? '🚨' : 
                    issue.severity === 'ERROR' ? '❌' : 
                    issue.severity === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`   ${icon} ${issue.component}: ${issue.message}`);
        if (issue.suggestion) {
          console.log(`      Suggestion: ${issue.suggestion}`);
        }
      });

    } catch (error) {
      console.error('Health monitoring failed:', error);
    }
  }

  /**
   * Example 7: Selective relationship loading with patterns
   */
  public async demonstrateSelectiveLoading(): Promise<void> {
    console.log('\n=== Example 7: Selective Relationship Loading ===');

    try {
      const companyId = 123;

      // Load with different patterns
      const patterns = [
        { name: 'Lightweight', include: ['contacts'], exclude: [] },
        { name: 'Customer Service', include: ['contacts', 'tickets', 'notes'], exclude: ['contracts'] },
        { name: 'Sales Focus', include: ['contacts', 'opportunities', 'quotes'], exclude: ['tickets'] },
        { name: 'Technical', include: ['tickets', 'projects', 'configurationItems'], exclude: ['opportunities'] }
      ];

      for (const pattern of patterns) {
        console.log(`\n🎯 Loading with ${pattern.name} pattern:`);
        
        const result = await this.relationshipSystem.loading.loadSelective(
          'Companies',
          companyId,
          pattern.include,
          pattern.exclude
        );

        console.log(`   Relationships loaded: ${result.relatedData.size}`);
        console.log(`   Query time: ${result.loadingStatistics.totalQueryTime}ms`);
        console.log(`   Cache hit rate: ${result.loadingStatistics.cacheHitRate.toFixed(1)}%`);
        
        result.relatedData.forEach((data, relationshipName) => {
          console.log(`   - ${relationshipName}: ${data.length} records`);
        });

        if (result.optimizationSuggestions.length > 0) {
          console.log(`   💡 ${result.optimizationSuggestions[0]}`);
        }
      }

    } catch (error) {
      console.error('Selective loading failed:', error);
    }
  }

  /**
   * Run all examples
   */
  public async runAllExamples(): Promise<void> {
    console.log('🚀 Running Autotask Relationship System Examples');
    console.log('================================================');

    await this.initialize();

    const examples = [
      () => this.createCompanyWithRelatedData(),
      () => this.loadEntityWithSmartRelationships(),
      () => this.analyzeEntityDependencies(),
      () => this.performDataIntegrityCheck(),
      () => this.performBatchCascadeDelete(),
      () => this.monitorSystemHealth(),
      () => this.demonstrateSelectiveLoading()
    ];

    for (let i = 0; i < examples.length; i++) {
      try {
        await examples[i]();
        if (i < examples.length - 1) {
          console.log('\n' + '─'.repeat(60));
        }
      } catch (error) {
        console.error(`Example ${i + 1} failed:`, error);
      }
    }

    console.log('\n✅ All examples completed');
  }
}

// Export for standalone usage
export default RelationshipUsageExamples;