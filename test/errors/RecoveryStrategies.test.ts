import {
  RecoveryStrategy,
  RecoveryContext,
  RecoveryResult,
  RetryRecoveryStrategy,
  FallbackRecoveryStrategy,
  GracefulDegradationStrategy,
  FallbackProvider,
  CacheFallbackProvider,
  StaticDataFallbackProvider,
  FeatureFlagManager,
  ErrorRecoveryHandler,
  WithRecovery,
  withRecovery,
  FeatureFlag
} from '../../src/errors/RecoveryStrategies';
import { AutotaskError, NetworkError, TimeoutError } from '../../src/errors/AutotaskErrors';
import { RetryStrategy } from '../../src/errors/RetryStrategy';

describe('RecoveryStrategies', () => {
  let mockContext: RecoveryContext;

  beforeEach(() => {
    mockContext = {
      operation: 'test-operation',
      entityType: 'TestEntity',
      attemptCount: 0,
      maxAttempts: 3,
      metadata: {
        userId: 'user123',
        correlationId: 'test-correlation-id'
      }
    };
  });

  describe('RetryRecoveryStrategy', () => {
    let retryStrategy: RetryRecoveryStrategy<any>;

    beforeEach(() => {
      const retryStrategyImpl = new RetryStrategy({
        maxRetries: 3,
        initialDelay: 100,
        backoffMultiplier: 2,
        maxDelay: 1000
      });
      retryStrategy = new RetryRecoveryStrategy(retryStrategyImpl);
    });

    it('should have correct name and priority', () => {
      expect(retryStrategy.name).toBe('retry');
      expect(retryStrategy.priority).toBe(100);
    });

    it('should handle retryable errors', () => {
      const networkError = new NetworkError('Connection failed');
      expect(retryStrategy.canHandle(networkError, mockContext)).toBe(true);
    });

    it('should not handle non-retryable errors', () => {
      const validationError = new AutotaskError('Invalid input', 'VALIDATION_ERROR', false);
      expect(retryStrategy.canHandle(validationError, mockContext)).toBe(false);
    });

    it('should not handle errors that exceed max retries', () => {
      const contextWithRetries = { ...mockContext, attemptCount: 4 };
      const networkError = new NetworkError('Connection failed');
      expect(retryStrategy.canHandle(networkError, contextWithRetries)).toBe(false);
    });

    it('should return error for retry recovery (needs original operation)', async () => {
      const networkError = new NetworkError('Connection failed');
      const result = await retryStrategy.recover(networkError, mockContext);

      expect(result.success).toBe(false);
      expect(result.strategy).toBe('retry');
      expect(result.isFallback).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Retry recovery requires original operation context');
    });
  });

  describe('FallbackRecoveryStrategy', () => {
    let fallbackStrategy: FallbackRecoveryStrategy<any>;
    let mockFallbackProvider: jest.Mocked<FallbackProvider>;

    beforeEach(() => {
      mockFallbackProvider = {
        canProvide: jest.fn(),
        getFallback: jest.fn(),
        name: 'mock-provider'
      };
      fallbackStrategy = new FallbackRecoveryStrategy(mockFallbackProvider);
    });

    it('should have correct name and priority', () => {
      expect(fallbackStrategy.name).toBe('fallback');
      expect(fallbackStrategy.priority).toBe(50);
    });

    it('should handle errors when provider can provide', () => {
      mockFallbackProvider.canProvide.mockReturnValue(true);
      const error = new NetworkError('Connection failed');
      
      expect(fallbackStrategy.canHandle(error, mockContext)).toBe(true);
      expect(mockFallbackProvider.canProvide).toHaveBeenCalledWith(mockContext);
    });

    it('should not handle errors when provider cannot provide', () => {
      mockFallbackProvider.canProvide.mockReturnValue(false);
      const error = new NetworkError('Connection failed');
      
      expect(fallbackStrategy.canHandle(error, mockContext)).toBe(false);
    });

    it('should successfully recover with fallback data', async () => {
      const fallbackData = { name: 'Fallback Data' };
      mockFallbackProvider.getFallback.mockResolvedValue(fallbackData);
      
      const error = new NetworkError('Connection failed');
      const result = await fallbackStrategy.recover(error, mockContext);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('fallback');
      expect(result.isFallback).toBe(true);
      expect(result.data).toBe(fallbackData);
      expect(result.metadata?.provider).toBe('mock-provider');
    });

    it('should handle provider errors gracefully', async () => {
      const providerError = new Error('Provider failed');
      mockFallbackProvider.getFallback.mockRejectedValue(providerError);
      
      const error = new NetworkError('Connection failed');
      const result = await fallbackStrategy.recover(error, mockContext);

      expect(result.success).toBe(false);
      expect(result.strategy).toBe('fallback');
      expect(result.isFallback).toBe(false);
      expect(result.error).toBe(providerError);
    });
  });

  describe('GracefulDegradationStrategy', () => {
    let degradationStrategy: GracefulDegradationStrategy<any>;

    beforeEach(() => {
      degradationStrategy = new GracefulDegradationStrategy();
    });

    it('should have correct name and priority', () => {
      expect(degradationStrategy.name).toBe('graceful-degradation');
      expect(degradationStrategy.priority).toBe(25);
    });

    it('should handle all errors', () => {
      const error = new NetworkError('Connection failed');
      expect(degradationStrategy.canHandle(error, mockContext)).toBe(true);
    });

    it('should provide graceful degradation with partial data', async () => {
      const error = new NetworkError('Connection failed');
      const result = await degradationStrategy.recover(error, mockContext);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('graceful-degradation');
      expect(result.isFallback).toBe(true);
      expect(result.data).toEqual({
        _degraded: true,
        operation: 'test-operation',
        message: 'Service temporarily degraded',
        timestamp: expect.any(String)
      });
      expect(result.metadata?.degradedOperation).toBe('test-operation');
    });

    it('should handle different error types appropriately', async () => {
      const timeoutError = new TimeoutError(5000, 'API call');
      const result = await degradationStrategy.recover(timeoutError, mockContext);

      expect(result.success).toBe(true);
      expect(result.metadata?.originalError).toBe('Operation \'API call\' timed out after 5000ms');
    });

    it('should track degraded features', () => {
      expect(degradationStrategy.isFeatureDegraded('test-operation')).toBe(false);
      
      const error = new NetworkError('Connection failed');
      degradationStrategy.recover(error, mockContext);
      
      expect(degradationStrategy.isFeatureDegraded('test-operation')).toBe(true);
    });

    it('should restore degraded features', () => {
      const error = new NetworkError('Connection failed');
      degradationStrategy.recover(error, mockContext);
      
      expect(degradationStrategy.isFeatureDegraded('test-operation')).toBe(true);
      
      degradationStrategy.restoreFeature('test-operation');
      expect(degradationStrategy.isFeatureDegraded('test-operation')).toBe(false);
    });
  });

  describe('CacheFallbackProvider', () => {
    let cacheProvider: CacheFallbackProvider<any>;

    beforeEach(() => {
      cacheProvider = new CacheFallbackProvider();
    });

    it('should have correct name', () => {
      expect(cacheProvider.name).toBe('cache');
    });

    it('should provide cached data when available and not expired', () => {
      const cachedData = { name: 'Cached Data' };
      cacheProvider.store(mockContext, cachedData, 60000); // 1 minute TTL
      
      expect(cacheProvider.canProvide(mockContext)).toBe(true);
    });

    it('should not provide expired cached data', () => {
      const cachedData = { name: 'Cached Data' };
      cacheProvider.store(mockContext, cachedData, 1); // 1ms TTL
      
      // Wait for expiration
      return new Promise(resolve => {
        setTimeout(() => {
          expect(cacheProvider.canProvide(mockContext)).toBe(false);
          resolve(undefined);
        }, 10);
      });
    });

    it('should not provide when no cached data exists', () => {
      expect(cacheProvider.canProvide(mockContext)).toBe(false);
    });

    it('should return cached data', async () => {
      const cachedData = { name: 'Cached Data' };
      cacheProvider.store(mockContext, cachedData, 60000);
      
      const result = await cacheProvider.getFallback(mockContext);
      expect(result).toEqual(cachedData);
    });

    it('should return null when trying to get non-existent data', async () => {
      const result = await cacheProvider.getFallback(mockContext);
      expect(result).toBeNull();
    });

    it('should generate consistent cache keys', () => {
      const context1 = { operation: 'test', entityType: 'Entity', parameters: { id: 1 } };
      const context2 = { operation: 'test', entityType: 'Entity', parameters: { id: 1 } };
      const context3 = { operation: 'test', entityType: 'Entity', parameters: { id: 2 } };
      
      cacheProvider.store(context1, { data: 'test1' });
      expect(cacheProvider.canProvide(context2)).toBe(true);
      expect(cacheProvider.canProvide(context3)).toBe(false);
    });
  });

  describe('StaticDataFallbackProvider', () => {
    let staticProvider: StaticDataFallbackProvider<any>;

    beforeEach(() => {
      staticProvider = new StaticDataFallbackProvider();
      staticProvider.addFallback('test-operation', 'TestEntity', { message: 'Static fallback data' });
      staticProvider.addFallback('another-operation', 'TestEntity', { message: 'Another static response' });
    });

    it('should have correct name', () => {
      expect(staticProvider.name).toBe('static-data');
    });

    it('should provide static data when available for operation', () => {
      expect(staticProvider.canProvide(mockContext)).toBe(true);
    });

    it('should not provide when no static data for operation', () => {
      const unknownContext = { ...mockContext, operation: 'unknown-operation' };
      expect(staticProvider.canProvide(unknownContext)).toBe(false);
    });

    it('should return static data for operation', async () => {
      const result = await staticProvider.getFallback(mockContext);
      expect(result).toEqual({ message: 'Static fallback data' });
    });

    it('should return null when no static data available', async () => {
      const unknownContext = { ...mockContext, operation: 'unknown-operation' };
      const result = await staticProvider.getFallback(unknownContext);
      expect(result).toBeNull();
    });

    it('should handle different entity types', () => {
      staticProvider.addFallback('test-operation', 'DifferentEntity', { message: 'Different entity data' });
      
      const context1 = { ...mockContext, entityType: 'TestEntity' };
      const context2 = { ...mockContext, entityType: 'DifferentEntity' };
      
      expect(staticProvider.canProvide(context1)).toBe(true);
      expect(staticProvider.canProvide(context2)).toBe(true);
    });
  });

  describe('FeatureFlagManager', () => {
    let flagManager: FeatureFlagManager;

    beforeEach(() => {
      flagManager = new FeatureFlagManager();
      
      flagManager.setFlag({ name: 'feature-a', enabled: true });
      flagManager.setFlag({ name: 'feature-b', enabled: false });
      flagManager.setFlag({ name: 'percentage-rollout', enabled: true, rollout: 50 });
    });

    it('should return correct values for boolean flags', () => {
      expect(flagManager.isEnabled('feature-a')).toBe(true);
      expect(flagManager.isEnabled('feature-b')).toBe(false);
    });

    it('should return true for unknown flags (default behavior)', () => {
      expect(flagManager.isEnabled('unknown-feature')).toBe(true);
    });

    it('should handle percentage rollout based on user ID', () => {
      // Mock hash function to return consistent values for testing
      const originalHashUserId = (flagManager as any).hashUserId;
      (flagManager as any).hashUserId = jest.fn();
      
      // Hash returns 25 (less than 50% rollout)
      ((flagManager as any).hashUserId as jest.Mock).mockReturnValue(25);
      expect(flagManager.isEnabled('percentage-rollout', 'user1')).toBe(true);
      
      // Hash returns 75 (greater than 50% rollout)
      ((flagManager as any).hashUserId as jest.Mock).mockReturnValue(75);
      expect(flagManager.isEnabled('percentage-rollout', 'user2')).toBe(false);
      
      // Restore original method
      (flagManager as any).hashUserId = originalHashUserId;
    });

    it('should handle expired flags', () => {
      const expiredFlag: FeatureFlag = {
        name: 'expired-feature',
        enabled: false,
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      };
      
      flagManager.setFlag(expiredFlag);
      expect(flagManager.isEnabled('expired-feature')).toBe(true); // Should default to enabled when expired
    });

    it('should enable and disable flags', () => {
      flagManager.disable('feature-a');
      expect(flagManager.isEnabled('feature-a')).toBe(false);
      
      flagManager.enable('feature-a');
      expect(flagManager.isEnabled('feature-a')).toBe(true);
    });

    it('should get all flags', () => {
      const flags = flagManager.getAllFlags();
      expect(flags.length).toBeGreaterThan(0);
      expect(flags.find(f => f.name === 'feature-a')).toBeDefined();
    });

    it('should remove flags', () => {
      expect(flagManager.removeFlag('feature-a')).toBe(true);
      expect(flagManager.removeFlag('non-existent')).toBe(false);
    });
  });

  describe('ErrorRecoveryHandler', () => {
    let recoveryHandler: ErrorRecoveryHandler;
    let mockRetryStrategy: jest.Mocked<RetryRecoveryStrategy<any>>;
    let mockFallbackStrategy: jest.Mocked<FallbackRecoveryStrategy<any>>;

    beforeEach(() => {
      recoveryHandler = new ErrorRecoveryHandler();
      
      mockRetryStrategy = {
        name: 'retry',
        priority: 100,
        canHandle: jest.fn(),
        recover: jest.fn()
      } as any;

      mockFallbackStrategy = {
        name: 'fallback',
        priority: 50,
        canHandle: jest.fn(),
        recover: jest.fn()
      } as any;

      // Clear default strategies and add our mocks
      recoveryHandler.removeStrategy('retry');
      recoveryHandler.removeStrategy('fallback');
      recoveryHandler.removeStrategy('graceful-degradation');
      
      recoveryHandler.addStrategy(mockFallbackStrategy);
      recoveryHandler.addStrategy(mockRetryStrategy);
    });

    it('should sort strategies by priority (highest first)', () => {
      const strategies = recoveryHandler.getStrategies();
      expect(strategies[0].priority).toBe(100); // retry should be first
      expect(strategies[1].priority).toBe(50); // fallback should be second
    });

    it('should use the first applicable strategy', async () => {
      mockRetryStrategy.canHandle.mockReturnValue(true);
      mockRetryStrategy.recover.mockResolvedValue({
        success: true,
        strategy: 'retry',
        isFallback: false
      });

      const error = new NetworkError('Connection failed');
      const result = await recoveryHandler.handleError(error, mockContext);

      expect(result.success).toBe(true);
      expect(mockRetryStrategy.canHandle).toHaveBeenCalledWith(error, mockContext);
      // Note: For retry strategy, it uses special handling and won't call recover directly
    });

    it('should try next strategy if first cannot handle', async () => {
      mockRetryStrategy.canHandle.mockReturnValue(false);
      mockFallbackStrategy.canHandle.mockReturnValue(true);
      mockFallbackStrategy.recover.mockResolvedValue({
        success: true,
        data: { fallback: 'data' },
        strategy: 'fallback',
        isFallback: true
      });

      const error = new NetworkError('Connection failed');
      const result = await recoveryHandler.handleError(error, mockContext);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ fallback: 'data' });
      expect(mockRetryStrategy.canHandle).toHaveBeenCalled();
      expect(mockFallbackStrategy.canHandle).toHaveBeenCalled();
      expect(mockFallbackStrategy.recover).toHaveBeenCalled();
    });

    it('should return failure when no strategies can handle', async () => {
      mockRetryStrategy.canHandle.mockReturnValue(false);
      mockFallbackStrategy.canHandle.mockReturnValue(false);

      const error = new NetworkError('Connection failed');
      const result = await recoveryHandler.handleError(error, mockContext);

      expect(result.success).toBe(false);
      expect(result.strategy).toBe('none');
      expect(result.error).toBe(error);
      expect(result.isFallback).toBe(false);
    });

    it('should handle strategy errors gracefully', async () => {
      const strategyError = new Error('Strategy failed');
      mockFallbackStrategy.canHandle.mockReturnValue(true);
      mockFallbackStrategy.recover.mockRejectedValue(strategyError);

      const error = new NetworkError('Connection failed');
      const result = await recoveryHandler.handleError(error, mockContext);

      expect(result.success).toBe(false);
      expect(result.strategy).toBe('none');
      expect(result.error).toBe(error);
    });

    it('should handle feature flag disabled operations', async () => {
      const featureFlags = recoveryHandler.getFeatureFlags();
      featureFlags.setFlag({ name: 'operation:test-operation', enabled: false });

      const error = new NetworkError('Connection failed');
      const result = await recoveryHandler.handleError(error, mockContext);

      expect(result.success).toBe(false);
      expect(result.strategy).toBe('feature-flag');
      expect(result.error?.message).toContain('Operation test-operation is currently disabled');
    });
  });

  describe('WithRecovery decorator', () => {
    it('should exist and be a function', () => {
      expect(typeof WithRecovery).toBe('function');
    });
  });

  describe('withRecovery utility function', () => {
    it('should use default recovery handler for successful operations', async () => {
      const operation = jest.fn().mockResolvedValue({ success: 'data' });
      
      const result = await withRecovery(operation, mockContext);
      
      expect(result).toEqual({ success: 'data' });
      expect(operation).toHaveBeenCalled();
    });

    it('should handle errors with recovery strategies', async () => {
      const operation = jest.fn().mockRejectedValue(new NetworkError('Connection failed'));
      
      const result = await withRecovery(operation, mockContext);
      
      // Should return degraded response (last resort strategy)
      expect(result).toHaveProperty('_degraded', true);
      expect(result).toHaveProperty('operation', 'test-operation');
    });

    it('should handle multiple errors with retry through original operation', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockResolvedValueOnce({ success: 'data after retry' });
      
      const result = await withRecovery(operation, mockContext);
      
      // The retry strategy will retry the original operation and succeed
      expect(result).toEqual({ success: 'data after retry' });
      expect(operation).toHaveBeenCalledTimes(2); // Initial call + 1 retry
    });
  });
});