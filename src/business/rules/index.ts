/**
 * Business rules and configuration for Autotask entities
 * 
 * This module contains the business rules that define how Autotask
 * entities should behave, including workflow rules, validation rules,
 * and business logic configurations.
 */

export * from './AutotaskBusinessRules';

// Common business rule types and interfaces
export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  entityType: string;
  ruleType: 'validation' | 'workflow' | 'calculation' | 'automation';
  enabled: boolean;
  priority: number;
  conditions: BusinessRuleCondition[];
  actions: BusinessRuleAction[];
}

export interface BusinessRuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface BusinessRuleAction {
  type: 'set_field' | 'calculate' | 'validate' | 'trigger_workflow' | 'send_notification';
  target: string;
  value?: any;
  formula?: string;
  workflowId?: string;
  notificationTemplate?: string;
}