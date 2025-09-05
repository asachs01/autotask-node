/**
 * Entity Relationship Graph
 * 
 * Manages and analyzes the graph of entity relationships,
 * providing path finding and dependency analysis.
 */

import { EntityRelationship, RelationshipType } from './ReferentialIntegrityManager';

/**
 * Node in the relationship graph
 */
export interface GraphNode {
  /** Entity type */
  entityType: string;
  
  /** Outgoing edges (relationships where this is the source) */
  outgoing: GraphEdge[];
  
  /** Incoming edges (relationships where this is the target) */
  incoming: GraphEdge[];
  
  /** Metadata about the entity */
  metadata?: {
    description?: string;
    primaryKey?: string;
    indexes?: string[];
    constraints?: string[];
  };
}

/**
 * Edge in the relationship graph
 */
export interface GraphEdge {
  /** Source entity type */
  source: string;
  
  /** Target entity type */
  target: string;
  
  /** Relationship details */
  relationship: EntityRelationship;
  
  /** Weight for path finding (lower is better) */
  weight: number;
}

/**
 * Path between two entities
 */
export interface EntityPath {
  /** Starting entity */
  source: string;
  
  /** Ending entity */
  target: string;
  
  /** Edges in the path */
  edges: GraphEdge[];
  
  /** Total path weight */
  totalWeight: number;
  
  /** Path length (number of edges) */
  length: number;
}

/**
 * Dependency information for an entity
 */
export interface DependencyInfo {
  /** Entity type */
  entityType: string;
  
  /** Entities that this entity depends on */
  dependencies: string[];
  
  /** Entities that depend on this entity */
  dependents: string[];
  
  /** Whether this entity can be deleted independently */
  canDelete: boolean;
  
  /** Order for safe deletion (lower numbers should be deleted first) */
  deletionOrder: number;
  
  /** Order for safe creation (lower numbers should be created first) */
  creationOrder: number;
}

/**
 * Graph cycle detection result
 */
export interface CycleInfo {
  /** Whether a cycle exists */
  hasCycle: boolean;
  
  /** Entities involved in cycles */
  cycleEntities?: string[];
  
  /** Edges forming the cycle */
  cycleEdges?: GraphEdge[];
}

/**
 * Relationship Graph Manager
 */
export class RelationshipGraph {
  private nodes = new Map<string, GraphNode>();
  private adjacencyList = new Map<string, Set<string>>();
  private pathCache = new Map<string, EntityPath>();
  
  /**
   * Add a relationship to the graph
   */
  addRelationship(relationship: EntityRelationship): void {
    // Ensure nodes exist
    this.ensureNode(relationship.sourceEntity);
    this.ensureNode(relationship.targetEntity);
    
    // Create edge
    const edge: GraphEdge = {
      source: relationship.sourceEntity,
      target: relationship.targetEntity,
      relationship,
      weight: this.calculateWeight(relationship)
    };
    
    // Add edge to nodes
    const sourceNode = this.nodes.get(relationship.sourceEntity)!;
    const targetNode = this.nodes.get(relationship.targetEntity)!;
    
    sourceNode.outgoing.push(edge);
    targetNode.incoming.push(edge);
    
    // Update adjacency list
    if (!this.adjacencyList.has(relationship.sourceEntity)) {
      this.adjacencyList.set(relationship.sourceEntity, new Set());
    }
    this.adjacencyList.get(relationship.sourceEntity)!.add(relationship.targetEntity);
    
    // Clear path cache as graph has changed
    this.pathCache.clear();
  }
  
