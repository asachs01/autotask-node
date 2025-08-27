/**
 * Test suite for the Autotask Relationship System
 * Validates core functionality, edge cases, and integration
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AutotaskClient } from '../../src/client/AutotaskClient';
import { 
  AutotaskRelationshipSystem,
  RelationshipMapper,
  CascadeEngine,
  GraphTraversalEngine,
  SmartLoadingEngine,
  DataIntegrityManager,
  BatchRelationshipProcessor,
  AutotaskRelationshipDefinitions,
  RelationshipSystemConfig,
  CascadeResult,
  IntegrityReport,
  LoadingResult,
  BatchResult,
  GraphTraversalResult
} from '../../src/relationships';

// Mock AutotaskClient
jest.mock('../../src/client/AutotaskClient');

describe('AutotaskRelationshipSystem', () => {
  let client: jest.Mocked<AutotaskClient>;
  let relationshipSystem: AutotaskRelationshipSystem;
  let config: RelationshipSystemConfig;

  beforeEach(() => {
    // Create mock client
    client = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      core: {
        companies: {
          get: jest.fn(),
          list: jest.fn()
        },
        contacts: {
          get: jest.fn(),
          list: jest.fn()
        }
      }
    } as any;

    // Configuration for testing
    config = {
      maxCascadeDepth: 5,
      defaultBatchSize: 10,
      enableCircularDependencyDetection: true,
      enableIntegrityValidation: true,
      defaultLoadingStrategy: 'SELECTIVE',
      cacheEnabled: true,
      cacheTtl: 60000,
      performanceMonitoring: true,
      logLevel: 'INFO',
      retryPolicy: {
        maxRetries: 2,
        baseDelay: 500,
        maxDelay: 5000,
        exponentialBackoff: true
      }
    };

    relationshipSystem = new AutotaskRelationshipSystem(client, config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('System Initialization', () => {
    test('should initialize with default configuration', () => {
      const system = new AutotaskRelationshipSystem(client);
      expect(system).toBeDefined();
      expect(system.mapper).toBeDefined();
      expect(system.cascade).toBeDefined();
      expect(system.traversal).toBeDefined();
      expect(system.loading).toBeDefined();
      expect(system.integrity).toBeDefined();
      expect(system.batch).toBeDefined();
    });

    test('should initialize with custom configuration', () => {
      const customConfig: Partial<RelationshipSystemConfig> = {
        maxCascadeDepth: 3,
        defaultBatchSize: 25,
        cacheEnabled: false
      };

      const system = new AutotaskRelationshipSystem(client, customConfig);
      const actualConfig = system.getConfiguration();
      
      expect(actualConfig.maxCascadeDepth).toBe(3);
      expect(actualConfig.defaultBatchSize).toBe(25);
      expect(actualConfig.cacheEnabled).toBe(false);
    });

    test('should initialize all subsystems', async () => {
      await expect(relationshipSystem.initialize()).resolves.not.toThrow();
    });
  });

  describe('RelationshipMapper', () => {
    test('should load relationship definitions', () => {
      const mapper = new RelationshipMapper();
      const allRelationships = mapper.getAllRelationships();
      
      expect(allRelationships.length).toBeGreaterThan(0);
      expect(allRelationships[0]).toHaveProperty('id');
      expect(allRelationships[0]).toHaveProperty('sourceEntity');
      expect(allRelationships[0]).toHaveProperty('targetEntity');
    });

    test('should find relationships for specific entities', () => {
      const mapper = new RelationshipMapper();
      const companyRelationships = mapper.getEntityRelationships('Companies');
      
      expect(companyRelationships.length).toBeGreaterThan(0);
      
      const hasContactsRelationship = companyRelationships.some(
        rel => rel.targetEntity === 'Contacts' || rel.sourceEntity === 'Contacts'
      );
      expect(hasContactsRelationship).toBe(true);
    });

    test('should detect circular dependencies', () => {
      const mapper = new RelationshipMapper();
      const graph = mapper.getEntityGraph();
      const circularDeps = mapper.getCircularDependencies();
      
      expect(graph).toBeDefined();
      expect(graph.nodes.size).toBeGreaterThan(0);
      expect(circularDeps).toBeDefined();
    });

    test('should calculate entity statistics', () => {
      const mapper = new RelationshipMapper();
      const stats = mapper.getEntityStatistics('Companies');
      
      expect(stats).toHaveProperty('totalRelationships');
      expect(stats).toHaveProperty('incomingRelationships');
      expect(stats).toHaveProperty('outgoingRelationships');
      expect(stats).toHaveProperty('hierarchyLevel');
      expect(stats).toHaveProperty('dependents');
      expect(stats).toHaveProperty('dependencies');
      
      expect(stats.totalRelationships).toBeGreaterThan(0);
      expect(Array.isArray(stats.dependents)).toBe(true);
      expect(Array.isArray(stats.dependencies)).toBe(true);
    });

    test('should find relationship paths between entities', () => {
      const mapper = new RelationshipMapper();
      const paths = mapper.findRelationshipPaths('Companies', 'TimeEntries', {
        maxDepth: 5,
        strategy: 'SHORTEST_PATH',
        direction: 'FORWARD',
        includeCircular: false
      });
      
      expect(Array.isArray(paths)).toBe(true);
      if (paths.length > 0) {
        expect(paths[0]).toHaveProperty('source', 'Companies');
        expect(paths[0]).toHaveProperty('target', 'TimeEntries');
        expect(paths[0]).toHaveProperty('distance');
        expect(paths[0]).toHaveProperty('cost');
        expect(Array.isArray(paths[0].path)).toBe(true);
      }
    });
  });

  describe('AutotaskRelationshipDefinitions', () => {
    test('should have core entity relationships defined', () => {
      const allRels = AutotaskRelationshipDefinitions.getAllRelationships();
      
      // Check for key relationships
      const companyContactsRel = allRels.find(rel => 
        rel.sourceEntity === 'Companies' && rel.targetEntity === 'Contacts'
      );
      expect(companyContactsRel).toBeDefined();

      const companyTicketsRel = allRels.find(rel =>
        rel.sourceEntity === 'Companies' && rel.targetEntity === 'Tickets'
      );
      expect(companyTicketsRel).toBeDefined();

      const projectTasksRel = allRels.find(rel =>
        rel.sourceEntity === 'Projects' && rel.targetEntity === 'Tasks'
      );
      expect(projectTasksRel).toBeDefined();
    });

    test('should provide entity-specific relationship queries', () => {
      const companyRels = AutotaskRelationshipDefinitions.getRelationshipsForEntity('Companies');
      expect(companyRels.length).toBeGreaterThan(0);

      const outgoingRels = AutotaskRelationshipDefinitions.getOutgoingRelationships('Companies');
      expect(outgoingRels.length).toBeGreaterThan(0);

      const incomingRels = AutotaskRelationshipDefinitions.getIncomingRelationships('Contacts');
      expect(incomingRels.length).toBeGreaterThan(0);
    });

    test('should identify core entities', () => {
      const coreEntities = AutotaskRelationshipDefinitions.getCoreEntities();
      
      expect(coreEntities).toContain('Companies');
      expect(coreEntities).toContain('Contacts');
      expect(coreEntities).toContain('Tickets');
      expect(coreEntities).toContain('Projects');
      expect(coreEntities).toContain('Tasks');
    });

    test('should identify high cascade risk entities', () => {
      const riskEntities = AutotaskRelationshipDefinitions.getHighCascadeRiskEntities();
      expect(Array.isArray(riskEntities)).toBe(true);
      expect(riskEntities.length).toBeGreaterThan(0);
    });
  });

  describe('GraphTraversalEngine', () => {
    let traversalEngine: GraphTraversalEngine;
    let mapper: RelationshipMapper;

    beforeEach(() => {
      mapper = new RelationshipMapper();
      traversalEngine = new GraphTraversalEngine(mapper);
    });

    test('should perform breadth-first search', () => {
      const result: GraphTraversalResult = traversalEngine.breadthFirstSearch('Companies', 'TimeEntries', {
        maxDepth: 5,
        strategy: 'BREADTH_FIRST'
      });

      expect(result).toHaveProperty('paths');
      expect(result).toHaveProperty('visitedNodes');
      expect(result).toHaveProperty('executionTime');
      expect(result).toHaveProperty('statistics');
      
      expect(Array.isArray(result.paths)).toBe(true);
      expect(Array.isArray(result.visitedNodes)).toBe(true);
      expect(typeof result.executionTime).toBe('number');
    });

    test('should perform depth-first search', () => {
      const result: GraphTraversalResult = traversalEngine.depthFirstSearch('Companies', 'Contacts', {
        maxDepth: 3,
        strategy: 'DEPTH_FIRST'
      });

      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.visitedNodes.length).toBeGreaterThan(0);
    });

    test('should find shortest path between entities', () => {
      const shortestPath = traversalEngine.findShortestPath('Companies', 'Contacts');
      
      if (shortestPath) {
        expect(shortestPath).toHaveProperty('source', 'Companies');
        expect(shortestPath).toHaveProperty('target', 'Contacts');
        expect(shortestPath).toHaveProperty('distance');
        expect(shortestPath.isOptimal).toBe(true);
      }
    });

    test('should analyze dependencies for entities', () => {
      const analysis = traversalEngine.analyzeDependencies('Companies');

      expect(analysis).toHaveProperty('entityName', 'Companies');
      expect(analysis).toHaveProperty('directDependencies');
      expect(analysis).toHaveProperty('transiteDependencies');
      expect(analysis).toHaveProperty('dependents');
      expect(analysis).toHaveProperty('transiteDependents');
      expect(analysis).toHaveProperty('isolationRisk');

      expect(Array.isArray(analysis.directDependencies)).toBe(true);
      expect(Array.isArray(analysis.dependents)).toBe(true);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(analysis.isolationRisk);
    });

    test('should find strongly connected components', () => {
      const components = traversalEngine.findStronglyConnectedComponents();
      
      expect(Array.isArray(components)).toBe(true);
      components.forEach(component => {
        expect(Array.isArray(component)).toBe(true);
        expect(component.length).toBeGreaterThan(1); // Components should have multiple entities
      });
    });
  });

  describe('System Health and Validation', () => {
    test('should report system health', () => {
      const health = relationshipSystem.getSystemHealth();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('metrics');
      expect(health).toHaveProperty('warnings');
      expect(health).toHaveProperty('errors');

      expect(['HEALTHY', 'DEGRADED', 'ERROR']).toContain(health.status);
      expect(Array.isArray(health.warnings)).toBe(true);
      expect(Array.isArray(health.errors)).toBe(true);
    });

    test('should validate system configuration', async () => {
      const validation = await relationshipSystem.validateSystem();

      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('issues');
      expect(typeof validation.valid).toBe('boolean');
      expect(Array.isArray(validation.issues)).toBe(true);

      validation.issues.forEach(issue => {
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('component');
        expect(issue).toHaveProperty('message');
        expect(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).toContain(issue.severity);
      });
    });

    test('should allow configuration updates', () => {
      const originalConfig = relationshipSystem.getConfiguration();
      
      relationshipSystem.updateConfiguration({
        maxCascadeDepth: 7,
        defaultBatchSize: 30
      });

      const updatedConfig = relationshipSystem.getConfiguration();
      expect(updatedConfig.maxCascadeDepth).toBe(7);
      expect(updatedConfig.defaultBatchSize).toBe(30);
      expect(updatedConfig.cacheEnabled).toBe(originalConfig.cacheEnabled); // Should preserve other settings
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with AutotaskClient', () => {
      expect(relationshipSystem.mapper).toBeInstanceOf(RelationshipMapper);
      expect(relationshipSystem.cascade).toBeInstanceOf(CascadeEngine);
      expect(relationshipSystem.traversal).toBeInstanceOf(GraphTraversalEngine);
      expect(relationshipSystem.loading).toBeInstanceOf(SmartLoadingEngine);
      expect(relationshipSystem.integrity).toBeInstanceOf(DataIntegrityManager);
      expect(relationshipSystem.batch).toBeInstanceOf(BatchRelationshipProcessor);
    });

    test('should maintain consistent relationship definitions across components', () => {
      const mapperRelationships = relationshipSystem.mapper.getAllRelationships();
      const definitionRelationships = AutotaskRelationshipDefinitions.getAllRelationships();

      expect(mapperRelationships.length).toBe(definitionRelationships.length);
      
      // Verify same relationships are present
      mapperRelationships.forEach(rel => {
        const matchingDef = definitionRelationships.find(def => def.id === rel.id);
        expect(matchingDef).toBeDefined();
        expect(matchingDef?.sourceEntity).toBe(rel.sourceEntity);
        expect(matchingDef?.targetEntity).toBe(rel.targetEntity);
      });
    });

    test('should handle errors gracefully', async () => {
      // Mock client to throw errors
      client.get.mockRejectedValue(new Error('API Error'));

      const system = new AutotaskRelationshipSystem(client);
      
      // System should still initialize even with API errors
      await expect(system.initialize()).resolves.not.toThrow();
      
      // Health check should report errors
      const health = system.getSystemHealth();
      expect(['DEGRADED', 'ERROR']).toContain(health.status);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large relationship graphs efficiently', () => {
      const startTime = Date.now();
      
      const mapper = new RelationshipMapper();
      const graph = mapper.getEntityGraph();
      const stats = mapper.getMetrics();
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second
      expect(graph.nodes.size).toBeGreaterThan(50); // Should have substantial graph
      expect(stats.totalRelationships).toBeGreaterThan(50);
    });

    test('should cache relationship queries', () => {
      const mapper = new RelationshipMapper();
      
      const startTime1 = Date.now();
      const relationships1 = mapper.getEntityRelationships('Companies');
      const duration1 = Date.now() - startTime1;

      const startTime2 = Date.now();
      const relationships2 = mapper.getEntityRelationships('Companies');
      const duration2 = Date.now() - startTime2;

      // Second call should be faster due to caching
      expect(duration2).toBeLessThanOrEqual(duration1);
      expect(relationships2).toEqual(relationships1);
    });

    test('should limit traversal depth to prevent infinite loops', () => {
      const mapper = new RelationshipMapper();
      const traversal = new GraphTraversalEngine(mapper);

      const result = traversal.breadthFirstSearch('Companies', undefined, {
        maxDepth: 2,
        includeCircular: true
      });

      // Should complete without hanging
      expect(result.paths.every(path => path.distance <= 2)).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle non-existent entities gracefully', () => {
      const mapper = new RelationshipMapper();
      
      expect(() => {
        mapper.getEntityStatistics('NonExistentEntity');
      }).toThrow();

      const relationships = mapper.getEntityRelationships('NonExistentEntity');
      expect(relationships).toEqual([]);
    });

    test('should handle invalid relationship paths', () => {
      const mapper = new RelationshipMapper();
      const paths = mapper.findRelationshipPaths('NonExistent1', 'NonExistent2');
      
      expect(paths).toEqual([]);
    });

    test('should validate relationship definitions', () => {
      const relationships = AutotaskRelationshipDefinitions.getAllRelationships();
      
      relationships.forEach(rel => {
        // Each relationship should have required fields
        expect(rel.id).toBeTruthy();
        expect(rel.sourceEntity).toBeTruthy();
        expect(rel.targetEntity).toBeTruthy();
        expect(rel.relationshipType).toBeTruthy();
        expect(Array.isArray(rel.sourceFields)).toBe(true);
        expect(Array.isArray(rel.targetFields)).toBe(true);
        expect(rel.sourceFields.length).toBeGreaterThan(0);
        expect(rel.targetFields.length).toBeGreaterThan(0);
        
        // Cascade options should be valid
        expect(rel.cascadeOptions).toBeTruthy();
        if (rel.cascadeOptions.onCreate) {
          expect(['CASCADE', 'SET_NULL', 'RESTRICT', 'NO_ACTION', 'SET_DEFAULT']).toContain(rel.cascadeOptions.onCreate);
        }
        if (rel.cascadeOptions.onUpdate) {
          expect(['CASCADE', 'SET_NULL', 'RESTRICT', 'NO_ACTION', 'SET_DEFAULT']).toContain(rel.cascadeOptions.onUpdate);
        }
        if (rel.cascadeOptions.onDelete) {
          expect(['CASCADE', 'SET_NULL', 'RESTRICT', 'NO_ACTION', 'SET_DEFAULT']).toContain(rel.cascadeOptions.onDelete);
        }
      });
    });

    test('should handle circular dependencies in traversal', () => {
      const mapper = new RelationshipMapper();
      const traversal = new GraphTraversalEngine(mapper);

      // This should not hang or crash
      const result = traversal.breadthFirstSearch('Companies', 'Companies', {
        includeCircular: true,
        maxDepth: 5
      });

      expect(result).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });
});

describe('Component Integration', () => {
  let client: jest.Mocked<AutotaskClient>;
  let relationshipSystem: AutotaskRelationshipSystem;

  beforeEach(() => {
    client = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      core: {
        companies: {
          get: jest.fn(),
          list: jest.fn()
        },
        contacts: {
          get: jest.fn(),
          list: jest.fn()
        }
      }
    } as any;
    relationshipSystem = new AutotaskRelationshipSystem(client);
  });

  test('should coordinate between mapper and traversal engine', () => {
    const mapperStats = relationshipSystem.mapper.getEntityStatistics('Companies');
    const traversalAnalysis = relationshipSystem.traversal.analyzeDependencies('Companies');

    // Both should report consistent information about the same entity
    expect(traversalAnalysis.entityName).toBe('Companies');
    expect(traversalAnalysis.dependents.length).toBe(mapperStats.dependents.length);
    expect(traversalAnalysis.directDependencies.length).toBe(mapperStats.dependencies.length);
  });

  test('should share consistent relationship definitions', () => {
    const allRels = relationshipSystem.mapper.getAllRelationships();
    const companyRels = relationshipSystem.mapper.getEntityRelationships('Companies');
    
    // Company relationships should be a subset of all relationships
    companyRels.forEach(rel => {
      const found = allRels.some(allRel => 
        allRel.id === rel.id && 
        (allRel.sourceEntity === 'Companies' || allRel.targetEntity === 'Companies')
      );
      expect(found).toBe(true);
    });
  });

  test('should maintain system-wide configuration consistency', () => {
    const config = relationshipSystem.getConfiguration();
    
    // All components should respect the same configuration
    expect(config.maxCascadeDepth).toBeGreaterThan(0);
    expect(config.defaultBatchSize).toBeGreaterThan(0);
    expect(typeof config.cacheEnabled).toBe('boolean');
    expect(typeof config.performanceMonitoring).toBe('boolean');
  });
});