/**
 * Referential Integrity Module
 * 
 * Exports all referential integrity components for ensuring
 * data consistency across related entities.
 */

export {
  // Core manager
  ReferentialIntegrityManager,
  defaultIntegrityManager,
  
  // Types and interfaces
  RelationshipType,
  ReferentialAction,
  EntityRelationship,
  IntegrityConstraint,
  IntegrityContext,
  IntegrityViolation,
  IntegrityManagerOptions
} from './ReferentialIntegrityManager';

export {
  // Graph management
  RelationshipGraph,
  
  // Graph types
  GraphNode,
  GraphEdge,
  EntityPath,
  DependencyInfo,
  CycleInfo
} from './RelationshipGraph';