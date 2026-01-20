"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactBusinessLogic = void 0;
/**
 * Contact-specific business logic for role permissions, multi-company associations, and communication preferences
 */
class ContactBusinessLogic {
    constructor(businessEngine) {
        this.businessEngine = businessEngine;
        /**
         * Contact types with different access levels
         */
        this.CONTACT_TYPES = {
            PRIMARY: 1,
            BILLING: 2,
            TECHNICAL: 3,
            ADMIN: 4,
            GENERAL: 5
        };
        /**
         * Permission levels for portal access
         */
        this.PERMISSION_LEVELS = {
            NONE: 0,
            READ_ONLY: 1,
            LIMITED: 2,
            FULL: 3,
            ADMIN: 4
        };
    }
    /**
     * Validate and process contact creation with role and permission validation
     */
    async createContact(contactData, context) {
        // Validate the contact data
        const result = await this.businessEngine.processBusinessRules('create', 'Contacts', contactData, {
            ...context,
            relatedEntities: {
                Companies: context?.company
            }
        });
        // Analyze permissions and security implications
        const permissionAnalysis = this.analyzeContactPermissions(contactData, context);
        // Apply contact-specific business logic
        const processedContact = this.applyContactCreationLogic(contactData, context);
        return {
            isValid: result.isAllowed,
            validationResult: result.validationResult,
            processedContact: result.transformedEntity || processedContact,
            permissionAnalysis,
            suggestedActions: result.suggestedActions || []
        };
    }
    /**
     * Manage contact role assignments and permissions
     */
    async assignContactRole(contactId, roleType, permissions, context) {
        const currentContact = context?.currentContact || {};
        const updatedContact = {
            ...currentContact,
            contactType: roleType,
            permissions: permissions
        };
        const result = await this.businessEngine.processBusinessRules('update', 'Contacts', updatedContact, {
            previousEntity: currentContact,
            user: context?.requestingUser
        });
        // Check for role conflicts
        const roleConflicts = this.checkRoleConflicts(roleType, currentContact, context);
        // Analyze security implications
        const securityImplications = this.analyzeSecurityImplications(currentContact, updatedContact, context);
        // Determine if approval is required
        const approvalRequired = this.requiresRoleApproval(currentContact, updatedContact, context);
        return {
            isValid: result.isAllowed && roleConflicts.length === 0,
            validationResult: result.validationResult,
            roleConflicts,
            securityImplications,
            approvalRequired
        };
    }
    /**
     * Manage multi-company contact associations
     */
    async manageMultiCompanyAssociation(contactId, companyAssociations, context) {
        const validAssociations = [];
        const invalidAssociations = [];
        const securityWarnings = [];
        const recommendations = [];
        let primaryCount = 0;
        const rolesByCompany = {};
        const duplicateRoles = [];
        const permissionConflicts = [];
        // Validate each association
        for (const association of companyAssociations) {
            const validation = await this.validateCompanyAssociation(association, context);
            if (validation.isValid) {
                validAssociations.push(association);
                // Track primary associations
                if (association.isPrimary) {
                    primaryCount++;
                }
                // Track roles by company
                if (!rolesByCompany[association.companyId]) {
                    rolesByCompany[association.companyId] = [];
                }
                rolesByCompany[association.companyId].push(association.role);
                // Check for security warnings
                if (association.permissions.includes('admin') && context?.securityLevel !== 'enterprise') {
                    securityWarnings.push(`Admin permissions granted for company ${association.companyId}`);
                }
            }
            else {
                invalidAssociations.push({
                    association,
                    errors: validation.errors
                });
            }
        }
        // Check for conflicts
        if (primaryCount > 1) {
            recommendations.push('Designate only one primary company association');
        }
        if (primaryCount === 0 && validAssociations.length > 0) {
            recommendations.push('Consider designating a primary company association');
        }
        // Check for duplicate roles within companies
        Object.entries(rolesByCompany).forEach(([companyId, roles]) => {
            const uniqueRoles = new Set(roles);
            if (uniqueRoles.size < roles.length) {
                duplicateRoles.push({
                    companyId: Number(companyId),
                    duplicatedRoles: roles.filter((role, index) => roles.indexOf(role) !== index)
                });
            }
        });
        return {
            validAssociations,
            invalidAssociations,
            securityWarnings,
            conflictResolution: {
                duplicateRoles,
                multiplePrimaries: primaryCount > 1,
                permissionConflicts
            },
            recommendations
        };
    }
    /**
     * Generate contact communication preferences and compliance
     */
    manageCommuncationPreferences(contact, preferences, complianceRequirements) {
        const validPreferences = { ...preferences };
        const requiredActions = [];
        // GDPR compliance checks
        let gdprCompliant = true;
        if (complianceRequirements?.gdprRequired) {
            if (!preferences.optInDate && preferences.emailMarketing) {
                gdprCompliant = false;
                requiredActions.push('Obtain explicit consent for email marketing');
            }
        }
        // CCPA compliance checks
        let ccpaCompliant = true;
        if (complianceRequirements?.ccpaRequired) {
            if (!contact.privacyPolicyAccepted) {
                ccpaCompliant = false;
                requiredActions.push('Obtain privacy policy acceptance');
            }
        }
        // CAN-SPAM compliance
        let canSpamCompliant = true;
        if (complianceRequirements?.canSpamCompliance && preferences.emailMarketing) {
            if (!contact.physicalAddress) {
                canSpamCompliant = false;
                requiredActions.push('Physical address required for email marketing compliance');
            }
        }
        // Determine allowed channels
        const allowedChannels = [];
        const restrictions = [];
        if (preferences.emailMarketing && gdprCompliant && canSpamCompliant) {
            allowedChannels.push('email_marketing');
        }
        else if (!preferences.emailMarketing) {
            restrictions.push('No marketing emails per contact preference');
        }
        if (preferences.smsNotifications) {
            allowedChannels.push('sms');
        }
        if (preferences.phoneContact) {
            allowedChannels.push('phone');
        }
        // Always allow essential notifications
        allowedChannels.push('email_essential');
        // Determine best time to contact based on timezone
        const bestTimeToContact = this.calculateBestContactTime(preferences.timezone);
        return {
            validPreferences,
            complianceStatus: {
                gdprCompliant,
                ccpaCompliant,
                canSpamCompliant,
                requiredActions
            },
            communicationPlan: {
                allowedChannels,
                restrictions,
                bestTimeToContact
            }
        };
    }
    /**
     * Generate contact activity and engagement analytics
     */
    generateContactAnalytics(contact, activities) {
        let engagementScore = 0;
        const riskFactors = [];
        const recommendations = [];
        const activityBreakdown = {
            ticketsCreated: activities.tickets?.length || 0,
            communicationsReceived: activities.communications?.length || 0,
            portalLogins: activities.portalLogins?.length || 0,
            surveysCompleted: activities.surveyResponses?.length || 0,
            lastActivityDate: this.findLastActivityDate(activities)
        };
        // Calculate engagement score
        engagementScore += Math.min(25, activityBreakdown.ticketsCreated * 5); // Max 25 points for tickets
        engagementScore += Math.min(20, activityBreakdown.portalLogins * 2); // Max 20 points for logins
        engagementScore += Math.min(15, activityBreakdown.surveysCompleted * 5); // Max 15 points for surveys
        engagementScore += Math.min(20, activityBreakdown.communicationsReceived * 1); // Max 20 points for comms
        // Recent activity bonus
        if (activityBreakdown.lastActivityDate) {
            const daysSinceActivity = Math.floor((new Date().getTime() - new Date(activityBreakdown.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceActivity <= 30) {
                engagementScore += 20;
            }
            else if (daysSinceActivity <= 90) {
                engagementScore += 10;
            }
            else {
                riskFactors.push('Low recent activity');
                recommendations.push('Schedule engagement call');
            }
        }
        // Analyze communication preferences
        const preferences = this.analyzeCommuncationPatterns(activities.communications || []);
        // Risk factor analysis
        if (activityBreakdown.ticketsCreated > 10 && preferences.responseRate < 0.5) {
            riskFactors.push('High ticket volume with low communication response rate');
            recommendations.push('Consider alternative communication methods');
        }
        if (activityBreakdown.portalLogins === 0 && contact.portalActive) {
            riskFactors.push('Portal access granted but never used');
            recommendations.push('Provide portal training or disable access');
        }
        return {
            engagementScore: Math.min(100, engagementScore),
            activityBreakdown,
            preferences,
            riskFactors,
            recommendations
        };
    }
    /**
     * Apply business logic during contact creation
     */
    applyContactCreationLogic(contactData, context) {
        const processed = { ...contactData };
        // Set default contact type if not specified
        if (!processed.contactType) {
            processed.contactType = this.CONTACT_TYPES.GENERAL;
        }
        // Auto-determine if this should be a primary contact
        if (context?.company && !processed.isPrimary) {
            // Check if company already has a primary contact
            processed._checkPrimaryContactNeeded = true;
        }
        // Set default communication preferences
        if (!processed.communicationPreferences) {
            processed.communicationPreferences = {
                emailMarketing: false, // Opt-in required
                emailEssential: true,
                phoneContact: true,
                smsNotifications: false
            };
        }
        // Default to active unless specified otherwise
        processed.isActive = processed.isActive !== false;
        // Set creation metadata
        processed.createdDate = new Date().toISOString();
        return processed;
    }
    /**
     * Analyze contact permissions and security implications
     */
    analyzeContactPermissions(contactData, context) {
        const recommendedPermissions = [];
        const securityWarnings = [];
        const accessLimitations = [];
        // Based on contact type, recommend appropriate permissions
        switch (contactData.contactType) {
            case this.CONTACT_TYPES.PRIMARY:
                recommendedPermissions.push('view_all_tickets', 'create_tickets', 'view_billing');
                break;
            case this.CONTACT_TYPES.BILLING:
                recommendedPermissions.push('view_billing', 'view_invoices', 'make_payments');
                accessLimitations.push('No access to technical tickets');
                break;
            case this.CONTACT_TYPES.TECHNICAL:
                recommendedPermissions.push('view_tech_tickets', 'create_tickets', 'view_assets');
                accessLimitations.push('No access to billing information');
                break;
            case this.CONTACT_TYPES.ADMIN:
                recommendedPermissions.push('admin_access', 'manage_users', 'view_all_data');
                securityWarnings.push('Admin access grants extensive permissions');
                break;
            default:
                recommendedPermissions.push('view_own_tickets', 'create_tickets');
                accessLimitations.push('Limited to own tickets only');
        }
        // Check for risky combinations
        if (contactData.portalAccess && !contactData.mfaEnabled) {
            securityWarnings.push('Portal access without MFA enabled');
        }
        return {
            recommendedPermissions,
            securityWarnings,
            accessLimitations
        };
    }
    /**
     * Check for role conflicts
     */
    checkRoleConflicts(roleType, currentContact, context) {
        const conflicts = [];
        // Check if assigning primary contact role when one already exists
        if (roleType === this.CONTACT_TYPES.PRIMARY && context?.company) {
            if (context.company.primaryContactId && context.company.primaryContactId !== currentContact.id) {
                conflicts.push('Company already has a primary contact');
            }
        }
        return conflicts;
    }
    /**
     * Analyze security implications of role changes
     */
    analyzeSecurityImplications(currentContact, updatedContact, context) {
        const currentPermissions = currentContact.permissions || [];
        const newPermissions = updatedContact.permissions || [];
        // Check for privilege escalation
        const privilegeEscalation = this.hasPrivilegeEscalation(currentPermissions, newPermissions);
        // Identify data access changes
        const dataAccessChanges = [];
        const addedPermissions = newPermissions.filter((p) => !currentPermissions.includes(p));
        const removedPermissions = currentPermissions.filter((p) => !newPermissions.includes(p));
        addedPermissions.forEach((permission) => {
            dataAccessChanges.push(`Added: ${permission}`);
        });
        removedPermissions.forEach((permission) => {
            dataAccessChanges.push(`Removed: ${permission}`);
        });
        // Determine if notification is required
        const notificationRequired = privilegeEscalation ||
            addedPermissions.includes('admin_access') ||
            addedPermissions.includes('view_billing');
        return {
            privilegeEscalation,
            dataAccessChanges,
            notificationRequired
        };
    }
    /**
     * Determine if role change requires approval
     */
    requiresRoleApproval(currentContact, updatedContact, context) {
        // Require approval for admin role assignments
        if (updatedContact.contactType === this.CONTACT_TYPES.ADMIN) {
            return true;
        }
        // Require approval for privilege escalation
        if (this.hasPrivilegeEscalation(currentContact.permissions || [], updatedContact.permissions || [])) {
            return true;
        }
        return false;
    }
    /**
     * Check if there's privilege escalation
     */
    hasPrivilegeEscalation(currentPermissions, newPermissions) {
        const highPrivilegePermissions = ['admin_access', 'manage_users', 'view_all_data', 'delete_data'];
        const currentHighPrivs = currentPermissions.filter(p => highPrivilegePermissions.includes(p));
        const newHighPrivs = newPermissions.filter(p => highPrivilegePermissions.includes(p));
        return newHighPrivs.length > currentHighPrivs.length;
    }
    /**
     * Validate company association
     */
    async validateCompanyAssociation(association, context) {
        const errors = [];
        if (!association.companyId)
            errors.push('Company ID is required');
        if (!association.role)
            errors.push('Role is required');
        if (!association.permissions || association.permissions.length === 0) {
            errors.push('At least one permission must be specified');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Calculate best contact time based on timezone
     */
    calculateBestContactTime(timezone) {
        // Simplified calculation - would use proper timezone libraries in production
        const timezoneOffsets = {
            'EST': -5,
            'CST': -6,
            'MST': -7,
            'PST': -8,
            'GMT': 0,
            'CET': 1
        };
        const offset = timezoneOffsets[timezone] || 0;
        const utcHour = 14; // 2 PM UTC as base
        const localHour = utcHour + offset;
        const adjustedHour = ((localHour % 24) + 24) % 24;
        return `${adjustedHour}:00 - ${(adjustedHour + 2) % 24}:00 ${timezone}`;
    }
    /**
     * Find the most recent activity date
     */
    findLastActivityDate(activities) {
        const dates = [];
        Object.values(activities).forEach((activityList) => {
            if (Array.isArray(activityList)) {
                activityList.forEach(activity => {
                    if (activity.date) {
                        dates.push(new Date(activity.date));
                    }
                });
            }
        });
        if (dates.length === 0)
            return '';
        const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())));
        return mostRecent.toISOString();
    }
    /**
     * Analyze communication patterns
     */
    analyzeCommuncationPatterns(communications) {
        if (communications.length === 0) {
            return {
                preferredContactMethod: 'email',
                responseRate: 0,
                averageResponseTime: 0
            };
        }
        // Count communication methods
        const methodCounts = {};
        let totalResponses = 0;
        let totalResponseTime = 0;
        communications.forEach(comm => {
            const method = comm.method || 'email';
            methodCounts[method] = (methodCounts[method] || 0) + 1;
            if (comm.response) {
                totalResponses++;
                if (comm.responseTime) {
                    totalResponseTime += comm.responseTime;
                }
            }
        });
        // Find preferred method (most used)
        const preferredContactMethod = Object.entries(methodCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'email';
        const responseRate = communications.length > 0 ? totalResponses / communications.length : 0;
        const averageResponseTime = totalResponses > 0 ? totalResponseTime / totalResponses : 0;
        return {
            preferredContactMethod,
            responseRate: Math.round(responseRate * 100) / 100,
            averageResponseTime: Math.round(averageResponseTime)
        };
    }
}
exports.ContactBusinessLogic = ContactBusinessLogic;
//# sourceMappingURL=ContactBusinessLogic.js.map