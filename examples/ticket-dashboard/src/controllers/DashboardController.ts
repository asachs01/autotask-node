/**
 * Dashboard REST API controller
 */

import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';
import { TicketService } from '../services/TicketService';
import { getAutotaskClient } from '../../shared/auth/autotask-auth';
import { 
  sendSuccess, 
  sendError, 
  sendNotFound,
  asyncHandler 
} from '../../shared/utils/response';
import { createLogger } from '../../shared/utils/logger';
import { DashboardFilter } from '../types/dashboard';

const logger = createLogger('dashboard-controller');

export class DashboardController {
  private dashboardService: DashboardService;
  private ticketService: TicketService;

  constructor() {
    const autotaskClient = getAutotaskClient();
    this.ticketService = new TicketService(autotaskClient);
    this.dashboardService = new DashboardService(autotaskClient, this.ticketService);
  }

  /**
   * Get dashboard metrics
   * GET /api/dashboard/metrics
   */
  getMetrics = asyncHandler(async (req: Request, res: Response) => {
    try {
      const metrics = await this.dashboardService.getMetrics();
      
      return sendSuccess(res, metrics, 'Dashboard metrics retrieved successfully');

    } catch (error) {
      logger.error('Failed to get dashboard metrics:', error);
      return sendError(res, 'Failed to get dashboard metrics');
    }
  });

  /**
   * Get tickets with filtering
   * GET /api/dashboard/tickets
   */
  getTickets = asyncHandler(async (req: Request, res: Response) => {
    try {
      const {
        queues,
        resources,
        companies,
        priorities,
        statuses,
        searchText,
        showClosed = false,
        page = 1,
        pageSize = 50
      } = req.query;

      const filter: DashboardFilter = {
        queues: queues ? String(queues).split(',').map(Number) : undefined,
        resources: resources ? String(resources).split(',').map(Number) : undefined,
        companies: companies ? String(companies).split(',').map(Number) : undefined,
        priorities: priorities ? String(priorities).split(',').map(Number) : undefined,
        statuses: statuses ? String(statuses).split(',').map(Number) : undefined,
        searchText: searchText ? String(searchText) : undefined,
        showClosed: showClosed === 'true',
      };

      const result = await this.ticketService.getTickets(
        filter,
        Number(page),
        Number(pageSize)
      );

      return sendSuccess(res, result, 'Tickets retrieved successfully');

    } catch (error) {
      logger.error('Failed to get tickets:', error);
      return sendError(res, 'Failed to get tickets');
    }
  });

