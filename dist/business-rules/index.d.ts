/**
 * Business Rules Module
 *
 * Comprehensive business rule enforcement system for the Autotask SDK.
 * Provides validation, cross-field rules, entity-specific rules, and
 * seamless integration with the AutotaskClient.
 */
export * from './BusinessRule';
export * from './ValidationResult';
export * from './BusinessRuleEngine';
export * from './CrossFieldRules';
export * from './EntityRules';
export * from './RuleConfiguration';
export * from './ClientIntegration';
export { ValidationSeverity } from './ValidationResult';
export { RulePriority } from './BusinessRule';
export { BusinessRuleEngine, RuleEngineOptions, RuleExecutionStats } from './BusinessRuleEngine';
export { BusinessRuleConfig, RuleConfigurationManager, DefaultRuleConfiguration } from './RuleConfiguration';
export { BusinessRuleMiddleware, BusinessRuleEnhancedClient, ValidationError, ValidateEntity } from './ClientIntegration';
//# sourceMappingURL=index.d.ts.map