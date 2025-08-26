/**
 * Mock Autotask API Server for Integration Testing
 * 
 * This mock server simulates the Autotask REST API with realistic responses,
 * rate limiting behavior, error conditions, and zone detection capabilities.
 * It provides a controlled environment for comprehensive integration testing
 * without requiring actual Autotask API credentials.
 */

import express, { Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import winston from 'winston';
import cors from 'cors';

// Types for mock data
interface MockEntity {
  id: number;
  [key: string]: any;
}

interface MockApiResponse<T = any> {
  items: T[];
  pageDetails?: {
    count: number;
    requestCount: number;
    prevPageLink?: string;
    nextPageLink?: string;
  };
}

interface RateLimitState {
  requests: { timestamp: number; endpoint: string }[];
  blocked: boolean;
  blockUntil?: number;
}

export class MockAutotaskServer {
  private app: express.Application;
  private server: Server | null = null;
  private logger: winston.Logger;
  private port: number;
  private baseUrl: string;

  // Mock data stores
  private entities: Map<string, Map<number, MockEntity>> = new Map();
  private nextIds: Map<string, number> = new Map();
  private rateLimitState: RateLimitState = { requests: [], blocked: false };

  // Configuration
  private readonly MAX_REQUESTS_PER_HOUR = 100; // Reduced for testing
  private readonly REQUESTS_PER_SECOND_LIMIT = 5;
  private readonly ZONE_DETECTION_DELAY = 500; // ms
  private readonly ERROR_RATE = 0.05; // 5% error rate for realism

  constructor(port: number = 3001) {
    this.port = port;
    this.baseUrl = `http://localhost:${port}`;
    this.app = express();
    this.logger = winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    this.setupMiddleware();
    this.setupMockData();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // CORS support
    this.app.use(cors());
    
    // JSON parsing
    this.app.use(express.json({ limit: '10mb' }));
    
    // Logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      this.logger.info(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        headers: req.headers
      });
      next();
    });

    // Rate limiting middleware
    this.app.use(this.rateLimitMiddleware.bind(this));

    // Authentication middleware
    this.app.use(this.authMiddleware.bind(this));

    // Random error injection for realism
    this.app.use(this.errorInjectionMiddleware.bind(this));
  }

  private rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneSecondAgo = now - 1000;

    // Clean old requests
    this.rateLimitState.requests = this.rateLimitState.requests.filter(
      r => r.timestamp > oneHourAgo
    );

    // Check if currently blocked
    if (this.rateLimitState.blocked && this.rateLimitState.blockUntil && now < this.rateLimitState.blockUntil) {
      res.status(429).json({
        errors: [{
          message: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        }]
      });
      return;
    }

    // Check hourly limit
    if (this.rateLimitState.requests.length >= this.MAX_REQUESTS_PER_HOUR) {
      this.rateLimitState.blocked = true;
      this.rateLimitState.blockUntil = now + (60 * 1000); // Block for 1 minute
      res.status(429).json({
        errors: [{
          message: 'Hourly rate limit exceeded',
          code: 'HOURLY_LIMIT_EXCEEDED'
        }]
      });
      return;
    }

    // Check per-second limit
    const recentRequests = this.rateLimitState.requests.filter(
      r => r.timestamp > oneSecondAgo
    );
    
    if (recentRequests.length >= this.REQUESTS_PER_SECOND_LIMIT) {
      res.status(429).json({
        errors: [{
          message: 'Too many requests per second',
          code: 'RATE_LIMIT_PER_SECOND_EXCEEDED'
        }]
      });
      return;
    }

    // Log this request
    this.rateLimitState.requests.push({
      timestamp: now,
      endpoint: req.path
    });

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': this.MAX_REQUESTS_PER_HOUR.toString(),
      'X-RateLimit-Remaining': (this.MAX_REQUESTS_PER_HOUR - this.rateLimitState.requests.length).toString(),
      'X-RateLimit-Reset': Math.ceil((now + (60 * 60 * 1000)) / 1000).toString()
    });

    next();
  }

  private authMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Skip auth for zone detection endpoint
    if (req.path === '/ATServicesRest/V1.0/zone') {
      next();
      return;
    }

    const integrationCode = req.headers['apiintegrationcode'] as string;
    const username = req.headers['username'] as string;
    const secret = req.headers['secret'] as string;

    if (!integrationCode || !username || !secret) {
      res.status(401).json({
        errors: [{
          message: 'Missing required authentication headers',
          code: 'AUTHENTICATION_REQUIRED'
        }]
      });
      return;
    }

    // Mock authentication validation
    if (integrationCode === 'invalid' || username === 'invalid' || secret === 'invalid') {
      res.status(401).json({
        errors: [{
          message: 'Invalid authentication credentials',
          code: 'AUTHENTICATION_FAILED'
        }]
      });
      return;
    }

    next();
  }

  private errorInjectionMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Skip error injection for zone detection
    if (req.path === '/ATServicesRest/V1.0/zone') {
      next();
      return;
    }

    // Inject random errors for realism
    if (Math.random() < this.ERROR_RATE) {
      const errorTypes = [
        { status: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error occurred' },
        { status: 502, code: 'BAD_GATEWAY', message: 'Bad gateway' },
        { status: 503, code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable' },
      ];

      const error = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      
      this.logger.info(`Injecting error for realism: ${error.code}`);
      
      res.status(error.status).json({
        errors: [{
          message: error.message,
          code: error.code
        }]
      });
      return;
    }

    next();
  }

  private setupMockData(): void {
    // Initialize entity stores
    const entityTypes = [
      'Accounts', 'Companies', 'Contacts', 'Tickets', 'Projects', 'Tasks',
      'Opportunities', 'Resources', 'TimeEntries', 'Contracts', 'Invoices',
      'Products', 'Services', 'ConfigurationItems', 'Documents',
      'CompanyAttachments', 'TicketAttachments', 'ProjectAttachments'
    ];

    entityTypes.forEach(entityType => {
      this.entities.set(entityType, new Map());
      this.nextIds.set(entityType, 1000);
    });

    // Create sample data
    this.createSampleCompanies();
    this.createSampleContacts();
    this.createSampleTickets();
    this.createSampleProjects();
    this.createSampleTasks();
    this.createSampleResources();
  }

  private createSampleCompanies(): void {
    const companies = this.entities.get('Companies')!;
    
    for (let i = 1; i <= 50; i++) {
      const id = 1000 + i;
      companies.set(id, {
        id,
        companyName: `Test Company ${i}`,
        companyNumber: `COMP${i.toString().padStart(3, '0')}`,
        accountType: Math.floor(Math.random() * 3) + 1, // 1-3
        phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
        state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
        postalCode: Math.floor(Math.random() * 90000) + 10000,
        country: 'United States',
        isActive: Math.random() > 0.1,
        createDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastModifiedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: Math.floor(Math.random() * 10) + 1,
        lastModifiedBy: Math.floor(Math.random() * 10) + 1
      });
    }
  }

  private createSampleContacts(): void {
    const contacts = this.entities.get('Contacts')!;
    const companies = Array.from(this.entities.get('Companies')!.keys());
    
    for (let i = 1; i <= 150; i++) {
      const id = 2000 + i;
      const firstName = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Amy'][Math.floor(Math.random() * 8)];
      const lastName = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'][Math.floor(Math.random() * 8)];
      
      contacts.set(id, {
        id,
        firstName,
        lastName,
        emailAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        companyId: companies[Math.floor(Math.random() * companies.length)],
        isActive: Math.random() > 0.15,
        phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        title: ['Manager', 'Director', 'Coordinator', 'Specialist', 'Analyst'][Math.floor(Math.random() * 5)],
        createDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastModifiedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  private createSampleTickets(): void {
    const tickets = this.entities.get('Tickets')!;
    const companies = Array.from(this.entities.get('Companies')!.keys());
    const contacts = Array.from(this.entities.get('Contacts')!.keys());
    
    for (let i = 1; i <= 200; i++) {
      const id = 3000 + i;
      const statuses = [1, 5, 8, 13]; // New, In Progress, Waiting, Complete
      const priorities = [1, 2, 3, 4]; // Critical, High, Normal, Low
      
      tickets.set(id, {
        id,
        title: `Test Ticket ${i}`,
        description: `This is a test ticket description for ticket ${i}. It contains various details about the issue that needs to be resolved.`,
        ticketNumber: `T${(20240000 + i).toString()}`,
        accountId: companies[Math.floor(Math.random() * companies.length)],
        contactId: Math.random() > 0.3 ? contacts[Math.floor(Math.random() * contacts.length)] : null,
        assignedResourceId: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 1 : null,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        issueType: Math.floor(Math.random() * 5) + 1,
        subIssueType: Math.floor(Math.random() * 10) + 1,
        source: Math.floor(Math.random() * 8) + 1,
        estimatedHours: Math.random() * 20,
        hoursWorked: Math.random() * 10,
        dueDateTime: Math.random() > 0.5 ? 
          new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivityDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        createDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastModifiedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  private createSampleProjects(): void {
    const projects = this.entities.get('Projects')!;
    const companies = Array.from(this.entities.get('Companies')!.keys());
    
    for (let i = 1; i <= 75; i++) {
      const id = 4000 + i;
      const statuses = [1, 3, 5, 7]; // New, In Progress, On Hold, Complete
      
      projects.set(id, {
        id,
        projectName: `Test Project ${i}`,
        projectNumber: `PROJ-${i.toString().padStart(4, '0')}`,
        accountId: companies[Math.floor(Math.random() * companies.length)],
        type: Math.floor(Math.random() * 3) + 1,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        startDateTime: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: Math.random() > 0.3 ? 
          new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString() : null,
        description: `Project description for ${i}`,
        estimatedHours: Math.random() * 500 + 50,
        laborEstimatedRevenue: Math.random() * 50000 + 10000,
        createDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastModifiedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  private createSampleTasks(): void {
    const tasks = this.entities.get('Tasks')!;
    const projects = Array.from(this.entities.get('Projects')!.keys());
    
    for (let i = 1; i <= 300; i++) {
      const id = 5000 + i;
      const statuses = [1, 2, 3, 5]; // New, In Progress, Complete, Waiting
      
      tasks.set(id, {
        id,
        title: `Test Task ${i}`,
        projectId: projects[Math.floor(Math.random() * projects.length)],
        assignedResourceId: Math.random() > 0.4 ? Math.floor(Math.random() * 20) + 1 : null,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priorityLabel: Math.floor(Math.random() * 4) + 1,
        description: `Task description for task ${i}`,
        estimatedHours: Math.random() * 20 + 1,
        hoursWorked: Math.random() * 15,
        percentComplete: Math.floor(Math.random() * 101),
        startDateTime: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: Math.random() > 0.3 ? 
          new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        createDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        lastModifiedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  private createSampleResources(): void {
    const resources = this.entities.get('Resources')!;
    
    for (let i = 1; i <= 25; i++) {
      const id = 6000 + i;
      const firstName = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Drew', 'Avery'][Math.floor(Math.random() * 8)];
      const lastName = ['Anderson', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Lewis', 'Lee'][Math.floor(Math.random() * 8)];
      
      resources.set(id, {
        id,
        firstName,
        lastName,
        userName: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
        isActive: Math.random() > 0.1,
        licenseType: Math.floor(Math.random() * 3) + 1,
        securityLevel: Math.floor(Math.random() * 5) + 1,
        payrollType: Math.floor(Math.random() * 3) + 1,
        hireDate: new Date(Date.now() - Math.random() * 2000 * 24 * 60 * 60 * 1000).toISOString(),
        createDate: new Date(Date.now() - Math.random() * 2000 * 24 * 60 * 60 * 1000).toISOString(),
        lastModifiedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  private setupRoutes(): void {
    // Zone detection endpoint (always first)
    this.app.get('/ATServicesRest/V1.0/zone', async (req: Request, res: Response) => {
      // Simulate zone detection delay
      await this.sleep(this.ZONE_DETECTION_DELAY);
      
      res.json({
        URL: `${this.baseUrl}/ATServicesRest/V1.0`
      });
    });

    // Entity CRUD routes
    this.setupEntityRoutes();

    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Rate limit status endpoint
    this.app.get('/rate-limit-status', (req: Request, res: Response) => {
      res.json({
        requestsInLastHour: this.rateLimitState.requests.length,
        limitPerHour: this.MAX_REQUESTS_PER_HOUR,
        blocked: this.rateLimitState.blocked,
        blockUntil: this.rateLimitState.blockUntil
      });
    });
  }

  private setupEntityRoutes(): void {
    const entityTypes = Array.from(this.entities.keys());
    
    entityTypes.forEach(entityType => {
      const basePath = `/ATServicesRest/V1.0/${entityType}`;
      
      // List/Query entities
      this.app.get(basePath, this.handleList(entityType));
      this.app.post(`${basePath}/query`, this.handleQuery(entityType));
      
      // Get single entity
      this.app.get(`${basePath}/:id`, this.handleGet(entityType));
      
      // Create entity
      this.app.post(basePath, this.handleCreate(entityType));
      
      // Update entity
      this.app.put(`${basePath}/:id`, this.handleUpdate(entityType));
      this.app.patch(`${basePath}/:id`, this.handleUpdate(entityType));
      
      // Delete entity
      this.app.delete(`${basePath}/:id`, this.handleDelete(entityType));
    });
  }

  private handleList(entityType: string) {
    return (req: Request, res: Response) => {
      const entities = Array.from(this.entities.get(entityType)!.values());
      
      // Simple pagination
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize as string) || 25, 500);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      const items = entities.slice(startIndex, endIndex);
      
      res.json({
        items,
        pageDetails: {
          count: items.length,
          requestCount: entities.length,
          prevPageLink: page > 1 ? `${req.originalUrl}?page=${page - 1}&pageSize=${pageSize}` : null,
          nextPageLink: endIndex < entities.length ? `${req.originalUrl}?page=${page + 1}&pageSize=${pageSize}` : null
        }
      });
    };
  }

  private handleQuery(entityType: string) {
    return (req: Request, res: Response) => {
      let entities = Array.from(this.entities.get(entityType)!.values());
      const { filter, sort, page = 1, pageSize = 25 } = req.body;
      
      // Apply filters (simplified implementation)
      if (filter && Array.isArray(filter)) {
        entities = entities.filter(entity => {
          return filter.every((filterItem: any) => {
            const { field, op, value } = filterItem;
            const entityValue = entity[field];
            
            switch (op) {
              case 'eq': return entityValue == value;
              case 'ne': return entityValue != value;
              case 'gt': return entityValue > value;
              case 'gte': return entityValue >= value;
              case 'lt': return entityValue < value;
              case 'lte': return entityValue <= value;
              case 'contains': return String(entityValue).toLowerCase().includes(String(value).toLowerCase());
              case 'in': return Array.isArray(value) && value.includes(entityValue);
              default: return true;
            }
          });
        });
      }
      
      // Apply sorting
      if (sort) {
        const [field, direction = 'asc'] = sort.split(' ');
        entities.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return direction === 'desc' ? -comparison : comparison;
        });
      }
      
      // Apply pagination
      const startIndex = (page - 1) * Math.min(pageSize, 500);
      const endIndex = startIndex + Math.min(pageSize, 500);
      const items = entities.slice(startIndex, endIndex);
      
      res.json({
        items,
        pageDetails: {
          count: items.length,
          requestCount: entities.length,
          prevPageLink: page > 1 ? null : null, // Simplified
          nextPageLink: endIndex < entities.length ? null : null // Simplified
        }
      });
    };
  }

  private handleGet(entityType: string) {
    return (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const entity = this.entities.get(entityType)!.get(id);
      
      if (!entity) {
        res.status(404).json({
          errors: [{
            message: `${entityType} with ID ${id} not found`,
            code: 'NOT_FOUND'
          }]
        });
        return;
      }
      
      res.json({ item: entity });
    };
  }

  private handleCreate(entityType: string) {
    return (req: Request, res: Response) => {
      const entityData = req.body;
      const entityStore = this.entities.get(entityType)!;
      const nextId = this.nextIds.get(entityType)!;
      
      // Simulate validation errors occasionally
      if (Math.random() < 0.1) {
        res.status(400).json({
          errors: [{
            message: 'Validation failed: Required field missing',
            code: 'VALIDATION_ERROR',
            field: 'title'
          }]
        });
        return;
      }
      
      const newEntity = {
        id: nextId,
        ...entityData,
        createDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
        createdBy: 1,
        lastModifiedBy: 1
      };
      
      entityStore.set(nextId, newEntity);
      this.nextIds.set(entityType, nextId + 1);
      
      res.status(201).json({ item: newEntity });
    };
  }

  private handleUpdate(entityType: string) {
    return (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const entityStore = this.entities.get(entityType)!;
      const existingEntity = entityStore.get(id);
      
      if (!existingEntity) {
        res.status(404).json({
          errors: [{
            message: `${entityType} with ID ${id} not found`,
            code: 'NOT_FOUND'
          }]
        });
        return;
      }
      
      const updatedEntity = {
        ...existingEntity,
        ...updateData,
        id, // Ensure ID doesn't change
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 1
      };
      
      entityStore.set(id, updatedEntity);
      res.json({ item: updatedEntity });
    };
  }

  private handleDelete(entityType: string) {
    return (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const entityStore = this.entities.get(entityType)!;
      
      if (!entityStore.has(id)) {
        res.status(404).json({
          errors: [{
            message: `${entityType} with ID ${id} not found`,
            code: 'NOT_FOUND'
          }]
        });
        return;
      }
      
      entityStore.delete(id);
      res.status(204).send();
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err?: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        this.logger.info(`Mock Autotask API server started on port ${this.port}`);
        this.logger.info(`Zone detection URL: ${this.baseUrl}/ATServicesRest/V1.0/zone`);
        this.logger.info(`Health check URL: ${this.baseUrl}/health`);
        resolve();
      });
    });
  }

  public async stop(): Promise<void> {
    if (!this.server) {
      return;
    }
    
    return new Promise((resolve) => {
      this.server!.close(() => {
        this.logger.info('Mock Autotask API server stopped');
        resolve();
      });
    });
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public resetRateLimit(): void {
    this.rateLimitState = { requests: [], blocked: false };
    this.logger.info('Rate limit state reset');
  }

  public getEntityCount(entityType: string): number {
    return this.entities.get(entityType)?.size || 0;
  }

  public addEntity(entityType: string, entity: MockEntity): void {
    const entityStore = this.entities.get(entityType);
    if (entityStore) {
      entityStore.set(entity.id, entity);
    }
  }

  public removeEntity(entityType: string, id: number): boolean {
    const entityStore = this.entities.get(entityType);
    return entityStore?.delete(id) || false;
  }

  public getRequestCount(): number {
    return this.rateLimitState.requests.length;
  }
}