/**
 * Dashboard service for metrics and analytics
 */

import { AutotaskClient } from 'autotask-node';
import { createLogger } from '../../shared/utils/logger';
import { 
  DashboardMetrics, 
  QueueMetrics, 
  ResourceMetrics, 
  TicketTrend,
  Alert,
  EscalationRule 
} from '../types/dashboard';
import { TicketService } from './TicketService';
import { EventEmitter } from 'events';

const logger = createLogger('dashboard-service');

export class DashboardService extends EventEmitter {
  private autotaskClient: AutotaskClient;
  private ticketService: TicketService;
  private metricsCache: DashboardMetrics | null = null;
  private lastMetricsUpdate: Date | null = null;
  private alerts: Alert[] = [];
  private escalationRules: EscalationRule[] = [];

  constructor(autotaskClient: AutotaskClient, ticketService: TicketService) {
    super();
    this.autotaskClient = autotaskClient;
    this.ticketService = ticketService;
    
    this.initializeEscalationRules();
    this.startMetricsCollection();
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      // Return cached metrics if recent (less than 5 minutes old)
      if (this.metricsCache && this.lastMetricsUpdate) {
        const age = Date.now() - this.lastMetricsUpdate.getTime();
        if (age < 300000) { // 5 minutes
          return this.metricsCache;
        }
      }

      logger.info('Calculating dashboard metrics...');
      const startTime = Date.now();

      // Calculate metrics in parallel
      const [
        overview,
        priority,
        queues,
        resources,
        slaBreaches,
        trends
      ] = await Promise.all([
        this.calculateOverviewMetrics(),
        this.calculatePriorityMetrics(),
        this.calculateQueueMetrics(),
        this.calculateResourceMetrics(),
        this.calculateSLAMetrics(),
        this.calculateTrendMetrics(),
      ]);

      const metrics: DashboardMetrics = {
        overview,
        priority,
        queues,
        resources,
        slaBreaches,
        trends,
      };

      this.metricsCache = metrics;
      this.lastMetricsUpdate = new Date();

      const duration = Date.now() - startTime;
      logger.info(`Dashboard metrics calculated in ${duration}ms`);

      return metrics;

    } catch (error) {
      logger.error('Failed to calculate dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get active alerts
   */
  getAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolvedAt);
  }

  /**
   * Add a new alert
   */
  addAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Alert {
    const newAlert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      ...alert,
    };

    this.alerts.push(newAlert);
    
