import {
  ConditionalRequiredRule,
  DateRangeRule,
  SumValidationRule,
  MutuallyExclusiveRule,
  DependentFieldsRule,
  PercentageSumRule
} from '../../src/business-rules/CrossFieldRules';
import { ValidationResult } from '../../src/business-rules/ValidationResult';

describe('CrossFieldRules', () => {
  describe('ConditionalRequiredRule', () => {
    it('should require field when condition is met (equals)', () => {
      const rule = new ConditionalRequiredRule(
        'test.conditional',
        'status',
        'equals',
        'complete',
        'resolution'
      );
      
      const entity = { status: 'complete' }; // Missing resolution
      const result = rule.validate(entity);
      
      expect(result.isValid).toBe(false);
      expect(result.getErrors()[0].code).toBe('CONDITIONAL_REQUIRED_FIELD');
      expect(result.getErrors()[0].fields).toContain('resolution');
    });
    
    it('should not require field when condition is not met', () => {
      const rule = new ConditionalRequiredRule(
        'test.conditional',
        'status',
        'equals',
        'complete',
        'resolution'
      );
      
      const entity = { status: 'open' }; // Resolution not required
      const result = rule.validate(entity);
      
      expect(result.isValid).toBe(true);
    });
    
    it('should handle notEquals operator', () => {
      const rule = new ConditionalRequiredRule(
        'test.conditional',
        'type',
        'notEquals',
        'standard',
        'customField'
      );
      
      const entity1 = { type: 'custom' }; // Should require customField
      const result1 = rule.validate(entity1);
      expect(result1.isValid).toBe(false);
      
      const entity2 = { type: 'standard' }; // Should not require customField
      const result2 = rule.validate(entity2);
      expect(result2.isValid).toBe(true);
    });
    
    it('should handle contains operator', () => {
      const rule = new ConditionalRequiredRule(
        'test.conditional',
        'description',
        'contains',
        'urgent',
        'priority'
      );
      
      const entity = { description: 'This is an urgent issue' }; // Should require priority
      const result = rule.validate(entity);
      expect(result.isValid).toBe(false);
    });
    
    it('should handle numeric comparison operators', () => {
      const greaterRule = new ConditionalRequiredRule(
        'test.greater',
        'amount',
        'greaterThan',
        1000,
        'approvalRequired'
      );
      
      const entity1 = { amount: 1500 }; // Should require approval
      const result1 = greaterRule.validate(entity1);
      expect(result1.isValid).toBe(false);
      
      const entity2 = { amount: 500 }; // Should not require approval
      const result2 = greaterRule.validate(entity2);
      expect(result2.isValid).toBe(true);
    });
  });
  
  describe('DateRangeRule', () => {
    it('should validate date order', () => {
      const rule = new DateRangeRule(
        'test.daterange',
        'startDate',
        'endDate',
        { allowEqual: false }
      );
      
      const entity1 = {
        startDate: '2024-01-01',
        endDate: '2023-12-31' // Before start date
      };
      const result1 = rule.validate(entity1);
      expect(result1.isValid).toBe(false);
      expect(result1.getErrors()[0].code).toBe('INVALID_DATE_RANGE');
      
      const entity2 = {
        startDate: '2024-01-01',
        endDate: '2024-01-02' // After start date
      };
      const result2 = rule.validate(entity2);
      expect(result2.isValid).toBe(true);
    });
    
    it('should handle allowEqual option', () => {
      const rule = new DateRangeRule(
        'test.daterange',
        'startDate',
        'endDate',
        { allowEqual: true }
      );
      
      const entity = {
        startDate: '2024-01-01',
        endDate: '2024-01-01' // Same as start date
      };
      const result = rule.validate(entity);
      expect(result.isValid).toBe(true);
    });
    
    it('should validate duration constraints', () => {
      const rule = new DateRangeRule(
        'test.daterange',
        'startDate',
        'endDate',
        {
          minDuration: 7,
          maxDuration: 30
        }
      );
      
      // Too short duration
      const entity1 = {
        startDate: '2024-01-01',
        endDate: '2024-01-03' // 2 days
      };
      const result1 = rule.validate(entity1);
      expect(result1.isValid).toBe(false);
      expect(result1.getErrors()[0].code).toBe('DURATION_TOO_SHORT');
      
      // Too long duration
      const entity2 = {
        startDate: '2024-01-01',
        endDate: '2024-03-01' // 60 days
      };
      const result2 = rule.validate(entity2);
      expect(result2.isValid).toBe(false);
      expect(result2.getErrors()[0].code).toBe('DURATION_TOO_LONG');
      
      // Valid duration
      const entity3 = {
        startDate: '2024-01-01',
        endDate: '2024-01-15' // 14 days
      };
      const result3 = rule.validate(entity3);
      expect(result3.isValid).toBe(true);
    });
    
    it('should skip validation for missing dates', () => {
      const rule = new DateRangeRule(
        'test.daterange',
        'startDate',
        'endDate'
      );
      
      const entity = { startDate: '2024-01-01' }; // Missing end date
      const result = rule.validate(entity);
      expect(result.isValid).toBe(true);
    });
  });
  
  describe('SumValidationRule', () => {
    it('should validate sum equals target value', () => {
      const rule = new SumValidationRule(
        'test.sum',
        ['amount1', 'amount2', 'amount3'],
        'equals',
        { value: 100 }
      );
      
      const entity1 = { amount1: 30, amount2: 40, amount3: 30 }; // Sum = 100
      const result1 = rule.validate(entity1);
      expect(result1.isValid).toBe(true);
      
      const entity2 = { amount1: 30, amount2: 40, amount3: 20 }; // Sum = 90
      const result2 = rule.validate(entity2);
      expect(result2.isValid).toBe(false);
      expect(result2.getErrors()[0].code).toBe('INVALID_SUM');
    });
    
    it('should validate sum against target field', () => {
      const rule = new SumValidationRule(
        'test.sum',
        ['item1', 'item2'],
        'equals',
        { field: 'total' }
      );
      
      const entity = {
        item1: 50,
        item2: 30,
        total: 80
      };
      const result = rule.validate(entity);
      expect(result.isValid).toBe(true);
    });
    
    it('should handle comparison operators', () => {
      const rule = new SumValidationRule(
        'test.sum',
        ['value1', 'value2'],
        'lessThan',
        { value: 100 }
      );
      
      const entity1 = { value1: 40, value2: 50 }; // Sum = 90 < 100
      const result1 = rule.validate(entity1);
      expect(result1.isValid).toBe(true);
      
      const entity2 = { value1: 60, value2: 50 }; // Sum = 110 > 100
      const result2 = rule.validate(entity2);
      expect(result2.isValid).toBe(false);
    });
    
    it('should warn about missing fields', () => {
      const rule = new SumValidationRule(
        'test.sum',
        ['amount1', 'amount2', 'amount3'],
        'equals',
        { value: 100 }
      );
      
      const entity = { amount1: 50, amount3: 50 }; // Missing amount2
      const result = rule.validate(entity);
      expect(result.hasWarnings()).toBe(true);
      expect(result.getWarnings()[0].code).toBe('MISSING_SUM_FIELDS');
    });
  });
  
  describe('MutuallyExclusiveRule', () => {
    it('should validate mutually exclusive field groups', () => {
      const rule = new MutuallyExclusiveRule(
        'test.exclusive',
        [
          ['creditCard', 'creditCardExpiry'],
          ['bankAccount', 'routingNumber']
        ]
      );
      
      // Valid - only credit card fields
      const entity1 = {
        creditCard: '1234-5678',
        creditCardExpiry: '12/25'
      };
      const result1 = rule.validate(entity1);
      expect(result1.isValid).toBe(true);
      
      // Invalid - both groups have values
      const entity2 = {
        creditCard: '1234-5678',
        bankAccount: '987654321'
      };
      const result2 = rule.validate(entity2);
      expect(result2.isValid).toBe(false);
      expect(result2.getErrors()[0].code).toBe('MUTUALLY_EXCLUSIVE_FIELDS');
    });
    
    it('should require at least one group when requireOne is true', () => {
      const rule = new MutuallyExclusiveRule(
        'test.exclusive',
        [
          ['option1'],
          ['option2'],
          ['option3']
        ],
        { requireOne: true }
      );
      
      // Invalid - no groups have values
      const entity1 = {};
      const result1 = rule.validate(entity1);
      expect(result1.isValid).toBe(false);
      expect(result1.getErrors()[0].code).toBe('REQUIRED_EXCLUSIVE_FIELD');
      
      // Valid - one group has value
      const entity2 = { option2: 'value' };
      const result2 = rule.validate(entity2);
      expect(result2.isValid).toBe(true);
    });
  });
  
  describe('DependentFieldsRule', () => {
    it('should validate dependent fields require primary field', () => {
      const rule = new DependentFieldsRule(
        'test.dependent',
        'email',
        ['emailVerified', 'emailPreferences']
      );
      
      // Valid - has primary field
      const entity1 = {
        email: 'test@example.com',
        emailVerified: true
      };
      const result1 = rule.validate(entity1);
      expect(result1.isValid).toBe(true);
      
      // Invalid - dependent field without primary
      const entity2 = {
        emailVerified: true
      };
      const result2 = rule.validate(entity2);
      expect(result2.isValid).toBe(false);
      expect(result2.getErrors()[0].code).toBe('MISSING_PRIMARY_FIELD');
    });
    
    it('should allow primary field without dependent fields', () => {
      const rule = new DependentFieldsRule(
        'test.dependent',
        'primaryField',
        ['dependent1', 'dependent2']
      );
      
      const entity = { primaryField: 'value' };
      const result = rule.validate(entity);
      expect(result.isValid).toBe(true);
    });
  });
  
  describe('PercentageSumRule', () => {
    it('should validate percentage fields sum to 100', () => {
      const rule = new PercentageSumRule(
        'test.percentage',
        ['allocation1', 'allocation2', 'allocation3']
      );
      
      // Valid - sums to 100
      const entity1 = {
        allocation1: 30,
        allocation2: 45,
        allocation3: 25
      };
      const result1 = rule.validate(entity1);
      expect(result1.isValid).toBe(true);
      
      // Invalid - sums to 90
      const entity2 = {
        allocation1: 30,
        allocation2: 40,
        allocation3: 20
      };
      const result2 = rule.validate(entity2);
      expect(result2.isValid).toBe(false);
      expect(result2.getErrors()[0].code).toBe('INVALID_PERCENTAGE_SUM');
    });
    
    it('should handle tolerance for floating point arithmetic', () => {
      const rule = new PercentageSumRule(
        'test.percentage',
        ['percent1', 'percent2', 'percent3'],
        { tolerance: 0.1 }
      );
      
      // Should pass with small rounding error
      const entity = {
        percent1: 33.33,
        percent2: 33.33,
        percent3: 33.34
      };
      const result = rule.validate(entity);
      expect(result.isValid).toBe(true);
    });
    
    it('should skip validation if no fields have values', () => {
      const rule = new PercentageSumRule(
        'test.percentage',
        ['allocation1', 'allocation2']
      );
      
      const entity = {};
      const result = rule.validate(entity);
      expect(result.isValid).toBe(true);
    });
    
    it('should validate even with some empty fields', () => {
      const rule = new PercentageSumRule(
        'test.percentage',
        ['allocation1', 'allocation2', 'allocation3']
      );
      
      const entity = {
        allocation1: 60,
        allocation2: 40
        // allocation3 is undefined
      };
      const result = rule.validate(entity);
      expect(result.isValid).toBe(true); // 60 + 40 = 100
    });
  });
});