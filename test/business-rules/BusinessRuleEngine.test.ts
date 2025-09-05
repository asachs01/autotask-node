import { BusinessRuleEngine, RuleEngineOptions } from '../../src/business-rules/BusinessRuleEngine';
import { BusinessRule, BaseBusinessRule, RequiredFieldRule, PatternRule, RangeRule, RulePriority } from '../../src/business-rules/BusinessRule';
import { ValidationResult, ValidationSeverity } from '../../src/business-rules/ValidationResult';
import { ErrorLogger } from '../../src/errors/ErrorLogger';

describe('BusinessRuleEngine', () => {
  let engine: BusinessRuleEngine;
  let mockErrorLogger: jest.Mocked<ErrorLogger>;
  
  beforeEach(() => {
    mockErrorLogger = {
      generateCorrelationId: jest.fn().mockReturnValue('test-correlation-id'),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as any;
    
    engine = new BusinessRuleEngine({
      errorLogger: mockErrorLogger,
      enableCache: false,
      enablePerformanceTracking: false
    });
  });
  
  describe('Rule Registration', () => {
    it('should register a rule for an entity type', () => {
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      
      engine.registerRule('TestEntity', rule);
      
      const rules = engine.getRules('TestEntity');
      expect(rules).toContain(rule);
    });
    
    it('should register a rule for multiple entity types', () => {
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      
      engine.registerRule(['Entity1', 'Entity2'], rule);
      
      expect(engine.getRules('Entity1')).toContain(rule);
      expect(engine.getRules('Entity2')).toContain(rule);
    });
    
    it('should register global rules', () => {
      const rule = new RequiredFieldRule('global.rule', ['field1']);
      
      engine.registerGlobalRule(rule);
      
      // Global rules should appear for any entity type
      expect(engine.getRules('AnyEntity')).toContain(rule);
      expect(engine.getRules('AnotherEntity')).toContain(rule);
    });
    
    it('should replace existing rules with the same name', () => {
      const rule1 = new RequiredFieldRule('test.rule', ['field1']);
      const rule2 = new RequiredFieldRule('test.rule', ['field2']);
      
      engine.registerRule('TestEntity', rule1);
      engine.registerRule('TestEntity', rule2);
      
      const rules = engine.getRules('TestEntity');
      expect(rules).toContain(rule2);
      expect(rules).not.toContain(rule1);
    });
    
    it('should sort rules by priority', () => {
      const highPriorityRule = new RequiredFieldRule('high', ['field1'], {
        priority: RulePriority.HIGH
      });
      const normalPriorityRule = new RequiredFieldRule('normal', ['field2'], {
        priority: RulePriority.NORMAL
      });
      const criticalPriorityRule = new RequiredFieldRule('critical', ['field3'], {
        priority: RulePriority.CRITICAL
      });
      
      // Register in random order
      engine.registerRule('TestEntity', normalPriorityRule);
      engine.registerRule('TestEntity', criticalPriorityRule);
      engine.registerRule('TestEntity', highPriorityRule);
      
      const rules = engine.getRules('TestEntity');
      expect(rules[0]).toBe(criticalPriorityRule);
      expect(rules[1]).toBe(highPriorityRule);
      expect(rules[2]).toBe(normalPriorityRule);
    });
  });
  
  describe('Rule Unregistration', () => {
    it('should unregister a specific rule', () => {
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      
      engine.registerRule('TestEntity', rule);
      const result = engine.unregisterRule('TestEntity', 'test.rule');
      
      expect(result).toBe(true);
      expect(engine.getRules('TestEntity')).not.toContain(rule);
    });
    
    it('should return false when unregistering non-existent rule', () => {
      const result = engine.unregisterRule('TestEntity', 'non.existent');
      expect(result).toBe(false);
    });
    
    it('should unregister global rules', () => {
      const rule = new RequiredFieldRule('global.rule', ['field1']);
      
      engine.registerGlobalRule(rule);
      const result = engine.unregisterGlobalRule('global.rule');
      
      expect(result).toBe(true);
      expect(engine.getRules('AnyEntity')).not.toContain(rule);
    });
  });
  
  describe('Entity Validation', () => {
    it('should validate an entity with passing rules', async () => {
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      engine.registerRule('TestEntity', rule);
      
      const entity = { field1: 'value' };
      const result = await engine.validateEntity('TestEntity', entity);
      
      expect(result.isValid).toBe(true);
      expect(result.hasErrors()).toBe(false);
    });
    
    it('should validate an entity with failing rules', async () => {
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      engine.registerRule('TestEntity', rule);
      
      const entity = {}; // Missing required field
      const result = await engine.validateEntity('TestEntity', entity);
      
      expect(result.isValid).toBe(false);
      expect(result.hasErrors()).toBe(true);
      expect(result.getErrors()).toHaveLength(1);
      expect(result.getErrors()[0].code).toBe('REQUIRED_FIELD');
    });
    
    it('should apply both global and entity-specific rules', async () => {
      const globalRule = new RequiredFieldRule('global.rule', ['globalField']);
      const entityRule = new RequiredFieldRule('entity.rule', ['entityField']);
      
      engine.registerGlobalRule(globalRule);
      engine.registerRule('TestEntity', entityRule);
      
      const entity = { globalField: 'value' }; // Missing entityField
      const result = await engine.validateEntity('TestEntity', entity);
      
      expect(result.isValid).toBe(false);
      expect(result.getErrors()).toHaveLength(1);
      expect(result.getErrors()[0].fields).toContain('entityField');
    });
    
    it('should skip disabled rules', async () => {
      const rule = new RequiredFieldRule('test.rule', ['field1'], {
        enabled: false
      });
      engine.registerRule('TestEntity', rule);
      
      const entity = {}; // Missing required field
      const result = await engine.validateEntity('TestEntity', entity);
      
      expect(result.isValid).toBe(true);
    });
    
    it('should apply conditional rules', async () => {
      class ConditionalRule extends BaseBusinessRule {
        async condition(entity: any): Promise<boolean> {
          return entity.type === 'special';
        }
        
        validate(entity: any): ValidationResult {
          const result = new ValidationResult();
          if (!entity.specialField) {
            result.addError('MISSING_SPECIAL_FIELD', 'Special field is required');
          }
          return result;
        }
      }
      
      const rule = new ConditionalRule('conditional.rule');
      engine.registerRule('TestEntity', rule);
      
      // Entity without special type - rule should not apply
      const normalEntity = { type: 'normal' };
      const normalResult = await engine.validateEntity('TestEntity', normalEntity);
      expect(normalResult.isValid).toBe(true);
      
      // Entity with special type - rule should apply
      const specialEntity = { type: 'special' };
      const specialResult = await engine.validateEntity('TestEntity', specialEntity);
      expect(specialResult.isValid).toBe(false);
    });
    
    it('should add rule name to validation issues', async () => {
      const rule = new RequiredFieldRule('test.required.rule', ['field1']);
      engine.registerRule('TestEntity', rule);
      
      const entity = {};
      const result = await engine.validateEntity('TestEntity', entity);
      
      const errors = result.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.ruleName).toBe('test.required.rule');
    });
  });
  
  describe('Caching', () => {
    beforeEach(() => {
      engine = new BusinessRuleEngine({
        errorLogger: mockErrorLogger,
        enableCache: true,
        cacheTTL: 1000,
        maxCacheSize: 10
      });
    });
    
    it('should cache validation results', async () => {
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      engine.registerRule('TestEntity', rule);
      
      const entity = { id: 1, field1: 'value' };
      
      // First validation
      const result1 = await engine.validateEntity('TestEntity', entity);
      
      // Second validation - should hit cache
      const result2 = await engine.validateEntity('TestEntity', entity);
      
      expect(result1).toEqual(result2);
      expect(mockErrorLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Cache hit'),
        expect.any(Object)
      );
    });
    
    it('should invalidate cache when entity changes', async () => {
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      engine.registerRule('TestEntity', rule);
      
      const entity1 = { id: 1, field1: 'value' };
      const entity2 = { id: 1, field1: 'different' };
      
      const result1 = await engine.validateEntity('TestEntity', entity1);
      const result2 = await engine.validateEntity('TestEntity', entity2);
      
      // Should not hit cache due to different entity content
      expect(mockErrorLogger.debug).not.toHaveBeenCalledWith(
        expect.stringContaining('Cache hit'),
        expect.any(Object)
      );
    });
    
    it('should clear cache on demand', async () => {
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      engine.registerRule('TestEntity', rule);
      
      const entity = { id: 1, field1: 'value' };
      
      await engine.validateEntity('TestEntity', entity);
      engine.clearCache();
      await engine.validateEntity('TestEntity', entity);
      
      // Should not hit cache after clearing
      expect(mockErrorLogger.debug).not.toHaveBeenCalledWith(
        expect.stringContaining('Cache hit'),
        expect.any(Object)
      );
    });
  });
  
  describe('Parallel Execution', () => {
    beforeEach(() => {
      engine = new BusinessRuleEngine({
        errorLogger: mockErrorLogger,
        enableParallelExecution: true,
        maxParallelRules: 2
      });
    });
    
    it('should execute rules in parallel batches', async () => {
      const executionOrder: string[] = [];
      
      class TrackingRule extends BaseBusinessRule {
        validate(entity: any): ValidationResult {
          executionOrder.push(this.name);
          return ValidationResult.success();
        }
      }
      
      // Create 5 rules with same priority
      for (let i = 1; i <= 5; i++) {
        engine.registerRule('TestEntity', new TrackingRule(`rule${i}`, {
          priority: RulePriority.NORMAL
        }));
      }
      
      await engine.validateEntity('TestEntity', {});
      
      // With batch size 2, rules should be executed in batches
      expect(executionOrder).toHaveLength(5);
    });
  });
  
  describe('Performance Tracking', () => {
    beforeEach(() => {
      engine = new BusinessRuleEngine({
        errorLogger: mockErrorLogger,
        enablePerformanceTracking: true
      });
    });
    
    it('should track rule execution statistics', async () => {
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      engine.registerRule('TestEntity', rule);
      
      await engine.validateEntity('TestEntity', { field1: 'value' });
      
      const stats = engine.getStatistics();
      expect(stats.size).toBeGreaterThan(0);
      
      const firstStats = stats.values().next().value;
      expect(firstStats).toBeDefined();
      expect(firstStats).toHaveLength(1);
      
      if (firstStats && firstStats[0]) {
        expect(firstStats[0].ruleName).toBe('test.rule');
        expect(firstStats[0].passed).toBe(true);
        expect(firstStats[0].executionTime).toBeGreaterThanOrEqual(0);
      }
    });
    
    it('should clear statistics on demand', async () => {
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      engine.registerRule('TestEntity', rule);
      
      await engine.validateEntity('TestEntity', { field1: 'value' });
      
      const statsBefore = engine.getStatistics();
      expect(statsBefore.size).toBeGreaterThan(0);
      
      engine.clearStatistics();
      
      const statsAfter = engine.getStatistics();
      expect(statsAfter.size).toBe(0);
    });
  });
  
  describe('Stop on First Error', () => {
    beforeEach(() => {
      engine = new BusinessRuleEngine({
        errorLogger: mockErrorLogger,
        stopOnFirstError: true
      });
    });
    
    it('should stop validation on first error', async () => {
      const executedRules: string[] = [];
      
      class TrackingRule extends BaseBusinessRule {
        validate(entity: any): ValidationResult {
          executedRules.push(this.name);
          const result = new ValidationResult();
          if (this.name === 'rule2') {
            result.addError('ERROR', 'Test error');
          }
          return result;
        }
      }
      
      engine.registerRule('TestEntity', new TrackingRule('rule1'));
      engine.registerRule('TestEntity', new TrackingRule('rule2'));
      engine.registerRule('TestEntity', new TrackingRule('rule3'));
      
      const result = await engine.validateEntity('TestEntity', {});
      
      expect(executedRules).toEqual(['rule1', 'rule2']);
      expect(result.hasErrors()).toBe(true);
    });
  });
  
  describe('Rule Summary', () => {
    it('should provide rule summary for all entities', () => {
      engine.registerGlobalRule(new RequiredFieldRule('global1', ['field1']));
      engine.registerGlobalRule(new RequiredFieldRule('global2', ['field2'], { enabled: false }));
      engine.registerRule('Entity1', new RequiredFieldRule('entity1.rule1', ['field3']));
      engine.registerRule('Entity2', new RequiredFieldRule('entity2.rule1', ['field4']));
      engine.registerRule('Entity2', new RequiredFieldRule('entity2.rule2', ['field5']));
      
      const summary = engine.getRuleSummary();
      
      expect(summary.totalRules).toBe(5);
      expect(summary.enabledRules).toBe(4); // One global rule is disabled
      expect(summary.globalRules).toBe(2);
      expect(summary.entityTypeRules.get('Entity1')).toBe(1);
      expect(summary.entityTypeRules.get('Entity2')).toBe(2);
    });
    
    it('should provide rule summary for specific entity', () => {
      engine.registerGlobalRule(new RequiredFieldRule('global1', ['field1']));
      engine.registerRule('Entity1', new RequiredFieldRule('entity1.rule1', ['field2']));
      engine.registerRule('Entity1', new RequiredFieldRule('entity1.rule2', ['field3'], { enabled: false }));
      
      const summary = engine.getRuleSummary('Entity1');
      
      expect(summary.totalRules).toBe(3); // 1 global + 2 entity-specific
      expect(summary.enabledRules).toBe(2); // One entity rule is disabled
      expect(summary.globalRules).toBe(1);
      expect(summary.entityTypeRules.get('Entity1')).toBe(2);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle rule execution errors gracefully', async () => {
      class ErrorRule extends BaseBusinessRule {
        validate(): ValidationResult {
          throw new Error('Rule execution failed');
        }
      }
      
      engine.registerRule('TestEntity', new ErrorRule('error.rule'));
      
      const result = await engine.validateEntity('TestEntity', {});
      
      expect(result.isValid).toBe(false);
      expect(result.getErrors()).toHaveLength(1);
      expect(result.getErrors()[0].code).toBe('RULE_EXECUTION_ERROR');
      expect(result.getErrors()[0].message).toContain('Rule execution failed');
    });
    
    it('should handle validation errors gracefully', async () => {
      // Simulate an error during validation setup
      const rule = new RequiredFieldRule('test.rule', ['field1']);
      engine.registerRule('TestEntity', rule);
      
      // Pass an entity that causes an error (circular reference)
      const circularEntity: any = { field1: 'value' };
      circularEntity.self = circularEntity;
      
      const result = await engine.validateEntity('TestEntity', circularEntity);
      
      // Should handle the circular reference gracefully
      expect(result).toBeDefined();
    });
  });
});