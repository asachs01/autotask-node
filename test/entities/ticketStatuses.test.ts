import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
  TicketStatuses,
  TicketStatus,
} from '../../src/entities/ticketStatuses';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { createMockAxios, createMockLogger } from '../utils/testHelpers';

describe('TicketStatuses', () => {
  let ticketStatuses: TicketStatuses;
  let mockAxios: any;
  let mockLogger: any;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    ticketStatuses = new TicketStatuses(mockAxios, mockLogger);
  });

  describe('constructor', () => {
    it('should initialize with correct endpoint', () => {
      expect(ticketStatuses['endpoint']).toBe('/TicketStatuses');
    });

    it('should store the axios instance and logger', () => {
      expect(ticketStatuses['axios']).toBe(mockAxios);
      expect(ticketStatuses['logger']).toBe(mockLogger);
    });
  });

  describe('list', () => {
    it('should call axios.get with correct parameters', async () => {
      const mockResponse = {
        data: [{ id: 1, name: 'Open', isActive: true, isSystemValue: true }],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const options = { pageSize: 10, page: 1 };
      const result = await ticketStatuses.list(options);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketStatuses', {
        params: { pageSize: 10, page: 1 },
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle filter for active statuses', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Open', isActive: true },
          { id: 2, name: 'In Progress', isActive: true },
        ],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const options = {
        filter: { isActive: true },
        sort: 'name asc',
      };
      const result = await ticketStatuses.list(options);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketStatuses', {
        params: {
          search: JSON.stringify({ isActive: true }),
          sort: 'name asc',
        },
      });
      expect(result.data.every((status: any) => status.isActive)).toBe(true);
    });

    it('should propagate errors from axios', async () => {
      const error = new Error('API Error');
      mockAxios.get.mockRejectedValue(error);

      await expect(ticketStatuses.list()).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should call axios.get with correct ID', async () => {
      const mockStatus = { id: 123, name: 'Closed', isActive: true };
      const mockResponse = { data: mockStatus };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await ticketStatuses.get(123);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketStatuses/123');
      expect(result.data).toEqual(mockStatus);
    });

    it('should propagate errors for non-existent status', async () => {
      const error = new Error('Ticket status not found');
      mockAxios.get.mockRejectedValue(error);

      await expect(ticketStatuses.get(999)).rejects.toThrow(
        'Ticket status not found'
      );
    });
  });

  describe('create', () => {
    it('should call axios.post with status data', async () => {
      const statusData: TicketStatus = {
        name: 'Custom Status',
        isActive: true,
        description: 'A custom ticket status',
      };
      const mockResponse = { data: { id: 789, ...statusData } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await ticketStatuses.create(statusData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TicketStatuses',
        statusData
      );
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate validation errors', async () => {
      const invalidData = { description: 'Missing required name field' };
      const error = new Error('Validation failed');
      mockAxios.post.mockRejectedValue(error);

      await expect(
        ticketStatuses.create(invalidData as TicketStatus)
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('update', () => {
    it('should call axios.put with ID and update data', async () => {
      const updateData = {
        name: 'Updated Status',
        isActive: false,
      };
      const mockResponse = { data: { id: 123, ...updateData } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await ticketStatuses.update(123, updateData);

      expect(mockAxios.put).toHaveBeenCalledWith(
        '/TicketStatuses/123',
        updateData
      );
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate errors for non-existent status', async () => {
      const error = new Error('Ticket status not found');
      mockAxios.put.mockRejectedValue(error);

      await expect(
        ticketStatuses.update(999, { name: 'Update' })
      ).rejects.toThrow('Ticket status not found');
    });
  });

  describe('delete', () => {
    it('should call axios.delete with correct ID', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      await ticketStatuses.delete(123);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TicketStatuses/123');
    });

    it('should propagate errors for system statuses', async () => {
      const error = new Error('Cannot delete system status');
      mockAxios.delete.mockRejectedValue(error);

      await expect(ticketStatuses.delete(1)).rejects.toThrow(
        'Cannot delete system status'
      );
    });
  });

  describe('business logic', () => {
    it('should handle system vs custom statuses', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Open', isSystemValue: true, isActive: true },
          {
            id: 100,
            name: 'Custom Status',
            isSystemValue: false,
            isActive: true,
          },
        ],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await ticketStatuses.list();

      const systemStatuses = result.data.filter(
        (status: any) => status.isSystemValue
      );
      const customStatuses = result.data.filter(
        (status: any) => !status.isSystemValue
      );

      expect(systemStatuses).toHaveLength(1);
      expect(customStatuses).toHaveLength(1);
    });
  });

  describe('error handling with retry', () => {
    it('should retry failed requests', async () => {
      const error = new Error('Network timeout');
      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      const result = await ticketStatuses.get(123);

      expect(mockAxios.get).toHaveBeenCalledTimes(3);
      expect(result.data).toEqual({ id: 123 });
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent error');
      mockAxios.get.mockRejectedValue(error);

      await expect(ticketStatuses.get(123)).rejects.toThrow('Persistent error');
      expect(mockAxios.get).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('logging', () => {
    it('should log operations', async () => {
      mockAxios.get.mockResolvedValue({ data: { id: 123 } });

      await ticketStatuses.get(123);

      expect(mockLogger.info).toHaveBeenCalledWith('Getting ticket status', {
        id: 123,
      });
    });

    it('should log warnings on retry', async () => {
      const error = new Error('Temporary error');
      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      await ticketStatuses.get(123);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Request failed, retrying in'),
        expect.any(Object)
      );
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = TicketStatuses.getMetadata();

      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createTicketStatus',
        'getTicketStatus',
        'updateTicketStatus',
        'deleteTicketStatus',
        'listTicketStatuses',
      ]);
    });
  });

  describe('type safety', () => {
    it('should accept valid ticket status data types', () => {
      const validStatus: TicketStatus = {
        name: 'Valid Status',
        description: 'A valid ticket status',
        isActive: true,
        isSystemValue: false,
        isDefaultValue: false,
        sortOrder: 10,
      };

      // This should compile without errors - just verify the type is valid
      expect(validStatus).toBeDefined();
      expect(typeof validStatus.name).toBe('string');
      expect(typeof validStatus.isActive).toBe('boolean');
    });
  });
});
