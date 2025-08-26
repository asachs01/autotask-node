/**
 * Webhook simulator for testing and development
 */

import axios from 'axios';
import crypto from 'crypto';
import winston from 'winston';
import {
  WebhookTest,
  SimulationConfig,
  WebhookAction,
} from '../types/WebhookTypes';
import {
  AutotaskEntityType,
  TicketEventData,
  ProjectEventData,
  ContactEventData,
  CompanyEventData,
} from '../../events/types/AutotaskEvents';

export interface SimulationResult {
  testId: string;
  name: string;
  success: boolean;
  response?: any;
  responseTime: number;
  error?: string;
  timestamp: Date;
}

export interface SimulatorConfig {
  baseUrl: string;
  secret?: string;
  signatureHeader?: string;
  signaturePrefix?: string;
  timeout?: number;
}

export class WebhookSimulator {
  private config: SimulatorConfig;
  private logger: winston.Logger;
  private tests: Map<string, WebhookTest> = new Map();

  constructor(config: SimulatorConfig, logger?: winston.Logger) {
    this.config = config;
    this.logger = logger || this.createDefaultLogger();
    this.loadDefaultTests();
  }

  private createDefaultLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'webhook-simulator' },
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

  private loadDefaultTests(): void {
    // Add predefined test cases
    this.addTest({
      id: 'ticket-created',
      name: 'Ticket Created Event',
      description: 'Test ticket creation webhook',
      payload: this.generateTicketPayload('create'),
      expectedResponse: { success: true },
      metadata: { tags: ['ticket', 'create'], category: 'core' },
    });

    this.addTest({
      id: 'ticket-updated',
      name: 'Ticket Updated Event',
      description: 'Test ticket update webhook',
      payload: this.generateTicketPayload('update'),
      expectedResponse: { success: true },
      metadata: { tags: ['ticket', 'update'], category: 'core' },
    });

    this.addTest({
      id: 'project-created',
      name: 'Project Created Event',
      description: 'Test project creation webhook',
      payload: this.generateProjectPayload('create'),
      expectedResponse: { success: true },
      metadata: { tags: ['project', 'create'], category: 'core' },
    });

    this.addTest({
      id: 'contact-updated',
      name: 'Contact Updated Event',
      description: 'Test contact update webhook',
      payload: this.generateContactPayload('update'),
      expectedResponse: { success: true },
      metadata: { tags: ['contact', 'update'], category: 'core' },
    });

    this.addTest({
      id: 'company-created',
      name: 'Company Created Event',
      description: 'Test company creation webhook',
      payload: this.generateCompanyPayload('create'),
      expectedResponse: { success: true },
      metadata: { tags: ['company', 'create'], category: 'core' },
    });

    this.addTest({
      id: 'invalid-payload',
      name: 'Invalid Payload Test',
      description: 'Test handling of invalid payload',
      payload: { invalid: 'payload', missing: 'required fields' },
      expectedResponse: { success: false },
      metadata: { tags: ['error', 'validation'], category: 'error-handling' },
    });

    this.addTest({
      id: 'high-priority-ticket',
      name: 'High Priority Ticket Event',
      description: 'Test high priority ticket handling',
      payload: this.generateTicketPayload('create', { priority: 'Critical' }),
      expectedResponse: { success: true },
      metadata: { tags: ['ticket', 'high-priority'], category: 'priority' },
    });
  }

  // Test management
  public addTest(test: WebhookTest): void {
    this.tests.set(test.id, test);
    this.logger.debug('Test added', { testId: test.id, name: test.name });
  }

  public removeTest(testId: string): boolean {
    const removed = this.tests.delete(testId);
    if (removed) {
      this.logger.debug('Test removed', { testId });
    }
    return removed;
  }

  public getTest(testId: string): WebhookTest | undefined {
    return this.tests.get(testId);
  }

  public getTests(): WebhookTest[] {
    return Array.from(this.tests.values());
  }

  public getTestsByCategory(category: string): WebhookTest[] {
    return Array.from(this.tests.values()).filter(
      test => test.metadata?.category === category
    );
  }

  public getTestsByTag(tag: string): WebhookTest[] {
    return Array.from(this.tests.values()).filter(test =>
      test.metadata?.tags?.includes(tag)
    );
  }

  // Single test execution
  public async runTest(testId: string): Promise<SimulationResult> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test not found: ${testId}`);
    }

    const startTime = Date.now();

    try {
      this.logger.info('Running test', { testId, name: test.name });

      const response = await this.sendWebhook(test.payload);
      const responseTime = Date.now() - startTime;

      const success = this.validateResponse(response, test.expectedResponse);

      const result: SimulationResult = {
        testId,
        name: test.name,
        success,
        response: response.data,
        responseTime,
        timestamp: new Date(),
      };

      this.logger.info('Test completed', {
        testId,
        success,
        responseTime: `${responseTime}ms`,
      });

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      const result: SimulationResult = {
        testId,
        name: test.name,
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      };

      this.logger.error('Test failed', {
        testId,
        error: result.error,
        responseTime: `${responseTime}ms`,
      });

      return result;
    }
  }

  // Batch test execution
  public async runTests(testIds?: string[]): Promise<SimulationResult[]> {
    const testsToRun = testIds || Array.from(this.tests.keys());
    const results: SimulationResult[] = [];

    this.logger.info('Running test batch', {
      totalTests: testsToRun.length,
      testIds: testsToRun,
    });

    for (const testId of testsToRun) {
      try {
        const result = await this.runTest(testId);
        results.push(result);
      } catch (error) {
        results.push({
          testId,
          name: this.tests.get(testId)?.name || 'Unknown',
          success: false,
          responseTime: 0,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    this.logger.info('Test batch completed', {
      total: results.length,
      successful,
      failed,
      successRate: `${Math.round((successful / results.length) * 100)}%`,
    });

    return results;
  }

  // Continuous simulation
  public async runSimulation(config: SimulationConfig): Promise<void> {
    this.logger.info('Starting webhook simulation', {
      eventTypes: config.eventTypes,
      entityTypes: config.entityTypes,
      frequency: config.frequency,
      duration: config.duration,
    });

    const startTime = Date.now();
    let eventCount = 0;

    const interval = 1000 / config.frequency; // milliseconds between events

    const sendEvent = async () => {
      if (config.duration && Date.now() - startTime > config.duration * 1000) {
        return; // Stop simulation
      }

      try {
        const payload = this.generateRandomPayload(config);
        await this.sendWebhook(payload);
        eventCount++;

        if (eventCount % 10 === 0) {
          this.logger.info('Simulation progress', {
            eventsSent: eventCount,
            elapsed: `${Math.round((Date.now() - startTime) / 1000)}s`,
          });
        }
      } catch (error) {
        this.logger.error('Simulation event failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      setTimeout(sendEvent, interval);
    };

    // Start the simulation
    sendEvent();

    // If duration is specified, schedule stop
    if (config.duration) {
      setTimeout(() => {
        this.logger.info('Simulation completed', {
          totalEvents: eventCount,
          duration: `${config.duration}s`,
          averageRate: Math.round(eventCount / config.duration!),
        });
      }, config.duration * 1000);
    }
  }

  // Webhook sending
  private async sendWebhook(payload: any): Promise<any> {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Autotask-Webhook-Simulator/1.0',
    };

    // Add signature if configured
    if (this.config.secret && this.config.signatureHeader) {
      const signature = this.generateSignature(body, this.config.secret);
      const prefix = this.config.signaturePrefix || '';
      headers[this.config.signatureHeader] = `${prefix}${signature}`;
    }

    return axios.post(this.config.baseUrl, payload, {
      headers,
      timeout: this.config.timeout || 30000,
      validateStatus: () => true, // Accept all status codes
    });
  }

  private generateSignature(body: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }

  private validateResponse(response: any, expected?: any): boolean {
    if (!expected) {
      return response.status >= 200 && response.status < 300;
    }

    // Simple validation - can be enhanced
    if (expected.success !== undefined) {
      return response.data?.success === expected.success;
    }

    return true;
  }

  // Payload generators
  private generateRandomPayload(config: SimulationConfig): any {
    this.randomChoice(config.eventTypes); // Consume to avoid unused warning
    const entityType = this.randomChoice(config.entityTypes);

    const action = this.randomChoice([
      WebhookAction.CREATE,
      WebhookAction.UPDATE,
      WebhookAction.DELETE,
    ]);

    switch (entityType) {
      case AutotaskEntityType.TICKET:
        return this.generateTicketPayload(action);
      case AutotaskEntityType.PROJECT:
        return this.generateProjectPayload(action);
      case AutotaskEntityType.CONTACT:
        return this.generateContactPayload(action);
      case AutotaskEntityType.COMPANY:
        return this.generateCompanyPayload(action);
      default:
        return this.generateGenericPayload(entityType, action);
    }
  }

  private generateTicketPayload(action: string, overrides: any = {}): any {
    const ticketData: Partial<TicketEventData> = {
      id: this.randomId(),
      ticketNumber: `T${this.randomId().padStart(8, '0')}`,
      title: this.randomChoice([
        'Server Down - Critical Issue',
        'Email not working',
        'Password reset request',
        'Software installation needed',
        'Network connectivity issue',
      ]),
      description: 'Auto-generated test ticket from webhook simulator',
      status: this.randomChoice([
        'New',
        'In Progress',
        'Waiting Customer',
        'Complete',
      ]),
      priority: this.randomChoice(['Low', 'Medium', 'High', 'Critical']),
      queue: 'IT Support',
      accountID: this.randomId(),
      contactID: this.randomId(),
      projectID: Math.random() > 0.5 ? this.randomId() : undefined,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
      estimatedHours: Math.random() * 8,
      hoursWorked: Math.random() * 4,
      category: this.randomChoice(['Hardware', 'Software', 'Network', 'Other']),
      source: this.randomChoice(['Email', 'Phone', 'Portal', 'Walk-in']),
      ...overrides,
    };

    return {
      eventType: action,
      action,
      entityType: AutotaskEntityType.TICKET,
      entityId: ticketData.id!.toString(),
      timestamp: new Date().toISOString(),
      zoneId: 'webservices12.autotask.net',
      entity: ticketData,
      changes:
        action === 'update'
          ? [
              {
                field: 'status',
                oldValue: 'New',
                newValue: ticketData.status,
              },
            ]
          : undefined,
    };
  }

  private generateProjectPayload(action: string, overrides: any = {}): any {
    const projectData: Partial<ProjectEventData> = {
      id: this.randomId(),
      projectNumber: `P${this.randomId().padStart(6, '0')}`,
      projectName: this.randomChoice([
        'Website Redesign',
        'Server Migration',
        'Network Upgrade',
        'Software Implementation',
        'Security Audit',
      ]),
      description: 'Auto-generated test project from webhook simulator',
      status: this.randomChoice(['New', 'In Progress', 'Complete', 'On Hold']),
      type: this.randomChoice(['Fixed Price', 'Time & Materials', 'Recurring']),
      accountID: this.randomId(),
      projectLeadResourceID: this.randomId(),
      startDateTime: new Date().toISOString(),
      endDateTime: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      estimatedTime: Math.random() * 100 + 20,
      budget: Math.random() * 50000 + 10000,
      ...overrides,
    };

    return {
      eventType: action,
      action,
      entityType: AutotaskEntityType.PROJECT,
      entityId: projectData.id!.toString(),
      timestamp: new Date().toISOString(),
      zoneId: 'webservices12.autotask.net',
      entity: projectData,
    };
  }

  private generateContactPayload(action: string, overrides: any = {}): any {
    const firstName = this.randomChoice([
      'John',
      'Jane',
      'Mike',
      'Sarah',
      'David',
      'Lisa',
    ]);
    const lastName = this.randomChoice([
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Davis',
      'Miller',
    ]);

    const contactData: Partial<ContactEventData> = {
      id: this.randomId(),
      firstName,
      lastName,
      emailAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      accountID: this.randomId(),
      isActive: true,
      title: this.randomChoice([
        'Manager',
        'Director',
        'Administrator',
        'Coordinator',
        'Analyst',
      ]),
      city: this.randomChoice([
        'New York',
        'Los Angeles',
        'Chicago',
        'Houston',
        'Phoenix',
      ]),
      state: this.randomChoice(['NY', 'CA', 'IL', 'TX', 'AZ']),
      lastModifiedDate: new Date().toISOString(),
      ...overrides,
    };

    return {
      eventType: action,
      action,
      entityType: AutotaskEntityType.CONTACT,
      entityId: contactData.id!.toString(),
      timestamp: new Date().toISOString(),
      zoneId: 'webservices12.autotask.net',
      entity: contactData,
    };
  }

  private generateCompanyPayload(action: string, overrides: any = {}): any {
    const companyData: Partial<CompanyEventData> = {
      id: this.randomId(),
      companyName: this.randomChoice([
        'Acme Corporation',
        'Global Tech Solutions',
        'Premier Services Inc',
        'Dynamic Systems LLC',
        'Innovative Solutions Group',
      ]),
      accountType: this.randomChoice([
        'Customer',
        'Prospect',
        'Vendor',
        'Partner',
      ]),
      isActive: true,
      phone: `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      city: this.randomChoice([
        'New York',
        'Los Angeles',
        'Chicago',
        'Houston',
        'Phoenix',
      ]),
      state: this.randomChoice(['NY', 'CA', 'IL', 'TX', 'AZ']),
      country: 'United States',
      lastModifiedDate: new Date().toISOString(),
      ...overrides,
    };

    return {
      eventType: action,
      action,
      entityType: AutotaskEntityType.COMPANY,
      entityId: companyData.id!.toString(),
      timestamp: new Date().toISOString(),
      zoneId: 'webservices12.autotask.net',
      entity: companyData,
    };
  }

  private generateGenericPayload(entityType: string, action: string): any {
    return {
      eventType: action,
      action,
      entityType,
      entityId: this.randomId().toString(),
      timestamp: new Date().toISOString(),
      zoneId: 'webservices12.autotask.net',
      entity: {
        id: this.randomId(),
        name: `Test ${entityType}`,
        lastModifiedDate: new Date().toISOString(),
      },
    };
  }

  // Utility methods
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomId(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  // Statistics and reporting
  public generateTestReport(results: SimulationResult[]): {
    summary: any;
    details: SimulationResult[];
    recommendations: string[];
  } {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const avgResponseTime =
      results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    const summary = {
      totalTests: results.length,
      successful: successful.length,
      failed: failed.length,
      successRate: Math.round((successful.length / results.length) * 100),
      averageResponseTime: Math.round(avgResponseTime),
      fastestResponse: Math.min(...results.map(r => r.responseTime)),
      slowestResponse: Math.max(...results.map(r => r.responseTime)),
    };

    const recommendations = [];

    if (summary.successRate < 90) {
      recommendations.push(
        'Success rate is below 90%. Review error handling and validation.'
      );
    }

    if (summary.averageResponseTime > 5000) {
      recommendations.push(
        'Average response time exceeds 5 seconds. Consider optimization.'
      );
    }

    if (failed.length > 0) {
      const commonErrors = this.getCommonErrors(failed);
      recommendations.push(`Common errors: ${commonErrors.join(', ')}`);
    }

    return {
      summary,
      details: results,
      recommendations,
    };
  }

  private getCommonErrors(failedResults: SimulationResult[]): string[] {
    const errorCounts: Record<string, number> = {};

    for (const result of failedResults) {
      if (result.error) {
        const errorType = result.error.split(':')[0]; // Get first part of error
        errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
      }
    }

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([error]) => error);
  }
}
