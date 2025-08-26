/**
 * Ticket service for dashboard operations
 */

import { AutotaskClient } from 'autotask-node';
import { createLogger } from '../../shared/utils/logger';
import { TicketSummary, DashboardFilter, SLAInfo, TicketEvent } from '../types/dashboard';
import { EventEmitter } from 'events';

const logger = createLogger('ticket-service');

export class TicketService extends EventEmitter {
  private autotaskClient: AutotaskClient;
  private ticketCache: Map<number, TicketSummary> = new Map();
  private lastSync: Date | null = null;
  private syncInterval: ReturnType<typeof setTimeout> | null = null;

  constructor(autotaskClient: AutotaskClient) {
    super();
    this.autotaskClient = autotaskClient;
    this.startSyncProcess();
  }

  /**
   * Get tickets with filtering and pagination
   */
  async getTickets(filter?: DashboardFilter, page = 1, pageSize = 50): Promise<{
    tickets: TicketSummary[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const filterString = this.buildFilterString(filter);
      const response = await this.autotaskClient.query('Tickets', {
        filter: filterString,
        page,
        pageSize,
      });

      const tickets = response?.items?.map(this.transformTicket) || [];
      const total = response?.pageDetails?.count || 0;

      return {
        tickets,
        total,
        hasMore: tickets.length === pageSize,
      };

    } catch (error) {
      logger.error('Failed to get tickets:', error);
      throw error;
    }
  }

  /**
   * Get ticket by ID with SLA information
   */
  async getTicketById(ticketId: number): Promise<TicketSummary | null> {
    try {
      // Check cache first
      if (this.ticketCache.has(ticketId)) {
        return this.ticketCache.get(ticketId)!;
      }

      const response = await this.autotaskClient.query('Tickets', {
        filter: `id eq ${ticketId}`,
        pageSize: 1,
      });

      if (!response?.items?.[0]) {
        return null;
      }

      const ticket = this.transformTicket(response.items[0]);
      this.ticketCache.set(ticketId, ticket);
      
      return ticket;

    } catch (error) {
      logger.error(`Failed to get ticket ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * Get SLA information for tickets
   */
  async getSLAInfo(ticketIds: number[]): Promise<Map<number, SLAInfo>> {
    const slaMap = new Map<number, SLAInfo>();

    try {
      // In a real implementation, this would fetch SLA data from Autotask
      // For now, we'll calculate basic SLA info
      
      for (const ticketId of ticketIds) {
        const ticket = await this.getTicketById(ticketId);
        if (!ticket) continue;

        const slaInfo = this.calculateSLAInfo(ticket);
        slaMap.set(ticketId, slaInfo);
      }

      return slaMap;

    } catch (error) {
      logger.error('Failed to get SLA information:', error);
      throw error;
    }
  }

  /**
   * Get tickets that are at risk or breaching SLA
   */
  async getSLAViolations(): Promise<{
    atRisk: TicketSummary[];
    breached: TicketSummary[];
  }> {
    try {
      // Get all open tickets
      const { tickets } = await this.getTickets({
        statuses: [1, 2, 3, 4, 5, 6, 7, 8], // Open statuses
        showClosed: false,
      }, 1, 500);

      const atRisk: TicketSummary[] = [];
      const breached: TicketSummary[] = [];

      for (const ticket of tickets) {
        const sla = this.calculateSLAInfo(ticket);
        
        if (sla.responseStatus === 'breached' || sla.resolutionStatus === 'breached') {
          breached.push(ticket);
        } else if (sla.responseStatus === 'at-risk' || sla.resolutionStatus === 'at-risk') {
          atRisk.push(ticket);
        }
      }

      return { atRisk, breached };

    } catch (error) {
      logger.error('Failed to get SLA violations:', error);
      throw error;
    }
  }

  /**
   * Update ticket and emit change event
   */
  async updateTicket(ticketId: number, updates: any): Promise<TicketSummary> {
    try {
      const response = await this.autotaskClient.update('Tickets', {
        id: ticketId,
        ...updates,
      });

      if (!response?.items?.[0]) {
        throw new Error('Failed to update ticket');
      }

      const updatedTicket = this.transformTicket(response.items[0]);
      this.ticketCache.set(ticketId, updatedTicket);

      // Emit update event
      this.emit('ticketUpdated', {
        type: 'updated',
        ticketId,
        timestamp: new Date(),
        changes: Object.keys(updates).map(field => ({
          field,
          newValue: updates[field],
          oldValue: undefined, // Would need to track previous state
        })),
      } as TicketEvent);

      return updatedTicket;

    } catch (error) {
      logger.error(`Failed to update ticket ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * Start the sync process to keep tickets updated
   */
  private startSyncProcess(): void {
    // Sync every 30 seconds
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncRecentChanges();
      } catch (error) {
        logger.error('Sync process failed:', error);
      }
    }, 30000);
  }

