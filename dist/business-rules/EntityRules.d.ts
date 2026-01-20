/**
 * Entity-Specific Business Rules for Autotask
 *
 * Implements business rules specific to Autotask entities
 * like Tickets, Companies, Contacts, Projects, etc.
 */
import { BusinessRule } from './BusinessRule';
/**
 * Ticket-specific validation rules
 */
export declare class TicketBusinessRules {
    static createRules(): BusinessRule[];
}
/**
 * Company-specific validation rules
 */
export declare class CompanyBusinessRules {
    static createRules(): BusinessRule[];
}
/**
 * Contact-specific validation rules
 */
export declare class ContactBusinessRules {
    static createRules(): BusinessRule[];
}
/**
 * Project-specific validation rules
 */
export declare class ProjectBusinessRules {
    static createRules(): BusinessRule[];
}
/**
 * Contract-specific validation rules
 */
export declare class ContractBusinessRules {
    static createRules(): BusinessRule[];
}
/**
 * Task-specific validation rules
 */
export declare class TaskBusinessRules {
    static createRules(): BusinessRule[];
}
/**
 * Time entry validation rules
 */
export declare class TimeEntryBusinessRules {
    static createRules(): BusinessRule[];
}
/**
 * Factory class to create entity-specific rules
 */
export declare class EntityRuleFactory {
    private static ruleMap;
    /**
     * Get rules for a specific entity type
     */
    static getRulesForEntity(entityType: string): BusinessRule[];
    /**
     * Get all available entity rules
     */
    static getAllRules(): Map<string, BusinessRule[]>;
    /**
     * Register custom rules for an entity type
     */
    static registerEntityRules(entityType: string, rulesFactory: () => BusinessRule[]): void;
}
//# sourceMappingURL=EntityRules.d.ts.map