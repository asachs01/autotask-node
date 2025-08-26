/**
 * Graph traversal engine for Autotask entity relationships
 * Provides advanced graph navigation, path finding, and dependency analysis
 */

import { 
  EntityRelationship,
  EntityNode,
  EntityGraph,
  RelationshipPath,
  TraversalOptions,
  RelationshipType
} from '../types/RelationshipTypes';
import { RelationshipMapper } from '../core/RelationshipMapper';

export interface GraphTraversalResult {
  paths: RelationshipPath[];
  visitedNodes: string[];
  executionTime: number;
  statistics: {
    totalPaths: number;
    shortestPath: RelationshipPath | null;
    longestPath: RelationshipPath | null;
    averagePathLength: number;
    circularPaths: number;
  };
}

export interface DependencyAnalysis {
  entityName: string;
  directDependencies: string[];
  transiteDependencies: string[];
  dependents: string[];
  transiteDependents: string[];
  circularDependencies: string[];
  independentFrom: string[];
  criticalPath: RelationshipPath[];
  isolationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class GraphTraversalEngine {
  private relationshipMapper: RelationshipMapper;
  private graph: EntityGraph;

  constructor(relationshipMapper: RelationshipMapper) {
    this.relationshipMapper = relationshipMapper;
    this.graph = relationshipMapper.getEntityGraph();
  }

  /**
   * Perform breadth-first search traversal
   */
  public breadthFirstSearch(
    startEntity: string,
    targetEntity?: string,
    options: Partial<TraversalOptions> = {}
  ): GraphTraversalResult {
    const startTime = Date.now();
    const defaultOptions: TraversalOptions = {
      direction: 'FORWARD',
      maxDepth: 10,
      includeCircular: false,
      strategy: 'BREADTH_FIRST',
      ...options
    };

    const paths: RelationshipPath[] = [];
    const visitedNodes: string[] = [];
    const queue: Array<{ entity: string; path: EntityRelationship[]; depth: number }> = [];
    const visited = new Set<string>();

    // Initialize queue
    queue.push({ entity: startEntity, path: [], depth: 0 });

    while (queue.length > 0) {
      const { entity, path, depth } = queue.shift()!;

      if (depth > defaultOptions.maxDepth) continue;
      
      if (!defaultOptions.includeCircular && visited.has(entity) && entity !== startEntity) {
        continue;
      }

      if (!visitedNodes.includes(entity)) {
        visitedNodes.push(entity);
      }

      // If we found the target, record the path
      if (targetEntity && entity === targetEntity && depth > 0) {
        paths.push({
          source: startEntity,
          target: targetEntity,
          path: [...path],
          distance: depth,
          cost: this.calculatePathCost(path),
          isOptimal: false
        });
        continue;
      }

      // If no specific target, record all reachable entities
      if (!targetEntity && depth > 0) {
        paths.push({
          source: startEntity,
          target: entity,
          path: [...path],
          distance: depth,
          cost: this.calculatePathCost(path),
          isOptimal: false
        });
      }

      visited.add(entity);

      // Add neighbors to queue
      const relationships = this.getEntityRelationships(entity, defaultOptions.direction);
      
      for (const relationship of relationships) {
        if (defaultOptions.filter && !defaultOptions.filter(relationship)) continue;

        const nextEntity = defaultOptions.direction === 'BACKWARD' 
          ? relationship.sourceEntity 
          : relationship.targetEntity;

        if (!defaultOptions.includeCircular && visited.has(nextEntity)) continue;

        queue.push({
          entity: nextEntity,
          path: [...path, relationship],
          depth: depth + 1
        });
      }
    }

    // Mark optimal paths
    this.markOptimalPaths(paths);

    return {
      paths,
      visitedNodes,
      executionTime: Date.now() - startTime,
      statistics: this.calculateTraversalStatistics(paths)
    };
  }

  /**
   * Perform depth-first search traversal
   */
  public depthFirstSearch(
    startEntity: string,
    targetEntity?: string,
    options: Partial<TraversalOptions> = {}
  ): GraphTraversalResult {
    const startTime = Date.now();
    const defaultOptions: TraversalOptions = {
      direction: 'FORWARD',
      maxDepth: 10,
      includeCircular: false,
      strategy: 'DEPTH_FIRST',
      ...options
    };

    const paths: RelationshipPath[] = [];
    const visitedNodes: string[] = [];
    const visited = new Set<string>();

    const dfs = (
      entity: string, 
      currentPath: EntityRelationship[], 
      depth: number
    ): void => {
      if (depth > defaultOptions.maxDepth) return;
      
      if (!defaultOptions.includeCircular && visited.has(entity) && entity !== startEntity) {
        return;
      }

      if (!visitedNodes.includes(entity)) {
        visitedNodes.push(entity);
      }

      // If we found the target, record the path
      if (targetEntity && entity === targetEntity && depth > 0) {
        paths.push({
          source: startEntity,
          target: targetEntity,
          path: [...currentPath],
          distance: depth,
          cost: this.calculatePathCost(currentPath),
          isOptimal: false
        });
        return;
      }

      // If no specific target, record all reachable entities
      if (!targetEntity && depth > 0) {
        paths.push({
          source: startEntity,
          target: entity,
          path: [...currentPath],
          distance: depth,
          cost: this.calculatePathCost(currentPath),
          isOptimal: false
        });
      }

      visited.add(entity);

      // Recursively explore neighbors
      const relationships = this.getEntityRelationships(entity, defaultOptions.direction);
      
      for (const relationship of relationships) {
        if (defaultOptions.filter && !defaultOptions.filter(relationship)) continue;

        const nextEntity = defaultOptions.direction === 'BACKWARD' 
          ? relationship.sourceEntity 
          : relationship.targetEntity;

        if (!defaultOptions.includeCircular && visited.has(nextEntity)) continue;

        currentPath.push(relationship);
        dfs(nextEntity, currentPath, depth + 1);
        currentPath.pop();
      }

      visited.delete(entity);
    };

    dfs(startEntity, [], 0);

    // Mark optimal paths
    this.markOptimalPaths(paths);

    return {
      paths,
      visitedNodes,
      executionTime: Date.now() - startTime,
      statistics: this.calculateTraversalStatistics(paths)
    };
  }

  /**
   * Find shortest path using Dijkstra's algorithm
   */
  public findShortestPath(
    startEntity: string,
    targetEntity: string,
    options: Partial<TraversalOptions> = {}
  ): RelationshipPath | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, { entity: string; relationship: EntityRelationship }>();
    const unvisited = new Set<string>();

    // Initialize distances
    this.graph.nodes.forEach((_, entity) => {
      distances.set(entity, entity === startEntity ? 0 : Infinity);
      unvisited.add(entity);
    });

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentEntity: string | null = null;
      let minDistance = Infinity;

      for (const entity of unvisited) {
        const distance = distances.get(entity)!;
        if (distance < minDistance) {
          minDistance = distance;
          currentEntity = entity;
        }
      }

      if (!currentEntity || minDistance === Infinity) break;

      unvisited.delete(currentEntity);

      // If we reached the target, build the path
      if (currentEntity === targetEntity) {
        return this.reconstructPath(startEntity, targetEntity, previous);
      }

      // Update distances to neighbors
      const relationships = this.getEntityRelationships(currentEntity, options.direction || 'FORWARD');
      
      for (const relationship of relationships) {
        if (options.filter && !options.filter(relationship)) continue;

        const neighbor = options.direction === 'BACKWARD' 
          ? relationship.sourceEntity 
          : relationship.targetEntity;

        if (!unvisited.has(neighbor)) continue;

        const edgeCost = this.calculateRelationshipCost(relationship);
        const newDistance = distances.get(currentEntity)! + edgeCost;

        if (newDistance < distances.get(neighbor)!) {
          distances.set(neighbor, newDistance);
          previous.set(neighbor, { entity: currentEntity, relationship });
        }
      }
    }

