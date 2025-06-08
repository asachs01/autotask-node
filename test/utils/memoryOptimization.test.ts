import { describe, it, expect, beforeEach } from '@jest/globals';
import axios from 'axios';
import winston from 'winston';
import {
  PaginationHandler,
  MemoryOptimizationConfig,
  estimateObjectSize,
  chunkArray,
} from '../../src/utils/memoryOptimization';
import { createMockAxios, createMockLogger } from '../utils/testHelpers';

describe('Memory Optimization Utils', () => {
  describe('PaginationHandler', () => {
    let handler: PaginationHandler;
    let mockAxios: any;
    let mockLogger: any;

    beforeEach(() => {
      mockAxios = createMockAxios();
      mockLogger = createMockLogger();
      handler = new PaginationHandler(mockAxios, mockLogger, { batchSize: 10 });
    });

    describe('constructor', () => {
      it('should initialize with default options', () => {
        const defaultHandler = new PaginationHandler(mockAxios, mockLogger);
        const config = defaultHandler.getConfig();
        expect(config.batchSize).toBe(1000);
        expect(config.enableStreaming).toBe(true);
        expect(config.memoryThreshold).toBe(100);
        expect(config.enableAutoPagination).toBe(true);
      });

      it('should initialize with custom options', () => {
        const customConfig: MemoryOptimizationConfig = {
          batchSize: 50,
          memoryThreshold: 200,
          enableStreaming: false,
        };
        const customHandler = new PaginationHandler(
          mockAxios,
          mockLogger,
          customConfig
        );
        const config = customHandler.getConfig();
        expect(config.batchSize).toBe(50);
        expect(config.memoryThreshold).toBe(200);
        expect(config.enableStreaming).toBe(false);
      });
    });

    describe('streamResults', () => {
      it('should stream all pages and yield each batch', async () => {
        // Mock responses that simulate proper pagination
        // First page: full page (2 items, same as pageSize)
        // Second page: full page (2 items, same as pageSize)
        // Third page: empty (0 items, indicating end)
        const mockResponses = [
          { data: [{ id: 1 }, { id: 2 }] }, // Full page
          { data: [{ id: 3 }, { id: 4 }] }, // Full page
          { data: [] }, // Empty page to end pagination
        ];

        mockAxios.get
          .mockResolvedValueOnce(mockResponses[0])
          .mockResolvedValueOnce(mockResponses[1])
          .mockResolvedValueOnce(mockResponses[2]);

        const batches: any[] = [];
        // Use pageSize of 2 to match our mock data
        for await (const batch of handler.streamResults(
          '/test-endpoint',
          {},
          2
        )) {
          batches.push(batch);
        }

        expect(mockAxios.get).toHaveBeenCalledTimes(3);
        expect(batches).toHaveLength(2);
        expect(batches[0]).toEqual([{ id: 1 }, { id: 2 }]);
        expect(batches[1]).toEqual([{ id: 3 }, { id: 4 }]);
      });

      it('should handle API errors', async () => {
        const error = new Error('API Error');
        mockAxios.get.mockRejectedValue(error);

        const generator = handler.streamResults('/test-endpoint');
        await expect(generator.next()).rejects.toThrow('API Error');
      });
    });

    describe('fetchAllOptimized', () => {
      it('should collect all pages into a single array', async () => {
        // Mock responses with proper pagination logic
        const mockResponses = [
          { data: [{ id: 1 }, { id: 2 }] }, // Full page (2 items)
          { data: [{ id: 3 }] }, // Partial page (1 item, less than pageSize)
          { data: [] }, // This won't be called since partial page ends pagination
        ];

        mockAxios.get
          .mockResolvedValueOnce(mockResponses[0])
          .mockResolvedValueOnce(mockResponses[1]);

        // Use pageSize of 2 to match our mock data
        const result = await handler.fetchAllOptimized('/test-endpoint', {}, 2);

        expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
      });

      it('should handle empty responses', async () => {
        mockAxios.get.mockResolvedValue({ data: [] });

        const result = await handler.fetchAllOptimized('/test-endpoint');

        expect(result).toEqual([]);
      });
    });

    describe('processBatches', () => {
      it('should process items in batches', async () => {
        // Mock responses with proper pagination logic
        const mockResponses = [
          { data: [{ id: 1 }, { id: 2 }] }, // Full page (2 items)
          { data: [{ id: 3 }, { id: 4 }] }, // Full page (2 items)
          { data: [] }, // Empty page to end pagination
        ];

        mockAxios.get
          .mockResolvedValueOnce(mockResponses[0])
          .mockResolvedValueOnce(mockResponses[1])
          .mockResolvedValueOnce(mockResponses[2]);

        const processedBatches: any[][] = [];
        const batchProcessor = jest.fn((batch: any[]) => {
          processedBatches.push([...batch]);
          return batch.map(item => ({ ...item, processed: true }));
        });

        // Use pageSize of 2 to match our mock data
        const result = await handler.processBatches(
          '/test-endpoint',
          batchProcessor,
          {},
          2
        );

        expect(batchProcessor).toHaveBeenCalledTimes(2);
        expect(processedBatches).toEqual([
          [{ id: 1 }, { id: 2 }],
          [{ id: 3 }, { id: 4 }],
        ]);
        expect(result).toEqual([
          { id: 1, processed: true },
          { id: 2, processed: true },
          { id: 3, processed: true },
          { id: 4, processed: true },
        ]);
      });

      it('should handle batch processing errors', async () => {
        mockAxios.get.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

        const batchError = new Error('Batch processing failed');
        const batchProcessor = jest.fn(async (_batch: any[]) => {
          throw batchError;
        });

        await expect(
          handler.processBatches('/test-endpoint', batchProcessor)
        ).rejects.toThrow('Batch processing failed');
      });
    });

    describe('updateConfig', () => {
      it('should update configuration', () => {
        const newConfig = { batchSize: 500, memoryThreshold: 150 };
        handler.updateConfig(newConfig);

        const config = handler.getConfig();
        expect(config.batchSize).toBe(500);
        expect(config.memoryThreshold).toBe(150);
      });
    });
  });

  describe('estimateObjectSize', () => {
    it('should estimate memory usage for simple objects', () => {
      const simpleObj = { id: 1, name: 'test' };
      const usage = estimateObjectSize(simpleObj);

      expect(usage).toBeGreaterThan(0);
      expect(typeof usage).toBe('number');
    });

    it('should estimate memory usage for arrays', () => {
      const array = [1, 2, 3, 'test', { nested: true }];
      const usage = estimateObjectSize(array);

      expect(usage).toBeGreaterThan(0);
    });

    it('should handle null and undefined', () => {
      expect(estimateObjectSize(null)).toBe(4); // "null" as string
      expect(estimateObjectSize(undefined)).toBeGreaterThan(0); // undefined becomes null in JSON
    });

    it('should estimate larger usage for larger objects', () => {
      const smallObj = { id: 1 };
      const largeObj = {
        id: 1,
        data: 'x'.repeat(1000),
        nested: {
          moreData: 'y'.repeat(500),
          array: new Array(100).fill('item'),
        },
      };

      const smallUsage = estimateObjectSize(smallObj);
      const largeUsage = estimateObjectSize(largeObj);

      expect(largeUsage).toBeGreaterThan(smallUsage);
    });
  });

  describe('chunkArray', () => {
    it('should split array into chunks of specified size', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunks = chunkArray(array, 3);

      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
    });

    it('should handle empty arrays', () => {
      const chunks = chunkArray([], 3);
      expect(chunks).toEqual([]);
    });

    it('should handle arrays smaller than chunk size', () => {
      const array = [1, 2];
      const chunks = chunkArray(array, 5);

      expect(chunks).toEqual([[1, 2]]);
    });

    it('should handle chunk size of 1', () => {
      const array = [1, 2, 3];
      const chunks = chunkArray(array, 1);

      expect(chunks).toEqual([[1], [2], [3]]);
    });

    it('should handle chunk size larger than array', () => {
      const array = [1, 2, 3];
      const chunks = chunkArray(array, 10);

      expect(chunks).toEqual([[1, 2, 3]]);
    });
  });

  describe('integration scenarios', () => {
    let integrationMockAxios: any;
    let integrationMockLogger: any;

    beforeEach(() => {
      integrationMockAxios = createMockAxios();
      integrationMockLogger = createMockLogger();
    });

    it('should handle large dataset processing with memory management', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        data: `item-${i}`,
        metadata: { index: i, processed: false },
      }));

      // Mock responses in chunks of 25
      const mockResponses: any[] = [];
      for (let i = 0; i < largeDataset.length; i += 25) {
        const chunk = largeDataset.slice(i, i + 25);
        mockResponses.push({ data: chunk });
      }
      mockResponses.push({ data: [] }); // End pagination

      integrationMockAxios.get.mockImplementation(() => {
        const response = mockResponses.shift();
        return Promise.resolve(response || { data: [] });
      });

      const handler = new PaginationHandler(
        integrationMockAxios,
        integrationMockLogger,
        { batchSize: 25 }
      );
      const result = await handler.fetchAllOptimized('/test-endpoint');

      expect(result).toHaveLength(100);
      expect(result.every((item: any) => typeof item.id === 'number')).toBe(
        true
      );
    });

    it('should handle concurrent batch processing', async () => {
      const testData = Array.from({ length: 50 }, (_, i) => ({ id: i }));

      // Mock responses in chunks of 25
      integrationMockAxios.get
        .mockResolvedValueOnce({ data: testData.slice(0, 25) })
        .mockResolvedValueOnce({ data: testData.slice(25, 50) })
        .mockResolvedValueOnce({ data: [] });

      const handler = new PaginationHandler(
        integrationMockAxios,
        integrationMockLogger,
        { batchSize: 25 }
      );

      const batchResults: number[] = [];
      const batchProcessor = jest.fn(async (batch: any[]) => {
        // Simulate async processing
        await new Promise(resolve => setTimeout(resolve, 1));
        batchResults.push(batch.length);
        return batch.map(item => ({ ...item, processed: true }));
      });

      const result = await handler.processBatches(
        '/test-endpoint',
        batchProcessor
      );

      expect(result).toHaveLength(50);
      expect(batchProcessor).toHaveBeenCalledTimes(2);
      expect(batchResults).toEqual([25, 25]);
    });
  });
});
