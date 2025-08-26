import {
  FieldValidator,
  EntityValidator,
  CrossEntityValidator,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '../validation';

/**
 * Central validation engine that orchestrates all validation operations
 */
export class ValidationEngine {
  private fieldValidators = new Map<string, FieldValidator[]>();
  private entityValidators = new Map<string, EntityValidator[]>();
  private crossEntityValidators: CrossEntityValidator[] = [];
  
  /**
   * Register a field validator for a specific entity and field
   */
  registerFieldValidator(entityType: string, fieldName: string, validator: FieldValidator): void {
    const key = `${entityType}.${fieldName}`;
    if (!this.fieldValidators.has(key)) {
      this.fieldValidators.set(key, []);
    }
    this.fieldValidators.get(key)!.push(validator);
  }
  
  /**
   * Register an entity validator for a specific entity type
   */
  registerEntityValidator(validator: EntityValidator): void {
    if (!this.entityValidators.has(validator.entityType)) {
      this.entityValidators.set(validator.entityType, []);
    }
    this.entityValidators.get(validator.entityType)!.push(validator);
  }
  
  /**
   * Register a cross-entity validator
   */
  registerCrossEntityValidator(validator: CrossEntityValidator): void {
    this.crossEntityValidators.push(validator);
  }
  
  /**
   * Validate a single field value
   */
  validateField(
    entityType: string,
    fieldName: string,
    value: any,
    context?: any
  ): ValidationResult {
    const key = `${entityType}.${fieldName}`;
    const validators = this.fieldValidators.get(key) || [];
    
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    
    for (const validator of validators) {
      try {
        const result = validator.validate(value, context);
        
        // Add field name to errors/warnings
        result.errors.forEach(error => {
          error.field = fieldName;
          allErrors.push(error);
        });
        
        result.warnings.forEach(warning => {
          warning.field = fieldName;
          allWarnings.push(warning);
        });
        
        // Stop on first error if configured to do so
        if (!result.isValid && validator.config?.severity === 'error') {
          break;
        }
      } catch (error) {
        // Handle validator errors gracefully
        allErrors.push({
          field: fieldName,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALIDATOR_ERROR',
          severity: 'error'
        });
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
  
  /**
   * Validate an entire entity
   */
  validateEntity(entityType: string, entity: any, context?: any): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    
    // First, validate individual fields
    for (const [fieldName, value] of Object.entries(entity)) {
      const fieldResult = this.validateField(entityType, fieldName, value, entity);
      allErrors.push(...fieldResult.errors);
      allWarnings.push(...fieldResult.warnings);
    }
    
    // Then, validate entity-level rules
    const entityValidators = this.entityValidators.get(entityType) || [];
    
    for (const validator of entityValidators) {
      try {
        const result = validator.validate(entity, context);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      } catch (error) {
        allErrors.push({
          field: 'entity',
          message: `Entity validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'ENTITY_VALIDATOR_ERROR',
          severity: 'error'
        });
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
  
  /**
   * Validate relationships between multiple entities
   */
  validateCrossEntity(entities: Record<string, any>, context?: any): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    
    for (const validator of this.crossEntityValidators) {
      // Check if all required entities are present
      const hasRequiredEntities = validator.entities.every(
        entityType => entities[entityType] !== undefined
      );
      
      if (!hasRequiredEntities) {
        continue; // Skip this validator if not all entities are present
      }
      
      try {
        const result = validator.validate(entities, context);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      } catch (error) {
        allErrors.push({
          field: 'entities',
          message: `Cross-entity validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'CROSS_ENTITY_VALIDATOR_ERROR',
          severity: 'error'
        });
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
  
  /**
   * Comprehensive validation that runs field, entity, and cross-entity validation
   */
  validateComplete(
    primaryEntityType: string,
    primaryEntity: any,
    relatedEntities: Record<string, any> = {},
    context?: any
  ): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    
    // 1. Validate primary entity
    const primaryResult = this.validateEntity(primaryEntityType, primaryEntity, context);
    allErrors.push(...primaryResult.errors);
    allWarnings.push(...primaryResult.warnings);
    
    // 2. Validate related entities
    for (const [entityType, entity] of Object.entries(relatedEntities)) {
      const entityResult = this.validateEntity(entityType, entity, context);
      allErrors.push(...entityResult.errors);
      allWarnings.push(...entityResult.warnings);
    }
    
    // 3. Validate cross-entity relationships
    const allEntities = {
      [primaryEntityType]: primaryEntity,
      ...relatedEntities
    };
    
    const crossEntityResult = this.validateCrossEntity(allEntities, context);
    allErrors.push(...crossEntityResult.errors);
    allWarnings.push(...crossEntityResult.warnings);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
  
  /**
   * Get validation summary with counts and severity breakdown
   */
  getValidationSummary(result: ValidationResult): {
    isValid: boolean;
    totalErrors: number;
    totalWarnings: number;
    errorsBySeverity: Record<string, number>;
    errorsByCode: Record<string, number>;
  } {
    const errorsBySeverity: Record<string, number> = {};
    const errorsByCode: Record<string, number> = {};
    
    result.errors.forEach(error => {
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1;
    });
    
    return {
      isValid: result.isValid,
      totalErrors: result.errors.length,
      totalWarnings: result.warnings.length,
      errorsBySeverity,
      errorsByCode
    };
  }
}