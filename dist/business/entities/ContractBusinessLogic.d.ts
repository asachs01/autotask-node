import { BusinessLogicEngine } from '../core/BusinessLogicEngine';
import { ValidationResult } from '../validation';
/**
 * Contract-specific business logic for service validation, billing rules, and renewal tracking
 */
export declare class ContractBusinessLogic {
    private businessEngine;
    constructor(businessEngine: BusinessLogicEngine);
    /**
     * Contract statuses with business implications
     */
    private readonly CONTRACT_STATUSES;
    /**
     * Contract types with different billing models
     */
    private readonly CONTRACT_TYPES;
    /**
     * Validate and process contract creation with comprehensive service validation
     */
    createContract(contractData: any, context?: {
        user?: any;
        company?: any;
        services?: any[];
        billingRules?: any[];
        parentContract?: any;
    }): Promise<{
        isValid: boolean;
        validationResult: ValidationResult;
        processedContract: any;
        serviceValidation: {
            validServices: any[];
            invalidServices: any[];
            missingServices: string[];
            conflicts: string[];
        };
        billingProjections: {
            monthlyRecurring: number;
            annualValue: number;
            variableComponents: any[];
        };
        suggestedActions: string[];
    }>;
    /**
     * Process contract renewal with intelligent recommendations
     */
    processContractRenewal(contractId: number, currentContract: any, renewalOptions: {
        proposedStartDate: string;
        proposedEndDate: string;
        priceAdjustment?: number;
        serviceChanges?: any[];
        autoRenewal?: boolean;
    }, context?: {
        user?: any;
        usageAnalytics?: any;
        performanceMetrics?: any;
    }): Promise<{
        isValid: boolean;
        validationResult: ValidationResult;
        renewalAnalysis: {
            recommendedChanges: any[];
            pricingRecommendations: any[];
            serviceOptimizations: any[];
            riskFactors: string[];
        };
        processedRenewal: any;
        approvalRequired: boolean;
    }>;
    /**
     * Validate contract billing rules and rates
     */
    validateBillingConfiguration(contractData: any, billingRules: {
        hourlyRates?: Record<string, number>;
        serviceBundles?: any[];
        discountRules?: any[];
        escalationClauses?: any[];
    }, context?: {
        previousRates?: Record<string, number>;
        marketRates?: Record<string, number>;
    }): Promise<{
        validRules: any[];
        invalidRules: any[];
        rateAnalysis: {
            competitivePosition: 'below' | 'at' | 'above';
            marginAnalysis: any[];
            rateIncreases: any[];
        };
        recommendations: string[];
        warnings: string[];
    }>;
    /**
     * Calculate contract utilization and performance metrics
     */
    calculateContractMetrics(contract: any, usage: {
        timeEntries?: any[];
        serviceConsumption?: any[];
        billingData?: any[];
        supportTickets?: any[];
    }): {
        utilizationRate: number;
        budgetConsumption: {
            hoursUsed: number;
            totalHours: number;
            percentageUsed: number;
            projectedOverrun: number;
        };
        financialMetrics: {
            totalBilled: number;
            totalCost: number;
            grossMargin: number;
            profitability: number;
        };
        serviceMetrics: {
            averageResponseTime: number;
            customerSatisfaction: number;
            slaCompliance: number;
        };
        healthScore: number;
    };
    /**
     * Apply business logic during contract creation
     */
    private applyContractCreationLogic;
    /**
     * Validate contract services and configurations
     */
    private validateContractServices;
    /**
     * Calculate billing projections
     */
    private calculateBillingProjections;
    /**
     * Analyze renewal opportunity
     */
    private analyzeRenewalOpportunity;
    /**
     * Check if renewal requires approval
     */
    private requiresRenewalApproval;
    /**
     * Validate individual service
     */
    private validateIndividualService;
    /**
     * Get required services for contract type
     */
    private getRequiredServices;
    /**
     * Validate service bundle
     */
    private validateServiceBundle;
    /**
     * Analyze rate competitiveness
     */
    private analyzeRateCompetitiveness;
    /**
     * Calculate contract health score
     */
    private calculateContractHealthScore;
}
//# sourceMappingURL=ContractBusinessLogic.d.ts.map