  /**
   * Get ticket details with SLA information
   * GET /api/dashboard/tickets/:id
   */
  getTicketDetails = asyncHandler(async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      
      if (isNaN(ticketId)) {
        return sendError(res, 'Invalid ticket ID', 400);
      }

      const ticket = await this.ticketService.getTicketById(ticketId);
      
      if (!ticket) {
        return sendNotFound(res, 'Ticket');
      }

      const slaMap = await this.ticketService.getSLAInfo([ticketId]);
      const slaInfo = slaMap.get(ticketId);

      return sendSuccess(res, {
        ticket,
        sla: slaInfo,
      }, 'Ticket details retrieved successfully');

    } catch (error) {
      logger.error('Failed to get ticket details:', error);
      return sendError(res, 'Failed to get ticket details');
    }
  });

  /**
   * Get SLA violations
   * GET /api/dashboard/sla/violations
   */
  getSLAViolations = asyncHandler(async (req: Request, res: Response) => {
    try {
      const violations = await this.ticketService.getSLAViolations();
      
      return sendSuccess(res, violations, 'SLA violations retrieved successfully');

    } catch (error) {
      logger.error('Failed to get SLA violations:', error);
      return sendError(res, 'Failed to get SLA violations');
    }
  });

  /**
   * Get active alerts
   * GET /api/dashboard/alerts
   */
  getAlerts = asyncHandler(async (req: Request, res: Response) => {
    try {
      const alerts = this.dashboardService.getAlerts();
      
      return sendSuccess(res, {
        alerts,
        total: alerts.length,
        unacknowledged: alerts.filter(a => !a.acknowledgedAt).length,
      }, 'Alerts retrieved successfully');

    } catch (error) {
      logger.error('Failed to get alerts:', error);
      return sendError(res, 'Failed to get alerts');
    }
  });

  /**
   * Acknowledge alert
   * POST /api/dashboard/alerts/:id/acknowledge
   */
  acknowledgeAlert = asyncHandler(async (req: Request, res: Response) => {
    try {
      const alertId = req.params.id;
      const { acknowledgedBy = 'Unknown User' } = req.body;

      const success = this.dashboardService.acknowledgeAlert(alertId, acknowledgedBy);
      
      if (!success) {
        return sendNotFound(res, 'Alert');
      }

      return sendSuccess(res, { acknowledged: true }, 'Alert acknowledged successfully');

    } catch (error) {
      logger.error('Failed to acknowledge alert:', error);
      return sendError(res, 'Failed to acknowledge alert');
    }
  });

  /**
   * Resolve alert
   * POST /api/dashboard/alerts/:id/resolve
   */
  resolveAlert = asyncHandler(async (req: Request, res: Response) => {
    try {
      const alertId = req.params.id;
      const { resolvedBy = 'Unknown User' } = req.body;

      const success = this.dashboardService.resolveAlert(alertId, resolvedBy);
      
      if (!success) {
        return sendNotFound(res, 'Alert');
      }

      return sendSuccess(res, { resolved: true }, 'Alert resolved successfully');

    } catch (error) {
      logger.error('Failed to resolve alert:', error);
      return sendError(res, 'Failed to resolve alert');
    }
  });

  /**
   * Get escalation rules
   * GET /api/dashboard/escalation-rules
   */
  getEscalationRules = asyncHandler(async (req: Request, res: Response) => {
    try {
      const rules = this.dashboardService.getEscalationRules();
      
      return sendSuccess(res, {
        rules,
        total: rules.length,
        active: rules.filter(r => r.isActive).length,
      }, 'Escalation rules retrieved successfully');

    } catch (error) {
      logger.error('Failed to get escalation rules:', error);
      return sendError(res, 'Failed to get escalation rules');
    }
  });

  /**
   * Update ticket
   * PATCH /api/dashboard/tickets/:id
   */
  updateTicket = asyncHandler(async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      const updates = req.body;

      if (isNaN(ticketId)) {
        return sendError(res, 'Invalid ticket ID', 400);
      }

      const updatedTicket = await this.ticketService.updateTicket(ticketId, updates);
      
      return sendSuccess(res, updatedTicket, 'Ticket updated successfully');

    } catch (error) {
      logger.error('Failed to update ticket:', error);
      return sendError(res, 'Failed to update ticket');
    }
  });

  /**
   * Get queue metrics
   * GET /api/dashboard/queues
   */
  getQueueMetrics = asyncHandler(async (req: Request, res: Response) => {
    try {
      const metrics = await this.dashboardService.getMetrics();
      
      return sendSuccess(res, {
        queues: metrics.queues,
        total: metrics.queues.length,
      }, 'Queue metrics retrieved successfully');

    } catch (error) {
      logger.error('Failed to get queue metrics:', error);
      return sendError(res, 'Failed to get queue metrics');
    }
  });

  /**
   * Get resource metrics
   * GET /api/dashboard/resources
   */
  getResourceMetrics = asyncHandler(async (req: Request, res: Response) => {
    try {
      const metrics = await this.dashboardService.getMetrics();
      
      return sendSuccess(res, {
        resources: metrics.resources,
        total: metrics.resources.length,
      }, 'Resource metrics retrieved successfully');

    } catch (error) {
      logger.error('Failed to get resource metrics:', error);
      return sendError(res, 'Failed to get resource metrics');
    }
  });

  /**
   * Get trend data
   * GET /api/dashboard/trends
   */
  getTrends = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { period = '30d' } = req.query;
      
      const metrics = await this.dashboardService.getMetrics();
      
      return sendSuccess(res, {
        trends: metrics.trends,
        period,
      }, 'Trend data retrieved successfully');

    } catch (error) {
      logger.error('Failed to get trends:', error);
      return sendError(res, 'Failed to get trends');
    }
  });

  /**
   * Get system health status
   * GET /api/dashboard/health
   */
  getSystemHealth = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Mock system health data
      const health = {
        status: 'healthy',
        uptime: process.uptime(),
        services: {
          autotask: { status: 'up', responseTime: 150 },
          database: { status: 'up', connectionCount: 5 },
          redis: { status: 'up', memoryUsage: 45 },
          websocket: { status: 'up', connections: 12 },
        },
        performance: {
          timestamp: new Date(),
          metrics: {
            activeConnections: 12,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
            cpuUsage: process.cpuUsage().user / 1000000, // seconds
            apiResponseTime: 120,
            databaseResponseTime: 25,
            ticketProcessingRate: 2.5,
            alertGenerationRate: 0.1,
            websocketConnections: 12,
          },
        },
        lastCheck: new Date(),
      };
      
      return sendSuccess(res, health, 'System health retrieved successfully');

    } catch (error) {
      logger.error('Failed to get system health:', error);
      return sendError(res, 'Failed to get system health');
    }
  });
}