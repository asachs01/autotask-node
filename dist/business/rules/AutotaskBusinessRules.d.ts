/**
 * Autotask-specific business rules and configurations
 *
 * This file contains the comprehensive business rules that govern
 * Autotask entity behavior, workflows, and validations.
 */
import { BusinessRule } from './index';
/**
 * Autotask business rules registry
 */
export declare class AutotaskBusinessRules {
    private static rules;
    /**
     * Initialize default Autotask business rules
     */
    static initialize(): void;
    /**
     * Register a business rule
     */
    static registerRule(rule: BusinessRule): void;
    /**
     * Get a business rule by ID
     */
    static getRule(ruleId: string): BusinessRule | undefined;
    /**
     * Get all rules for an entity type
     */
    static getRulesForEntity(entityType: string): BusinessRule[];
    /**
     * Get rules by type
     */
    static getRulesByType(ruleType: string): BusinessRule[];
    /**
     * Register ticket-specific business rules
     */
    private static registerTicketRules;
    /**
     * Register time entry business rules
     */
    private static registerTimeEntryRules;
    /**
     * Register contract business rules
     */
    private static registerContractRules;
    /**
     * Register company business rules
     */
    private static registerCompanyRules;
    /**
     * Register contact business rules
     */
    private static registerContactRules;
    /**
     * Register project business rules
     */
    private static registerProjectRules;
}
//# sourceMappingURL=AutotaskBusinessRules.d.ts.map