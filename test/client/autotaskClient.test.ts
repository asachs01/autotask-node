import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import axios, { AxiosInstance } from 'axios';
import { AutotaskClient } from '../../src/client/AutotaskClient';
import { AutotaskAuth, PerformanceConfig } from '../../src/types';
import { ConfigurationError } from '../../src/utils/errors';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AutotaskClient', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;
  let mockAuth: AutotaskAuth;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      defaults: {
        headers: {
          common: {},
        },
      },
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
        },
        response: {
          use: jest.fn(),
          eject: jest.fn(),
        },
      },
    } as any;

    mockAuth = {
      username: 'test@example.com',
      integrationCode: 'TEST123',
      secret: 'secret123',
      apiUrl: 'https://webservices.autotask.net/atservicesrest/v1.0/',
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Mock the zone detection call and connection test
    mockedAxios.get.mockResolvedValue({
      data: { url: 'https://webservices.autotask.net/atservicesrest/v1.0/' },
    });
    mockAxiosInstance.get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create AutotaskClient with valid configuration', async () => {
      const client = await AutotaskClient.create(mockAuth);

      expect(client).toBeInstanceOf(AutotaskClient);
      expect(client.tickets).toBeDefined();
      expect(client.accounts).toBeDefined();
      expect(client.contacts).toBeDefined();
      expect(client.resources).toBeDefined();
    });

    it('should create client with performance configuration', async () => {
      const performanceConfig: PerformanceConfig = {
        timeout: 60000,
        maxConcurrentRequests: 20,
        enableConnectionPooling: true,
        requestsPerSecond: 10,
      };

      const client = await AutotaskClient.create(mockAuth, performanceConfig);

      expect(client).toBeInstanceOf(AutotaskClient);

      const config = client.getPerformanceConfig();
      expect(config.timeout).toBe(60000);
      expect(config.maxConcurrentRequests).toBe(20);
      expect(config.enableConnectionPooling).toBe(true);
      expect(config.requestsPerSecond).toBe(10);
    });

    it('should use environment variables when no config provided', async () => {
      // Mock environment variables
      process.env.AUTOTASK_USERNAME = 'env@example.com';
      process.env.AUTOTASK_INTEGRATION_CODE = 'ENV123';
      process.env.AUTOTASK_SECRET = 'envsecret';
      process.env.AUTOTASK_API_URL = 'https://env.autotask.net/v1.0/';

      const client = await AutotaskClient.create();

      expect(client).toBeInstanceOf(AutotaskClient);

      // Clean up environment variables
      delete process.env.AUTOTASK_USERNAME;
      delete process.env.AUTOTASK_INTEGRATION_CODE;
      delete process.env.AUTOTASK_SECRET;
      delete process.env.AUTOTASK_API_URL;
    });

    it('should throw ConfigurationError for missing credentials', async () => {
      const invalidAuth = {
        username: '',
        integrationCode: 'TEST123',
        secret: 'secret123',
      };

      await expect(AutotaskClient.create(invalidAuth)).rejects.toThrow();
    });

    it('should detect API zone when apiUrl not provided', async () => {
      const authWithoutUrl = {
        username: 'test@example.com',
        integrationCode: 'TEST123',
        secret: 'secret123',
      };

      // Mock successful zone detection
      mockedAxios.get.mockResolvedValueOnce({
        data: { url: 'https://webservices2.autotask.net/atservicesrest/v1.0/' },
      });

      const client = await AutotaskClient.create(authWithoutUrl);

      expect(client).toBeInstanceOf(AutotaskClient);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('zoneInformation')
      );
    });

    it('should handle zone detection failure gracefully', async () => {
      const authWithoutUrl = {
        username: 'test@example.com',
        integrationCode: 'TEST123',
        secret: 'secret123',
      };

      // Mock zone detection failure completely
      mockedAxios.get.mockRejectedValue(new Error('Zone detection failed'));

      await expect(AutotaskClient.create(authWithoutUrl)).rejects.toThrow(
        ConfigurationError
      );
    });

    it('should handle zone detection complete failure', async () => {
      const authWithoutUrl = {
        username: 'test@example.com',
        integrationCode: 'TEST123',
        secret: 'secret123',
      };

      // Reset all mocks completely
      mockedAxios.get.mockReset();
      mockedAxios.post.mockReset();
      mockedAxios.create.mockReset();

      // Mock both zone detection methods to fail completely
      mockedAxios.get.mockRejectedValue(new Error('Zone detection failed'));
      mockedAxios.post.mockRejectedValue(new Error('Fallback failed'));

      await expect(AutotaskClient.create(authWithoutUrl)).rejects.toThrow(
        ConfigurationError
      );
    });
  });

  describe('entity access', () => {
    let client: AutotaskClient;

    beforeEach(async () => {
      client = await AutotaskClient.create(mockAuth);
    });

    it('should provide access to all entity types', () => {
      expect(client.tickets).toBeDefined();
      expect(client.accounts).toBeDefined();
      expect(client.contacts).toBeDefined();
      expect(client.projects).toBeDefined();
      expect(client.timeEntries).toBeDefined();
      expect(client.configurationItems).toBeDefined();
      expect(client.serviceCalls).toBeDefined();
      expect(client.tasks).toBeDefined();
      expect(client.resources).toBeDefined();
      expect(client.notes).toBeDefined();
      expect(client.attachments).toBeDefined();
      expect(client.contracts).toBeDefined();
      expect(client.contractServices).toBeDefined();
      expect(client.contractBlocks).toBeDefined();
      expect(client.contractAdjustments).toBeDefined();
      expect(client.contractExclusions).toBeDefined();
      expect(client.invoices).toBeDefined();
      expect(client.quotes).toBeDefined();
      expect(client.purchaseOrders).toBeDefined();
      expect(client.expenses).toBeDefined();
      expect(client.ticketCategories).toBeDefined();
      expect(client.ticketStatuses).toBeDefined();
      expect(client.ticketPriorities).toBeDefined();
      expect(client.ticketSources).toBeDefined();
    });
  });

  describe('performance configuration', () => {
    let client: AutotaskClient;

    beforeEach(async () => {
      const performanceConfig: PerformanceConfig = {
        timeout: 45000,
        maxConcurrentRequests: 15,
        enableConnectionPooling: true,
        maxContentLength: 100 * 1024 * 1024,
        maxBodyLength: 20 * 1024 * 1024,
        enableCompression: true,
        requestsPerSecond: 8,
        keepAliveTimeout: 45000,
      };

      client = await AutotaskClient.create(mockAuth, performanceConfig);
    });

    it('should return current performance configuration', () => {
      const config = client.getPerformanceConfig();

      expect(config.timeout).toBe(45000);
      expect(config.maxConcurrentRequests).toBe(15);
      expect(config.enableConnectionPooling).toBe(true);
      expect(config.maxContentLength).toBe(100 * 1024 * 1024);
      expect(config.maxBodyLength).toBe(20 * 1024 * 1024);
      expect(config.enableCompression).toBe(true);
      expect(config.requestsPerSecond).toBe(8);
      expect(config.keepAliveTimeout).toBe(45000);
    });

    it('should provide performance metrics', () => {
      const metrics = client.getPerformanceMetrics();

      expect(metrics).toHaveProperty('rateLimiter');
      expect(metrics).toHaveProperty('connectionPooling');
      expect(metrics).toHaveProperty('timeouts');
      expect(metrics).toHaveProperty('limits');
      expect(metrics).toHaveProperty('subClients');

      expect(metrics.rateLimiter.requestsPerSecond).toBe(8);
      expect(metrics.connectionPooling.enabled).toBe(true);
      expect(metrics.connectionPooling.maxConcurrentRequests).toBe(15);
      expect(metrics.timeouts.requestTimeout).toBe(45000);
      expect(metrics.timeouts.keepAliveTimeout).toBe(45000);
      expect(metrics.limits.maxContentLength).toBe(100 * 1024 * 1024);
      expect(metrics.limits.maxBodyLength).toBe(20 * 1024 * 1024);
      expect(metrics.subClients.total).toBeGreaterThan(0);
      expect(metrics.subClients.initialized).toBeGreaterThanOrEqual(0);
    });

    it('should allow updating rate limit at runtime', () => {
      client.updateRateLimit(12);

      const metrics = client.getPerformanceMetrics();
      expect(metrics.rateLimiter.requestsPerSecond).toBe(12);
    });
  });

  describe('logger access', () => {
    it('should provide access to logger', async () => {
      const client = await AutotaskClient.create(mockAuth);
      const logger = client.getLogger();

      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('request handler access', () => {
    it('should provide access to request handler', async () => {
      const client = await AutotaskClient.create(mockAuth);
      const requestHandler = client.getRequestHandler();

      expect(requestHandler).toBeDefined();
      expect(typeof requestHandler.executeRequest).toBe('function');
    });
  });

  describe('axios configuration', () => {
    it('should configure axios with correct headers', async () => {
      await AutotaskClient.create(mockAuth);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('autotask.net'),
          timeout: expect.any(Number),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            ApiIntegrationcode: mockAuth.integrationCode,
            Authorization: expect.stringContaining('Basic'),
          }),
        })
      );
    });

    it('should configure axios with performance settings', async () => {
      const performanceConfig: PerformanceConfig = {
        timeout: 60000,
        maxContentLength: 200 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
        enableCompression: true,
      };

      await AutotaskClient.create(mockAuth, performanceConfig);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 60000,
          maxContentLength: 200 * 1024 * 1024,
          maxBodyLength: 50 * 1024 * 1024,
          decompress: true,
        })
      );
    });

    it('should configure compression headers when enabled', async () => {
      const performanceConfig: PerformanceConfig = {
        enableCompression: true,
      };

      await AutotaskClient.create(mockAuth, performanceConfig);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          decompress: true,
        })
      );
    });

    it('should have transform request configured', async () => {
      await AutotaskClient.create(mockAuth);

      const createCall = mockedAxios.create.mock.calls[0][0];
      const transformRequest = createCall?.transformRequest;

      expect(transformRequest).toBeDefined();
      expect(Array.isArray(transformRequest)).toBe(true);
    });
  });

  describe('default configuration', () => {
    it('should use default performance configuration when none provided', async () => {
      const client = await AutotaskClient.create(mockAuth);
      const config = client.getPerformanceConfig();

      expect(config.timeout).toBe(30000);
      expect(config.maxConcurrentRequests).toBe(10);
      expect(config.enableConnectionPooling).toBe(true);
      expect(config.maxContentLength).toBe(50 * 1024 * 1024);
      expect(config.maxBodyLength).toBe(10 * 1024 * 1024);
      expect(config.enableCompression).toBe(true);
      expect(config.requestsPerSecond).toBe(5);
      expect(config.keepAliveTimeout).toBe(30000);
    });

    it('should merge provided config with defaults', async () => {
      const partialConfig: PerformanceConfig = {
        timeout: 60000,
        requestsPerSecond: 15,
      };

      const client = await AutotaskClient.create(mockAuth, partialConfig);
      const config = client.getPerformanceConfig();

      expect(config.timeout).toBe(60000); // Overridden
      expect(config.requestsPerSecond).toBe(15); // Overridden
      expect(config.maxConcurrentRequests).toBe(10); // Default
      expect(config.enableConnectionPooling).toBe(true); // Default
    });
  });

  describe('sub-client architecture', () => {
    let client: AutotaskClient;

    beforeEach(async () => {
      client = await AutotaskClient.create(mockAuth);
    });

    it('should have all sub-clients available', () => {
      expect(client.core).toBeDefined();
      expect(client.contractsClient).toBeDefined();
      expect(client.financial).toBeDefined();
      expect(client.configuration).toBeDefined();
      expect(client.timeTracking).toBeDefined();
      expect(client.knowledge).toBeDefined();
      expect(client.inventory).toBeDefined();
      expect(client.reports).toBeDefined();
    });

    it('should provide sub-client status', () => {
      const status = client.getSubClientStatus();

      expect(status).toHaveProperty('core');
      expect(status).toHaveProperty('contracts');
      expect(status).toHaveProperty('financial');
      expect(status).toHaveProperty('configuration');
      expect(status).toHaveProperty('timeTracking');
      expect(status).toHaveProperty('knowledge');
      expect(status).toHaveProperty('inventory');
      expect(status).toHaveProperty('reports');

      expect(status.core.name).toBe('CoreClient');
      expect(status.contracts.name).toBe('ContractClient');
    });

    it('should allow getting sub-clients by name', () => {
      const coreClient = client.getSubClient('core');
      expect(coreClient).toBeDefined();
      expect(coreClient?.getName()).toBe('CoreClient');

      const nonExistentClient = client.getSubClient('nonexistent');
      expect(nonExistentClient).toBeUndefined();
    });

    it('should support sub-client initialization', async () => {
      await client.initializeAllSubClients();

      const metrics = client.getPerformanceMetrics();
      expect(metrics.subClients.initialized).toBe(metrics.subClients.total);
    });

    it('should support sub-client connection testing', async () => {
      // Mock successful connection tests
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const results = await client.testAllSubClientConnections();

      expect(results).toHaveProperty('core');
      expect(results).toHaveProperty('contracts');
      expect(results).toHaveProperty('financial');
      expect(results).toHaveProperty('configuration');
    });
  });

  describe('error handling', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Clear environment variables
      delete process.env.AUTOTASK_USERNAME;
      delete process.env.AUTOTASK_INTEGRATION_CODE;
      delete process.env.AUTOTASK_SECRET;

      await expect(AutotaskClient.create()).rejects.toThrow(ConfigurationError);
    });
  });
});
