/**
 * Customer Onboarding Automation Application
 * 
 * A complete customer onboarding workflow system that automates:
 * - Company creation and setup
 * - Contact management
 * - Location configuration
 * - Initial ticket creation
 * - Welcome notifications
 * - Service activation
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createBaseConfig, getEnvironmentConfig } from '../shared/config/base';
import { initializeLogger } from '../shared/utils/logger';
import { initializeAutotaskAuth } from '../shared/auth/autotask-auth';
import { errorHandler, notFoundHandler } from '../shared/utils/response';
import { apiKeyAuth, requestLogging, securityHeaders } from '../shared/middleware/auth';
import { rateLimiters } from '../shared/middleware/rate-limit';
import { OnboardingController } from './controllers/OnboardingController';

async function startApplication() {
  try {
    // Load configuration
    const config = createBaseConfig();
    const envConfig = getEnvironmentConfig(config.environment);
    
    // Initialize logging
    const logger = initializeLogger(config);
    logger.info('Starting Customer Onboarding Automation Application');
    
    // Initialize Autotask authentication
    await initializeAutotaskAuth(config);
    logger.info('Autotask authentication initialized');
    
    // Create Express application
    const app = express();
    
    // Security middleware
    app.use(helmet());
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
    }
    
    // Initialize controllers
    const onboardingController = new OnboardingController();
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'customer-onboarding',
      });
    });
    
    // API routes
    const apiRouter = express.Router();
    
    // Onboarding routes
    apiRouter.post('/onboarding/start', onboardingController.startOnboarding);
    apiRouter.get('/onboarding/workflow/:id', onboardingController.getWorkflowStatus);
    apiRouter.get('/onboarding/workflows', onboardingController.getAllWorkflows);
    apiRouter.get('/onboarding/metrics', onboardingController.getMetrics);
    
    app.use('/api', apiRouter);
    
    // Serve static files (for dashboard)
    app.use(express.static('public'));
    
    // Error handling
    app.use(notFoundHandler());
    app.use(errorHandler(logger));
    
    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Customer Onboarding Application started successfully`);
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.environment}`);
      logger.info('Available endpoints:');
      logger.info('  GET  /health - Health check');
      logger.info('  POST /api/onboarding/start - Start new onboarding');
      logger.info('  GET  /api/onboarding/workflow/:id - Get workflow status');
      logger.info('  GET  /api/onboarding/workflows - List all workflows');
      logger.info('  GET  /api/onboarding/metrics - Get onboarding metrics');
    });
    
    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        logger.info('Server closed successfully');
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