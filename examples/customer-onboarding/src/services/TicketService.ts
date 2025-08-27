/**
 * Ticket service for Autotask ticket operations
 */

import { AutotaskClient } from 'autotask-node';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('ticket-service');

export interface TicketCreateData {
  CompanyID: number;
  Title: string;
  Description: string;
  QueueID: number;
  Status: number;
  Priority: number;
  IssueType: number;
  TicketType: number;
  Source: number;
  ContactID?: number;
  AssignedResourceID?: number;
  [key: string]: any;
}

export class TicketService {
  private autotaskClient: AutotaskClient;

  constructor(autotaskClient: AutotaskClient) {
    this.autotaskClient = autotaskClient;
  }

  async createTicket(ticketData: TicketCreateData): Promise<any> {
    try {
      logger.info(`Creating ticket: ${ticketData.Title}`);
      
      const response = await this.autotaskClient.create('Tickets', ticketData);
      
      if (!response?.items?.[0]) {
        throw new Error('Failed to create ticket - invalid response');
      }
      
      const createdTicket = response.items[0];
      logger.info(`Ticket created successfully with ID: ${createdTicket.id}`);
      
      return createdTicket;
      
    } catch (error) {
      logger.error(`Failed to create ticket ${ticketData.Title}:`, error);
      throw error;
    }
  }
}