    return null; // No path found
  }

  /**
   * Find all paths between two entities
   */
  public findAllPaths(
    startEntity: string,
    targetEntity: string,
    options: Partial<TraversalOptions> = {}
  ): RelationshipPath[] {
    const paths: RelationshipPath[] = [];
    const defaultOptions: TraversalOptions = {
      direction: 'FORWARD',
      maxDepth: 6, // Reasonable limit for all paths
      includeCircular: false,
      strategy: 'ALL_PATHS',
      ...options
    };

    const visited = new Set<string>();

    const findPaths = (
      currentEntity: string,
      currentPath: EntityRelationship[],
      depth: number
    ): void => {
      if (depth > defaultOptions.maxDepth) return;

      if (currentEntity === targetEntity && depth > 0) {
        paths.push({
          source: startEntity,
          target: targetEntity,
          path: [...currentPath],
          distance: depth,
          cost: this.calculatePathCost(currentPath),
          isOptimal: false
        });
        return;
      }

      visited.add(currentEntity);

      const relationships = this.getEntityRelationships(currentEntity, defaultOptions.direction);
      
      for (const relationship of relationships) {
        if (defaultOptions.filter && !defaultOptions.filter(relationship)) continue;

        const nextEntity = defaultOptions.direction === 'BACKWARD' 
          ? relationship.sourceEntity 
          : relationship.targetEntity;

        if (!defaultOptions.includeCircular && visited.has(nextEntity)) continue;

        currentPath.push(relationship);
        findPaths(nextEntity, currentPath, depth + 1);
        currentPath.pop();
      }

      visited.delete(currentEntity);
    };

    findPaths(startEntity, [], 0);

    // Sort paths by distance and cost
    paths.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.cost - b.cost;
    });

    // Mark optimal paths
    this.markOptimalPaths(paths);

    return paths;
  }

  /**
   * Analyze entity dependencies
   */
  public analyzeDependencies(entityName: string): DependencyAnalysis {
    const node = this.graph.nodes.get(entityName);
    if (!node) {
      throw new Error(`Entity '${entityName}' not found in relationship graph`);
    }

    // Direct dependencies (entities this entity depends on)
    const directDependencies = Array.from(node.dependsOn);

    // Transitive dependencies (all entities this entity transitively depends on)
    const transiteDependencies = this.findTransitiveDependencies(entityName, 'BACKWARD');

    // Direct dependents (entities that depend on this entity)
    const dependents = Array.from(node.dependents);

    // Transitive dependents (all entities that transitively depend on this entity)
    const transiteDependents = this.findTransitiveDependencies(entityName, 'FORWARD');

    // Circular dependencies
    const circularDependencies = this.findCircularDependenciesForEntity(entityName);

    // Independent entities (entities with no relationship to this entity)
    const allEntities = Array.from(this.graph.nodes.keys());
    const relatedEntities = new Set([
      ...directDependencies,
      ...transiteDependencies,
      ...dependents,
      ...transiteDependents,
      entityName
    ]);
    const independentFrom = allEntities.filter(entity => !relatedEntities.has(entity));

    // Find critical path (longest dependency chain)
    const criticalPath = this.findCriticalPath(entityName);

    // Calculate isolation risk
    const isolationRisk = this.calculateIsolationRisk(
      directDependencies.length,
      transiteDependencies.length,
      dependents.length,
      transiteDependents.length
    );

    return {
      entityName,
      directDependencies,
      transiteDependencies,
      dependents,
      transiteDependents,
      circularDependencies,
      independentFrom,
      criticalPath,
      isolationRisk
    };
  }

  /**
   * Find strongly connected components (circular dependency groups)
   */
  public findStronglyConnectedComponents(): string[][] {
    const components: string[][] = [];
    const visited = new Set<string>();
    const stack: string[] = [];

    // First DFS to fill stack in finishing order
    const dfs1 = (entity: string): void => {
      visited.add(entity);
      const relationships = this.getEntityRelationships(entity, 'FORWARD');
      
      for (const rel of relationships) {
        const neighbor = rel.targetEntity;
        if (!visited.has(neighbor)) {
          dfs1(neighbor);
        }
      }
      
      stack.push(entity);
    };

    // Process all entities
    this.graph.nodes.forEach((_, entity) => {
      if (!visited.has(entity)) {
        dfs1(entity);
      }
    });

    // Second DFS on transpose graph
    visited.clear();
    
    const dfs2 = (entity: string, component: string[]): void => {
      visited.add(entity);
      component.push(entity);
      
      const relationships = this.getEntityRelationships(entity, 'BACKWARD');
      
      for (const rel of relationships) {
        const neighbor = rel.sourceEntity;
        if (!visited.has(neighbor)) {
          dfs2(neighbor, component);
        }
      }
    };

    // Process stack in reverse order
    while (stack.length > 0) {
      const entity = stack.pop()!;
      if (!visited.has(entity)) {
        const component: string[] = [];
        dfs2(entity, component);
        if (component.length > 1) {
          components.push(component);
        }
      }
    }

    return components;
  }

  /**
   * Helper methods
   */
  private getEntityRelationships(entity: string, direction: 'FORWARD' | 'BACKWARD' | 'BIDIRECTIONAL'): EntityRelationship[] {
    if (direction === 'FORWARD') {
      return this.relationshipMapper.getOutgoingRelationships(entity);
    } else if (direction === 'BACKWARD') {
      return this.relationshipMapper.getIncomingRelationships(entity);
    } else { // BIDIRECTIONAL
      return [
        ...this.relationshipMapper.getOutgoingRelationships(entity),
        ...this.relationshipMapper.getIncomingRelationships(entity)
      ];
    }
  }

  private calculatePathCost(path: EntityRelationship[]): number {
    return path.reduce((cost, rel) => {
      let relationshipCost = 1;

      // Higher cost for complex relationships
      switch (rel.relationshipType) {
        case 'MANY_TO_MANY': relationshipCost += 2; break;
        case 'POLYMORPHIC': relationshipCost += 3; break;
        case 'HIERARCHICAL': relationshipCost += 1; break;
      }

      // Loading strategy impact
      switch (rel.loadingStrategy) {
        case 'LAZY': relationshipCost += 1; break;
        case 'ON_DEMAND': relationshipCost += 2; break;
        case 'EAGER': relationshipCost -= 0.5; break;
      }

      // Performance considerations
      if (rel.metadata?.performance?.isIndexed) relationshipCost -= 0.5;
      if (rel.metadata?.performance?.queryFrequency === 'HIGH') relationshipCost -= 0.25;

      return cost + Math.max(0.1, relationshipCost);
    }, 0);
  }

  private calculateRelationshipCost(relationship: EntityRelationship): number {
    return this.calculatePathCost([relationship]);
  }

  private markOptimalPaths(paths: RelationshipPath[]): void {
    if (paths.length === 0) return;

    // Group paths by target
    const pathsByTarget = new Map<string, RelationshipPath[]>();
    paths.forEach(path => {
      const key = path.target;
      if (!pathsByTarget.has(key)) {
        pathsByTarget.set(key, []);
      }
      pathsByTarget.get(key)!.push(path);
    });

    // Mark optimal path for each target
    pathsByTarget.forEach(targetPaths => {
      const minDistance = Math.min(...targetPaths.map(p => p.distance));
      const minCostAtMinDistance = Math.min(
        ...targetPaths.filter(p => p.distance === minDistance).map(p => p.cost)
      );

      targetPaths.forEach(path => {
        path.isOptimal = path.distance === minDistance && path.cost === minCostAtMinDistance;
      });
    });
  }

  private reconstructPath(
    start: string,
    end: string,
    previous: Map<string, { entity: string; relationship: EntityRelationship }>
  ): RelationshipPath {
    const path: EntityRelationship[] = [];
    let current = end;

    while (current !== start) {
      const prev = previous.get(current);
      if (!prev) break;
      
      path.unshift(prev.relationship);
      current = prev.entity;
    }

    return {
      source: start,
      target: end,
      path,
      distance: path.length,
      cost: this.calculatePathCost(path),
      isOptimal: true
    };
  }

  private calculateTraversalStatistics(paths: RelationshipPath[]) {
    if (paths.length === 0) {
      return {
        totalPaths: 0,
        shortestPath: null,
        longestPath: null,
        averagePathLength: 0,
        circularPaths: 0
      };
    }

    const shortestPath = paths.reduce((min, path) => 
      path.distance < min.distance ? path : min
    );

    const longestPath = paths.reduce((max, path) => 
      path.distance > max.distance ? path : max
    );

    const averagePathLength = paths.reduce((sum, path) => sum + path.distance, 0) / paths.length;

    const circularPaths = paths.filter(path => path.source === path.target).length;

    return {
      totalPaths: paths.length,
      shortestPath,
      longestPath,
      averagePathLength,
      circularPaths
    };
  }

  private findTransitiveDependencies(entityName: string, direction: 'FORWARD' | 'BACKWARD' | 'BIDIRECTIONAL'): string[] {
    const dependencies = new Set<string>();
    const visited = new Set<string>();

    const traverse = (entity: string): void => {
      if (visited.has(entity)) return;
      visited.add(entity);

      const relationships = this.getEntityRelationships(entity, direction);
      
      for (const rel of relationships) {
        const relatedEntity = direction === 'FORWARD' ? rel.targetEntity : rel.sourceEntity;
        if (relatedEntity !== entityName) {
          dependencies.add(relatedEntity);
          traverse(relatedEntity);
        }
      }
    };

    traverse(entityName);
    dependencies.delete(entityName);

    return Array.from(dependencies);
  }

  private findCircularDependenciesForEntity(entityName: string): string[] {
    const circularDeps: string[] = [];
    const components = this.findStronglyConnectedComponents();

    for (const component of components) {
      if (component.includes(entityName)) {
        circularDeps.push(...component.filter(entity => entity !== entityName));
      }
    }

    return circularDeps;
  }

  private findCriticalPath(entityName: string): RelationshipPath[] {
    // Find the longest path from any entity to this entity
    let longestPath: RelationshipPath | null = null;

    this.graph.nodes.forEach((_, sourceEntity) => {
      if (sourceEntity === entityName) return;

      const paths = this.findAllPaths(sourceEntity, entityName, { maxDepth: 8 });
      if (paths.length > 0) {
        const longest = paths.reduce((max, path) => 
          path.distance > max.distance ? path : max
        );

        if (!longestPath || longest.distance > longestPath.distance) {
          longestPath = longest;
        }
      }
    });

    return longestPath ? [longestPath] : [];
  }

  private calculateIsolationRisk(
    directDeps: number,
    transitiveDeps: number,
    dependents: number,
    transitiveDependents: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const totalConnections = directDeps + transitiveDeps + dependents + transitiveDependents;
    const dependencyRatio = transitiveDependents / Math.max(1, totalConnections);

    if (transitiveDependents > 50 || dependencyRatio > 0.7) return 'CRITICAL';
    if (transitiveDependents > 20 || dependencyRatio > 0.5) return 'HIGH';
    if (transitiveDependents > 5 || dependencyRatio > 0.3) return 'MEDIUM';
    return 'LOW';
  }
}