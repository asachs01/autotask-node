import { BusinessLogicEngine } from '../core/BusinessLogicEngine';
import { ValidationResult } from '../validation';

/**
 * Contact-specific business logic for role permissions, multi-company associations, and communication preferences
 */
export class ContactBusinessLogic {
  constructor(private businessEngine: BusinessLogicEngine) {}
  
  /**
   * Contact types with different access levels
   */
  private readonly CONTACT_TYPES = {
    PRIMARY: 1,
    BILLING: 2,
    TECHNICAL: 3,
    ADMIN: 4,
    GENERAL: 5
  } as const;
  
  /**
   * Permission levels for portal access
   */
  private readonly PERMISSION_LEVELS = {
    NONE: 0,
    READ_ONLY: 1,
    LIMITED: 2,
    FULL: 3,
    ADMIN: 4
  } as const;
  
  /**
   * Validate and process contact creation with role and permission validation
   */
  async createContact(contactData: any, context?: {
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
  }> {
    // Validate the contact data
    const result = await this.businessEngine.processBusinessRules(
      'create',
      'Contacts',
      contactData,
      {
        ...context,
        relatedEntities: {
          Companies: context?.company
        }
      }
    );
    
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
  async assignContactRole(
    contactId: number,
    roleType: number,
    permissions: string[],
    context?: {
      currentContact?: any;
      company?: any;
      requestingUser?: any;
    }
  ): Promise<{
    isValid: boolean;
    validationResult: ValidationResult;
    roleConflicts: string[];
    securityImplications: {
      privilegeEscalation: boolean;
      dataAccessChanges: string[];
      notificationRequired: boolean;
    };
    approvalRequired: boolean;
  }> {
    const currentContact = context?.currentContact || {};
    const updatedContact = {
      ...currentContact,
      contactType: roleType,
      permissions: permissions
    };
    
    const result = await this.businessEngine.processBusinessRules(
      'update',
      'Contacts',
      updatedContact,
      {
        previousEntity: currentContact,
        user: context?.requestingUser
      }
    );
    
    // Check for role conflicts
    const roleConflicts = this.checkRoleConflicts(roleType, currentContact, context);
    
    // Analyze security implications
    const securityImplications = this.analyzeSecurityImplications(
      currentContact,
      updatedContact,
      context
    );
    
    // Determine if approval is required
    const approvalRequired = this.requiresRoleApproval(
      currentContact,
      updatedContact,
      context
    );
    
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
  async manageMultiCompanyAssociation(
    contactId: number,
    companyAssociations: {
      companyId: number;
      role: string;
      permissions: string[];
      isPrimary: boolean;
    }[],
    context?: {
      currentAssociations?: any[];
      securityLevel?: 'standard' | 'high' | 'enterprise';
    }
  ): Promise<{
    validAssociations: any[];
    invalidAssociations: any[];
    securityWarnings: string[];
    conflictResolution: {
      duplicateRoles: any[];
      multiplePrimaries: boolean;
      permissionConflicts: any[];
    };
    recommendations: string[];
  }> {
    const validAssociations: any[] = [];
    const invalidAssociations: any[] = [];
    const securityWarnings: string[] = [];
    const recommendations: string[] = [];
    
    let primaryCount = 0;
    const rolesByCompany: Record<number, string[]> = {};
    const duplicateRoles: any[] = [];
    const permissionConflicts: any[] = [];
    
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
      } else {
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
  manageCommuncationPreferences(
    contact: any,
    preferences: {
      emailMarketing: boolean;
      smsNotifications: boolean;
      phoneContact: boolean;
      preferredLanguage: string;
      timezone: string;
      optInDate?: string;
      optOutRequests?: string[];
    },
    complianceRequirements?: {
      gdprRequired: boolean;
      ccpaRequired: boolean;
      canSpamCompliance: boolean;
    }
  ): {
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
  } {
    const validPreferences = { ...preferences };
    const requiredActions: string[] = [];
    
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
    const allowedChannels: string[] = [];
    const restrictions: string[] = [];
    
    if (preferences.emailMarketing && gdprCompliant && canSpamCompliant) {
      allowedChannels.push('email_marketing');
    } else if (!preferences.emailMarketing) {
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
  } {
    let engagementScore = 0;
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    
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
      const daysSinceActivity = Math.floor(
        (new Date().getTime() - new Date(activityBreakdown.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceActivity <= 30) {
        engagementScore += 20;
      } else if (daysSinceActivity <= 90) {
        engagementScore += 10;
      } else {
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
  private applyContactCreationLogic(contactData: any, context?: any): any {
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
  private analyzeContactPermissions(contactData: any, context?: any): {
    recommendedPermissions: string[];
    securityWarnings: string[];
    accessLimitations: string[];
  } {
    const recommendedPermissions: string[] = [];
    const securityWarnings: string[] = [];
    const accessLimitations: string[] = [];
    
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
  private checkRoleConflicts(roleType: number, currentContact: any, context?: any): string[] {
    const conflicts: string[] = [];
    
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
  private analyzeSecurityImplications(
    currentContact: any,
    updatedContact: any,
    context?: any
  ): {
    privilegeEscalation: boolean;
    dataAccessChanges: string[];
    notificationRequired: boolean;
  } {
    const currentPermissions = currentContact.permissions || [];
    const newPermissions = updatedContact.permissions || [];
    
    // Check for privilege escalation
    const privilegeEscalation = this.hasPrivilegeEscalation(currentPermissions, newPermissions);
    
    // Identify data access changes
    const dataAccessChanges: string[] = [];
    const addedPermissions = newPermissions.filter((p: any) => !currentPermissions.includes(p));
    const removedPermissions = currentPermissions.filter((p: any) => !newPermissions.includes(p));
    
    addedPermissions.forEach((permission: any) => {
      dataAccessChanges.push(`Added: ${permission}`);
    });
    
    removedPermissions.forEach((permission: any) => {
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
  private requiresRoleApproval(currentContact: any, updatedContact: any, context?: any): boolean {
    // Require approval for admin role assignments
    if (updatedContact.contactType === this.CONTACT_TYPES.ADMIN) {
      return true;
    }
    
    // Require approval for privilege escalation
    if (this.hasPrivilegeEscalation(
      currentContact.permissions || [],
      updatedContact.permissions || []
    )) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if there's privilege escalation
   */
  private hasPrivilegeEscalation(currentPermissions: string[], newPermissions: string[]): boolean {
    const highPrivilegePermissions = ['admin_access', 'manage_users', 'view_all_data', 'delete_data'];
    
    const currentHighPrivs = currentPermissions.filter(p => highPrivilegePermissions.includes(p));
    const newHighPrivs = newPermissions.filter(p => highPrivilegePermissions.includes(p));
    
    return newHighPrivs.length > currentHighPrivs.length;
  }
  
  /**
   * Validate company association
   */
  private async validateCompanyAssociation(association: any, context?: any): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    if (!association.companyId) errors.push('Company ID is required');
    if (!association.role) errors.push('Role is required');
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
  private calculateBestContactTime(timezone: string): string {
    // Simplified calculation - would use proper timezone libraries in production
    const timezoneOffsets: Record<string, number> = {
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
  private findLastActivityDate(activities: any): string {
    const dates: Date[] = [];
    
    Object.values(activities).forEach((activityList: any) => {
      if (Array.isArray(activityList)) {
        activityList.forEach(activity => {
          if (activity.date) {
            dates.push(new Date(activity.date));
          }
        });
      }
    });
    
    if (dates.length === 0) return '';
    
    const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())));
    return mostRecent.toISOString();
  }
  
  /**
   * Analyze communication patterns
   */
  private analyzeCommuncationPatterns(communications: any[]): {
    preferredContactMethod: string;
    responseRate: number;
    averageResponseTime: number;
  } {
    if (communications.length === 0) {
      return {
        preferredContactMethod: 'email',
        responseRate: 0,
        averageResponseTime: 0
      };
    }
    
    // Count communication methods
    const methodCounts: Record<string, number> = {};
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
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'email';
    
    const responseRate = communications.length > 0 ? totalResponses / communications.length : 0;
    const averageResponseTime = totalResponses > 0 ? totalResponseTime / totalResponses : 0;
    
    return {
      preferredContactMethod,
      responseRate: Math.round(responseRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime)
    };
  }
}