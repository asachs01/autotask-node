/**
 * Core relationship mapping system for Autotask entities
 * Provides centralized relationship discovery, validation, and graph building
 */

import { 
  EntityRelationship, 
  EntityNode, 
  EntityGraph, 
  RelationshipType,
  LoadingStrategy,
  RelationshipPath,
  TraversalOptions,
  RelationshipMetrics
} from '../types/RelationshipTypes';
import { AutotaskRelationshipDefinitions } from '../mapping/AutotaskRelationshipDefinitions';

export class RelationshipMapper {
  private entityGraph: EntityGraph;
  private relationshipCache: Map<string, EntityRelationship[]> = new Map();
  private pathCache: Map<string, RelationshipPath[]> = new Map();
  private metrics: RelationshipMetrics;

  constructor() {
    this.entityGraph = this.buildEntityGraph();
    this.metrics = this.calculateMetrics();
  }

  /**
   * Build the complete entity relationship graph
   */
  private buildEntityGraph(): EntityGraph {
    const graph: EntityGraph = {
      nodes: new Map(),
      edges: new Map(),
      hierarchies: new Map(),
      circularDependencies: new Set()
    };

    const relationships = AutotaskRelationshipDefinitions.getAllRelationships();

    // Create nodes for all entities
    const allEntities = new Set<string>();
    relationships.forEach(rel => {
      allEntities.add(rel.sourceEntity);
      allEntities.add(rel.targetEntity);
    });

    allEntities.forEach(entityName => {
      const node: EntityNode = {
        entityName,
        relationships: new Map(),
        incomingRelationships: new Map(),
        outgoingRelationships: new Map(),
        dependsOn: new Set(),
        dependents: new Set()
      };
      graph.nodes.set(entityName, node);
    });

    // Add relationships to graph
    relationships.forEach(rel => {
      graph.edges.set(rel.id, rel);

      const sourceNode = graph.nodes.get(rel.sourceEntity)!;
      const targetNode = graph.nodes.get(rel.targetEntity)!;

      // Add to node relationship maps
      sourceNode.relationships.set(rel.id, rel);
      sourceNode.outgoingRelationships.set(rel.id, rel);
      targetNode.relationships.set(rel.id, rel);
      targetNode.incomingRelationships.set(rel.id, rel);

      // Add dependency tracking
      sourceNode.dependents.add(rel.targetEntity);
      targetNode.dependsOn.add(rel.sourceEntity);
    });

    // Detect circular dependencies
    this.detectCircularDependencies(graph);

    // Build hierarchies
    this.buildHierarchies(graph);

    return graph;
  }

  /**
   * Detect circular dependencies in the relationship graph
   */
  private detectCircularDependencies(graph: EntityGraph): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (entityName: string, path: string[]): boolean => {
      if (recursionStack.has(entityName)) {
        // Found a cycle
        const cycleStart = path.indexOf(entityName);
        const cycle = path.slice(cycleStart).join(' -> ') + ` -> ${entityName}`;
        graph.circularDependencies.add(cycle);
        return true;
      }

      if (visited.has(entityName)) {
        return false;
      }

      visited.add(entityName);
      recursionStack.add(entityName);
      const newPath = [...path, entityName];

      const node = graph.nodes.get(entityName);
      if (node) {
        for (const dependent of node.dependents) {
          if (hasCycle(dependent, newPath)) {
            return true;
          }
        }
      }

      recursionStack.delete(entityName);
      return false;
    };

