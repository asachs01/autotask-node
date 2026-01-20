"use strict";
/**
 * Basic webhook setup example showing how to use the webhook system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBasicWebhookSetup = createBasicWebhookSetup;
exports.runBasicExample = runBasicExample;
const WebhookManager_1 = require("../WebhookManager");
const WebhookTypes_1 = require("../types/WebhookTypes");
const AutotaskEvents_1 = require("../../events/types/AutotaskEvents");
// Example: Basic webhook setup for handling ticket events
async function createBasicWebhookSetup() {
    // Configure the webhook system
    const webhookConfig = {
        // Server configuration
        server: {
            port: 3000,
            host: 'localhost',
            path: '/autotask/webhook',
            secret: process.env.WEBHOOK_SECRET || 'your-webhook-secret',
            enableCors: true,
            maxPayloadSize: '10mb',
        },
        // Security configuration
        security: {
            validateSignature: true,
            signatureConfig: {
                algorithm: 'sha256',
                secret: process.env.WEBHOOK_SECRET || 'your-webhook-secret',
                header: 'X-Autotask-Signature',
                prefix: 'sha256=',
            },
            requireAuth: false,
            sanitizeInput: true,
            maxPayloadSize: 10 * 1024 * 1024, // 10MB
            rateLimiting: {
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 100,
                message: 'Too many webhook requests',
            },
        },
        // Delivery options
        delivery: {
            mode: 'at_least_once',
            retryPolicy: {
                maxAttempts: 3,
                initialDelayMs: 1000,
                maxDelayMs: 30000,
                backoffMultiplier: 2,
                jitterMs: 500,
            },
            timeout: 30000,
            deadLetterQueue: true,
            persistEvents: true,
        },
        // Queue configuration
        queues: [
            {
                name: 'default',
                concurrency: 5,
                retryPolicy: {
                    maxAttempts: 3,
                    initialDelayMs: 1000,
                    maxDelayMs: 10000,
                    backoffMultiplier: 2,
                    jitterMs: 100
                }
            }
        ],
        // Event store configuration (using Redis)
        eventStore: {
            type: 'redis',
            config: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                db: 0,
            },
        },
        // Enable auto-start and health monitoring
        autoStart: true,
        enableHealthCheck: true,
        healthCheckInterval: 30000,
    };
    // Create webhook manager
    const webhookManager = new WebhookManager_1.WebhookManager(webhookConfig);
    // Add event handlers
    setupEventHandlers(webhookManager);
    // Initialize the system
    await webhookManager.initialize();
    return webhookManager;
}
function setupEventHandlers(webhookManager) {
    // Handler for ticket creation events
    const ticketCreatedHandler = {
        id: 'ticket-created-handler',
        name: 'Ticket Created Handler',
        description: 'Handles new ticket creation events',
        priority: 10,
        enabled: true,
        filter: {
            entityType: [AutotaskEvents_1.AutotaskEntityType.TICKET],
            action: [WebhookTypes_1.WebhookAction.CREATE],
        },
        handle: async (event) => {
            const ticketEvent = event;
            console.log(`New ticket created: ${ticketEvent.data.title}`);
            console.log(`Ticket ID: ${ticketEvent.entityId}`);
            console.log(`Company: ${ticketEvent.data.companyName || 'Unknown'}`);
            // Example: Send notification, update external system, etc.
            try {
                await sendSlackNotification(ticketEvent);
                await updateCRM(ticketEvent);
                return {
                    success: true,
                    message: 'Ticket creation processed successfully',
                    data: {
                        ticketId: ticketEvent.entityId,
                        processed: true,
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'Failed to process ticket creation',
                    errors: [
                        {
                            code: 'PROCESSING_ERROR',
                            message: error instanceof Error ? error.message : String(error),
                        },
                    ],
                };
            }
        },
    };
    // Handler for ticket status changes
    const ticketStatusHandler = {
        id: 'ticket-status-handler',
        name: 'Ticket Status Handler',
        description: 'Handles ticket status changes',
        priority: 5,
        enabled: true,
        filter: {
            entityType: [AutotaskEvents_1.AutotaskEntityType.TICKET],
            action: [WebhookTypes_1.WebhookAction.UPDATE],
            conditions: [
                {
                    field: 'changes.status',
                    operator: 'exists',
                    value: true,
                },
            ],
        },
        handle: async (event) => {
            const ticketEvent = event;
            const statusChange = ticketEvent.changes?.find(c => c.field === 'status');
            if (statusChange) {
                console.log(`Ticket ${ticketEvent.entityId} status changed from ${statusChange.oldValue} to ${statusChange.newValue}`);
                // Handle specific status changes
                if (statusChange.newValue === 'Completed') {
                    await handleTicketCompletion(ticketEvent);
                }
            }
            return {
                success: true,
                message: 'Status change processed successfully',
            };
        },
    };
    // Handler for high-priority tickets
    const highPriorityHandler = {
        id: 'high-priority-handler',
        name: 'High Priority Ticket Handler',
        description: 'Handles high priority ticket events',
        priority: 20, // Higher priority
        enabled: true,
        filter: {
            entityType: [AutotaskEvents_1.AutotaskEntityType.TICKET],
            conditions: [
                {
                    field: 'data.priority',
                    operator: 'in',
                    value: ['High', 'Critical', 'Urgent'],
                },
            ],
        },
        handle: async (event) => {
            const ticketEvent = event;
            console.log(`🚨 HIGH PRIORITY TICKET: ${ticketEvent.data.title}`);
            // Send immediate notifications
            await Promise.all([
                sendUrgentSlackNotification(ticketEvent),
                sendEmailAlert(ticketEvent),
                createPagerDutyIncident(ticketEvent),
            ]);
            return {
                success: true,
                message: 'High priority ticket alerts sent',
            };
        },
    };
    // Add handlers to the manager
    webhookManager.addHandler(ticketCreatedHandler);
    webhookManager.addHandler(ticketStatusHandler);
    webhookManager.addHandler(highPriorityHandler);
    // Add system event listeners
    webhookManager.on('started', () => {
        console.log('✅ Webhook system started successfully');
    });
    webhookManager.on('error', error => {
        console.error('❌ Webhook system error:', error.message);
    });
    webhookManager.on('health:check', health => {
        if (health.status !== 'healthy') {
            console.warn('⚠️ System health check:', health.status, health.issues);
        }
    });
}
// Example helper functions
async function sendSlackNotification(event) {
    // Implementation would send to Slack webhook
    console.log(`📢 Slack notification sent for ticket ${event.entityId}`);
}
async function updateCRM(event) {
    // Implementation would update external CRM
    console.log(`🔄 CRM updated for ticket ${event.entityId}`);
}
async function handleTicketCompletion(event) {
    // Implementation would handle completion workflow
    console.log(`✅ Ticket completion workflow triggered for ${event.entityId}`);
}
async function sendUrgentSlackNotification(event) {
    console.log(`🚨 URGENT Slack notification sent for ticket ${event.entityId}`);
}
async function sendEmailAlert(event) {
    console.log(`📧 Email alert sent for high priority ticket ${event.entityId}`);
}
async function createPagerDutyIncident(event) {
    console.log(`📟 PagerDuty incident created for ticket ${event.entityId}`);
}
// Usage example
async function runBasicExample() {
    console.log('Starting basic webhook example...');
    try {
        const webhookManager = await createBasicWebhookSetup();
        console.log('Webhook system is running!');
        console.log(`Server listening on http://localhost:3000/autotask/webhook`);
        // Example of checking system health
        setInterval(async () => {
            const health = await webhookManager.checkHealth();
            console.log(`System status: ${health.status} (uptime: ${Math.round(health.uptime / 1000)}s)`);
        }, 60000); // Check every minute
        // Example of getting metrics
        setInterval(() => {
            const metrics = webhookManager.getMetrics();
            console.log('System metrics:', {
                totalRequests: metrics.receiver.totalRequests,
                successfulRequests: metrics.receiver.successfulRequests,
                totalEvents: metrics.router.totalEvents,
                processedEvents: metrics.router.processedEvents,
            });
        }, 300000); // Every 5 minutes
    }
    catch (error) {
        console.error('Failed to start webhook example:', error);
        process.exit(1);
    }
}
// Run example if this file is executed directly
if (require.main === module) {
    runBasicExample().catch(console.error);
}
//# sourceMappingURL=BasicWebhookSetup.js.map