  /**
   * Sync recent ticket changes
   */
  private async syncRecentChanges(): Promise<void> {
    try {
      const since = this.lastSync || new Date(Date.now() - 300000); // Last 5 minutes
      const sinceString = since.toISOString();

      const response = await this.autotaskClient.query('Tickets', {
        filter: `LastModifiedDateTime gt datetime'${sinceString}'`,
        pageSize: 100,
      });

      const changedTickets = response?.items || [];
      
      for (const ticketData of changedTickets) {
        const ticket = this.transformTicket(ticketData);
        const wasInCache = this.ticketCache.has(ticket.id);
        
        this.ticketCache.set(ticket.id, ticket);

        // Emit appropriate event
        const eventType = wasInCache ? 'updated' : 'created';
        this.emit('ticketChanged', {
          type: eventType,
          ticketId: ticket.id,
          timestamp: new Date(ticket.lastModifiedDateTime),
        } as TicketEvent);
      }

      this.lastSync = new Date();
      
      if (changedTickets.length > 0) {
        logger.info(`Synced ${changedTickets.length} changed tickets`);
      }

    } catch (error) {
      logger.error('Failed to sync recent changes:', error);
    }
  }

  /**
   * Build filter string for Autotask query
   */
  private buildFilterString(filter?: DashboardFilter): string {
    if (!filter) return '';

    const conditions: string[] = [];

    if (filter.queues && filter.queues.length > 0) {
      const queueFilter = filter.queues.map(q => `QueueID eq ${q}`).join(' or ');
      conditions.push(`(${queueFilter})`);
    }

    if (filter.resources && filter.resources.length > 0) {
      const resourceFilter = filter.resources.map(r => `AssignedResourceID eq ${r}`).join(' or ');
      conditions.push(`(${resourceFilter})`);
    }

    if (filter.companies && filter.companies.length > 0) {
      const companyFilter = filter.companies.map(c => `CompanyID eq ${c}`).join(' or ');
      conditions.push(`(${companyFilter})`);
    }

    if (filter.priorities && filter.priorities.length > 0) {
      const priorityFilter = filter.priorities.map(p => `Priority eq ${p}`).join(' or ');
      conditions.push(`(${priorityFilter})`);
    }

    if (filter.statuses && filter.statuses.length > 0) {
      const statusFilter = filter.statuses.map(s => `Status eq ${s}`).join(' or ');
      conditions.push(`(${statusFilter})`);
    }

    if (filter.dateRange) {
      const startDate = filter.dateRange.start.toISOString();
      const endDate = filter.dateRange.end.toISOString();
      conditions.push(`CreatedDateTime gt datetime'${startDate}' and CreatedDateTime lt datetime'${endDate}'`);
    }

    if (filter.searchText) {
      const searchText = filter.searchText.replace(/'/g, "''"); // Escape quotes
      conditions.push(`(Title contains '${searchText}' or Description contains '${searchText}')`);
    }

    if (!filter.showClosed) {
      // Exclude closed statuses (typically status 5 = Complete)
      conditions.push('Status ne 5');
    }

    return conditions.length > 0 ? conditions.join(' and ') : '';
  }

  /**
   * Transform Autotask ticket data to our format
   */
  private transformTicket(ticketData: any): TicketSummary {
    return {
      id: ticketData.id,
      ticketNumber: ticketData.TicketNumber || `T${ticketData.id}`,
      title: ticketData.Title || '',
      status: ticketData.Status,
      statusName: this.getStatusName(ticketData.Status),
      priority: ticketData.Priority,
      priorityName: this.getPriorityName(ticketData.Priority),
      companyId: ticketData.CompanyID,
      companyName: ticketData.CompanyName || 'Unknown Company',
      contactId: ticketData.ContactID,
      contactName: ticketData.ContactName,
      assignedResourceId: ticketData.AssignedResourceID,
      assignedResourceName: ticketData.AssignedResourceName,
      queueId: ticketData.QueueID,
      queueName: ticketData.QueueName || 'Default Queue',
      issueType: ticketData.IssueType,
      issueTypeName: this.getIssueTypeName(ticketData.IssueType),
      createdDateTime: ticketData.CreatedDateTime,
      dueDateTime: ticketData.DueDateTime,
      lastModifiedDateTime: ticketData.LastModifiedDateTime,
      estimatedHours: ticketData.EstimatedHours,
      hoursToBeScheduled: ticketData.HoursToBeScheduled,
      description: ticketData.Description || '',
      resolution: ticketData.Resolution,
    };
  }

  /**
   * Calculate SLA information for a ticket
   */
  private calculateSLAInfo(ticket: TicketSummary): SLAInfo {
    // Default SLA targets (in hours)
    const responseTarget = this.getResponseTarget(ticket.priority);
    const resolutionTarget = this.getResolutionTarget(ticket.priority);

    const createdTime = new Date(ticket.createdDateTime);
    const now = new Date();
    const ageInMinutes = (now.getTime() - createdTime.getTime()) / (1000 * 60);

    const responseTargetMinutes = responseTarget * 60;
    const resolutionTargetMinutes = resolutionTarget * 60;

    const responseTimeRemaining = responseTargetMinutes - ageInMinutes;
    const resolutionTimeRemaining = resolutionTargetMinutes - ageInMinutes;

    // Determine status based on remaining time
    const getStatus = (remaining: number): 'met' | 'at-risk' | 'breached' => {
      if (remaining < 0) return 'breached';
      if (remaining < 60) return 'at-risk'; // Less than 1 hour remaining
      return 'met';
    };

    return {
      ticketId: ticket.id,
      responseTargetHours: responseTarget,
      resolutionTargetHours: resolutionTarget,
      responseTimeRemaining,
      resolutionTimeRemaining,
      responseStatus: getStatus(responseTimeRemaining),
      resolutionStatus: getStatus(resolutionTimeRemaining),
      escalationLevel: 0, // Would be determined by escalation rules
      autoEscalated: false,
    };
  }

  /**
   * Get response time target based on priority
   */
  private getResponseTarget(priority: number): number {
    switch (priority) {
      case 1: return 1; // Critical - 1 hour
      case 2: return 4; // High - 4 hours
      case 3: return 8; // Medium - 8 hours
      case 4: return 24; // Low - 24 hours
      default: return 8;
    }
  }

  /**
   * Get resolution time target based on priority
   */
  private getResolutionTarget(priority: number): number {
    switch (priority) {
      case 1: return 4; // Critical - 4 hours
      case 2: return 8; // High - 8 hours
      case 3: return 24; // Medium - 24 hours
      case 4: return 72; // Low - 72 hours
      default: return 24;
    }
  }

  /**
   * Helper methods for status and type names
   */
  private getStatusName(status: number): string {
    const statusNames: { [key: number]: string } = {
      1: 'New',
      2: 'In Progress',
      3: 'Waiting Customer',
      4: 'Waiting Vendor',
      5: 'Complete',
      6: 'On Hold',
      7: 'Escalated',
      8: 'Dispatched',
    };
    return statusNames[status] || `Status ${status}`;
  }

  private getPriorityName(priority: number): string {
    const priorityNames: { [key: number]: string } = {
      1: 'Critical',
      2: 'High',
      3: 'Medium',
      4: 'Low',
    };
    return priorityNames[priority] || `Priority ${priority}`;
  }

  private getIssueTypeName(issueType: number): string {
    const issueTypeNames: { [key: number]: string } = {
      1: 'General',
      2: 'Hardware',
      3: 'Software',
      4: 'Network',
      5: 'Security',
    };
    return issueTypeNames[issueType] || `Issue Type ${issueType}`;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.ticketCache.clear();
    this.removeAllListeners();
  }
}