  /**
   * Find shortest path between two entities
   */
  findPath(source: string, target: string): EntityPath | null {
    const cacheKey = `${source}->${target}`;
    
    // Check cache
    if (this.pathCache.has(cacheKey)) {
      return this.pathCache.get(cacheKey)!;
    }
    
    // Use Dijkstra's algorithm
    const distances = new Map<string, number>();
    const previous = new Map<string, GraphEdge | null>();
    const unvisited = new Set<string>(this.nodes.keys());
    
    // Initialize distances
    for (const node of this.nodes.keys()) {
      distances.set(node, node === source ? 0 : Infinity);
    }
    
    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current: string | null = null;
      let minDistance = Infinity;
      
      for (const node of unvisited) {
        const distance = distances.get(node)!;
        if (distance < minDistance) {
          current = node;
          minDistance = distance;
        }
      }
      
      if (current === null || minDistance === Infinity) {
        break; // No path exists
      }
      
      if (current === target) {
        // Found path, reconstruct it
        const path = this.reconstructPath(source, target, previous);
        this.pathCache.set(cacheKey, path);
        return path;
      }
      
      unvisited.delete(current);
      
      // Update distances for neighbors
      const currentNode = this.nodes.get(current)!;
      for (const edge of currentNode.outgoing) {
        if (unvisited.has(edge.target)) {
          const altDistance = distances.get(current)! + edge.weight;
          if (altDistance < distances.get(edge.target)!) {
            distances.set(edge.target, altDistance);
            previous.set(edge.target, edge);
          }
        }
      }
    }
    
