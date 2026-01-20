import { BusinessLogicEngine } from '../core/BusinessLogicEngine';
import { ValidationResult } from '../validation';
/**
 * Contact-specific business logic for role permissions, multi-company associations, and communication preferences
 */
export declare class ContactBusinessLogic {
    private businessEngine;
    constructor(businessEngine: BusinessLogicEngine);
    /**
     * Contact types with different access levels
     */
    private readonly CONTACT_TYPES;
    /**
     * Permission levels for portal access
     */
    private readonly PERMISSION_LEVELS;
    /**
     * Validate and process contact creation with role and permission validation
     */
    createContact(contactData: any, context?: {
        user?: any;
        company?: any;
        parentContact?: any;
        defaultPermissions?: any;
    }): Promise<{
        isValid: boolean;
        validationResult: ValidationResult;
        processedContact: any;
        permissionAnalysis: {
            recommendedPermissions: string[];
            securityWarnings: string[];
            accessLimitations: string[];
        };
        suggestedActions: string[];
    }>;
    /**
     * Manage contact role assignments and permissions
     */
    assignContactRole(contactId: number, roleType: number, permissions: string[], context?: {
        currentContact?: any;
        company?: any;
        requestingUser?: any;
    }): Promise<{
        isValid: boolean;
        validationResult: ValidationResult;
        roleConflicts: string[];
        securityImplications: {
            privilegeEscalation: boolean;
            dataAccessChanges: string[];
            notificationRequired: boolean;
        };
        approvalRequired: boolean;
    }>;
    /**
     * Manage multi-company contact associations
     */
    manageMultiCompanyAssociation(contactId: number, companyAssociations: {
        companyId: number;
        role: string;
        permissions: string[];
        isPrimary: boolean;
    }[], context?: {
        currentAssociations?: any[];
        securityLevel?: 'standard' | 'high' | 'enterprise';
    }): Promise<{
        validAssociations: any[];
        invalidAssociations: any[];
        securityWarnings: string[];
        conflictResolution: {
            duplicateRoles: any[];
            multiplePrimaries: boolean;
            permissionConflicts: any[];
        };
        recommendations: string[];
    }>;
    /**
     * Generate contact communication preferences and compliance
     */
    manageCommuncationPreferences(contact: any, preferences: {
        emailMarketing: boolean;
        smsNotifications: boolean;
        phoneContact: boolean;
        preferredLanguage: string;
        timezone: string;
        optInDate?: string;
        optOutRequests?: string[];
    }, complianceRequirements?: {
        gdprRequired: boolean;
        ccpaRequired: boolean;
        canSpamCompliance: boolean;
    }): {
        validPreferences: any;
        complianceStatus: {
            gdprCompliant: boolean;
            ccpaCompliant: boolean;
            canSpamCompliant: boolean;
            requiredActions: string[];
        };
        communicationPlan: {
            allowedChannels: string[];
            restrictions: string[];
            bestTimeToContact: string;
        };
    };
    /**
     * Generate contact activity and engagement analytics
     */
    generateContactAnalytics(contact: any, activities: {
        tickets?: any[];
        communications?: any[];
        portalLogins?: any[];
        surveyResponses?: any[];
    }): {
        engagementScore: number;
        activityBreakdown: {
            ticketsCreated: number;
            communicationsReceived: number;
            portalLogins: number;
            surveysCompleted: number;
            lastActivityDate: string;
        };
        preferences: {
            preferredContactMethod: string;
            responseRate: number;
            averageResponseTime: number;
        };
        riskFactors: string[];
        recommendations: string[];
    };
    /**
     * Apply business logic during contact creation
     */
    private applyContactCreationLogic;
    /**
     * Analyze contact permissions and security implications
     */
    private analyzeContactPermissions;
    /**
     * Check for role conflicts
     */
    private checkRoleConflicts;
    /**
     * Analyze security implications of role changes
     */
    private analyzeSecurityImplications;
    /**
     * Determine if role change requires approval
     */
    private requiresRoleApproval;
    /**
     * Check if there's privilege escalation
     */
    private hasPrivilegeEscalation;
    /**
     * Validate company association
     */
    private validateCompanyAssociation;
    /**
     * Calculate best contact time based on timezone
     */
    private calculateBestContactTime;
    /**
     * Find the most recent activity date
     */
    private findLastActivityDate;
    /**
     * Analyze communication patterns
     */
    private analyzeCommuncationPatterns;
}
//# sourceMappingURL=ContactBusinessLogic.d.ts.map