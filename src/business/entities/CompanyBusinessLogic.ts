import { BusinessLogicEngine } from '../core/BusinessLogicEngine';
import { ValidationResult } from '../validation';

/**
 * Company-specific business logic for account hierarchy, location management, and compliance
 */
export class CompanyBusinessLogic {
  constructor(private businessEngine: BusinessLogicEngine) {}
  
  /**
   * Company types with different business rules
   */
  private readonly COMPANY_TYPES = {
    CUSTOMER: 1,
    PROSPECT: 2,
    PARTNER: 3,
    VENDOR: 4,
    INTERNAL: 5
  } as const;
  
  /**
   * Validate and process company creation with hierarchy validation
   */
  async createCompany(companyData: any, context?: {
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
  }> {
    // Validate the company data
    const result = await this.businessEngine.processBusinessRules(
      'create',
      'Companies',
      companyData,
      {
        ...context,
        relatedEntities: {
          Companies: context?.parentCompany
        }
      }
    );
    
    // Validate hierarchy
    const hierarchyValidation = await this.validateCompanyHierarchy(companyData, context);
    
    // Apply company-specific business logic
    const processedCompany = this.applyCompanyCreationLogic(companyData, context);
    
    return {
      isValid: result.isAllowed && !hierarchyValidation.hasCircularReference,
      validationResult: result.validationResult,
      processedCompany: result.transformedEntity || processedCompany,
      hierarchyValidation,
      suggestedActions: result.suggestedActions || []
    };
  }
  
  /**
   * Validate company hierarchy to prevent circular references and excessive depth
   */
  async validateCompanyHierarchy(
    companyData: any,
    context?: { parentCompany?: any; allCompanies?: any[] }
  ): Promise<{
    hasCircularReference: boolean;
    maxDepthExceeded: boolean;
    conflictingParents: string[];
    hierarchyDepth: number;
  }> {
    const maxDepth = 5; // Maximum hierarchy depth allowed
    let hasCircularReference = false;
    let hierarchyDepth = 0;
    const conflictingParents: string[] = [];
    
    // Check for circular references
    if (companyData.parentCompanyID && context?.allCompanies) {
      const visitedIds = new Set<number>();
      let currentParentId = companyData.parentCompanyID;
      
      while (currentParentId) {
        if (visitedIds.has(currentParentId)) {
          hasCircularReference = true;
          break;
        }
        
        if (currentParentId === companyData.id) {
          hasCircularReference = true;
          break;
        }
        
        visitedIds.add(currentParentId);
        hierarchyDepth++;
        
        const parentCompany = context.allCompanies.find(c => c.id === currentParentId);
        currentParentId = parentCompany?.parentCompanyID;
        
        if (hierarchyDepth > maxDepth) {
          break;
        }
      }
    }
    
    return {
      hasCircularReference,
      maxDepthExceeded: hierarchyDepth > maxDepth,
      conflictingParents,
      hierarchyDepth
    };
  }
  
  /**
   * Manage company locations and ensure business compliance
   */
  async manageCompanyLocations(
    companyId: number,
    locations: any[],
    context?: {
      primaryLocationRequired?: boolean;
      taxJurisdictions?: any[];
    }
  ): Promise<{
    validLocations: any[];
    invalidLocations: any[];
    taxImplications: {
      location: any;
      taxJurisdiction: string;
      requiresRegistration: boolean;
    }[];
    complianceWarnings: string[];
  }> {
    const validLocations: any[] = [];
    const invalidLocations: any[] = [];
    const taxImplications: any[] = [];
    const complianceWarnings: string[] = [];
    
    let hasPrimaryLocation = false;
    
    for (const location of locations) {
      const locationValidation = await this.validateLocation(location);
      
      if (locationValidation.isValid) {
        validLocations.push(location);
        
        if (location.isPrimary) {
          if (hasPrimaryLocation) {
            complianceWarnings.push('Multiple primary locations detected - only one should be primary');
          }
          hasPrimaryLocation = true;
        }
        
        // Check tax implications
        if (context?.taxJurisdictions) {
          const taxJurisdiction = this.determineTaxJurisdiction(location, context.taxJurisdictions);
          if (taxJurisdiction) {
            taxImplications.push({
              location,
              taxJurisdiction: taxJurisdiction.name,
              requiresRegistration: taxJurisdiction.requiresRegistration
            });
          }
        }
      } else {
        invalidLocations.push({
          location,
          errors: locationValidation.errors
        });
      }
    }
    
    if (context?.primaryLocationRequired && !hasPrimaryLocation) {
      complianceWarnings.push('Company requires at least one primary location');
    }
    
    return {
      validLocations,
      invalidLocations,
      taxImplications,
      complianceWarnings
    };
  }
  
  /**
   * Calculate company health score based on various metrics
   */
  calculateCompanyHealthScore(
    company: any,
    metrics: {
      ticketCount?: number;
      averageTicketResolutionTime?: number;
      contractValue?: number;
      outstandingInvoiceAmount?: number;
      lastActivityDate?: string;
      satisfactionScore?: number;
    }
  ): {
    overallScore: number;
    breakdown: {
      activity: number;
      financial: number;
      support: number;
      satisfaction: number;
    };
    riskFactors: string[];
    recommendations: string[];
  } {
    const breakdown = {
      activity: 0,
      financial: 0,
      support: 0,
      satisfaction: 0
    };
    
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    
    // Activity score (0-25 points)
    if (metrics.lastActivityDate) {
      const daysSinceActivity = Math.floor(
        (new Date().getTime() - new Date(metrics.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceActivity <= 7) {
        breakdown.activity = 25;
      } else if (daysSinceActivity <= 30) {
        breakdown.activity = 20;
      } else if (daysSinceActivity <= 90) {
        breakdown.activity = 15;
        riskFactors.push('Low recent activity');
        recommendations.push('Schedule check-in call');
      } else {
        breakdown.activity = 5;
        riskFactors.push('Very low activity');
        recommendations.push('Urgent: Contact customer to verify account status');
      }
    }
    
    // Financial score (0-25 points)
    if (metrics.contractValue !== undefined) {
      if (metrics.contractValue > 100000) {
        breakdown.financial = 25;
      } else if (metrics.contractValue > 50000) {
        breakdown.financial = 20;
      } else if (metrics.contractValue > 10000) {
        breakdown.financial = 15;
      } else {
        breakdown.financial = 10;
      }
      
      if (metrics.outstandingInvoiceAmount && metrics.outstandingInvoiceAmount > metrics.contractValue * 0.1) {
        breakdown.financial *= 0.7; // Reduce by 30% for outstanding invoices
        riskFactors.push('Significant outstanding invoices');
        recommendations.push('Follow up on overdue payments');
      }
    }
    
    // Support score (0-25 points)
    if (metrics.ticketCount !== undefined) {
      if (metrics.averageTicketResolutionTime) {
        if (metrics.averageTicketResolutionTime <= 4) { // 4 hours or less
          breakdown.support = 25;
        } else if (metrics.averageTicketResolutionTime <= 24) { // 1 day
          breakdown.support = 20;
        } else if (metrics.averageTicketResolutionTime <= 72) { // 3 days
          breakdown.support = 15;
        } else {
          breakdown.support = 10;
          riskFactors.push('Slow ticket resolution times');
          recommendations.push('Review support processes and resource allocation');
        }
      }
      
      // Adjust for ticket volume
      if (metrics.ticketCount > 10) {
        riskFactors.push('High support ticket volume');
        recommendations.push('Consider additional training or preventive measures');
      }
    }
    
    // Satisfaction score (0-25 points)
    if (metrics.satisfactionScore !== undefined) {
      breakdown.satisfaction = Math.min(25, (metrics.satisfactionScore / 5) * 25);
      
      if (metrics.satisfactionScore < 3) {
        riskFactors.push('Low customer satisfaction');
        recommendations.push('Schedule customer success review');
      }
    } else {
      breakdown.satisfaction = 15; // Neutral if no data
      recommendations.push('Consider implementing customer satisfaction surveys');
    }
    
    const overallScore = breakdown.activity + breakdown.financial + breakdown.support + breakdown.satisfaction;
    
    return {
      overallScore,
      breakdown,
      riskFactors,
      recommendations
    };
  }
  
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
  } {
    const requiredActions: any[] = [];
    const certifications: any[] = [];
    const recommendations: string[] = [];
    let complianceScore = 100;
    
    // Data protection compliance (GDPR, CCPA, etc.)
    if (requirements.dataProtection) {
      if (!company.dataProcessingAgreement) {
        requiredActions.push({
          priority: 'high' as const,
          action: 'Execute Data Processing Agreement',
          deadline: '30 days'
        });
        complianceScore -= 20;
      }
      
      if (!company.privacyPolicyAccepted) {
        requiredActions.push({
          priority: 'medium' as const,
          action: 'Obtain Privacy Policy acceptance',
          deadline: '60 days'
        });
        complianceScore -= 10;
      }
    }
    
    // Financial reporting requirements
    if (requirements.financialReporting) {
      if (!company.taxId) {
        requiredActions.push({
          priority: 'high' as const,
          action: 'Collect Tax ID for reporting compliance'
        });
        complianceScore -= 15;
      }
      
      certifications.push({
        name: 'Financial Reporting Compliance',
        status: company.taxId ? 'valid' as const : 'missing' as const
      });
    }
    
    // Industry-specific requirements
    if (requirements.industrySpecific) {
      requirements.industrySpecific.forEach(industry => {
        switch (industry.toLowerCase()) {
          case 'healthcare':
            certifications.push({
              name: 'HIPAA Compliance',
              status: company.hipaaCompliant ? 'valid' as const : 'missing' as const,
              expiryDate: company.hipaaExpiryDate
            });
            
            if (!company.hipaaCompliant) {
              requiredActions.push({
                priority: 'high' as const,
                action: 'Complete HIPAA compliance certification'
              });
              complianceScore -= 25;
            }
            break;
            
          case 'finance':
            certifications.push({
              name: 'SOC 2 Compliance',
              status: company.soc2Compliant ? 'valid' as const : 'missing' as const,
              expiryDate: company.soc2ExpiryDate
            });
            
            if (!company.soc2Compliant) {
              requiredActions.push({
                priority: 'medium' as const,
                action: 'Obtain SOC 2 certification'
              });
              complianceScore -= 15;
            }
            break;
        }
      });
    }
    
    // General recommendations
    if (complianceScore < 80) {
      recommendations.push('Schedule compliance review meeting');
      recommendations.push('Consider legal consultation for compliance gaps');
    }
    
    if (requiredActions.length > 0) {
      recommendations.push('Create compliance action plan with timelines');
    }
    
    return {
      complianceScore: Math.max(0, complianceScore),
      requiredActions,
      certifications,
      recommendations
    };
  }
  
  /**
   * Apply business logic during company creation
   */
  private applyCompanyCreationLogic(companyData: any, context?: any): any {
    const processed = { ...companyData };
    
    // Set default company type if not specified
    if (!processed.companyType) {
      processed.companyType = this.COMPANY_TYPES.CUSTOMER;
    }
    
    // Auto-set territory based on address (simplified)
    if (processed.country && !processed.territory) {
      processed.territory = this.determineTerritoryFromCountry(processed.country);
    }
    
    // Apply default settings if provided
    if (context?.defaultSettings) {
      Object.keys(context.defaultSettings).forEach(key => {
        if (processed[key] === undefined) {
          processed[key] = context.defaultSettings[key];
        }
      });
    }
    
    // Set creation metadata
    processed.createdDate = new Date().toISOString();
    processed.isActive = processed.isActive !== false; // Default to active
    
    return processed;
  }
  
  /**
   * Validate individual location data
   */
  private async validateLocation(location: any): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    // Required fields
    if (!location.name) errors.push('Location name is required');
    if (!location.address1) errors.push('Address is required');
    if (!location.city) errors.push('City is required');
    if (!location.postalCode) errors.push('Postal code is required');
    if (!location.country) errors.push('Country is required');
    
    // Postal code format validation (simplified)
    if (location.postalCode && location.country) {
      const isValidPostalCode = this.validatePostalCode(location.postalCode, location.country);
      if (!isValidPostalCode) {
        errors.push('Invalid postal code format for country');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Determine tax jurisdiction for location
   */
  private determineTaxJurisdiction(location: any, taxJurisdictions: any[]): any {
    return taxJurisdictions.find(jurisdiction => {
      return jurisdiction.country === location.country &&
             (!jurisdiction.state || jurisdiction.state === location.state);
    });
  }
  
  /**
   * Validate postal code format by country
   */
  private validatePostalCode(postalCode: string, country: string): boolean {
    const patterns: Record<string, RegExp> = {
      'US': /^\d{5}(-\d{4})?$/,
      'CA': /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
      'UK': /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
      'DE': /^\d{5}$/,
      'FR': /^\d{5}$/
    };
    
    const pattern = patterns[country];
    return pattern ? pattern.test(postalCode) : true; // Default to valid if no pattern
  }
  
  /**
   * Determine territory from country (simplified mapping)
   */
  private determineTerritoryFromCountry(country: string): string {
    const territoryMap: Record<string, string> = {
      'US': 'North America',
      'CA': 'North America',
      'MX': 'North America',
      'GB': 'Europe',
      'DE': 'Europe',
      'FR': 'Europe',
      'AU': 'Asia Pacific',
      'JP': 'Asia Pacific',
      'SG': 'Asia Pacific'
    };
    
    return territoryMap[country] || 'International';
  }
}