    return null; // No path found
  }
  
  /**
   * Find all paths between two entities
   */
  findAllPaths(source: string, target: string, maxLength: number = 10): EntityPath[] {
    const paths: EntityPath[] = [];
    const visited = new Set<string>();
    const currentPath: GraphEdge[] = [];
    
    this.dfsAllPaths(source, target, visited, currentPath, paths, maxLength);
    
    return paths.sort((a, b) => a.totalWeight - b.totalWeight);
  }
  
  /**
   * Analyze dependencies for an entity
   */
  analyzeDependencies(entityType: string): DependencyInfo {
    const dependencies = new Set<string>();
    const dependents = new Set<string>();
    
    const node = this.nodes.get(entityType);
    if (!node) {
      return {
        entityType,
        dependencies: [],
        dependents: [],
        canDelete: true,
        deletionOrder: 0,
        creationOrder: 0
      };
    }
    
    // Find dependencies (entities this one references)
    for (const edge of node.outgoing) {
      if (edge.relationship.required) {
        dependencies.add(edge.target);
      }
    }
    
    // Find dependents (entities that reference this one)
    for (const edge of node.incoming) {
      if (edge.relationship.required) {
        dependents.add(edge.source);
      }
    }
    
    // Calculate deletion/creation order using topological sort
    const { deletionOrder, creationOrder } = this.calculateEntityOrder(entityType);
    
    return {
      entityType,
      dependencies: Array.from(dependencies),
      dependents: Array.from(dependents),
      canDelete: dependents.size === 0,
      deletionOrder,
      creationOrder
    };
  }
  
  /**
   * Detect cycles in the relationship graph
   */
  detectCycles(): CycleInfo {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycleEdges: GraphEdge[] = [];
    
    for (const node of this.nodes.keys()) {
      if (!visited.has(node)) {
        const hasCycle = this.dfsCycleDetection(node, visited, recStack, cycleEdges);
        if (hasCycle) {
          return {
            hasCycle: true,
            cycleEntities: Array.from(recStack),
            cycleEdges
          };
        }
      }
    }
    
    return { hasCycle: false };
  }
  
  /**
   * Get topological ordering of entities
   */
  getTopologicalOrder(): string[] | null {
    const inDegree = new Map<string, number>();
    const queue: string[] = [];
    const result: string[] = [];
    
    // Calculate in-degrees
    for (const node of this.nodes.keys()) {
      inDegree.set(node, 0);
    }
    
    for (const node of this.nodes.values()) {
      for (const edge of node.outgoing) {
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }
    }
    
    // Find nodes with no incoming edges
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(node);
      }
    }
    
    // Process queue
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      
      const node = this.nodes.get(current)!;
      for (const edge of node.outgoing) {
        const newDegree = inDegree.get(edge.target)! - 1;
        inDegree.set(edge.target, newDegree);
        
        if (newDegree === 0) {
          queue.push(edge.target);
        }
      }
    }
    
    // Check if all nodes were processed (no cycles)
    return result.length === this.nodes.size ? result : null;
  }
  
  /**
   * Get entities at a specific depth from a source
   */
  getEntitiesAtDepth(source: string, depth: number): string[] {
    if (depth === 0) return [source];
    
    const visited = new Set<string>();
    const currentLevel = new Set<string>([source]);
    
    for (let i = 0; i < depth; i++) {
      const nextLevel = new Set<string>();
      
      for (const entity of currentLevel) {
        if (!visited.has(entity)) {
          visited.add(entity);
          const node = this.nodes.get(entity);
          
          if (node) {
            for (const edge of node.outgoing) {
              nextLevel.add(edge.target);
            }
          }
        }
      }
      
      if (nextLevel.size === 0) break;
      currentLevel.clear();
      for (const entity of nextLevel) {
        currentLevel.add(entity);
      }
    }
    
    return Array.from(currentLevel);
  }
  
  /**
   * Get impact analysis for entity deletion
   */
  getDeleteImpact(entityType: string): {
    directImpact: string[];
    cascadeImpact: string[];
    restrictedBy: string[];
  } {
    const directImpact: string[] = [];
    const cascadeImpact: string[] = [];
    const restrictedBy: string[] = [];
    
    const node = this.nodes.get(entityType);
    if (!node) {
      return { directImpact, cascadeImpact, restrictedBy };
    }
    
    // Analyze incoming relationships
    for (const edge of node.incoming) {
      const action = edge.relationship.onDelete;
      
      switch (action) {
        case 'cascade':
          cascadeImpact.push(edge.source);
          break;
        case 'set-null':
          directImpact.push(edge.source);
          break;
        case 'restrict':
          if (edge.relationship.required) {
            restrictedBy.push(edge.source);
          }
          break;
      }
    }
    
    // Recursively find cascade impact
    const visited = new Set<string>();
    const queue = [...cascadeImpact];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      
      const currentNode = this.nodes.get(current);
      if (currentNode) {
        for (const edge of currentNode.incoming) {
          if (edge.relationship.onDelete === 'cascade') {
            queue.push(edge.source);
            cascadeImpact.push(edge.source);
          }
        }
      }
    }
    
    return {
      directImpact: [...new Set(directImpact)],
      cascadeImpact: [...new Set(cascadeImpact)],
      restrictedBy: [...new Set(restrictedBy)]
    };
  }
  
  /**
   * Ensure a node exists in the graph
   */
  private ensureNode(entityType: string): void {
    if (!this.nodes.has(entityType)) {
      this.nodes.set(entityType, {
        entityType,
        outgoing: [],
        incoming: []
      });
    }
  }
  
  /**
   * Calculate edge weight based on relationship properties
   */
  private calculateWeight(relationship: EntityRelationship): number {
    let weight = 1;
    
    // Required relationships have lower weight (preferred)
    if (relationship.required) {
      weight *= 0.5;
    }
    
    // Different relationship types have different weights
    switch (relationship.type) {
      case RelationshipType.ONE_TO_ONE:
        weight *= 0.8;
        break;
      case RelationshipType.ONE_TO_MANY:
        weight *= 1.0;
        break;
      case RelationshipType.MANY_TO_ONE:
        weight *= 1.0;
        break;
      case RelationshipType.MANY_TO_MANY:
        weight *= 1.5;
        break;
    }
    
    // Cascade actions have lower weight
    if (relationship.onDelete === 'cascade') {
      weight *= 0.9;
    }
    
    return weight;
  }
  
  /**
   * Reconstruct path from Dijkstra's algorithm
   */
  private reconstructPath(
    source: string,
    target: string,
    previous: Map<string, GraphEdge | null>
  ): EntityPath {
    const edges: GraphEdge[] = [];
    let current = target;
    let totalWeight = 0;
    
    while (current !== source) {
      const edge = previous.get(current);
      if (!edge) break;
      
      edges.unshift(edge);
      totalWeight += edge.weight;
      current = edge.source;
    }
    
    return {
      source,
      target,
      edges,
      totalWeight,
      length: edges.length
    };
  }
  
  /**
   * DFS for finding all paths
   */
  private dfsAllPaths(
    current: string,
    target: string,
    visited: Set<string>,
    currentPath: GraphEdge[],
    allPaths: EntityPath[],
    maxLength: number
  ): void {
    if (currentPath.length >= maxLength) return;
    
    if (current === target && currentPath.length > 0) {
      // Found a path
      const totalWeight = currentPath.reduce((sum, edge) => sum + edge.weight, 0);
      allPaths.push({
        source: currentPath[0].source,
        target,
        edges: [...currentPath],
        totalWeight,
        length: currentPath.length
      });
      return;
    }
    
    visited.add(current);
    const node = this.nodes.get(current);
    
    if (node) {
      for (const edge of node.outgoing) {
        if (!visited.has(edge.target)) {
          currentPath.push(edge);
          this.dfsAllPaths(edge.target, target, visited, currentPath, allPaths, maxLength);
          currentPath.pop();
        }
      }
    }
    
    visited.delete(current);
  }
  
  /**
   * DFS for cycle detection
   */
  private dfsCycleDetection(
    node: string,
    visited: Set<string>,
    recStack: Set<string>,
    cycleEdges: GraphEdge[]
  ): boolean {
    visited.add(node);
    recStack.add(node);
    
    const currentNode = this.nodes.get(node);
    if (currentNode) {
      for (const edge of currentNode.outgoing) {
        if (!visited.has(edge.target)) {
          cycleEdges.push(edge);
          if (this.dfsCycleDetection(edge.target, visited, recStack, cycleEdges)) {
            return true;
          }
          cycleEdges.pop();
        } else if (recStack.has(edge.target)) {
          cycleEdges.push(edge);
          return true;
        }
      }
    }
    
    recStack.delete(node);
    return false;
  }
  
  /**
   * Calculate entity creation and deletion order
   */
  private calculateEntityOrder(entityType: string): {
    deletionOrder: number;
    creationOrder: number;
  } {
    const topOrder = this.getTopologicalOrder();
    
    if (topOrder) {
      const index = topOrder.indexOf(entityType);
      return {
        creationOrder: index,
        deletionOrder: topOrder.length - index - 1
      };
    }
    
    // If there are cycles, use a simple heuristic
    const dependencies = this.analyzeDependencies(entityType);
    return {
      creationOrder: dependencies.dependencies.length,
      deletionOrder: dependencies.dependents.length
    };
  }
  
  /**
   * Export graph as DOT format for visualization
   */
  exportAsDot(): string {
    let dot = 'digraph EntityRelationships {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box];\n\n';
    
    // Add nodes
    for (const node of this.nodes.keys()) {
      dot += `  "${node}";\n`;
    }
    
    dot += '\n';
    
    // Add edges
    for (const node of this.nodes.values()) {
      for (const edge of node.outgoing) {
        const label = edge.relationship.sourceField;
        const style = edge.relationship.required ? 'solid' : 'dashed';
        const color = edge.relationship.onDelete === 'cascade' ? 'red' : 'black';
        
        dot += `  "${edge.source}" -> "${edge.target}" [label="${label}", style="${style}", color="${color}"];\n`;
      }
    }
    
    dot += '}';
    return dot;
  }
  
  /**
   * Get graph statistics
   */
  getStatistics(): {
    nodeCount: number;
    edgeCount: number;
    averageDegree: number;
    maxInDegree: { entity: string; count: number };
    maxOutDegree: { entity: string; count: number };
    hasCycles: boolean;
  } {
    let totalEdges = 0;
    let maxInDegree = { entity: '', count: 0 };
    let maxOutDegree = { entity: '', count: 0 };
    
    for (const [entityType, node] of this.nodes.entries()) {
      totalEdges += node.outgoing.length;
      
      if (node.incoming.length > maxInDegree.count) {
        maxInDegree = { entity: entityType, count: node.incoming.length };
      }
      
      if (node.outgoing.length > maxOutDegree.count) {
        maxOutDegree = { entity: entityType, count: node.outgoing.length };
      }
    }
    
    const averageDegree = this.nodes.size > 0 ? totalEdges / this.nodes.size : 0;
    const { hasCycle } = this.detectCycles();
    
    return {
      nodeCount: this.nodes.size,
      edgeCount: totalEdges,
      averageDegree,
      maxInDegree,
      maxOutDegree,
      hasCycles: hasCycle
    };
  }
  
  /**
   * Clear the graph
   */
  clear(): void {
    this.nodes.clear();
    this.adjacencyList.clear();
    this.pathCache.clear();
  }
}