    // Emit alert event
    this.emit('alert', newAlert);
    
    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    logger.info(`Alert generated: ${newAlert.type} - ${newAlert.title}`);
    return newAlert;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.acknowledgedAt) {
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = acknowledgedBy;
      this.emit('alertAcknowledged', alert);
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolvedAt) {
      alert.resolvedAt = new Date();
      alert.resolvedBy = resolvedBy;
      this.emit('alertResolved', alert);
      return true;
    }
    return false;
  }

  /**
   * Calculate overview metrics
   */
  private async calculateOverviewMetrics(): Promise<DashboardMetrics['overview']> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all tickets with basic filtering
      const allTicketsResponse = await this.autotaskClient.query('Tickets', {
        pageSize: 1000, // Adjust based on your ticket volume
      });

      const allTickets = allTicketsResponse?.items || [];
      
      const totalTickets = allTickets.length;
      const openTickets = allTickets.filter(t => t.Status !== 5).length; // Not complete
      const newTickets = allTickets.filter(t => t.Status === 1).length;
      const inProgressTickets = allTickets.filter(t => t.Status === 2).length;
      const waitingTickets = allTickets.filter(t => [3, 4].includes(t.Status)).length; // Waiting customer/vendor
      
      const closedToday = allTickets.filter(t => {
        if (t.Status !== 5) return false;
        const completedDate = new Date(t.CompletedDateTime || t.LastModifiedDateTime);
        return completedDate >= today;
      }).length;

      // Calculate average response and resolution times
      const completedTickets = allTickets.filter(t => t.Status === 5);
      let avgResponseTime = 0;
      let avgResolutionTime = 0;

      if (completedTickets.length > 0) {
        const responseTimes = completedTickets
          .filter(t => t.FirstResponseDateTime)
          .map(t => {
            const created = new Date(t.CreatedDateTime);
            const response = new Date(t.FirstResponseDateTime);
            return (response.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
          });

        const resolutionTimes = completedTickets.map(t => {
          const created = new Date(t.CreatedDateTime);
          const completed = new Date(t.CompletedDateTime || t.LastModifiedDateTime);
          return (completed.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
        });

        avgResponseTime = responseTimes.length > 0 
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
          : 0;

        avgResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;
      }

      // Calculate SLA compliance (simplified)
      const slaComplianceRate = completedTickets.length > 0 
        ? Math.random() * 20 + 80 // Mock: 80-100%
        : 0;

      return {
        totalTickets,
        openTickets,
        newTickets,
        inProgressTickets,
        waitingTickets,
        closedToday,
        averageResponseTime: Math.round(avgResponseTime * 10) / 10,
        averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        slaComplianceRate: Math.round(slaComplianceRate * 10) / 10,
      };

    } catch (error) {
      logger.error('Failed to calculate overview metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate priority-based metrics
   */
  private async calculatePriorityMetrics(): Promise<DashboardMetrics['priority']> {
    try {
      const response = await this.autotaskClient.query('Tickets', {
        filter: 'Status ne 5', // Not complete
        pageSize: 1000,
      });

      const openTickets = response?.items || [];
      
      return {
        critical: openTickets.filter(t => t.Priority === 1).length,
        high: openTickets.filter(t => t.Priority === 2).length,
        medium: openTickets.filter(t => t.Priority === 3).length,
        low: openTickets.filter(t => t.Priority === 4).length,
      };

    } catch (error) {
      logger.error('Failed to calculate priority metrics:', error);
      return { critical: 0, high: 0, medium: 0, low: 0 };
    }
  }

  /**
   * Calculate queue-based metrics
   */
  private async calculateQueueMetrics(): Promise<QueueMetrics[]> {
    try {
      // First get all queues
      const queuesResponse = await this.autotaskClient.query('TicketQueues', {
        pageSize: 100,
      });

      const queues = queuesResponse?.items || [];
      const queueMetrics: QueueMetrics[] = [];

      for (const queue of queues) {
        const ticketsResponse = await this.autotaskClient.query('Tickets', {
          filter: `QueueID eq ${queue.id}`,
          pageSize: 500,
        });

        const queueTickets = ticketsResponse?.items || [];
        const openTickets = queueTickets.filter(t => t.Status !== 5);
        
        // Calculate average age
        const now = Date.now();
        const ages = openTickets.map(t => {
          const created = new Date(t.CreatedDateTime);
          return (now - created.getTime()) / (1000 * 60 * 60); // hours
        });

        const averageAge = ages.length > 0 
          ? ages.reduce((sum, age) => sum + age, 0) / ages.length 
          : 0;

        const oldestTicketAge = ages.length > 0 ? Math.max(...ages) : 0;

        queueMetrics.push({
          queueId: queue.id,
          queueName: queue.Name || `Queue ${queue.id}`,
          ticketCount: openTickets.length,
          averageAge: Math.round(averageAge * 10) / 10,
          oldestTicketAge: Math.round(oldestTicketAge * 10) / 10,
        });
      }

      return queueMetrics.sort((a, b) => b.ticketCount - a.ticketCount);

    } catch (error) {
      logger.error('Failed to calculate queue metrics:', error);
      return [];
    }
  }

  /**
   * Calculate resource-based metrics
   */
  private async calculateResourceMetrics(): Promise<ResourceMetrics[]> {
    try {
      // Get all resources
      const resourcesResponse = await this.autotaskClient.query('Resources', {
        filter: 'Active eq true',
        pageSize: 100,
      });

      const resources = resourcesResponse?.items || [];
      const resourceMetrics: ResourceMetrics[] = [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const resource of resources) {
        const ticketsResponse = await this.autotaskClient.query('Tickets', {
          filter: `AssignedResourceID eq ${resource.id}`,
          pageSize: 500,
        });

        const assignedTickets = ticketsResponse?.items || [];
        const activeTickets = assignedTickets.filter(t => t.Status !== 5);
        
        const completedToday = assignedTickets.filter(t => {
          if (t.Status !== 5) return false;
          const completedDate = new Date(t.CompletedDateTime || t.LastModifiedDateTime);
          return completedDate >= today;
        }).length;

        const completedThisWeek = assignedTickets.filter(t => {
          if (t.Status !== 5) return false;
          const completedDate = new Date(t.CompletedDateTime || t.LastModifiedDateTime);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return completedDate >= weekAgo;
        }).length;

        // Calculate average resolution time for completed tickets
        const completedTickets = assignedTickets.filter(t => t.Status === 5);
        let avgResolutionTime = 0;
        
        if (completedTickets.length > 0) {
          const resolutionTimes = completedTickets.map(t => {
            const created = new Date(t.CreatedDateTime);
            const completed = new Date(t.CompletedDateTime || t.LastModifiedDateTime);
            return (completed.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
          });
          
          avgResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;
        }

        // Mock some values for demo
        const slaComplianceRate = 85 + Math.random() * 15; // 85-100%
        const utilizationRate = 60 + Math.random() * 35; // 60-95%
        const workloadLevel = 
          activeTickets.length > 20 ? 'overloaded' :
          activeTickets.length > 15 ? 'heavy' :
          activeTickets.length > 5 ? 'normal' : 'light';

        resourceMetrics.push({
          resourceId: resource.id,
          resourceName: `${resource.FirstName} ${resource.LastName}`,
          email: resource.Email,
          activeTickets: activeTickets.length,
          completedToday,
          completedThisWeek,
          averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
          slaComplianceRate: Math.round(slaComplianceRate * 10) / 10,
          utilizationRate: Math.round(utilizationRate * 10) / 10,
          escalationsReceived: Math.floor(Math.random() * 5),
          workload: workloadLevel as any,
        });
      }

      return resourceMetrics.sort((a, b) => b.activeTickets - a.activeTickets);

    } catch (error) {
      logger.error('Failed to calculate resource metrics:', error);
      return [];
    }
  }

  /**
   * Calculate SLA-related metrics
   */
  private async calculateSLAMetrics(): Promise<DashboardMetrics['slaBreaches']> {
    try {
      const { atRisk, breached } = await this.ticketService.getSLAViolations();
      
      return {
        responseBreaches: breached.filter(t => t.status !== 5).length,
        resolutionBreaches: breached.length,
        atRiskTickets: atRisk.length,
      };

    } catch (error) {
      logger.error('Failed to calculate SLA metrics:', error);
      return {
        responseBreaches: 0,
        resolutionBreaches: 0,
        atRiskTickets: 0,
      };
    }
  }

  /**
   * Calculate trend metrics
   */
  private async calculateTrendMetrics(): Promise<DashboardMetrics['trends']> {
    try {
      const trends = {
        ticketsCreatedTrend: [] as { date: string; count: number }[],
        ticketsClosedTrend: [] as { date: string; count: number }[],
        responseTimeTrend: [] as { date: string; avgHours: number }[],
        resolutionTimeTrend: [] as { date: string; avgHours: number }[],
      };

      // Generate trend data for the last 30 days
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        // Mock trend data - in production, this would query historical data
        trends.ticketsCreatedTrend.push({
          date: dateString,
          count: Math.floor(Math.random() * 20) + 5, // 5-25 tickets
        });

        trends.ticketsClosedTrend.push({
          date: dateString,
          count: Math.floor(Math.random() * 18) + 3, // 3-21 tickets
        });

        trends.responseTimeTrend.push({
          date: dateString,
          avgHours: Math.round((Math.random() * 4 + 2) * 10) / 10, // 2-6 hours
        });

        trends.resolutionTimeTrend.push({
          date: dateString,
          avgHours: Math.round((Math.random() * 20 + 10) * 10) / 10, // 10-30 hours
        });
      }

      return trends;

    } catch (error) {
      logger.error('Failed to calculate trend metrics:', error);
      return {
        ticketsCreatedTrend: [],
        ticketsClosedTrend: [],
        responseTimeTrend: [],
        resolutionTimeTrend: [],
      };
    }
  }

  /**
   * Initialize default escalation rules
   */
  private initializeEscalationRules(): void {
    this.escalationRules = [
      {
        id: 'critical-response-escalation',
        name: 'Critical Ticket Response Escalation',
        description: 'Escalate critical tickets if no response within 30 minutes',
        priority: [1], // Critical only
        conditions: [
          {
            type: 'response_overdue',
            operator: 'gte',
            value: 30, // 30 minutes
          }
        ],
        actions: [
          {
            type: 'notify',
            parameters: {
              emailAddress: 'manager@company.com',
            }
          },
          {
            type: 'priority_change',
            parameters: {
              newPriority: 1,
            }
          }
        ],
        isActive: true,
        triggerCount: 0,
      },
      {
        id: 'high-priority-escalation',
        name: 'High Priority Resolution Escalation',
        description: 'Escalate high priority tickets if not resolved within 8 hours',
        priority: [1, 2], // Critical and High
        conditions: [
          {
            type: 'resolution_overdue',
            operator: 'gte',
            value: 480, // 8 hours
          }
        ],
        actions: [
          {
            type: 'reassign',
            parameters: {
              resourceId: 1, // Senior technician
            }
          },
          {
            type: 'add_note',
            parameters: {
              noteText: 'Ticket escalated due to SLA breach - requires immediate attention',
            }
          }
        ],
        isActive: true,
        triggerCount: 0,
      }
    ];
  }

  /**
   * Start metrics collection process
   */
  private startMetricsCollection(): void {
    // Update metrics every 5 minutes
    setInterval(async () => {
      try {
        await this.getMetrics(); // This will refresh the cache
        this.emit('metricsUpdated', this.metricsCache);
      } catch (error) {
        logger.error('Scheduled metrics update failed:', error);
      }
    }, 300000); // 5 minutes

    // Check for escalations every minute
    setInterval(async () => {
      try {
        await this.checkEscalations();
      } catch (error) {
        logger.error('Escalation check failed:', error);
      }
    }, 60000); // 1 minute
  }

  /**
   * Check for escalations
   */
  private async checkEscalations(): Promise<void> {
    try {
      const { tickets } = await this.ticketService.getTickets({
        showClosed: false,
      }, 1, 500);

      for (const ticket of tickets) {
        for (const rule of this.escalationRules.filter(r => r.isActive)) {
          if (await this.shouldEscalate(ticket, rule)) {
            await this.executeEscalation(ticket, rule);
          }
        }
      }

    } catch (error) {
      logger.error('Failed to check escalations:', error);
    }
  }

  /**
   * Check if a ticket should be escalated based on a rule
   */
  private async shouldEscalate(ticket: any, rule: EscalationRule): Promise<boolean> {
    // Check if rule applies to this ticket
    if (rule.priority && !rule.priority.includes(ticket.priority)) {
      return false;
    }

    if (rule.queues && !rule.queues.includes(ticket.queueId)) {
      return false;
    }

    if (rule.issueTypes && !rule.issueTypes.includes(ticket.issueType)) {
      return false;
    }

    // Check conditions
    const slaInfo = this.ticketService['calculateSLAInfo'](ticket);
    
    for (const condition of rule.conditions) {
      switch (condition.type) {
        case 'response_overdue':
          if (slaInfo.responseTimeRemaining <= -condition.value) {
            return true;
          }
          break;
        case 'resolution_overdue':
          if (slaInfo.resolutionTimeRemaining <= -condition.value) {
            return true;
          }
          break;
        case 'no_activity': {
          const lastModified = new Date(ticket.lastModifiedDateTime);
          const minutesSinceUpdate = (Date.now() - lastModified.getTime()) / (1000 * 60);
          if (minutesSinceUpdate >= condition.value) {
            return true;
          }
          break;
        }
      }
    }

    return false;
  }

  /**
   * Execute escalation actions
   */
  private async executeEscalation(ticket: any, rule: EscalationRule): Promise<void> {
    logger.info(`Executing escalation rule "${rule.name}" for ticket ${ticket.id}`);

    rule.triggerCount++;
    rule.lastTriggered = new Date();

    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'notify':
            this.addAlert({
              type: 'escalation',
              severity: 'high',
              title: `Ticket Escalated: ${ticket.title}`,
              message: `Ticket ${ticket.ticketNumber} has been escalated due to rule: ${rule.name}`,
              ticketId: ticket.id,
              metadata: { ruleId: rule.id, ruleName: rule.name },
            });
            break;
          
          case 'reassign':
            if (action.parameters.resourceId) {
              await this.ticketService.updateTicket(ticket.id, {
                AssignedResourceID: action.parameters.resourceId,
              });
            }
            break;
          
          case 'priority_change':
            if (action.parameters.newPriority) {
              await this.ticketService.updateTicket(ticket.id, {
                Priority: action.parameters.newPriority,
              });
            }
            break;
          
          case 'status_change':
            if (action.parameters.newStatus) {
              await this.ticketService.updateTicket(ticket.id, {
                Status: action.parameters.newStatus,
              });
            }
            break;
        }
      } catch (error) {
        logger.error(`Failed to execute escalation action ${action.type}:`, error);
      }
    }

    this.emit('escalation', { ticket, rule });
  }

  /**
   * Get escalation rules
   */
  getEscalationRules(): EscalationRule[] {
    return this.escalationRules;
  }

  /**
   * Add escalation rule
   */
  addEscalationRule(rule: Omit<EscalationRule, 'id' | 'triggerCount'>): EscalationRule {
    const newRule: EscalationRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      triggerCount: 0,
    };

    this.escalationRules.push(newRule);
    return newRule;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.removeAllListeners();
  }
}