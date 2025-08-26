/**
 * Secure webhook receiver with Express.js integration and signature validation
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import { createHmac, timingSafeEqual } from 'crypto';
import winston from 'winston';
import rateLimit from 'express-rate-limit';
import {
  WebhookConfig,
  WebhookRequest,
  WebhookResponse,
  WebhookError,
  WebhookSignature,
  SecurityOptions,
  WebhookMiddleware,
} from './types/WebhookTypes';

export class WebhookReceiver {
  private app: Express;
  private server: Server | null = null;
  private config: Required<WebhookConfig>;
  private securityOptions: SecurityOptions;
  private middleware: WebhookMiddleware[] = [];
  private logger: winston.Logger;
  private isRunning: boolean = false;

  constructor(
    config: WebhookConfig = {},
    securityOptions: SecurityOptions,
    logger?: winston.Logger
  ) {
    this.config = this.mergeWithDefaults(config);
    this.securityOptions = securityOptions;
    this.logger = logger || this.createDefaultLogger();
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private mergeWithDefaults(config: WebhookConfig): Required<WebhookConfig> {
    return {
      port: config.port || 3000,
      host: config.host || 'localhost',
      path: config.path || '/webhook',
      secret: config.secret || '',
      timeout: config.timeout || 30000,
      maxPayloadSize: config.maxPayloadSize || '10mb',
      enableCors: config.enableCors || true,
      corsOptions: config.corsOptions || {
        origin: '*',
        methods: ['POST'],
        allowedHeaders: ['Content-Type', 'X-Signature', 'Authorization'],
      },
      rateLimiting: config.rateLimiting || {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many webhook requests from this IP',
      },
    };
  }

  private createDefaultLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'webhook-receiver' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  private setupMiddleware(): void {
    // Trust proxy for correct IP addresses
    this.app.set('trust proxy', true);

    // CORS setup
    if (this.config.enableCors) {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        const { origin, methods, allowedHeaders } = this.config.corsOptions;

        if (origin) {
          if (Array.isArray(origin)) {
            const requestOrigin = req.headers.origin;
            if (requestOrigin && origin.includes(requestOrigin)) {
              res.header('Access-Control-Allow-Origin', requestOrigin);
            }
          } else {
            res.header('Access-Control-Allow-Origin', origin);
          }
        }

        if (methods) {
          res.header('Access-Control-Allow-Methods', methods.join(', '));
        }

        if (allowedHeaders) {
          res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
        }

        next();
      });
    }

    // Rate limiting
    if (this.config.rateLimiting) {
      const limiter = rateLimit({
        windowMs: this.config.rateLimiting.windowMs!,
        max: this.config.rateLimiting.max!,
        message: this.config.rateLimiting.message!,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req: Request, res: Response) => {
          this.logger.warn('Rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
          });

          res.status(429).json({
            success: false,
            message: this.config.rateLimiting!.message!,
            retryAfter: Math.round(this.config.rateLimiting!.windowMs! / 1000),
          });
        },
      });

      this.app.use(limiter);
    }

    // Request timeout
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          this.logger.error('Request timeout', {
            url: req.url,
            method: req.method,
          });
          res.status(408).json({
            success: false,
            message: 'Request timeout',
          });
        }
      }, this.config.timeout);

      res.on('finish', () => clearTimeout(timeout));
      res.on('close', () => clearTimeout(timeout));

      next();
    });

    // Raw body parser for signature validation
    this.app.use(
      express.raw({
        type: 'application/json',
        limit: this.config.maxPayloadSize,
        verify: (req: WebhookRequest, res: Response, buf: Buffer) => {
          req.rawBody = buf;
        },
      })
    );

    // Security middleware
    this.setupSecurityMiddleware();

    // Custom middleware
    this.middleware.forEach(middleware => {
      if (middleware.before) {
        this.app.use(
          async (req: WebhookRequest, res: Response, next: NextFunction) => {
            try {
              await middleware.before!(req, res, next);
            } catch (error) {
              this.handleMiddlewareError(
                error as Error,
                middleware,
                req,
                res,
                next
              );
            }
          }
        );
      }
    });

    // Request logging
    this.app.use((req: WebhookRequest, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      req.webhookId = this.generateWebhookId();
      req.timestamp = new Date();

      this.logger.info('Webhook request received', {
        webhookId: req.webhookId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentLength: req.get('Content-Length'),
        timestamp: req.timestamp,
      });

      res.on('finish', () => {
        const processingTime = Date.now() - startTime;
        this.logger.info('Webhook request completed', {
          webhookId: req.webhookId,
          statusCode: res.statusCode,
          processingTime,
          timestamp: new Date(),
        });
      });

      next();
    });
  }

  private setupSecurityMiddleware(): void {
    // IP whitelist check
    if (
      this.securityOptions.allowedIps &&
      this.securityOptions.allowedIps.length > 0
    ) {
      this.app.use((req: WebhookRequest, res: Response, next: NextFunction) => {
        const clientIp = req.ip;

        if (!this.securityOptions.allowedIps!.includes(clientIp)) {
          this.logger.warn('Unauthorized IP address', {
            ip: clientIp,
            webhookId: req.webhookId,
          });

          return res.status(403).json({
            success: false,
            message: 'Forbidden: IP address not allowed',
          });
        }

        next();
      });
    }

    // Authentication check
    if (this.securityOptions.requireAuth && this.securityOptions.authConfig) {
      this.app.use((req: WebhookRequest, res: Response, next: NextFunction) => {
        const authResult = this.validateAuthentication(req);

        if (!authResult.valid) {
          this.logger.warn('Authentication failed', {
            reason: authResult.error,
            webhookId: req.webhookId,
          });

          return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid authentication',
          });
        }

        next();
      });
    }

    // Signature validation
    if (
      this.securityOptions.validateSignature &&
      this.securityOptions.signatureConfig
    ) {
      this.app.use((req: WebhookRequest, res: Response, next: NextFunction) => {
        const signatureResult = this.validateSignature(req);

        if (!signatureResult.valid) {
          this.logger.warn('Signature validation failed', {
            reason: signatureResult.error,
            webhookId: req.webhookId,
          });

          return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid signature',
          });
        }

        req.verified = true;
        req.signature = signatureResult.signature;
        next();
      });
    }

    // Payload size validation
    if (this.securityOptions.maxPayloadSize) {
      this.app.use((req: WebhookRequest, res: Response, next: NextFunction) => {
        const contentLength = parseInt(req.get('content-length') || '0', 10);

        if (contentLength > this.securityOptions.maxPayloadSize!) {
          this.logger.warn('Payload too large', {
            contentLength,
            maxAllowed: this.securityOptions.maxPayloadSize,
            webhookId: req.webhookId,
          });

          return res.status(413).json({
            success: false,
            message: 'Payload too large',
          });
        }

        next();
      });
    }
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Main webhook endpoint
    this.app.post(
      this.config.path,
      async (req: WebhookRequest, res: Response) => {
        try {
          const response = await this.processWebhook(req);
          res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
          this.logger.error('Webhook processing error', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            webhookId: req.webhookId,
          });

          res.status(500).json({
            success: false,
            message: 'Internal server error',
            eventId: req.webhookId,
          });
        }
      }
    );

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
      });
    });

    // Global error handler
    this.app.use(
      (
        error: Error,
        req: WebhookRequest,
        res: Response,
        _next: NextFunction
      ) => {
        this.logger.error('Unhandled error', {
          error: error.message,
          stack: error.stack,
          webhookId: req.webhookId,
        });

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Internal server error',
            eventId: req.webhookId,
          });
        }
      }
    );
  }

  private validateAuthentication(req: WebhookRequest): {
    valid: boolean;
    error?: string;
  } {
    const authConfig = this.securityOptions.authConfig!;

    switch (authConfig.type) {
      case 'api_key': {
        const apiKey =
          req.get('X-API-Key') ||
          req.get('Authorization')?.replace('Bearer ', '');
        if (!apiKey || apiKey !== authConfig.config.key) {
          return { valid: false, error: 'Invalid API key' };
        }
        break;
      }

      case 'bearer_token': {
        const bearerToken = req.get('Authorization')?.replace('Bearer ', '');
        if (!bearerToken || bearerToken !== authConfig.config.token) {
          return { valid: false, error: 'Invalid bearer token' };
        }
        break;
      }

      case 'basic': {
        const authHeader = req.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Basic ')) {
          return { valid: false, error: 'Missing basic auth' };
        }

        const credentials = Buffer.from(
          authHeader.slice(6),
          'base64'
        ).toString();
        const [username, password] = credentials.split(':');

        if (
          username !== authConfig.config.username ||
          password !== authConfig.config.password
        ) {
          return { valid: false, error: 'Invalid credentials' };
        }
        break;
      }

      default:
        return { valid: false, error: 'Unsupported auth type' };
    }

    return { valid: true };
  }

  private validateSignature(req: WebhookRequest): {
    valid: boolean;
    signature?: string;
    error?: string;
  } {
    const signatureConfig = this.securityOptions.signatureConfig!;
    const receivedSignature = req.get(signatureConfig.header);

    if (!receivedSignature) {
      return { valid: false, error: 'Missing signature header' };
    }

    if (!req.rawBody) {
      return {
        valid: false,
        error: 'Missing raw body for signature validation',
      };
    }

    const expectedSignature = this.generateSignature(
      req.rawBody,
      signatureConfig
    );
    const isValid = this.compareSignatures(
      receivedSignature,
      expectedSignature,
      signatureConfig.prefix
    );

    if (!isValid) {
      return { valid: false, error: 'Signature mismatch' };
    }

    return { valid: true, signature: receivedSignature };
  }

  private generateSignature(payload: Buffer, config: WebhookSignature): string {
    switch (config.algorithm) {
      case 'sha256':
        return createHmac('sha256', config.secret)
          .update(payload)
          .digest('hex');
      case 'sha1':
        return createHmac('sha1', config.secret).update(payload).digest('hex');
      case 'md5':
        return createHmac('md5', config.secret).update(payload).digest('hex');
      default:
        throw new Error(`Unsupported signature algorithm: ${config.algorithm}`);
    }
  }

  private compareSignatures(
    received: string,
    expected: string,
    prefix?: string
  ): boolean {
    const expectedWithPrefix = prefix ? `${prefix}${expected}` : expected;

    // Use timing-safe comparison to prevent timing attacks
    if (received.length !== expectedWithPrefix.length) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(received),
      Buffer.from(expectedWithPrefix)
    );
  }

  private generateWebhookId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async processWebhook(req: WebhookRequest): Promise<WebhookResponse> {
    const startTime = Date.now();
    const response: WebhookResponse = {
      success: false,
      eventId: req.webhookId,
      processedAt: new Date(),
    };

    try {
      // Parse JSON payload
      let payload: any;
      try {
        payload = JSON.parse(req.rawBody!.toString());
      } catch (_error) {
        response.errors = [
          {
            code: 'INVALID_JSON',
            message: 'Invalid JSON payload',
          },
        ];
        return response;
      }

      // Input sanitization
      if (this.securityOptions.sanitizeInput) {
        payload = this.sanitizePayload(payload);
      }

      // Emit webhook event for processing by handlers
      const processingResult = await this.emitWebhookEvent(payload, req);

      response.success = processingResult.success;
      response.message =
        processingResult.message || 'Webhook processed successfully';
      response.errors = processingResult.errors;

      this.logger.info('Webhook processed', {
        webhookId: req.webhookId,
        processingTime: Date.now() - startTime,
        success: response.success,
      });
    } catch (error) {
      response.errors = [
        {
          code: 'PROCESSING_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown processing error',
        },
      ];

      this.logger.error('Webhook processing failed', {
        webhookId: req.webhookId,
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime,
      });
    }

    return response;
  }

  private sanitizePayload(payload: any): any {
    // Basic payload sanitization
    // This is a simplified implementation - in production, you'd want more comprehensive sanitization
    if (typeof payload === 'string') {
      return payload.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ''
      );
    }

    if (Array.isArray(payload)) {
      return payload.map(item => this.sanitizePayload(item));
    }

    if (typeof payload === 'object' && payload !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(payload)) {
        sanitized[key] = this.sanitizePayload(value);
      }
      return sanitized;
    }

    return payload;
  }

  private async emitWebhookEvent(
    _payload: any,
    _req: WebhookRequest
  ): Promise<{
    success: boolean;
    message?: string;
    errors?: WebhookError[];
  }> {
    // This will be implemented to work with the EventRouter
    // For now, return a basic success response
    return {
      success: true,
      message: 'Event emitted for processing',
    };
  }

  private handleMiddlewareError(
    error: Error,
    middleware: WebhookMiddleware,
    req: WebhookRequest,
    res: Response,
    next: NextFunction
  ): void {
    this.logger.error('Middleware error', {
      middleware: middleware.name,
      error: error.message,
      webhookId: req.webhookId,
    });

    if (middleware.error) {
      middleware.error(error, req, res, next);
    } else {
      next(error);
    }
  }

  // Public methods
  public addMiddleware(middleware: WebhookMiddleware): void {
    this.middleware.push(middleware);
  }

  public removeMiddleware(name: string): boolean {
    const index = this.middleware.findIndex(m => m.name === name);
    if (index !== -1) {
      this.middleware.splice(index, 1);
      return true;
    }
    return false;
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Webhook receiver is already running');
    }

    return new Promise((resolve, reject) => {
      this.server = createServer(this.app);

      this.server.listen(this.config.port, this.config.host, () => {
        this.isRunning = true;
        this.logger.info('Webhook receiver started', {
          host: this.config.host,
          port: this.config.port,
          path: this.config.path,
        });
        resolve();
      });

      this.server.on('error', error => {
        this.logger.error('Server error', { error: error.message });
        reject(error);
      });
    });
  }

  public async stop(): Promise<void> {
    if (!this.isRunning || !this.server) {
      return;
    }

    return new Promise(resolve => {
      this.server!.close(() => {
        this.isRunning = false;
        this.logger.info('Webhook receiver stopped');
        resolve();
      });
    });
  }

  public isListening(): boolean {
    return this.isRunning;
  }

  public getConfig(): Required<WebhookConfig> {
    return { ...this.config };
  }

  public getApp(): Express {
    return this.app;
  }
}
