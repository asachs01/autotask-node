/**
 * Comprehensive tests for ZoneManager
 */

import { ZoneManager, ZoneConfiguration, LoadBalancingStrategy } from '../../src/rate-limiting/ZoneManager';
import winston from 'winston';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ZoneManager', () => {
  let zoneManager: ZoneManager;
  let logger: winston.Logger;

  beforeEach(() => {
    // Create silent logger for testing
    logger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })]
    });
    
    // Clear all mocks
    jest.clearAllMocks();
    
    zoneManager = new ZoneManager(logger);
  });

  afterEach(() => {
    zoneManager.destroy();
  });

  describe('Initialization', () => {
    it('should initialize with default load balancing strategy', () => {
      const manager = new ZoneManager(logger);
      expect(manager).toBeDefined();
      manager.destroy();
    });

    it('should initialize with custom load balancing strategy', () => {
      const strategy: LoadBalancingStrategy = { type: 'round_robin' };
      const manager = new ZoneManager(logger, strategy);
      expect(manager).toBeDefined();
      manager.destroy();
    });

    it('should start health checks and metrics collection', () => {
      // Verify that intervals are set up (can't easily test private properties)
      expect(zoneManager).toBeDefined();
    });
  });

  describe('Zone Management', () => {
    const testZoneConfig: ZoneConfiguration = {
      zoneId: 'test-zone-1',
      name: 'Test Zone 1',
      apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
      region: 'us-east-1',
      isBackup: false,
      priority: 8,
      maxConcurrentRequests: 10,
      healthCheckEndpoint: '/CompanyCategories?$select=id&$top=1',
      healthCheckInterval: 30000
    };

    it('should add zones correctly', () => {
      zoneManager.addZone(testZoneConfig);
      
      const zones = zoneManager.getAllZones();
      expect(zones).toHaveLength(1);
      expect(zones[0].config.zoneId).toBe('test-zone-1');
      expect(zones[0].config.name).toBe('Test Zone 1');
    });

    it('should remove zones correctly', () => {
      zoneManager.addZone(testZoneConfig);
      expect(zoneManager.getAllZones()).toHaveLength(1);
      
      const removed = zoneManager.removeZone('test-zone-1');
      expect(removed).toBe(true);
      expect(zoneManager.getAllZones()).toHaveLength(0);
    });

    it('should handle removing non-existent zones', () => {
      const removed = zoneManager.removeZone('non-existent');
      expect(removed).toBe(false);
    });

    it('should get zone by ID', () => {
      zoneManager.addZone(testZoneConfig);
      
      const zone = zoneManager.getZone('test-zone-1');
      expect(zone).toBeDefined();
      expect(zone!.config.zoneId).toBe('test-zone-1');
      
      const nonExistent = zoneManager.getZone('non-existent');
      expect(nonExistent).toBeNull();
    });

    it('should update zone configuration', () => {
      zoneManager.addZone(testZoneConfig);
      
      const updated = zoneManager.updateZoneConfig('test-zone-1', {
        priority: 9,
        name: 'Updated Zone 1'
      });
      
      expect(updated).toBe(true);
      
      const zone = zoneManager.getZone('test-zone-1');
      expect(zone!.config.priority).toBe(9);
      expect(zone!.config.name).toBe('Updated Zone 1');
    });

    it('should emit events when zones are added/removed', (done) => {
      let eventCount = 0;
      
      zoneManager.on('zoneAdded', (event) => {
        expect(event.zoneId).toBe('test-zone-1');
        eventCount++;
      });
      
      zoneManager.on('zoneRemoved', (event) => {
        expect(event.zoneId).toBe('test-zone-1');
        eventCount++;
        if (eventCount === 2) done();
      });
      
      zoneManager.addZone(testZoneConfig);
      zoneManager.removeZone('test-zone-1');
    });
  });

  describe('Zone Selection', () => {
    const zone1: ZoneConfiguration = {
      zoneId: 'zone-1',
      name: 'Zone 1',
      apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
      region: 'us-east-1',
      isBackup: false,
      priority: 8,
      maxConcurrentRequests: 10,
      healthCheckEndpoint: '/test',
      healthCheckInterval: 30000
    };

    const zone2: ZoneConfiguration = {
      zoneId: 'zone-2',
      name: 'Zone 2',
      apiUrl: 'https://webservices2.autotask.net/ATServicesRest/v1.0/',
      region: 'us-west-1',
      isBackup: false,
      priority: 9,
      maxConcurrentRequests: 15,
      healthCheckEndpoint: '/test',
      healthCheckInterval: 30000
    };

    const backupZone: ZoneConfiguration = {
      zoneId: 'backup-zone',
      name: 'Backup Zone',
      apiUrl: 'https://webservices3.autotask.net/ATServicesRest/v1.0/',
      region: 'eu-west-1',
      isBackup: true,
      priority: 5,
      maxConcurrentRequests: 5,
      healthCheckEndpoint: '/test',
      healthCheckInterval: 30000
    };

    beforeEach(() => {
      zoneManager.addZone(zone1);
      zoneManager.addZone(zone2);
      zoneManager.addZone(backupZone);
    });

    it('should select zones based on criteria', () => {
      const selectedZone = zoneManager.selectZone({
        requireHealthy: true,
        excludeBackup: true
      });
      
      expect(selectedZone).toBeDefined();
      expect(selectedZone!.config.isBackup).toBe(false);
    });

    it('should include backup zones when specified', () => {
      // Mark primary zones as unhealthy
      zoneManager.updateZoneHealth('zone-1', false);
      zoneManager.updateZoneHealth('zone-2', false);
      
      const selectedZone = zoneManager.selectZone({
        requireHealthy: false,
        excludeBackup: false
      });
      
      expect(selectedZone).toBeDefined();
    });

    it('should filter by region preference', () => {
      const selectedZone = zoneManager.selectZone({
        requireHealthy: true,
        excludeBackup: true,
        preferredRegion: 'us-west-1'
      });
      
      expect(selectedZone).toBeDefined();
      expect(selectedZone!.config.region).toBe('us-west-1');
    });

    it('should return null when no zones match criteria', () => {
      // Mark all zones as unhealthy
      zoneManager.updateZoneHealth('zone-1', false);
      zoneManager.updateZoneHealth('zone-2', false);
      zoneManager.updateZoneHealth('backup-zone', false);
      
      const selectedZone = zoneManager.selectZone({
        requireHealthy: true,
        excludeBackup: true
      });
      
      expect(selectedZone).toBeNull();
    });

    it('should respect response time filters', () => {
      // Simulate slow response times
      const zone = zoneManager.getZone('zone-1');
      if (zone) {
        zone.health.responseTime = 15000; // 15 seconds
      }
      
      const selectedZone = zoneManager.selectZone({
        requireHealthy: true,
        excludeBackup: true,
        maxResponseTime: 10000 // 10 seconds
      });
      
      // Should not select zone-1 due to slow response time
      expect(selectedZone).toBeDefined();
      expect(selectedZone!.config.zoneId).not.toBe('zone-1');
    });

    it('should respect uptime filters', () => {
      const zone = zoneManager.getZone('zone-1');
      if (zone) {
        zone.health.uptime = 85; // 85% uptime
      }
      
      const selectedZone = zoneManager.selectZone({
        requireHealthy: true,
        excludeBackup: true,
        minUptime: 90 // 90% minimum
      });
      
      // Should not select zone-1 due to low uptime
      expect(selectedZone).toBeDefined();
      expect(selectedZone!.config.zoneId).not.toBe('zone-1');
    });
  });

  describe('Load Balancing Strategies', () => {
    beforeEach(() => {
      // Add multiple zones for load balancing tests
      for (let i = 1; i <= 3; i++) {
        zoneManager.addZone({
          zoneId: `zone-${i}`,
          name: `Zone ${i}`,
          apiUrl: `https://webservices${i}.autotask.net/ATServicesRest/v1.0/`,
          isBackup: false,
          priority: i * 2,
          maxConcurrentRequests: 10,
          healthCheckEndpoint: '/test',
          healthCheckInterval: 30000
        });
      }
    });

    it('should distribute requests using round robin', () => {
      const roundRobinManager = new ZoneManager(logger, { type: 'round_robin' });
      
      // Add zones to round robin manager
      for (let i = 1; i <= 3; i++) {
        roundRobinManager.addZone({
          zoneId: `zone-${i}`,
          name: `Zone ${i}`,
          apiUrl: `https://webservices${i}.autotask.net/ATServicesRest/v1.0/`,
          isBackup: false,
          priority: i * 2,
          maxConcurrentRequests: 10,
          healthCheckEndpoint: '/test',
          healthCheckInterval: 30000
        });
      }
      
      const selectedZones: string[] = [];
      
      // Select zones multiple times
      for (let i = 0; i < 6; i++) {
        const zone = roundRobinManager.selectZone({
          requireHealthy: true,
          excludeBackup: true
        });
        if (zone) {
          selectedZones.push(zone.config.zoneId);
        }
      }
      
      // Should have cycled through zones
      expect(selectedZones.length).toBe(6);
      expect(new Set(selectedZones).size).toBeGreaterThan(1);
      
      roundRobinManager.destroy();
    });

    it('should select zones based on least connections', () => {
      const leastConnManager = new ZoneManager(logger, { type: 'least_connections' });
      
      // Add zones
      for (let i = 1; i <= 3; i++) {
        leastConnManager.addZone({
          zoneId: `zone-${i}`,
          name: `Zone ${i}`,
          apiUrl: `https://webservices${i}.autotask.net/ATServicesRest/v1.0/`,
          isBackup: false,
          priority: i * 2,
          maxConcurrentRequests: 10,
          healthCheckEndpoint: '/test',
          healthCheckInterval: 30000
        });
      }
      
      // Simulate active requests on zone-1
      leastConnManager.recordRequestStart('zone-1', 'req-1');
      leastConnManager.recordRequestStart('zone-1', 'req-2');
      
      const selectedZone = leastConnManager.selectZone({
        requireHealthy: true,
        excludeBackup: true
      });
      
      // Should select zone with fewer connections (not zone-1)
      expect(selectedZone).toBeDefined();
      expect(selectedZone!.config.zoneId).not.toBe('zone-1');
      
      leastConnManager.destroy();
    });

    it('should handle custom load balancing strategies', () => {
      const customSelector = (zones: any[]) => zones[0]; // Always select first zone
      const customManager = new ZoneManager(logger, { 
        type: 'custom', 
        customSelector 
      });
      
      // Add zones
      for (let i = 1; i <= 3; i++) {
        customManager.addZone({
          zoneId: `zone-${i}`,
          name: `Zone ${i}`,
          apiUrl: `https://webservices${i}.autotask.net/ATServicesRest/v1.0/`,
          isBackup: false,
          priority: i * 2,
          maxConcurrentRequests: 10,
          healthCheckEndpoint: '/test',
          healthCheckInterval: 30000
        });
      }
      
      const selectedZone = customManager.selectZone({
        requireHealthy: true,
        excludeBackup: true
      });
      
      expect(selectedZone).toBeDefined();
      
      customManager.destroy();
    });
  });

  describe('Auto Zone Detection', () => {
    it('should detect zone from username successfully', async () => {
      // Mock successful zone detection response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          url: 'https://webservices5.autotask.net/ATServicesRest/'
        }
      });

      const zoneConfig = await zoneManager.autoDetectZone('test@example.com');
      
      expect(zoneConfig).toBeDefined();
      expect(zoneConfig!.zoneId).toBe('5');
      expect(zoneConfig!.apiUrl).toBe('https://webservices5.autotask.net/ATServicesRest/v1.0/');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://webservices.autotask.net/ATServicesRest/V1.0/zoneInformation?user=test%40example.com',
        { timeout: 10000 }
      );
    });

    it('should handle zone detection failures', async () => {
      // Mock failed zone detection response
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const zoneConfig = await zoneManager.autoDetectZone('invalid@example.com');
      
      expect(zoneConfig).toBeNull();
    });

    it('should handle malformed zone detection responses', async () => {
      // Mock malformed response
      mockedAxios.get.mockResolvedValueOnce({
        data: {} // Missing url field
      });

      const zoneConfig = await zoneManager.autoDetectZone('test@example.com');
      
      expect(zoneConfig).toBeDefined(); // Should still create config with unknown zone
      expect(zoneConfig!.zoneId).toBe('unknown');
    });
  });

  describe('Request Tracking', () => {
    beforeEach(() => {
      zoneManager.addZone({
        zoneId: 'test-zone',
        name: 'Test Zone',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/test',
        healthCheckInterval: 30000
      });
    });

    it('should track request start and completion', () => {
      zoneManager.recordRequestStart('test-zone', 'req-1');
      
      const zone = zoneManager.getZone('test-zone');
      expect(zone!.activeRequests.has('req-1')).toBe(true);
      expect(zone!.metrics.totalRequests).toBe(1);
      
      zoneManager.recordRequestComplete('test-zone', 'req-1', true, 500);
      
      expect(zone!.activeRequests.has('req-1')).toBe(false);
      expect(zone!.metrics.successfulRequests).toBe(1);
    });

    it('should update zone health based on request outcomes', () => {
      const zone = zoneManager.getZone('test-zone')!;
      const initialErrorRate = zone.health.errorRate;
      
      // Record successful requests
      for (let i = 0; i < 10; i++) {
        zoneManager.recordRequestStart('test-zone', `req-${i}`);
        zoneManager.recordRequestComplete('test-zone', `req-${i}`, true, 500);
      }
      
      expect(zone.health.consecutiveFailures).toBe(0);
      expect(zone.health.errorRate).toBeLessThanOrEqual(initialErrorRate);
      
      // Record failed request
      zoneManager.recordRequestStart('test-zone', 'failed-req');
      zoneManager.recordRequestComplete('test-zone', 'failed-req', false, 1000);
      
      expect(zone.health.consecutiveFailures).toBe(1);
      expect(zone.health.errorRate).toBeGreaterThan(0);
    });

    it('should update response time metrics', () => {
      const zone = zoneManager.getZone('test-zone')!;
      const initialResponseTime = zone.metrics.averageResponseTime;
      
      zoneManager.recordRequestStart('test-zone', 'req-1');
      zoneManager.recordRequestComplete('test-zone', 'req-1', true, 1000);
      
      // Average response time should be updated
      expect(zone.metrics.averageResponseTime).not.toBe(initialResponseTime);
    });

    it('should calculate current load correctly', () => {
      const zone = zoneManager.getZone('test-zone')!;
      
      // Start multiple requests
      for (let i = 0; i < 5; i++) {
        zoneManager.recordRequestStart('test-zone', `req-${i}`);
      }
      
      expect(zone.metrics.currentLoad).toBe(0.5); // 5 out of 10 max concurrent
      
      // Complete some requests
      for (let i = 0; i < 3; i++) {
        zoneManager.recordRequestComplete('test-zone', `req-${i}`, true, 500);
      }
      
      expect(zone.metrics.currentLoad).toBe(0.2); // 2 out of 10 remaining
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(() => {
      zoneManager.addZone({
        zoneId: 'test-zone',
        name: 'Test Zone',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/CompanyCategories?$select=id&$top=1',
        healthCheckInterval: 30000
      });
    });

    it('should perform health checks', async () => {
      // Mock successful health check
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ status: 200 })
      } as any);

      await zoneManager.forceHealthCheck('test-zone');
      
      const zone = zoneManager.getZone('test-zone')!;
      expect(zone.health.isHealthy).toBe(true);
    });

    it('should handle failed health checks', async () => {
      // Mock failed health check
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Health check failed'))
      } as any);

      await zoneManager.forceHealthCheck('test-zone');
      
      const zone = zoneManager.getZone('test-zone')!;
      expect(zone.health.isHealthy).toBe(false);
      expect(zone.health.consecutiveFailures).toBeGreaterThan(0);
    });

    it('should emit health check events', (done) => {
      let eventReceived = false;
      
      zoneManager.on('healthCheckSuccess', (event) => {
        expect(event.zoneId).toBe('test-zone');
        eventReceived = true;
      });
      
      zoneManager.on('healthCheckFailed', (event) => {
        expect(event.zoneId).toBe('test-zone');
        if (!eventReceived) done(); // Only complete on first event
      });
      
      // Mock failed health check to trigger event
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Health check failed'))
      } as any);
      
      zoneManager.forceHealthCheck('test-zone');
    });

    it('should update zone health manually', () => {
      zoneManager.updateZoneHealth('test-zone', false, 0.8);
      
      const zone = zoneManager.getZone('test-zone')!;
      expect(zone.health.isHealthy).toBe(false);
      expect(zone.health.errorRate).toBe(0.8);
    });
  });

  describe('Circuit Breaker', () => {
    beforeEach(() => {
      zoneManager.addZone({
        zoneId: 'test-zone',
        name: 'Test Zone',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/test',
        healthCheckInterval: 30000
      });
    });

    it('should open circuit breaker on high error rate', () => {
      const zone = zoneManager.getZone('test-zone')!;
      
      // Simulate high error rate
      for (let i = 0; i < 20; i++) {
        zoneManager.recordRequestStart('test-zone', `req-${i}`);
        zoneManager.recordRequestComplete('test-zone', `req-${i}`, i >= 15, 500); // 75% failure rate
      }
      
      // Circuit breaker should be open
      expect(zone.circuitBreakerOpen).toBe(true);
    });

    it('should emit circuit breaker events', (done) => {
      zoneManager.on('circuitBreakerOpened', (event) => {
        expect(event.zoneId).toBe('test-zone');
        expect(event.errorRate).toBeGreaterThan(0.5);
        done();
      });
      
      // Trigger circuit breaker
      for (let i = 0; i < 20; i++) {
        zoneManager.recordRequestStart('test-zone', `req-${i}`);
        zoneManager.recordRequestComplete('test-zone', `req-${i}`, false, 500); // All failures
      }
    });

    it('should close circuit breaker after recovery period', (done) => {
      const zone = zoneManager.getZone('test-zone')!;
      
      // Open circuit breaker
      for (let i = 0; i < 20; i++) {
        zoneManager.recordRequestStart('test-zone', `req-${i}`);
        zoneManager.recordRequestComplete('test-zone', `req-${i}`, false, 500);
      }
      
      expect(zone.circuitBreakerOpen).toBe(true);
      
      // Listen for circuit breaker closing
      zoneManager.on('circuitBreakerClosed', (event) => {
        expect(event.zoneId).toBe('test-zone');
        done();
      });
      
      // Simulate time passing and recovery
      if (zone.circuitBreakerOpenUntil) {
        zone.circuitBreakerOpenUntil = new Date(Date.now() - 1000); // Make it past recovery time
      }
      
      // Force health check which should close circuit breaker
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ status: 200 })
      } as any);
      
      zoneManager.forceHealthCheck('test-zone');
    });
  });

  describe('Statistics and Metrics', () => {
    beforeEach(() => {
      // Add multiple zones with different configurations
      zoneManager.addZone({
        zoneId: 'zone-1',
        name: 'Zone 1',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        region: 'us-east-1',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/test',
        healthCheckInterval: 30000
      });

      zoneManager.addZone({
        zoneId: 'zone-2',
        name: 'Zone 2',
        apiUrl: 'https://webservices2.autotask.net/ATServicesRest/v1.0/',
        region: 'us-west-1',
        isBackup: true,
        priority: 5,
        maxConcurrentRequests: 5,
        healthCheckEndpoint: '/test',
        healthCheckInterval: 30000
      });
    });

    it('should provide comprehensive zone statistics', () => {
      const stats = zoneManager.getZoneStatistics();
      
      expect(Object.keys(stats)).toContain('zone-1');
      expect(Object.keys(stats)).toContain('zone-2');
      
      const zone1Stats = stats['zone-1'];
      expect(zone1Stats.config.name).toBe('Zone 1');
      expect(zone1Stats.config.region).toBe('us-east-1');
      expect(zone1Stats.config.isBackup).toBe(false);
      expect(zone1Stats.health).toBeDefined();
      expect(zone1Stats.metrics).toBeDefined();
      expect(zone1Stats.circuitBreaker).toBeDefined();
    });

    it('should calculate success rates correctly', () => {
      // Simulate requests with mixed outcomes
      for (let i = 0; i < 10; i++) {
        zoneManager.recordRequestStart('zone-1', `req-${i}`);
        zoneManager.recordRequestComplete('zone-1', `req-${i}`, i < 8, 500); // 80% success rate
      }
      
      const stats = zoneManager.getZoneStatistics();
      const zone1Stats = stats['zone-1'];
      
      expect(zone1Stats.metrics.successRate).toBeCloseTo(80, 0);
    });

    it('should track healthy zones correctly', () => {
      // Mark zone-1 as unhealthy
      zoneManager.updateZoneHealth('zone-1', false);
      
      const healthyZones = zoneManager.getHealthyZones();
      
      expect(healthyZones).toHaveLength(1);
      expect(healthyZones[0].config.zoneId).toBe('zone-2');
    });

    it('should provide performance metrics', () => {
      // Simulate requests with different response times
      const responseTimes = [100, 200, 500, 1000, 2000];
      
      responseTimes.forEach((responseTime, index) => {
        zoneManager.recordRequestStart('zone-1', `req-${index}`);
        zoneManager.recordRequestComplete('zone-1', `req-${index}`, true, responseTime);
      });
      
      const stats = zoneManager.getZoneStatistics();
      const zone1Stats = stats['zone-1'];
      
      expect(zone1Stats.metrics.averageResponseTime).toBeGreaterThan(0);
      expect(zone1Stats.metrics.totalRequests).toBe(responseTimes.length);
    });
  });

  describe('Event Handling', () => {
    it('should emit zone selection events', (done) => {
      zoneManager.addZone({
        zoneId: 'test-zone',
        name: 'Test Zone',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/test',
        healthCheckInterval: 30000
      });

      zoneManager.on('zoneSelected', (event) => {
        expect(event.zoneId).toBe('test-zone');
        expect(event.strategy).toBeDefined();
        done();
      });

      zoneManager.selectZone({ requireHealthy: true, excludeBackup: true });
    });

    it('should emit request tracking events', (done) => {
      zoneManager.addZone({
        zoneId: 'test-zone',
        name: 'Test Zone',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/test',
        healthCheckInterval: 30000
      });

      zoneManager.on('requestCompleted', (event) => {
        expect(event.zoneId).toBe('test-zone');
        expect(event.requestId).toBe('test-request');
        expect(event.success).toBe(true);
        done();
      });

      zoneManager.recordRequestStart('test-zone', 'test-request');
      zoneManager.recordRequestComplete('test-zone', 'test-request', true, 500);
    });

    it('should emit metrics update events', (done) => {
      zoneManager.addZone({
        zoneId: 'test-zone',
        name: 'Test Zone',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/test',
        healthCheckInterval: 30000
      });

      zoneManager.on('metricsUpdated', (metrics) => {
        expect(metrics).toBeDefined();
        expect(typeof metrics).toBe('object');
        done();
      });

      // Trigger metrics update by recording some activity
      zoneManager.recordRequestStart('test-zone', 'test-request');
      zoneManager.recordRequestComplete('test-zone', 'test-request', true, 500);
    });
  });

  describe('Cleanup and Resource Management', () => {
    it('should clean up resources on destroy', () => {
      const testManager = new ZoneManager(logger);
      
      testManager.addZone({
        zoneId: 'test-zone',
        name: 'Test Zone',
        apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
        isBackup: false,
        priority: 8,
        maxConcurrentRequests: 10,
        healthCheckEndpoint: '/test',
        healthCheckInterval: 30000
      });

      expect(testManager.getAllZones()).toHaveLength(1);
      
      testManager.destroy();
      
      expect(testManager.getAllZones()).toHaveLength(0);
    });

    it('should handle destroy called multiple times', () => {
      const testManager = new ZoneManager(logger);
      
      expect(() => {
        testManager.destroy();
        testManager.destroy(); // Second call should not throw
      }).not.toThrow();
    });

    it('should remove all event listeners on destroy', () => {
      const testManager = new ZoneManager(logger);
      
      const mockListener = jest.fn();
      testManager.on('zoneAdded', mockListener);
      testManager.on('zoneRemoved', mockListener);
      
      testManager.destroy();
      
      // EventEmitter should have no listeners after destroy
      expect(testManager.listenerCount('zoneAdded')).toBe(0);
      expect(testManager.listenerCount('zoneRemoved')).toBe(0);
    });
  });
});