/**
 * Company service for Autotask company operations
 */

import { AutotaskClient } from 'autotask-node';
import { createLogger } from '../../shared/utils/logger';
import { URL } from 'url';

const logger = createLogger('company-service');

export interface CompanyCreateData {
  CompanyName: string;
  CompanyType: number;
  Phone?: string;
  Fax?: string;
  WebAddress?: string;
  OwnerResourceID?: number;
  BillToLocationID?: number;
  TaxRegionID?: number;
  MarketSegmentID?: number;
  CompetitorID?: number;
  TerritoryID?: number;
  [key: string]: any;
}

export interface CompanyData {
  id: number;
  CompanyName: string;
  CompanyType: number;
  Phone?: string;
  Fax?: string;
  WebAddress?: string;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
  [key: string]: any;
}

export class CompanyService {
  private autotaskClient: AutotaskClient;

  constructor(autotaskClient: AutotaskClient) {
    this.autotaskClient = autotaskClient;
  }

  /**
   * Create a new company in Autotask
   */
  async createCompany(companyData: CompanyCreateData): Promise<CompanyData> {
    try {
      logger.info(`Creating company: ${companyData.CompanyName}`);
      
      // Validate required fields
      this.validateCompanyData(companyData);
      
      // Create the company
      const response = await this.autotaskClient.create('Companies', companyData);
      
      if (!response?.items?.[0]) {
        throw new Error('Failed to create company - invalid response');
      }
      
      const createdCompany = response.items[0];
      logger.info(`Company created successfully with ID: ${createdCompany.id}`);
      
      return createdCompany;
      
    } catch (error) {
      logger.error(`Failed to create company ${companyData.CompanyName}:`, error);
      throw error;
    }
  }

  /**
   * Get company by ID
   */
  async getCompany(companyId: number): Promise<CompanyData | null> {
    try {
      const response = await this.autotaskClient.query('Companies', {
        filter: `id eq ${companyId}`,
        pageSize: 1,
      });
      
      return response?.items?.[0] || null;
      
    } catch (error) {
      logger.error(`Failed to get company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Search companies by name
   */
  async searchCompaniesByName(name: string): Promise<CompanyData[]> {
    try {
      const response = await this.autotaskClient.query('Companies', {
        filter: `CompanyName contains '${name}'`,
        pageSize: 50,
      });
      
      return response?.items || [];
      
    } catch (error) {
      logger.error(`Failed to search companies by name ${name}:`, error);
      throw error;
    }
  }

  /**
   * Update company
   */
  async updateCompany(companyId: number, updateData: Partial<CompanyCreateData>): Promise<CompanyData> {
    try {
      logger.info(`Updating company ${companyId}`);
      
      const response = await this.autotaskClient.update('Companies', {
        id: companyId,
        ...updateData,
      });
      
      if (!response?.items?.[0]) {
        throw new Error('Failed to update company - invalid response');
      }
      
      const updatedCompany = response.items[0];
      logger.info(`Company ${companyId} updated successfully`);
      
      return updatedCompany;
      
    } catch (error) {
      logger.error(`Failed to update company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Check if company exists by name
   */
  async companyExistsByName(name: string): Promise<boolean> {
    try {
      const companies = await this.searchCompaniesByName(name);
      return companies.some(company => 
        company.CompanyName.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      logger.error(`Failed to check if company exists: ${name}:`, error);
      return false;
    }
  }

  /**
   * Get company types from Autotask
   */
  async getCompanyTypes(): Promise<any[]> {
    try {
      const response = await this.autotaskClient.getPicklistValues('Companies', 'CompanyType');
      return response || [];
    } catch (error) {
      logger.error('Failed to get company types:', error);
      return [];
    }
  }

  /**
   * Get companies by type
   */
  async getCompaniesByType(companyType: number): Promise<CompanyData[]> {
    try {
      const response = await this.autotaskClient.query('Companies', {
        filter: `CompanyType eq ${companyType}`,
        pageSize: 100,
      });
      
      return response?.items || [];
      
    } catch (error) {
      logger.error(`Failed to get companies by type ${companyType}:`, error);
      throw error;
    }
  }

  /**
   * Get customer companies (typically CompanyType = 1)
   */
  async getCustomerCompanies(): Promise<CompanyData[]> {
    return this.getCompaniesByType(1);
  }

  /**
   * Validate company data before creation
   */
  private validateCompanyData(companyData: CompanyCreateData): void {
    if (!companyData.CompanyName || companyData.CompanyName.trim().length === 0) {
      throw new Error('Company name is required');
    }

    if (!companyData.CompanyType) {
      throw new Error('Company type is required');
    }

    // Validate company name length
    if (companyData.CompanyName.length > 100) {
      throw new Error('Company name must be 100 characters or less');
    }

    // Validate phone number format if provided
    if (companyData.Phone && companyData.Phone.length > 25) {
      throw new Error('Phone number must be 25 characters or less');
    }

    // Validate fax number format if provided
    if (companyData.Fax && companyData.Fax.length > 25) {
      throw new Error('Fax number must be 25 characters or less');
    }

    // Validate website URL format if provided
    if (companyData.WebAddress) {
      try {
        new URL(companyData.WebAddress);
      } catch {
        throw new Error('Invalid website URL format');
      }
    }
  }

  /**
   * Format company data for display
   */
  formatCompanyForDisplay(company: CompanyData): any {
    return {
      id: company.id,
      name: company.CompanyName,
      type: company.CompanyType,
      phone: company.Phone,
      fax: company.Fax,
      website: company.WebAddress,
      created: new Date(company.CreatedDateTime).toISOString(),
      lastModified: new Date(company.LastModifiedDateTime).toISOString(),
    };
  }

  /**
   * Get company summary statistics
   */
  async getCompanySummary(): Promise<{
    total: number;
    byType: { [type: number]: number };
  }> {
    try {
      // Get all companies (you might want to paginate this for large datasets)
      const response = await this.autotaskClient.query('Companies', {
        pageSize: 1000, // Adjust as needed
      });
      
      const companies = response?.items || [];
      const byType: { [type: number]: number } = {};
      
      companies.forEach(company => {
        byType[company.CompanyType] = (byType[company.CompanyType] || 0) + 1;
      });
      
      return {
        total: companies.length,
        byType,
      };
      
    } catch (error) {
      logger.error('Failed to get company summary:', error);
      return { total: 0, byType: {} };
    }
  }
}