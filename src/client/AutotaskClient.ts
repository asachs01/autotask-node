import { AxiosInstance } from 'axios';
import axios from 'axios';
import winston from 'winston';
import { RequestHandler } from '../utils/requestHandler';
import { AutotaskAuth, PerformanceConfig, ConfigurationError } from '../types';
import {
  Tickets,
  Accounts,
  Contacts,
  Projects,
  TimeEntries,
  ConfigurationItems,
  ServiceCalls,
  Tasks,
  Resources,
  Notes,
  Attachments,
  Contracts,
  ContractServices,
  ContractBlocks,
  ContractAdjustments,
  ContractExclusions,
  Invoices,
  Quotes,
  PurchaseOrders,
  Expenses,
  TicketCategories,
  TicketStatuses,
  TicketPriorities,
  TicketSources,
} from '../entities';
import * as http from 'http';
import * as https from 'https';

// Load environment variables if available
try {
  require('dotenv').config();
} catch {
  // dotenv is optional, do nothing if not available
}

/**
 * Rate limiter to prevent overwhelming the API
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number = 1000; // 1 second

  constructor(requestsPerSecond: number) {
    this.maxRequests = requestsPerSecond;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();

    // Remove requests older than 1 second
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      // Wait until the oldest request is more than 1 second old
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitForSlot(); // Recursive call to check again
      }
    }

    this.requests.push(now);
  }
}

export class AutotaskClient {
  private axios: AxiosInstance;
  private requestHandler: RequestHandler;
  private rateLimiter: RateLimiter;
  private performanceConfig: Required<PerformanceConfig>;
  public tickets: Tickets;
  public accounts: Accounts;
  public contacts: Contacts;
  public projects: Projects;
  public timeEntries: TimeEntries;
  public configurationItems: ConfigurationItems;
  public serviceCalls: ServiceCalls;
  public tasks: Tasks;
  public resources: Resources;
  public notes: Notes;
  public attachments: Attachments;
  public contracts: Contracts;

  // Contract-related entities (Phase 2.1)
  public contractServices: ContractServices;
  public contractBlocks: ContractBlocks;
  public contractAdjustments: ContractAdjustments;
  public contractExclusions: ContractExclusions;

  // Billing & Finance entities (Phase 2.2)
  public invoices: Invoices;
  public quotes: Quotes;
  public purchaseOrders: PurchaseOrders;
  public expenses: Expenses;

  // Service Desk Enhancement entities (Phase 2.3)
  public ticketCategories: TicketCategories;
  public ticketStatuses: TicketStatuses;
  public ticketPriorities: TicketPriorities;
  public ticketSources: TicketSources;
  private logger: winston.Logger;

  private constructor(
    private config: AutotaskAuth,
    axiosInstance: AxiosInstance,
    performanceConfig?: PerformanceConfig
  ) {
    // Set default performance configuration
    this.performanceConfig = {
      timeout: 30000,
      maxConcurrentRequests: 10,
      enableConnectionPooling: true,
      maxContentLength: 50 * 1024 * 1024, // 50MB
      maxBodyLength: 10 * 1024 * 1024, // 10MB
      enableCompression: true,
      requestsPerSecond: 5,
      keepAliveTimeout: 30000,
      ...performanceConfig,
    };

    this.rateLimiter = new RateLimiter(
      this.performanceConfig.requestsPerSecond
    );

    this.logger = winston.createLogger({
      level: 'info',
      transports: [new winston.transports.Console()],
    });
    this.axios = axiosInstance;
    this.requestHandler = new RequestHandler(this.axios, this.logger, {
      timeout: this.performanceConfig.timeout,
      retries: 3,
      baseDelay: 1000,
    });

    // Setup rate limiting interceptor
    this.setupRateLimitingInterceptor();

    this.tickets = new Tickets(this.axios, this.logger, this.requestHandler);
    this.accounts = new Accounts(this.axios, this.logger);
    this.contacts = new Contacts(this.axios, this.logger);
    this.projects = new Projects(this.axios, this.logger);
    this.timeEntries = new TimeEntries(this.axios, this.logger);
    this.configurationItems = new ConfigurationItems(this.axios, this.logger);
    this.serviceCalls = new ServiceCalls(this.axios, this.logger);
    this.tasks = new Tasks(this.axios, this.logger);
    this.resources = new Resources(this.axios, this.logger);
    this.notes = new Notes(this.axios, this.logger);
    this.attachments = new Attachments(this.axios, this.logger);
    this.contracts = new Contracts(this.axios, this.logger);

    // Contract-related entities (Phase 2.1)
    this.contractServices = new ContractServices(this.axios, this.logger);
    this.contractBlocks = new ContractBlocks(this.axios, this.logger);
    this.contractAdjustments = new ContractAdjustments(this.axios, this.logger);
    this.contractExclusions = new ContractExclusions(this.axios, this.logger);

    // Billing & Finance entities (Phase 2.2)
    this.invoices = new Invoices(this.axios, this.logger);
    this.quotes = new Quotes(this.axios, this.logger);
    this.purchaseOrders = new PurchaseOrders(this.axios, this.logger);
    this.expenses = new Expenses(this.axios, this.logger);

    // Service Desk Enhancement entities (Phase 2.3)
    this.ticketCategories = new TicketCategories(this.axios, this.logger);
    this.ticketStatuses = new TicketStatuses(this.axios, this.logger);
    this.ticketPriorities = new TicketPriorities(this.axios, this.logger);
    this.ticketSources = new TicketSources(this.axios, this.logger);
  }

  /**
   * Setup rate limiting interceptor to prevent overwhelming the API
   */
  private setupRateLimitingInterceptor(): void {
    this.axios.interceptors.request.use(async config => {
      // Wait for rate limiter slot before making request
      await this.rateLimiter.waitForSlot();
      return config;
    });
  }

  /**
   * Creates a new AutotaskClient instance, with optional .env file loading.
   * If no config is provided, environment variables will be used.
   */
  static async create(
    config?: AutotaskAuth,
    performanceConfig?: PerformanceConfig
  ): Promise<AutotaskClient> {
    // Create a logger for this static method
    const logger = winston.createLogger({
      level: process.env.NODE_ENV === 'test' ? 'error' : 'info',
      format: winston.format.simple(),
      transports: [new winston.transports.Console()],
      silent:
        process.env.NODE_ENV === 'test' &&
        !process.env.DEBUG_TESTS &&
        !process.env.DEBUG_INTEGRATION_TESTS,
    });

    // If no config is provided, try to use environment variables
    if (!config) {
      config = {
        username: process.env.AUTOTASK_USERNAME!,
        integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
        secret: process.env.AUTOTASK_SECRET!,
        apiUrl: process.env.AUTOTASK_API_URL,
      };

      if (!config.username || !config.integrationCode || !config.secret) {
        throw new ConfigurationError(
          'Missing required environment variables: AUTOTASK_USERNAME, AUTOTASK_INTEGRATION_CODE, AUTOTASK_SECRET'
        );
      }
    } else {
      // Validate provided config
      if (!config.username || config.username.trim() === '') {
        throw new ConfigurationError(
          'Username is required and cannot be empty',
          'username'
        );
      }
      if (!config.integrationCode || config.integrationCode.trim() === '') {
        throw new ConfigurationError(
          'Integration code is required and cannot be empty',
          'integrationCode'
        );
      }
      if (!config.secret || config.secret.trim() === '') {
        throw new ConfigurationError(
          'Secret is required and cannot be empty',
          'secret'
        );
      }
    }

    let apiUrl = config.apiUrl;
    if (!apiUrl) {
      // Zone detection
      try {
        logger.debug('Getting zone information for username:', config.username);

        // Try format 1 - URL query parameter
        const zoneInfoUrl = `https://webservices.autotask.net/ATServicesRest/V1.0/zoneInformation?user=${encodeURIComponent(config.username)}`;
        logger.debug('Trying zone info URL:', zoneInfoUrl);

        // Make a GET request
        const response = await axios.get(zoneInfoUrl);
        logger.debug('Zone info response:', response.data);

        if (response.data && response.data.url) {
          apiUrl = response.data.url;
          logger.debug('Got API URL:', apiUrl);
        } else if (response.data && response.data.URL) {
          apiUrl = response.data.URL;
          logger.debug('Got API URL (upper case):', apiUrl);
        } else if (response.data && response.data.zoneUrl) {
          apiUrl = response.data.zoneUrl;
          logger.debug('Got API URL (zoneUrl):', apiUrl);
        } else {
          // Try extracting the API URL from any property that looks like a URL
          for (const [key, value] of Object.entries(response.data)) {
            if (typeof value === 'string' && value.includes('autotask.net')) {
              apiUrl = value;
              logger.debug(`Found API URL in field ${key}:`, apiUrl);
              break;
            }
          }
        }

        if (!apiUrl) {
          throw new ConfigurationError(
            'Could not determine API zone URL from zoneInformation response. Response data: ' +
              JSON.stringify(response.data)
          );
        }
      } catch (err: any) {
        logger.warn('Error getting zone information:', err.message);

        // Try a fallback method
        try {
          logger.debug('Trying fallback zone detection method');

          // Try format 2 - POST request
          const fallbackBody = {
            integrationCode:
              config.integrationCode || process.env.AUTOTASK_INTEGRATION_CODE,
            username: config.username,
          };

          const fallbackHeaders = {
            APIIntegrationcode:
              config.integrationCode || process.env.AUTOTASK_INTEGRATION_CODE,
            UserName: config.username,
            'Content-Type': 'application/json',
          };

          const fallbackResponse = await axios.post(
            'https://webservices.autotask.net/ATServicesRest/V1.0/zoneInformation',
            fallbackBody,
            { headers: fallbackHeaders }
          );

          logger.debug('Fallback response:', fallbackResponse.data);

          if (fallbackResponse.data && fallbackResponse.data.url) {
            apiUrl = fallbackResponse.data.url;
            logger.debug('Got API URL from fallback:', apiUrl);
          }
        } catch {
          logger.error('Fallback method also failed');
          logger.error(
            'Could not determine zone automatically. Please provide apiUrl in configuration.'
          );
          logger.error(
            'Visit https://ww1.autotask.net/help/DeveloperHelp/Content/APIs/REST/API_Calls/REST_Basic_Query_Calls.htm for more information.'
          );
        }
      }
    }

    // Double check we have an API URL before creating the client
    if (!apiUrl) {
      throw new ConfigurationError(
        'No API URL determined. Please provide the API URL explicitly or check your credentials.',
        'apiUrl'
      );
    }

    // Ensure the API URL ends with the version path
    if (!apiUrl.endsWith('/')) {
      apiUrl += '/';
    }

    if (!apiUrl.toLowerCase().endsWith('v1.0/')) {
      apiUrl += 'v1.0/';
    }

    logger.info('Creating Autotask client with API URL:', apiUrl);

    // Set default performance configuration for axios instance creation
    const defaultPerformanceConfig: Required<PerformanceConfig> = {
      timeout: 30000,
      maxConcurrentRequests: 10,
      enableConnectionPooling: true,
      maxContentLength: 50 * 1024 * 1024, // 50MB
      maxBodyLength: 10 * 1024 * 1024, // 10MB
      enableCompression: true,
      requestsPerSecond: 5,
      keepAliveTimeout: 30000,
      ...performanceConfig,
    };

    // Create HTTP/HTTPS agents with connection pooling if enabled
    let httpAgent: http.Agent | undefined;
    let httpsAgent: https.Agent | undefined;

    if (defaultPerformanceConfig.enableConnectionPooling) {
      const agentOptions = {
        keepAlive: true,
        keepAliveMsecs: defaultPerformanceConfig.keepAliveTimeout,
        maxSockets: defaultPerformanceConfig.maxConcurrentRequests,
        maxFreeSockets: Math.ceil(
          defaultPerformanceConfig.maxConcurrentRequests / 2
        ),
        timeout: defaultPerformanceConfig.timeout,
        freeSocketTimeout: defaultPerformanceConfig.keepAliveTimeout,
      };

      httpAgent = new http.Agent(agentOptions);
      httpsAgent = new https.Agent(agentOptions);
    }

    // Now create the axios instance with the determined API URL and performance configurations
    const axiosInstance = axios.create({
      baseURL: apiUrl,
      timeout: defaultPerformanceConfig.timeout,
      maxContentLength: defaultPerformanceConfig.maxContentLength,
      maxBodyLength: defaultPerformanceConfig.maxBodyLength,
      decompress: defaultPerformanceConfig.enableCompression,
      httpAgent,
      httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        ApiIntegrationcode: config.integrationCode,
        UserName: config.username,
        Secret: config.secret,
        ...(defaultPerformanceConfig.enableCompression && {
          'Accept-Encoding': 'gzip, deflate, br',
        }),
      },
      // Validate status codes - only 2xx are considered successful
      validateStatus: status => status >= 200 && status < 300,
    });

    return new AutotaskClient(config, axiosInstance, performanceConfig);
  }

  getLogger() {
    return this.logger;
  }

  getRequestHandler() {
    return this.requestHandler;
  }

  /**
   * Get current performance configuration
   */
  getPerformanceConfig(): Required<PerformanceConfig> {
    return { ...this.performanceConfig };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      rateLimiter: {
        requestsPerSecond: this.performanceConfig.requestsPerSecond,
        currentRequests: (this.rateLimiter as any).requests.length,
      },
      connectionPooling: {
        enabled: this.performanceConfig.enableConnectionPooling,
        maxConcurrentRequests: this.performanceConfig.maxConcurrentRequests,
      },
      timeouts: {
        requestTimeout: this.performanceConfig.timeout,
        keepAliveTimeout: this.performanceConfig.keepAliveTimeout,
      },
      limits: {
        maxContentLength: this.performanceConfig.maxContentLength,
        maxBodyLength: this.performanceConfig.maxBodyLength,
      },
    };
  }

  /**
   * Update rate limiting configuration at runtime
   */
  updateRateLimit(requestsPerSecond: number): void {
    this.performanceConfig.requestsPerSecond = requestsPerSecond;
    this.rateLimiter = new RateLimiter(requestsPerSecond);
    this.setupRateLimitingInterceptor();
  }
}
