/**
 * Contact service for Autotask contact operations
 */

import { AutotaskClient } from 'autotask-node';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('contact-service');

export interface ContactCreateData {
  CompanyID: number;
  FirstName: string;
  LastName: string;
  Title?: string;
  EmailAddress?: string;
  Phone?: string;
  MobilePhone?: string;
  Fax?: string;
  [key: string]: any;
}

export interface ContactData {
  id: number;
  CompanyID: number;
  FirstName: string;
  LastName: string;
  Title?: string;
  EmailAddress?: string;
  Phone?: string;
  MobilePhone?: string;
  CreatedDateTime: string;
  LastModifiedDateTime: string;
  [key: string]: any;
}

export class ContactService {
  private autotaskClient: AutotaskClient;

  constructor(autotaskClient: AutotaskClient) {
    this.autotaskClient = autotaskClient;
  }

  /**
   * Create a new contact in Autotask
   */
  async createContact(contactData: ContactCreateData): Promise<ContactData> {
    try {
      logger.info(`Creating contact: ${contactData.FirstName} ${contactData.LastName}`);
      
      // Validate required fields
      this.validateContactData(contactData);
      
      // Create the contact
      const response = await this.autotaskClient.create('Contacts', contactData);
      
      if (!response?.items?.[0]) {
        throw new Error('Failed to create contact - invalid response');
      }
      
      const createdContact = response.items[0];
      logger.info(`Contact created successfully with ID: ${createdContact.id}`);
      
      return createdContact;
      
    } catch (error) {
      logger.error(`Failed to create contact ${contactData.FirstName} ${contactData.LastName}:`, error);
      throw error;
    }
  }

  /**
   * Get contacts for a company
   */
  async getContactsByCompany(companyId: number): Promise<ContactData[]> {
    try {
      const response = await this.autotaskClient.query('Contacts', {
        filter: `CompanyID eq ${companyId}`,
        pageSize: 100,
      });
      
      return response?.items || [];
      
    } catch (error) {
      logger.error(`Failed to get contacts for company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Search contacts by email
   */
  async findContactByEmail(email: string): Promise<ContactData | null> {
    try {
      const response = await this.autotaskClient.query('Contacts', {
        filter: `EmailAddress eq '${email}'`,
        pageSize: 1,
      });
      
      return response?.items?.[0] || null;
      
    } catch (error) {
      logger.error(`Failed to search contact by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Validate contact data
   */
  private validateContactData(contactData: ContactCreateData): void {
    if (!contactData.CompanyID) {
      throw new Error('Company ID is required');
    }

    if (!contactData.FirstName || contactData.FirstName.trim().length === 0) {
      throw new Error('First name is required');
    }

    if (!contactData.LastName || contactData.LastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    // Validate field lengths
    if (contactData.FirstName.length > 50) {
      throw new Error('First name must be 50 characters or less');
    }

    if (contactData.LastName.length > 50) {
      throw new Error('Last name must be 50 characters or less');
    }

    if (contactData.EmailAddress) {
      if (contactData.EmailAddress.length > 254) {
        throw new Error('Email address must be 254 characters or less');
      }
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.EmailAddress)) {
        throw new Error('Invalid email address format');
      }
    }
  }
}