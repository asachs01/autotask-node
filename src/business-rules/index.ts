/**
 * Business Rules Module
 * 
 * Comprehensive business rule enforcement system for the Autotask SDK.
 * Provides validation, cross-field rules, entity-specific rules, and
 * seamless integration with the AutotaskClient.
 */

// Core components
export * from './BusinessRule';
export * from './ValidationResult';
export * from './BusinessRuleEngine';

// Rule types
export * from './CrossFieldRules';
export * from './EntityRules';

// Configuration
export * from './RuleConfiguration';

// Client integration
export * from './ClientIntegration';

// Re-export commonly used types and classes for convenience
export { ValidationSeverity } from './ValidationResult';
export { RulePriority } from './BusinessRule';
export { 
  BusinessRuleEngine,
  RuleEngineOptions,
  RuleExecutionStats 
} from './BusinessRuleEngine';
export {
  BusinessRuleConfig,
  RuleConfigurationManager,
  DefaultRuleConfiguration
} from './RuleConfiguration';
export {
  BusinessRuleMiddleware,
  BusinessRuleEnhancedClient,
  ValidationError,
  ValidateEntity
} from './ClientIntegration';