    // Check for cycles starting from each node
    graph.nodes.forEach((_, entityName) => {
      if (!visited.has(entityName)) {
        hasCycle(entityName, []);
      }
    });
  }

  /**
   * Build entity hierarchies based on dependency depth
   */
  private buildHierarchies(graph: EntityGraph): void {
    const hierarchyLevels = new Map<string, number>();

    const calculateLevel = (entityName: string, visited: Set<string> = new Set()): number => {
      if (visited.has(entityName)) {
        return 0; // Circular dependency, assign base level
      }

      if (hierarchyLevels.has(entityName)) {
        return hierarchyLevels.get(entityName)!;
      }

      visited.add(entityName);
      const node = graph.nodes.get(entityName);
      if (!node || node.dependsOn.size === 0) {
        hierarchyLevels.set(entityName, 0);
        return 0;
      }

      let maxParentLevel = -1;
      for (const dependency of node.dependsOn) {
        const parentLevel = calculateLevel(dependency, new Set(visited));
        maxParentLevel = Math.max(maxParentLevel, parentLevel);
      }

      const level = maxParentLevel + 1;
      hierarchyLevels.set(entityName, level);
      node.hierarchyLevel = level;

      return level;
    };

    // Calculate hierarchy levels for all entities
    graph.nodes.forEach((_, entityName) => {
      calculateLevel(entityName);
    });

    // Group entities by hierarchy level
    hierarchyLevels.forEach((level, entityName) => {
      const node = graph.nodes.get(entityName)!;
      if (!graph.hierarchies.has(level.toString())) {
        graph.hierarchies.set(level.toString(), []);
      }
      graph.hierarchies.get(level.toString())!.push(node);
    });
  }

  /**
   * Get all relationships for a specific entity
   */
  public getEntityRelationships(entityName: string): EntityRelationship[] {
    if (this.relationshipCache.has(entityName)) {
      return this.relationshipCache.get(entityName)!;
    }

    const relationships = AutotaskRelationshipDefinitions.getRelationshipsForEntity(entityName);
    this.relationshipCache.set(entityName, relationships);
    return relationships;
  }

  /**
   * Get outgoing relationships (entity as source)
   */
  public getOutgoingRelationships(entityName: string): EntityRelationship[] {
    return AutotaskRelationshipDefinitions.getOutgoingRelationships(entityName);
  }

  /**
   * Get incoming relationships (entity as target)
   */
  public getIncomingRelationships(entityName: string): EntityRelationship[] {
    return AutotaskRelationshipDefinitions.getIncomingRelationships(entityName);
  }

  /**
   * Find relationship paths between two entities
   */
  public findRelationshipPaths(
    sourceEntity: string, 
    targetEntity: string, 
    options: TraversalOptions = {
      direction: 'FORWARD',
      maxDepth: 5,
      includeCircular: false,
      strategy: 'SHORTEST_PATH'
    }
  ): RelationshipPath[] {
    const cacheKey = `${sourceEntity}->${targetEntity}`;
    if (this.pathCache.has(cacheKey)) {
      return this.pathCache.get(cacheKey)!;
    }

    const paths: RelationshipPath[] = [];

    if (sourceEntity === targetEntity) {
      return [{
        source: sourceEntity,
        target: targetEntity,
        path: [],
        distance: 0,
        cost: 0,
        isOptimal: true
      }];
    }

    const visited = new Set<string>();
    const currentPath: EntityRelationship[] = [];

    const findPaths = (current: string, depth: number): void => {
      if (depth > options.maxDepth) return;
      if (!options.includeCircular && visited.has(current)) return;

      if (current === targetEntity && depth > 0) {
        paths.push({
          source: sourceEntity,
          target: targetEntity,
          path: [...currentPath],
          distance: depth,
          cost: this.calculatePathCost(currentPath),
          isOptimal: false
        });
        return;
      }

      visited.add(current);

      const relationships = options.direction === 'BACKWARD' 
        ? this.getIncomingRelationships(current)
        : this.getOutgoingRelationships(current);

      relationships.forEach(rel => {
        if (options.filter && !options.filter(rel)) return;

        const nextEntity = options.direction === 'BACKWARD' 
          ? rel.sourceEntity 
          : rel.targetEntity;

        currentPath.push(rel);
        findPaths(nextEntity, depth + 1);
        currentPath.pop();
      });

      visited.delete(current);
    };

    findPaths(sourceEntity, 0);

    // Mark optimal paths
    if (paths.length > 0) {
      const minDistance = Math.min(...paths.map(p => p.distance));
      const minCost = Math.min(...paths.filter(p => p.distance === minDistance).map(p => p.cost));
      
      paths.forEach(path => {
        path.isOptimal = path.distance === minDistance && path.cost === minCost;
      });
    }

    // Sort paths by optimality and distance
    paths.sort((a, b) => {
      if (a.isOptimal !== b.isOptimal) return a.isOptimal ? -1 : 1;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.cost - b.cost;
    });

    this.pathCache.set(cacheKey, paths);
    return paths;
  }

  /**
   * Calculate the cost of a relationship path
   */
  private calculatePathCost(path: EntityRelationship[]): number {
    return path.reduce((cost, rel) => {
      let relationshipCost = 1;

      // Higher cost for complex relationships
      if (rel.relationshipType === 'MANY_TO_MANY') relationshipCost += 2;
      if (rel.relationshipType === 'POLYMORPHIC') relationshipCost += 3;

      // Higher cost for lazy loading
      if (rel.loadingStrategy === 'LAZY') relationshipCost += 1;
      if (rel.loadingStrategy === 'ON_DEMAND') relationshipCost += 2;

      // Lower cost for indexed relationships
      if (rel.metadata?.performance?.isIndexed) relationshipCost -= 0.5;

      return cost + relationshipCost;
    }, 0);
  }

  /**
   * Get the entity graph
   */
  public getEntityGraph(): EntityGraph {
    return this.entityGraph;
  }

  /**
   * Get entities at a specific hierarchy level
   */
  public getEntitiesAtLevel(level: number): EntityNode[] {
    return this.entityGraph.hierarchies.get(level.toString()) || [];
  }

  /**
   * Get all circular dependencies
   */
  public getCircularDependencies(): Set<string> {
    return this.entityGraph.circularDependencies;
  }

  /**
   * Check if two entities are directly related
   */
  public areDirectlyRelated(entity1: string, entity2: string): boolean {
    const direct = AutotaskRelationshipDefinitions.getDirectRelationship(entity1, entity2);
    const reverse = AutotaskRelationshipDefinitions.getDirectRelationship(entity2, entity1);
    return !!(direct || reverse);
  }

  /**
   * Get entities with cascade delete risk
   */
  public getCascadeDeleteRiskEntities(): string[] {
    return AutotaskRelationshipDefinitions.getHighCascadeRiskEntities();
  }

  /**
   * Get relationship metrics
   */
  public getMetrics(): RelationshipMetrics {
    return this.metrics;
  }

  /**
   * Calculate relationship metrics
   */
  private calculateMetrics(): RelationshipMetrics {
    const relationships = AutotaskRelationshipDefinitions.getAllRelationships();
    const relationshipsByType = new Map<RelationshipType, number>();

    relationships.forEach(rel => {
      const count = relationshipsByType.get(rel.relationshipType) || 0;
      relationshipsByType.set(rel.relationshipType, count + 1);
    });

    // Calculate average cascade depth
    let totalDepth = 0;
    let pathCount = 0;
    const coreEntities = AutotaskRelationshipDefinitions.getCoreEntities();

    coreEntities.forEach(entity => {
      const paths = this.findRelationshipPaths(entity, entity, {
        direction: 'FORWARD',
        maxDepth: 10,
        includeCircular: false,
        strategy: 'ALL_PATHS'
      });
      paths.forEach(path => {
        totalDepth += path.distance;
        pathCount++;
      });
    });

    return {
      totalRelationships: relationships.length,
      relationshipsByType,
      averageCascadeDepth: pathCount > 0 ? totalDepth / pathCount : 0,
      averageExecutionTime: 0, // Will be updated by performance monitoring
      cacheHitRate: 0, // Will be updated by cache monitoring
      integrityViolationsCount: 0, // Will be updated by integrity checks
      mostUsedRelationships: [], // Will be updated by usage tracking
      performanceBottlenecks: [] // Will be updated by performance monitoring
    };
  }

  /**
   * Get all relationships in the system
   */
  public getAllRelationships(): EntityRelationship[] {
    return AutotaskRelationshipDefinitions.getAllRelationships();
  }

  /**
   * Clear caches (useful for testing or memory management)
   */
  public clearCaches(): void {
    this.relationshipCache.clear();
    this.pathCache.clear();
  }

  /**
   * Get relationship statistics for an entity
   */
  public getEntityStatistics(entityName: string): {
    totalRelationships: number;
    incomingRelationships: number;
    outgoingRelationships: number;
    hierarchyLevel: number;
    dependents: string[];
    dependencies: string[];
  } {
    const node = this.entityGraph.nodes.get(entityName);
    if (!node) {
      throw new Error(`Entity '${entityName}' not found in relationship graph`);
    }

    return {
      totalRelationships: node.relationships.size,
      incomingRelationships: node.incomingRelationships.size,
      outgoingRelationships: node.outgoingRelationships.size,
      hierarchyLevel: node.hierarchyLevel || 0,
      dependents: Array.from(node.dependents),
      dependencies: Array.from(node.dependsOn)
    };
  }
}