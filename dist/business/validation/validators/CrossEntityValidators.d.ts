import { CrossEntityValidator, ValidationResult, ValidationError } from '../index';
/**
 * Cross-entity validators for relationships and referential integrity
 */
export declare abstract class BaseCrossEntityValidator implements CrossEntityValidator {
    abstract name: string;
    abstract entities: string[];
    abstract validate(entities: Record<string, any>, context?: any): ValidationResult;
    protected createError(field: string, message: string, code: string, suggestedFix?: string, context?: Record<string, any>): ValidationError;
    protected createWarning(field: string, message: string, code: string, suggestedAction?: string): {
        field: string;
        message: string;
        code: string;
        suggestedAction: string | undefined;
    };
}
export declare class TicketCompanyContactValidator extends BaseCrossEntityValidator {
    name: string;
    entities: string[];
    validate(entities: Record<string, any>, context?: any): ValidationResult;
}
export declare class TimeEntryProjectTicketValidator extends BaseCrossEntityValidator {
    name: string;
    entities: string[];
    validate(entities: Record<string, any>, context?: any): ValidationResult;
}
export declare class ContractCompanyServiceValidator extends BaseCrossEntityValidator {
    name: string;
    entities: string[];
    validate(entities: Record<string, any>, context?: any): ValidationResult;
}
export declare class ProjectCompanyResourceValidator extends BaseCrossEntityValidator {
    name: string;
    entities: string[];
    validate(entities: Record<string, any>, context?: any): ValidationResult;
}
export declare class BillingCodeContractValidator extends BaseCrossEntityValidator {
    name: string;
    entities: string[];
    validate(entities: Record<string, any>, context?: any): ValidationResult;
}
export declare class ConfigurationItemCompanyValidator extends BaseCrossEntityValidator {
    name: string;
    entities: string[];
    validate(entities: Record<string, any>, context?: any): ValidationResult;
}
export declare class ServiceCallResourceValidator extends BaseCrossEntityValidator {
    name: string;
    entities: string[];
    validate(entities: Record<string, any>, context?: any): ValidationResult;
}
//# sourceMappingURL=CrossEntityValidators.d.ts.map