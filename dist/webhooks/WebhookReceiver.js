"use strict";
/**
 * Secure webhook receiver with Express.js integration and signature validation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookReceiver = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const crypto_1 = require("crypto");
const winston_1 = __importDefault(require("winston"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
class WebhookReceiver {
    constructor(config = {}, securityOptions, logger) {
        this.server = null;
        this.middleware = [];
        this.isRunning = false;
        this.config = this.mergeWithDefaults(config);
        this.securityOptions = securityOptions;
        this.logger = logger || this.createDefaultLogger();
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
    }
    mergeWithDefaults(config) {
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
    createDefaultLogger() {
        return winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: { service: 'webhook-receiver' },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
                }),
            ],
        });
    }
    setupMiddleware() {
        // Trust proxy for correct IP addresses
        this.app.set('trust proxy', true);
        // CORS setup
        if (this.config.enableCors) {
            this.app.use((req, res, next) => {
                const { origin, methods, allowedHeaders } = this.config.corsOptions;
                if (origin) {
                    if (Array.isArray(origin)) {
                        const requestOrigin = req.headers.origin;
                        if (requestOrigin && origin.includes(requestOrigin)) {
                            res.header('Access-Control-Allow-Origin', requestOrigin);
                        }
                    }
                    else {
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
            const limiter = (0, express_rate_limit_1.default)({
                windowMs: this.config.rateLimiting.windowMs,
                max: this.config.rateLimiting.max,
                message: this.config.rateLimiting.message,
                standardHeaders: true,
                legacyHeaders: false,
                handler: (req, res) => {
                    this.logger.warn('Rate limit exceeded', {
                        ip: req.ip,
                        userAgent: req.get('User-Agent'),
                        timestamp: new Date().toISOString(),
                    });
                    res.status(429).json({
                        success: false,
                        message: this.config.rateLimiting.message,
                        retryAfter: Math.round(this.config.rateLimiting.windowMs / 1000),
                    });
                },
            });
            this.app.use(limiter);
        }
        // Request timeout
        this.app.use((req, res, next) => {
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
        this.app.use(express_1.default.raw({
            type: 'application/json',
            limit: this.config.maxPayloadSize,
            verify: (req, res, buf) => {
                req.rawBody = buf;
            },
        }));
        // Security middleware
        this.setupSecurityMiddleware();
        // Custom middleware
        this.middleware.forEach(middleware => {
            if (middleware.before) {
                this.app.use(async (req, res, next) => {
                    try {
                        await middleware.before(req, res, next);
                    }
                    catch (error) {
                        this.handleMiddlewareError(error, middleware, req, res, next);
                    }
                });
            }
        });
        // Request logging
        this.app.use((req, res, next) => {
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
    setupSecurityMiddleware() {
        // IP whitelist check
        if (this.securityOptions.allowedIps &&
            this.securityOptions.allowedIps.length > 0) {
            this.app.use((req, res, next) => {
                const clientIp = req.ip;
                if (!clientIp || !this.securityOptions.allowedIps.includes(clientIp)) {
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
            this.app.use((req, res, next) => {
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
        if (this.securityOptions.validateSignature &&
            this.securityOptions.signatureConfig) {
            this.app.use((req, res, next) => {
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
            this.app.use((req, res, next) => {
                const contentLength = parseInt(req.get('content-length') || '0', 10);
                if (contentLength > this.securityOptions.maxPayloadSize) {
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
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            });
        });
        // Main webhook endpoint
        this.app.post(this.config.path, async (req, res) => {
            try {
                const response = await this.processWebhook(req);
                res.status(response.success ? 200 : 400).json(response);
            }
            catch (error) {
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
        });
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint not found',
            });
        });
        // Global error handler
        this.app.use((error, req, res, _next) => {
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
        });
    }
    validateAuthentication(req) {
        const authConfig = this.securityOptions.authConfig;
        switch (authConfig.type) {
            case 'api_key': {
                const apiKey = req.get('X-API-Key') ||
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
                const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
                const [username, password] = credentials.split(':');
                if (username !== authConfig.config.username ||
                    password !== authConfig.config.password) {
                    return { valid: false, error: 'Invalid credentials' };
                }
                break;
            }
            default:
                return { valid: false, error: 'Unsupported auth type' };
        }
        return { valid: true };
    }
    validateSignature(req) {
        const signatureConfig = this.securityOptions.signatureConfig;
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
        const expectedSignature = this.generateSignature(req.rawBody, signatureConfig);
        const isValid = this.compareSignatures(receivedSignature, expectedSignature, signatureConfig.prefix);
        if (!isValid) {
            return { valid: false, error: 'Signature mismatch' };
        }
        return { valid: true, signature: receivedSignature };
    }
    generateSignature(payload, config) {
        switch (config.algorithm) {
            case 'sha256':
                return (0, crypto_1.createHmac)('sha256', config.secret)
                    .update(payload)
                    .digest('hex');
            case 'sha1':
                return (0, crypto_1.createHmac)('sha1', config.secret).update(payload).digest('hex');
            case 'md5':
                return (0, crypto_1.createHmac)('md5', config.secret).update(payload).digest('hex');
            default:
                throw new Error(`Unsupported signature algorithm: ${config.algorithm}`);
        }
    }
    compareSignatures(received, expected, prefix) {
        const expectedWithPrefix = prefix ? `${prefix}${expected}` : expected;
        // Use timing-safe comparison to prevent timing attacks
        if (received.length !== expectedWithPrefix.length) {
            return false;
        }
        return (0, crypto_1.timingSafeEqual)(Buffer.from(received), Buffer.from(expectedWithPrefix));
    }
    generateWebhookId() {
        return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async processWebhook(req) {
        const startTime = Date.now();
        const response = {
            success: false,
            eventId: req.webhookId,
            processedAt: new Date(),
        };
        try {
            // Parse JSON payload
            let payload;
            try {
                payload = JSON.parse(req.rawBody.toString());
            }
            catch (_error) {
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
        }
        catch (error) {
            response.errors = [
                {
                    code: 'PROCESSING_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown processing error',
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
    sanitizePayload(payload) {
        // Basic payload sanitization
        // This is a simplified implementation - in production, you'd want more comprehensive sanitization
        if (typeof payload === 'string') {
            return payload.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
        if (Array.isArray(payload)) {
            return payload.map(item => this.sanitizePayload(item));
        }
        if (typeof payload === 'object' && payload !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(payload)) {
                sanitized[key] = this.sanitizePayload(value);
            }
            return sanitized;
        }
        return payload;
    }
    async emitWebhookEvent(_payload, _req) {
        // This will be implemented to work with the EventRouter
        // For now, return a basic success response
        return {
            success: true,
            message: 'Event emitted for processing',
        };
    }
    handleMiddlewareError(error, middleware, req, res, next) {
        this.logger.error('Middleware error', {
            middleware: middleware.name,
            error: error.message,
            webhookId: req.webhookId,
        });
        if (middleware.error) {
            middleware.error(error, req, res, next);
        }
        else {
            next(error);
        }
    }
    // Public methods
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    removeMiddleware(name) {
        const index = this.middleware.findIndex(m => m.name === name);
        if (index !== -1) {
            this.middleware.splice(index, 1);
            return true;
        }
        return false;
    }
    async start() {
        if (this.isRunning) {
            throw new Error('Webhook receiver is already running');
        }
        return new Promise((resolve, reject) => {
            this.server = (0, http_1.createServer)(this.app);
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
    async stop() {
        if (!this.isRunning || !this.server) {
            return;
        }
        return new Promise(resolve => {
            this.server.close(() => {
                this.isRunning = false;
                this.logger.info('Webhook receiver stopped');
                resolve();
            });
        });
    }
    isListening() {
        return this.isRunning;
    }
    getConfig() {
        return { ...this.config };
    }
    getApp() {
        return this.app;
    }
}
exports.WebhookReceiver = WebhookReceiver;
//# sourceMappingURL=WebhookReceiver.js.map