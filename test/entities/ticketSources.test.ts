import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { TicketSources, TicketSource } from '../../src/entities/ticketSources';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';
import { createMockAxios, createMockLogger } from '../utils/testHelpers';

describe('TicketSources', () => {
  let ticketSources: TicketSources;
  let mockAxios: any;
  let mockLogger: any;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    ticketSources = new TicketSources(mockAxios, mockLogger);
  });

  describe('constructor', () => {
    it('should initialize with correct endpoint', () => {
      expect(ticketSources['endpoint']).toBe('/TicketSources');
    });

    it('should store the axios instance and logger', () => {
      expect(ticketSources['axios']).toBe(mockAxios);
      expect(ticketSources['logger']).toBe(mockLogger);
    });
  });

  describe('list', () => {
    it('should call axios.get with correct parameters', async () => {
      const mockResponse = {
        data: [{ id: 1, name: 'Email', isActive: true, isSystemValue: true }],
      };
      setup.mockAxios.get.mockResolvedValue(mockResponse);

      const options = { pageSize: 10, page: 1 };
      const result = await ticketSources.list(options);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketSources', {
        params: { pageSize: 10, page: 1 },
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle filtering by source type', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Email', isActive: true, isSystemValue: true },
          { id: 2, name: 'Phone', isActive: true, isSystemValue: true },
          {
            id: 100,
            name: 'Custom Portal',
            isActive: true,
            isSystemValue: false,
          },
        ],
      };
      setup.mockAxios.get.mockResolvedValue(mockResponse);

      const options = {
        filter: { isSystemValue: true },
        sort: 'name asc',
      };
      const result = await ticketSources.list(options);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketSources', {
        params: {
          search: JSON.stringify({ isSystemValue: true }),
          sort: 'name asc',
        },
      });
      expect(result.data).toHaveLength(3);
    });

    it('should propagate errors from axios', async () => {
      const error = new Error('API Error');
      setup.mockAxios.get.mockRejectedValue(error);

      await expect(ticketSources.list()).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should call axios.get with correct ID', async () => {
      const mockSource = { id: 123, name: 'Web Portal', isActive: true };
      const mockResponse = { data: mockSource };
      setup.mockAxios.get.mockResolvedValue(mockResponse);

      const result = await ticketSources.get(123);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketSources/123');
      expect(result.data).toEqual(mockSource);
    });

    it('should propagate errors for non-existent source', async () => {
      const error = new Error('Ticket source not found');
      setup.mockAxios.get.mockRejectedValue(error);

      await expect(ticketSources.get(999)).rejects.toThrow(
        'Ticket source not found'
      );
    });
  });

  describe('create', () => {
    it('should call axios.post with source data', async () => {
      const sourceData: TicketSource = {
        name: 'Custom API',
        isActive: true,
        description: 'Custom API integration source',
      };
      const mockResponse = { data: { id: 789, ...sourceData } };
      setup.mockAxios.post.mockResolvedValue(mockResponse);

      const result = await ticketSources.create(sourceData);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/TicketSources', sourceData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate validation errors', async () => {
      const invalidData = { description: 'Missing required name field' };
      const error = new Error('Validation failed');
      setup.mockAxios.post.mockRejectedValue(error);

      await expect(
        ticketSources.create(invalidData as TicketSource)
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('update', () => {
    it('should call axios.put with ID and update data', async () => {
      const updateData = {
        name: 'Updated Source',
        isActive: false,
        description: 'Updated description',
      };
      const mockResponse = { data: { id: 123, ...updateData } };
      setup.mockAxios.put.mockResolvedValue(mockResponse);

      const result = await ticketSources.update(123, updateData);

      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/TicketSources/123',
        updateData
      );
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate errors for non-existent source', async () => {
      const error = new Error('Ticket source not found');
      setup.mockAxios.put.mockRejectedValue(error);

      await expect(
        ticketSources.update(999, { name: 'Update' })
      ).rejects.toThrow('Ticket source not found');
    });
  });

  describe('delete', () => {
    it('should call axios.delete with correct ID', async () => {
      setup.mockAxios.delete.mockResolvedValue({ data: {} });

      await ticketSources.delete(123);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/TicketSources/123');
    });

    it('should propagate errors for system sources', async () => {
      const error = new Error('Cannot delete system source');
      setup.mockAxios.delete.mockRejectedValue(error);

      await expect(ticketSources.delete(1)).rejects.toThrow(
        'Cannot delete system source'
      );
    });
  });

  describe('business logic', () => {
    it('should handle system vs custom sources', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Email', isSystemValue: true, isActive: true },
          { id: 2, name: 'Phone', isSystemValue: true, isActive: true },
          {
            id: 100,
            name: 'Custom Portal',
            isSystemValue: false,
            isActive: true,
          },
        ],
      };
      setup.mockAxios.get.mockResolvedValue(mockResponse);

      const result = await ticketSources.list();

      const systemSources = result.data.filter(
        (source: any) => source.isSystemValue
      );
      const customSources = result.data.filter(
        (source: any) => !source.isSystemValue
      );

      expect(systemSources).toHaveLength(2);
      expect(customSources).toHaveLength(1);
    });

    it('should handle source activation/deactivation', async () => {
      const activationUpdate = { isActive: false };
      const mockResponse = { data: { id: 123, isActive: false } };
      setup.mockAxios.put.mockResolvedValue(mockResponse);

      const result = await ticketSources.update(123, activationUpdate);

      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/TicketSources/123',
        activationUpdate
      );
      expect(result.data.isActive).toBe(false);
    });
  });

  describe('error handling with retry', () => {
    it('should retry failed requests', async () => {
      const error = new Error('Network timeout');
      setup.mockAxios.get
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      const result = await ticketSources.get(123);

      expect(setup.mockAxios.get).toHaveBeenCalledTimes(3);
      expect(result.data).toEqual({ id: 123 });
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent error');
      setup.mockAxios.get.mockRejectedValue(error);

      await expect(ticketSources.get(123)).rejects.toThrow('Persistent error');
      expect(setup.mockAxios.get).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('logging', () => {
    it('should log operations', async () => {
      setup.mockAxios.get.mockResolvedValue({ data: { id: 123 } });

      await ticketSources.get(123);

      expect(mockLogger.info).toHaveBeenCalledWith('Getting ticket source', {
        id: 123,
      });
    });

    it('should log warnings on retry', async () => {
      const error = new Error('Temporary error');
      setup.mockAxios.get
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      await ticketSources.get(123);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Request failed, retrying in'),
        expect.any(Object)
      );
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = TicketSources.getMetadata();

      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createTicketSource',
        'getTicketSource',
        'updateTicketSource',
        'deleteTicketSource',
        'listTicketSources',
      ]);
    });
  });

  describe('type safety', () => {
    it('should accept valid ticket source data types', () => {
      const validSource: TicketSource = {
        name: 'Valid Source',
        description: 'A valid ticket source',
        isActive: true,
        isDefaultValue: false,
        isSystemValue: false,
        sortOrder: 10,
      };

      // This should compile without errors - just verify the type is valid
      expect(validSource).toBeDefined();
      expect(typeof validSource.name).toBe('string');
      expect(typeof validSource.isActive).toBe('boolean');
    });
  });
});
