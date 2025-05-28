import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
  TicketPriorities,
  TicketPriority,
} from '../../src/entities/ticketPriorities';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { createMockAxios, createMockLogger } from '../utils/testHelpers';

describe('TicketPriorities', () => {
  let ticketPriorities: TicketPriorities;
  let mockAxios: any;
  let mockLogger: any;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    ticketPriorities = new TicketPriorities(mockAxios, mockLogger);
  });

  describe('constructor', () => {
    it('should initialize with correct endpoint', () => {
      expect(ticketPriorities['endpoint']).toBe('/TicketPriorities');
    });

    it('should store the axios instance and logger', () => {
      expect(ticketPriorities['axios']).toBe(mockAxios);
      expect(ticketPriorities['logger']).toBe(mockLogger);
    });
  });

  describe('list', () => {
    it('should call axios.get with correct parameters', async () => {
      const mockResponse = {
        data: [{ id: 1, name: 'High', priorityLevel: 1, isActive: true }],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const options = { pageSize: 10, page: 1 };
      const result = await ticketPriorities.list(options);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketPriorities', {
        params: { pageSize: 10, page: 1 },
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle sorting by priority level', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Critical', priorityLevel: 1, isActive: true },
          { id: 2, name: 'High', priorityLevel: 2, isActive: true },
          { id: 3, name: 'Medium', priorityLevel: 3, isActive: true },
        ],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const options = {
        sort: 'priorityLevel asc',
        filter: { isActive: true },
      };
      const result = await ticketPriorities.list(options);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketPriorities', {
        params: {
          search: JSON.stringify({ isActive: true }),
          sort: 'priorityLevel asc',
        },
      });
      expect(result.data).toHaveLength(3);
    });

    it('should propagate errors from axios', async () => {
      const error = new Error('API Error');
      mockAxios.get.mockRejectedValue(error);

      await expect(ticketPriorities.list()).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should call axios.get with correct ID', async () => {
      const mockPriority = { id: 123, name: 'Urgent', priorityLevel: 1 };
      const mockResponse = { data: mockPriority };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await ticketPriorities.get(123);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketPriorities/123');
      expect(result.data).toEqual(mockPriority);
    });

    it('should propagate errors for non-existent priority', async () => {
      const error = new Error('Ticket priority not found');
      mockAxios.get.mockRejectedValue(error);

      await expect(ticketPriorities.get(999)).rejects.toThrow(
        'Ticket priority not found'
      );
    });
  });

  describe('create', () => {
    it('should call axios.post with priority data', async () => {
      const priorityData: TicketPriority = {
        name: 'Custom Priority',
        priorityLevel: 5,
        isActive: true,
        description: 'A custom ticket priority',
      };
      const mockResponse = { data: { id: 789, ...priorityData } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await ticketPriorities.create(priorityData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TicketPriorities',
        priorityData
      );
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle priority level validation', async () => {
      const invalidData = { name: 'Invalid', priorityLevel: -1 };
      const error = new Error('Invalid priority level');
      mockAxios.post.mockRejectedValue(error);

      await expect(
        ticketPriorities.create(invalidData as TicketPriority)
      ).rejects.toThrow('Invalid priority level');
    });
  });

  describe('update', () => {
    it('should call axios.put with ID and update data', async () => {
      const updateData = {
        name: 'Updated Priority',
        priorityLevel: 4,
        isActive: false,
      };
      const mockResponse = { data: { id: 123, ...updateData } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await ticketPriorities.update(123, updateData);

      expect(mockAxios.put).toHaveBeenCalledWith(
        '/TicketPriorities/123',
        updateData
      );
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate errors for non-existent priority', async () => {
      const error = new Error('Ticket priority not found');
      mockAxios.put.mockRejectedValue(error);

      await expect(
        ticketPriorities.update(999, { name: 'Update' })
      ).rejects.toThrow('Ticket priority not found');
    });
  });

  describe('delete', () => {
    it('should call axios.delete with correct ID', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      await ticketPriorities.delete(123);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TicketPriorities/123');
    });

    it('should propagate errors for system priorities', async () => {
      const error = new Error('Cannot delete system priority');
      mockAxios.delete.mockRejectedValue(error);

      await expect(ticketPriorities.delete(1)).rejects.toThrow(
        'Cannot delete system priority'
      );
    });
  });

  describe('business logic', () => {
    it('should handle priority level ordering', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Critical', priorityLevel: 1 },
          { id: 2, name: 'High', priorityLevel: 2 },
          { id: 3, name: 'Medium', priorityLevel: 3 },
          { id: 4, name: 'Low', priorityLevel: 4 },
        ],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await ticketPriorities.list({ sort: 'priorityLevel asc' });

      // Verify priorities are in correct order
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].priorityLevel).toBeGreaterThan(
          result.data[i - 1].priorityLevel || 0
        );
      }
    });
  });

  describe('error handling with retry', () => {
    it('should retry failed requests', async () => {
      const error = new Error('Network timeout');
      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      const result = await ticketPriorities.get(123);

      expect(mockAxios.get).toHaveBeenCalledTimes(3);
      expect(result.data).toEqual({ id: 123 });
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent error');
      mockAxios.get.mockRejectedValue(error);

      await expect(ticketPriorities.get(123)).rejects.toThrow(
        'Persistent error'
      );
      expect(mockAxios.get).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('logging', () => {
    it('should log operations', async () => {
      mockAxios.get.mockResolvedValue({ data: { id: 123 } });

      await ticketPriorities.get(123);

      expect(mockLogger.info).toHaveBeenCalledWith('Getting ticket priority', {
        id: 123,
      });
    });

    it('should log warnings on retry', async () => {
      const error = new Error('Temporary error');
      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      await ticketPriorities.get(123);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Request failed (attempt 1)')
      );
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = TicketPriorities.getMetadata();

      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createTicketPriority',
        'getTicketPriority',
        'updateTicketPriority',
        'deleteTicketPriority',
        'listTicketPriorities',
      ]);
    });
  });

  describe('type safety', () => {
    it('should accept valid ticket priority data types', () => {
      const validPriority: TicketPriority = {
        name: 'Valid Priority',
        description: 'A valid ticket priority',
        priorityLevel: 3,
        isActive: true,
        isDefaultValue: false,
        isSystemValue: false,
        sortOrder: 10,
      };

      // This should compile without errors - just verify the type is valid
      expect(validPriority).toBeDefined();
      expect(typeof validPriority.name).toBe('string');
      expect(typeof validPriority.priorityLevel).toBe('number');
    });
  });
});
