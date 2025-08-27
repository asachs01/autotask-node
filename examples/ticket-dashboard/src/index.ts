/**
 * Ticket Management Dashboard Application
 * 
 * Real-time ticket monitoring and analytics dashboard that provides:
 * - Live ticket status updates
 * - SLA tracking and breach alerts
 * - Automated escalation management
 * - Performance metrics and reporting
 * - Resource utilization monitoring
 * - Queue management analytics
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createBaseConfig, getEnvironmentConfig } from '../shared/config/base';
import { initializeLogger } from '../shared/utils/logger';
import { initializeAutotaskAuth } from '../shared/auth/autotask-auth';
import { errorHandler, notFoundHandler } from '../shared/utils/response';
import { apiKeyAuth, requestLogging, securityHeaders, optionalAuth } from '../shared/middleware/auth';
import { rateLimiters } from '../shared/middleware/rate-limit';
import { DashboardController } from './controllers/DashboardController';
import { WebSocketServer } from './websocket/WebSocketServer';
import { DashboardService } from './services/DashboardService';
import { TicketService } from './services/TicketService';
import { getAutotaskClient } from '../shared/auth/autotask-auth';
import path from 'path';

async function startApplication() {
  try {
    // Load configuration
    const config = createBaseConfig();
    const envConfig = getEnvironmentConfig(config.environment);
    
    // Initialize logging
    const logger = initializeLogger(config);
    logger.info('Starting Ticket Management Dashboard Application');
    
    // Initialize Autotask authentication
    await initializeAutotaskAuth(config);
    logger.info('Autotask authentication initialized');
    
    // Create Express application and HTTP server
    const app = express();
    const server = createServer(app);
    
    // Initialize Socket.IO
    const io = new SocketIOServer(server, {
      cors: envConfig.cors,
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    
    // Initialize services
    const autotaskClient = getAutotaskClient();
    const ticketService = new TicketService(autotaskClient);
    const dashboardService = new DashboardService(autotaskClient, ticketService);
    
    // Initialize WebSocket server
    const webSocketServer = new WebSocketServer(io, dashboardService, ticketService);
    
    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdnjs.cloudflare.com'],
          fontSrc: ["'self'", 'fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'ws:', 'wss:'],
        },
      },
    }));
    app.use(securityHeaders());
    app.use(cors(envConfig.cors));
    app.use(compression());
    
    // Request middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(requestLogging());
    
    // Rate limiting
    app.use('/api/', rateLimiters.api);
    
    // Authentication middleware for API routes
    if (process.env.NODE_ENV === 'production') {
      app.use('/api/', apiKeyAuth());
    } else {
      // In development, use optional auth to allow easier testing
      app.use('/api/', optionalAuth());
    }
    
    // Initialize controllers
    const dashboardController = new DashboardController();
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      const connectionStats = webSocketServer.getConnectionStats();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'ticket-dashboard',
        uptime: process.uptime(),
        connections: connectionStats,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      });
    });
    
    // API routes
    const apiRouter = express.Router();
    
    // Dashboard routes
    apiRouter.get('/dashboard/metrics', dashboardController.getMetrics);
    apiRouter.get('/dashboard/tickets', dashboardController.getTickets);
    apiRouter.get('/dashboard/tickets/:id', dashboardController.getTicketDetails);
    apiRouter.patch('/dashboard/tickets/:id', dashboardController.updateTicket);
    apiRouter.get('/dashboard/sla/violations', dashboardController.getSLAViolations);
    apiRouter.get('/dashboard/alerts', dashboardController.getAlerts);
    apiRouter.post('/dashboard/alerts/:id/acknowledge', dashboardController.acknowledgeAlert);
    apiRouter.post('/dashboard/alerts/:id/resolve', dashboardController.resolveAlert);
    apiRouter.get('/dashboard/escalation-rules', dashboardController.getEscalationRules);
    apiRouter.get('/dashboard/queues', dashboardController.getQueueMetrics);
    apiRouter.get('/dashboard/resources', dashboardController.getResourceMetrics);
    apiRouter.get('/dashboard/trends', dashboardController.getTrends);
    apiRouter.get('/dashboard/health', dashboardController.getSystemHealth);
    
    app.use('/api', apiRouter);
    
    // Serve static files (dashboard UI)
    const publicPath = path.join(__dirname, '../public');
    app.use(express.static(publicPath));
    
    // Serve dashboard HTML for all non-API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(publicPath, 'index.html'));
    });
    
    // Error handling
    app.use(notFoundHandler());
    app.use(errorHandler(logger));
    
    // Start server
    const port = config.port + 1; // Use port 3002 for dashboard
    server.listen(port, () => {
      logger.info(`Ticket Management Dashboard started successfully`);
      logger.info(`Server running on port ${port}`);
      logger.info(`Environment: ${config.environment}`);
      logger.info(`WebSocket server initialized`);
      logger.info('Available endpoints:');
      logger.info('  GET  /health - Health check with connection stats');
      logger.info('  GET  /api/dashboard/metrics - Dashboard metrics');
      logger.info('  GET  /api/dashboard/tickets - Tickets with filtering');
      logger.info('  GET  /api/dashboard/tickets/:id - Ticket details');
      logger.info('  PATCH /api/dashboard/tickets/:id - Update ticket');
      logger.info('  GET  /api/dashboard/sla/violations - SLA violations');
      logger.info('  GET  /api/dashboard/alerts - Active alerts');
      logger.info('  GET  /api/dashboard/queues - Queue metrics');
      logger.info('  GET  /api/dashboard/resources - Resource metrics');
      logger.info('  GET  /api/dashboard/trends - Trend data');
      logger.info('  WebSocket: Real-time updates on /socket.io/');
    });
    
    // Periodic system status broadcasts
    setInterval(() => {
      const connectionStats = webSocketServer.getConnectionStats();
      const systemStatus = {
        timestamp: new Date(),
        uptime: process.uptime(),
        connections: connectionStats.totalConnections,
        memory: process.memoryUsage().heapUsed / 1024 / 1024,
        cpu: process.cpuUsage().user / 1000000,
      };
      
      webSocketServer.broadcastSystemStatus(systemStatus);
    }, 30000); // Every 30 seconds
    
    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      // Stop accepting new connections
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        // Cleanup services
        webSocketServer.destroy();
        dashboardService.destroy();
        ticketService.destroy();
        
        logger.info('Server and services closed successfully');
        process.exit(0);
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  startApplication();
}

export default startApplication;