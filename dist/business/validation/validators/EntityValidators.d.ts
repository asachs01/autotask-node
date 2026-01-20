import { EntityValidator, ValidationResult, ValidationError } from '../index';
/**
 * Entity-level validators for business rules and state consistency
 */
export declare abstract class BaseEntityValidator implements EntityValidator {
    abstract name: string;
    abstract entityType: string;
    abstract validate(entity: any, context?: any): ValidationResult;
    protected createError(field: string, message: string, code: string, suggestedFix?: string, context?: Record<string, any>): ValidationError;
    protected createWarning(field: string, message: string, code: string, suggestedAction?: string): {
        field: string;
        message: string;
        code: string;
        suggestedAction: string | undefined;
    };
}
export declare class TicketStatusWorkflowValidator extends BaseEntityValidator {
    name: string;
    entityType: string;
    private readonly validTransitions;
    validate(entity: any, context?: any): ValidationResult;
}
export declare class TicketSLAValidator extends BaseEntityValidator {
    name: string;
    entityType: string;
    validate(entity: any, context?: any): ValidationResult;
}
export declare class CompanyHierarchyValidator extends BaseEntityValidator {
    name: string;
    entityType: string;
    validate(entity: any, context?: any): ValidationResult;
}
export declare class ContactMultiCompanyValidator extends BaseEntityValidator {
    name: string;
    entityType: string;
    validate(entity: any, context?: any): ValidationResult;
}
export declare class TimeEntryBillingValidator extends BaseEntityValidator {
    name: string;
    entityType: string;
    validate(entity: any, context?: any): ValidationResult;
}
export declare class ContractServiceValidator extends BaseEntityValidator {
    name: string;
    entityType: string;
    validate(entity: any, context?: any): ValidationResult;
}
export declare class ProjectResourceValidator extends BaseEntityValidator {
    name: string;
    entityType: string;
    validate(entity: any, context?: any): ValidationResult;
}
//# sourceMappingURL=EntityValidators.d.ts.map