import {
  describe,
  it,
  expect,
  beforeEach,
  jest
} from '@jest/globals';

import {
  ReferentialIntegrityManager,
  EntityRelationship,
  IntegrityConstraint,
  IntegrityContext,
  RelationshipType,
  ReferentialAction
} from '../../src/referential-integrity/ReferentialIntegrityManager';
import { ErrorLogger } from '../../src/errors/ErrorLogger';
import { CircuitBreaker } from '../../src/errors/CircuitBreaker';

describe('ReferentialIntegrityManager', () => {
  let manager: ReferentialIntegrityManager;
  let mockLogger: jest.Mocked<ErrorLogger>;
  let mockCircuitBreaker: jest.Mocked<CircuitBreaker>;
  
  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as any;
    
    mockCircuitBreaker = {
      execute: jest.fn().mockImplementation((fn: any) => typeof fn === 'function' ? fn() : fn),
      getMetrics: jest.fn()
    } as any;
    
    manager = new ReferentialIntegrityManager({
      errorLogger: mockLogger,
      circuitBreaker: mockCircuitBreaker,
      enableCascade: true,
      deepValidation: false
    });
  });
  
  describe('Relationship Registration', () => {
    it('should register a relationship', () => {
      const relationship: EntityRelationship = {
        sourceEntity: 'Ticket',
        targetEntity: 'Company',
        sourceField: 'companyID',
        targetField: 'id',
        type: RelationshipType.MANY_TO_ONE,
        onDelete: ReferentialAction.RESTRICT,
        onUpdate: ReferentialAction.CASCADE,
        required: true
      };
      
      manager.registerRelationship(relationship);
      
      const relationships = manager.getRelationships();
      expect(relationships.has('Ticket->Company')).toBe(true);
      const actual = relationships.get('Ticket->Company')?.[0];
      expect(actual).toMatchObject(relationship as any);
    });
    
    it('should register multiple relationships for same entities', () => {
      const rel1: EntityRelationship = {
        sourceEntity: 'Ticket',
        targetEntity: 'Contact',
        sourceField: 'contactID',
        targetField: 'id',
        type: RelationshipType.MANY_TO_ONE,
        onDelete: ReferentialAction.SET_NULL,
        onUpdate: ReferentialAction.CASCADE,
        required: false
      };
      
      const rel2: EntityRelationship = {
        sourceEntity: 'Ticket',
        targetEntity: 'Contact',
        sourceField: 'secondaryContactID',
        targetField: 'id',
        type: RelationshipType.MANY_TO_ONE,
        onDelete: ReferentialAction.SET_NULL,
        onUpdate: ReferentialAction.CASCADE,
        required: false
      };
      
      // Get initial count (there's already a default relationship)
      const initialCount = manager.getRelationships().get('Ticket->Contact')?.length || 0;
      
      manager.registerRelationship(rel1);
      manager.registerRelationship(rel2);
      
      const relationships = manager.getRelationships();
      expect(relationships.get('Ticket->Contact')).toHaveLength(initialCount + 2);
    });
  });
  
  describe('Constraint Registration', () => {
    it('should register a constraint', () => {
      const constraint: IntegrityConstraint = {
        name: 'ticket_priority_check',
        entityType: 'Ticket',
        type: 'check',
        fields: ['priority'],
        check: (entity) => entity.priority >= 1 && entity.priority <= 5,
        errorMessage: 'Priority must be between 1 and 5'
      };
      
      manager.registerConstraint(constraint);
      
      const constraints = manager.getConstraints();
      expect(constraints.has('Ticket')).toBe(true);
      const registeredConstraint = constraints.get('Ticket')?.find(c => c.name === 'ticket_priority_check');
      expect(registeredConstraint).toBeDefined();
      expect(registeredConstraint?.type).toBe('check');
      expect(registeredConstraint?.fields).toEqual(['priority']);
    });
    
    it('should register not-null constraint', () => {
      const constraint: IntegrityConstraint = {
        name: 'required_fields',
        entityType: 'Company',
        type: 'not-null',
        fields: ['name', 'type'],
        enabled: true
      };
      
      manager.registerConstraint(constraint);
      
      const constraints = manager.getConstraints();
      expect(constraints.get('Company')?.[0].type).toBe('not-null');
    });
  });
  
  describe('Integrity Validation', () => {
    it('should validate required relationships', async () => {
      const relationship: EntityRelationship = {
        sourceEntity: 'Ticket',
        targetEntity: 'Company',
        sourceField: 'companyID',
        targetField: 'id',
        type: RelationshipType.MANY_TO_ONE,
        onDelete: ReferentialAction.RESTRICT,
        onUpdate: ReferentialAction.CASCADE,
        required: true,
        enforced: true
      };
      
      manager.registerRelationship(relationship);
      
      const context: IntegrityContext = {
        operation: 'create',
        entityExists: jest.fn(() => Promise.resolve(false)) as any
      };
      
      const ticket = {
        id: 1,
        title: 'Test Ticket',
        companyID: 999
      };
      
      const result = await manager.validateIntegrity('Ticket', ticket, context);
      
      expect(result.isValid).toBe(false);
      expect(result.getErrors()).toHaveLength(1);
      expect(result.getErrors()[0]?.code).toBe('INVALID_REFERENCE');
    });
    
    it('should validate constraints', async () => {
      const constraint: IntegrityConstraint = {
        name: 'priority_check',
        entityType: 'Ticket',
        type: 'check',
        fields: ['priority'],
        check: (entity) => entity.priority >= 1 && entity.priority <= 5,
        errorMessage: 'Priority must be between 1 and 5',
        enabled: true
      };
      
      manager.registerConstraint(constraint);
      
      const context: IntegrityContext = {
        operation: 'create'
      };
      
      const ticket = {
        id: 1,
        title: 'Test Ticket',
        priority: 10
      };
      
      const result = await manager.validateIntegrity('Ticket', ticket, context);
      
      expect(result.isValid).toBe(false);
      expect(result.getErrors()[0]?.code).toBe('CHECK_CONSTRAINT_VIOLATION');
    });
    
    it('should cache validation results', async () => {
      const context: IntegrityContext = {
        operation: 'create'
      };
      
      const entity = { id: 1, name: 'Test' };
      
      // First validation
      await manager.validateIntegrity('Company', entity, context);
      
      // Second validation - should hit cache
      await manager.validateIntegrity('Company', entity, context);
      
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('cache hit'),
        expect.any(Object)
      );
    });
  });
  
  describe('Cascade Operations', () => {
    it('should handle cascade delete', async () => {
      const relationship: EntityRelationship = {
        sourceEntity: 'Task',
        targetEntity: 'TimeEntry',
        sourceField: 'id',
        targetField: 'taskID',
        type: RelationshipType.ONE_TO_MANY,
        onDelete: ReferentialAction.CASCADE,
        onUpdate: ReferentialAction.CASCADE,
        required: false
      };
      
      manager.registerRelationship(relationship);
      
      const context: IntegrityContext = {
        operation: 'delete',
        loadEntity: jest.fn(() => Promise.resolve([])) as any
      };
      
      const actions = await manager.handleCascade('Task', '123', 'delete', context);
      
      expect(actions).toEqual([]);
    });
    
    it('should handle restrict action', async () => {
      // When a Task has TimeEntries, we cannot delete the Task (RESTRICT)
      const relationship: EntityRelationship = {
        sourceEntity: 'Task',
        targetEntity: 'TimeEntry',
        sourceField: 'id',
        targetField: 'taskID',
        type: RelationshipType.ONE_TO_MANY,
        onDelete: ReferentialAction.RESTRICT,
        onUpdate: ReferentialAction.CASCADE,
        required: false
      };
      
      manager.registerRelationship(relationship);
      
      const context: IntegrityContext = {
        operation: 'delete',
        countRelated: jest.fn(() => Promise.resolve(5)) as any
      };
      
      await expect(
        manager.handleCascade('Task', '123', 'delete', context)
      ).rejects.toThrow('Cannot delete Task:123 - has 5 related TimeEntry entities');
    });
    
    it('should enforce maximum cascade depth', async () => {
      const context: IntegrityContext = {
        operation: 'delete'
      };
      
      await expect(
        manager.handleCascade('Entity', '1', 'delete', context, 10)
      ).rejects.toThrow('Maximum cascade depth');
    });
  });
  
  describe('Orphan Detection', () => {
    it('should find orphaned entities', async () => {
      const relationship: EntityRelationship = {
        sourceEntity: 'Company',
        targetEntity: 'Contact',
        sourceField: 'id',
        targetField: 'companyID',
        type: RelationshipType.ONE_TO_MANY,
        onDelete: ReferentialAction.CASCADE,
        onUpdate: ReferentialAction.CASCADE,
        required: true
      };
      
      manager.registerRelationship(relationship);
      
      const context: IntegrityContext = {
        operation: 'delete',
        countRelated: jest.fn(() => Promise.resolve(0)) as any
      };
      
      const contacts = [
        { id: 1, name: 'Contact 1', companyID: null },
        { id: 2, name: 'Contact 2', companyID: null }
      ];
      
      const violations = await manager.findOrphans('Contact', contacts, context);
      
      expect(violations).toHaveLength(2);
      expect(violations[0]?.type).toBe('orphaned-entity');
    });
  });
  
  describe('Default Relationships', () => {
    it('should have default Autotask relationships', () => {
      const relationships = manager.getRelationships();
      
      // Check some key relationships exist
      expect(relationships.has('Ticket->Company')).toBe(true);
      expect(relationships.has('Ticket->Contact')).toBe(true);
      expect(relationships.has('Task->Project')).toBe(true);
      expect(relationships.has('Contact->Company')).toBe(true);
      expect(relationships.has('TimeEntry->Task')).toBe(true);
    });
    
    it('should have default constraints', () => {
      const constraints = manager.getConstraints();
      
      // Check some constraints exist
      expect(constraints.has('Ticket')).toBe(true);
      expect(constraints.has('Task')).toBe(true);
      
      const ticketConstraints = constraints.get('Ticket');
      expect(ticketConstraints?.some(c => c.name === 'ticket_priority_check')).toBe(true);
    });
  });
  
  describe('Clear Operations', () => {
    it('should clear all relationships and constraints', () => {
      manager.clear();
      
      const relationships = manager.getRelationships();
      const constraints = manager.getConstraints();
      
      expect(relationships.size).toBe(0);
      expect(constraints.size).toBe(0);
    });
  });
});