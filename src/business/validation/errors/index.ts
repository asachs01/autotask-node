/**
 * Enhanced error handling system for Autotask business logic
 */

export * from './BusinessLogicErrors';

export {
  BusinessLogicError,
  ValidationError,
  WorkflowError,
  PermissionError,
  BusinessRuleViolationError,
  DataIntegrityError,
  ConfigurationError,
  ErrorFactory,
  ErrorAggregator
} from './BusinessLogicErrors';