import { BusinessLogicEngine } from '../core/BusinessLogicEngine';
import { ValidationResult } from '../validation';
/**
 * Company-specific business logic for account hierarchy, location management, and compliance
 */
export declare class CompanyBusinessLogic {
    private businessEngine;
    constructor(businessEngine: BusinessLogicEngine);
    /**
     * Company types with different business rules
     */
    private readonly COMPANY_TYPES;
    /**
     * Validate and process company creation with hierarchy validation
     */
    createCompany(companyData: any, context?: {
        user?: any;
        parentCompany?: any;
        defaultSettings?: any;
    }): Promise<{
        isValid: boolean;
        validationResult: ValidationResult;
        processedCompany: any;
        hierarchyValidation: {
            hasCircularReference: boolean;
            maxDepthExceeded: boolean;
            conflictingParents: string[];
        };
        suggestedActions: string[];
    }>;
    /**
     * Validate company hierarchy to prevent circular references and excessive depth
     */
    validateCompanyHierarchy(companyData: any, context?: {
        parentCompany?: any;
        allCompanies?: any[];
    }): Promise<{
        hasCircularReference: boolean;
        maxDepthExceeded: boolean;
        conflictingParents: string[];
        hierarchyDepth: number;
    }>;
    /**
     * Manage company locations and ensure business compliance
     */
    manageCompanyLocations(companyId: number, locations: any[], context?: {
        primaryLocationRequired?: boolean;
        taxJurisdictions?: any[];
    }): Promise<{
        validLocations: any[];
        invalidLocations: any[];
        taxImplications: {
            location: any;
            taxJurisdiction: string;
            requiresRegistration: boolean;
        }[];
        complianceWarnings: string[];
    }>;
    /**
     * Calculate company health score based on various metrics
     */
    calculateCompanyHealthScore(company: any, metrics: {
        ticketCount?: number;
        averageTicketResolutionTime?: number;
        contractValue?: number;
        outstandingInvoiceAmount?: number;
        lastActivityDate?: string;
        satisfactionScore?: number;
    }): {
        overallScore: number;
        breakdown: {
            activity: number;
            financial: number;
            support: number;
            satisfaction: number;
        };
        riskFactors: string[];
        recommendations: string[];
    };
    /**
     * Generate company compliance report
     */
    generateComplianceReport(company: any, requirements: {
        dataProtection?: boolean;
        financialReporting?: boolean;
        industrySpecific?: string[];
    }): {
        complianceScore: number;
        requiredActions: {
            priority: 'high' | 'medium' | 'low';
            action: string;
            deadline?: string;
        }[];
        certifications: {
            name: string;
            status: 'valid' | 'expired' | 'missing';
            expiryDate?: string;
        }[];
        recommendations: string[];
    };
    /**
     * Apply business logic during company creation
     */
    private applyCompanyCreationLogic;
    /**
     * Validate individual location data
     */
    private validateLocation;
    /**
     * Determine tax jurisdiction for location
     */
    private determineTaxJurisdiction;
    /**
     * Validate postal code format by country
     */
    private validatePostalCode;
    /**
     * Determine territory from country (simplified mapping)
     */
    private determineTerritoryFromCountry;
}
//# sourceMappingURL=CompanyBusinessLogic.d.ts.map