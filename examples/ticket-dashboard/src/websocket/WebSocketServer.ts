/**
 * WebSocket server for real-time dashboard updates
 */

import { Server } from 'socket.io';
import { createLogger } from '../../shared/utils/logger';
import { DashboardService } from '../services/DashboardService';
import { TicketService } from '../services/TicketService';
import { WebSocketMessage, DashboardUser } from '../types/dashboard';

const logger = createLogger('websocket-server');

export class WebSocketServer {
  private io: Server;
  private dashboardService: DashboardService;
  private ticketService: TicketService;
  private connectedUsers: Map<string, DashboardUser> = new Map();

  constructor(
    io: Server, 
    dashboardService: DashboardService, 
    ticketService: TicketService
  ) {
    this.io = io;
    this.dashboardService = dashboardService;
    this.ticketService = ticketService;
    
    this.initializeEventHandlers();
    this.setupServiceListeners();
  }

  /**
   * Initialize WebSocket event handlers
   */
  private initializeEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket connection established: ${socket.id}`);

      // Handle user authentication/registration
      socket.on('register', (userData: Partial<DashboardUser>) => {
        const user: DashboardUser = {
          id: socket.id,
          name: userData.name || 'Unknown User',
          email: userData.email || '',
          role: userData.role || 'viewer',
          preferences: userData.preferences || this.getDefaultPreferences(),
          lastActive: new Date(),
          connectedSince: new Date(),
        };

        this.connectedUsers.set(socket.id, user);
        
        // Join user to appropriate rooms based on role
        socket.join(`role:${user.role}`);
        
        // Send initial data
        this.sendInitialData(socket);
        
        logger.info(`User registered: ${user.name} (${user.role})`);
      });

      // Handle subscription to specific data types
      socket.on('subscribe', (subscriptions: string[]) => {
        subscriptions.forEach(subscription => {
          socket.join(`subscription:${subscription}`);
        });
        
        logger.info(`Client subscribed to: ${subscriptions.join(', ')}`);
      });

      // Handle unsubscription
      socket.on('unsubscribe', (subscriptions: string[]) => {
        subscriptions.forEach(subscription => {
          socket.leave(`subscription:${subscription}`);
        });
        
        logger.info(`Client unsubscribed from: ${subscriptions.join(', ')}`);
      });

      // Handle dashboard filter changes
      socket.on('filterChange', (filters: any) => {
        // Store user's current filters and send filtered data
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          user.preferences.defaultFilters = filters;
          user.lastActive = new Date();
          this.sendFilteredTickets(socket, filters);
        }
      });

      // Handle alert acknowledgment
      socket.on('acknowledgeAlert', (data: { alertId: string; acknowledgedBy: string }) => {
        const success = this.dashboardService.acknowledgeAlert(data.alertId, data.acknowledgedBy);
        
        socket.emit('alertAcknowledged', {
          success,
          alertId: data.alertId,
          acknowledgedBy: data.acknowledgedBy,
          timestamp: new Date(),
        });

        if (success) {
          // Broadcast to all connected clients
          this.broadcast('alertUpdate', {
            type: 'acknowledged',
            alertId: data.alertId,
            acknowledgedBy: data.acknowledgedBy,
          });
        }
      });

      // Handle ticket updates
      socket.on('updateTicket', async (data: { ticketId: number; updates: any }) => {
        try {
          const updatedTicket = await this.ticketService.updateTicket(data.ticketId, data.updates);
          
          // Broadcast ticket update to all subscribers
          this.broadcastToSubscribers('ticket-updates', {
            type: 'ticket_update',
            data: updatedTicket,
            timestamp: new Date(),
            id: `update_${Date.now()}`,
          });

          socket.emit('ticketUpdated', {
            success: true,
            ticket: updatedTicket,
          });

        } catch (error) {
          socket.emit('ticketUpdateError', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            ticketId: data.ticketId,
          });
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`WebSocket disconnected: ${socket.id} (${reason})`);
        this.connectedUsers.delete(socket.id);
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date() });
        
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          user.lastActive = new Date();
        }
      });
    });
  }

  /**
   * Setup listeners for dashboard and ticket service events
   */
  private setupServiceListeners(): void {
    // Listen for metrics updates
    this.dashboardService.on('metricsUpdated', (metrics) => {
      this.broadcastToSubscribers('metrics', {
        type: 'metrics_update',
        data: metrics,
        timestamp: new Date(),
        id: `metrics_${Date.now()}`,
      });
    });

    // Listen for new alerts
    this.dashboardService.on('alert', (alert) => {
      this.broadcastToSubscribers('alerts', {
        type: 'alert',
        data: alert,
        timestamp: new Date(),
        id: `alert_${Date.now()}`,
      });

      // Send push notifications to managers and admins
      this.broadcastToRole(['admin', 'manager'], {
        type: 'alert',
        data: {
          ...alert,
          priority: 'high',
          requiresAttention: true,
        },
        timestamp: new Date(),
        id: `urgent_alert_${Date.now()}`,
      });
    });

    // Listen for escalations
    this.dashboardService.on('escalation', ({ ticket, rule }) => {
      this.broadcastToSubscribers('escalations', {
        type: 'escalation',
        data: {
          ticket,
          rule: {
            id: rule.id,
            name: rule.name,
            description: rule.description,
          },
        },
        timestamp: new Date(),
        id: `escalation_${Date.now()}`,
      });

      // Notify all users about critical escalations
      if (ticket.priority === 1) { // Critical priority
        this.broadcast('criticalEscalation', {
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          ruleName: rule.name,
          timestamp: new Date(),
        });
      }
    });

    // Listen for ticket changes
    this.ticketService.on('ticketChanged', (event) => {
      this.broadcastToSubscribers('ticket-updates', {
        type: 'ticket_update',
        data: event,
        timestamp: new Date(),
        id: `ticket_event_${Date.now()}`,
      });
    });

    this.ticketService.on('ticketUpdated', (event) => {
      this.broadcastToSubscribers('ticket-updates', {
        type: 'ticket_update',
        data: event,
        timestamp: new Date(),
        id: `ticket_update_${Date.now()}`,
      });
    });
  }

  /**
   * Send initial data to a newly connected client
   */
  private async sendInitialData(socket: any): Promise<void> {
    try {
      // Send initial metrics
      const metrics = await this.dashboardService.getMetrics();
      socket.emit('initialData', {
        metrics,
        alerts: this.dashboardService.getAlerts(),
        connectedUsers: this.connectedUsers.size,
        serverTime: new Date(),
      });

      // Send recent tickets
      const { tickets } = await this.ticketService.getTickets({
        showClosed: false,
      }, 1, 20);
      
      socket.emit('recentTickets', tickets);

    } catch (error) {
      logger.error('Failed to send initial data:', error);
      socket.emit('error', {
        message: 'Failed to load initial data',
        type: 'initialization_error',
      });
    }
  }

  /**
   * Send filtered tickets to a client
   */
  private async sendFilteredTickets(socket: any, filters: any): Promise<void> {
    try {
      const { tickets } = await this.ticketService.getTickets(filters, 1, 100);
      socket.emit('filteredTickets', {
        tickets,
        filters,
        timestamp: new Date(),
      });

    } catch (error) {
      logger.error('Failed to send filtered tickets:', error);
      socket.emit('error', {
        message: 'Failed to load filtered tickets',
        type: 'filter_error',
      });
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Broadcast message to clients subscribed to a specific topic
   */
  private broadcastToSubscribers(subscription: string, message: WebSocketMessage): void {
    this.io.to(`subscription:${subscription}`).emit('message', message);
  }

  /**
   * Broadcast message to users with specific roles
   */
  private broadcastToRole(roles: string[], message: WebSocketMessage): void {
    roles.forEach(role => {
      this.io.to(`role:${role}`).emit('message', message);
    });
  }

  /**
   * Get default user preferences
   */
  private getDefaultPreferences() {
    return {
      refreshInterval: 30,
      autoRefresh: true,
      alertSound: true,
      theme: 'light' as const,
      defaultFilters: {
        showClosed: false,
      },
      columnVisibility: {
        ticketNumber: true,
        title: true,
        status: true,
        priority: true,
        assignedTo: true,
        company: true,
        created: true,
        dueDate: true,
      },
      escalationRules: [],
      kpiTargets: {
        responseTime: 4,
        resolutionTime: 24,
        slaCompliance: 95,
        customerSatisfaction: 4.5,
      },
    };
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    const users = Array.from(this.connectedUsers.values());
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as { [role: string]: number });

    return {
      totalConnections: users.length,
      roleBreakdown: roleStats,
      averageConnectionDuration: users.length > 0 
        ? users.reduce((sum, user) => {
            return sum + (Date.now() - user.connectedSince.getTime());
          }, 0) / users.length / 1000 // in seconds
        : 0,
    };
  }

  /**
   * Send system status update
   */
  broadcastSystemStatus(status: any): void {
    this.broadcast('systemStatus', {
      type: 'system_status',
      data: status,
      timestamp: new Date(),
      id: `system_status_${Date.now()}`,
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.connectedUsers.clear();
    this.dashboardService.removeAllListeners();
    this.ticketService.removeAllListeners();
  }
}