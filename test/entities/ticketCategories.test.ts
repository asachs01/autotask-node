import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
  TicketCategories,
  TicketCategory,
} from '../../src/entities/ticketCategories';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { createMockAxios, createMockLogger } from '../utils/testHelpers';

describe('TicketCategories', () => {
  let ticketCategories: TicketCategories;
  let mockAxios: any;
  let mockLogger: any;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    ticketCategories = new TicketCategories(mockAxios, mockLogger);
  });

  describe('constructor', () => {
    it('should initialize with correct endpoint', () => {
      expect(ticketCategories['endpoint']).toBe('/TicketCategories');
    });

    it('should store the axios instance and logger', () => {
      expect(ticketCategories['axios']).toBe(mockAxios);
      expect(ticketCategories['logger']).toBe(mockLogger);
    });
  });

  describe('list', () => {
    it('should call axios.get with correct parameters', async () => {
      const mockResponse = {
        data: [{ id: 1, name: 'Hardware Issue', isActive: true }],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const options = { pageSize: 10, page: 1 };
      const result = await ticketCategories.list(options);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketCategories', {
        params: { pageSize: 10, page: 1 },
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle empty options', async () => {
      const mockResponse = { data: [] };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await ticketCategories.list();

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketCategories', {
        params: {},
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle filter and sort options', async () => {
      const mockResponse = {
        data: [{ id: 1, name: 'Software Issue', isActive: true }],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const options = {
        filter: { isActive: true },
        sort: 'name asc',
        pageSize: 5,
      };
      const result = await ticketCategories.list(options);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketCategories', {
        params: {
          search: JSON.stringify({ isActive: true }),
          sort: 'name asc',
          pageSize: 5,
        },
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate errors from axios', async () => {
      const error = new Error('API Error');
      mockAxios.get.mockRejectedValue(error);

      await expect(ticketCategories.list()).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should call axios.get with correct ID', async () => {
      const mockCategory = { id: 123, name: 'Network Issue', isActive: true };
      const mockResponse = { data: mockCategory };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await ticketCategories.get(123);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketCategories/123');
      expect(result.data).toEqual(mockCategory);
    });

    it('should propagate errors for non-existent category', async () => {
      const error = new Error('Ticket category not found');
      mockAxios.get.mockRejectedValue(error);

      await expect(ticketCategories.get(999)).rejects.toThrow(
        'Ticket category not found'
      );
    });
  });

  describe('create', () => {
    it('should call axios.post with category data', async () => {
      const categoryData: TicketCategory = {
        name: 'New Category',
        isActive: true,
        description: 'A new ticket category',
      };
      const mockResponse = { data: { id: 789, ...categoryData } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await ticketCategories.create(categoryData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TicketCategories',
        categoryData
      );
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle minimal category data', async () => {
      const minimalData: TicketCategory = {
        name: 'Minimal Category',
      };
      const mockResponse = { data: { id: 790, ...minimalData } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await ticketCategories.create(minimalData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TicketCategories',
        minimalData
      );
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate validation errors', async () => {
      const invalidData = { description: 'Missing required name field' };
      const error = new Error('Validation failed');
      mockAxios.post.mockRejectedValue(error);

      await expect(
        ticketCategories.create(invalidData as TicketCategory)
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('update', () => {
    it('should call axios.put with ID and update data', async () => {
      const updateData = {
        name: 'Updated Category',
        description: 'Updated description',
        isActive: false,
      };
      const mockResponse = { data: { id: 123, ...updateData } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await ticketCategories.update(123, updateData);

      expect(mockAxios.put).toHaveBeenCalledWith(
        '/TicketCategories/123',
        updateData
      );
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle empty update data', async () => {
      const mockResponse = { data: { id: 123 } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await ticketCategories.update(123, {});

      expect(mockAxios.put).toHaveBeenCalledWith('/TicketCategories/123', {});
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate errors for non-existent category', async () => {
      const error = new Error('Ticket category not found');
      mockAxios.put.mockRejectedValue(error);

      await expect(
        ticketCategories.update(999, { name: 'Update' })
      ).rejects.toThrow('Ticket category not found');
    });
  });

  describe('delete', () => {
    it('should call axios.delete with correct ID', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      await ticketCategories.delete(123);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TicketCategories/123');
    });

    it('should propagate errors for non-existent category', async () => {
      const error = new Error('Ticket category not found');
      mockAxios.delete.mockRejectedValue(error);

      await expect(ticketCategories.delete(999)).rejects.toThrow(
        'Ticket category not found'
      );
    });

    it('should not return a value on successful deletion', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      const result = await ticketCategories.delete(123);

      expect(result).toBeUndefined();
    });
  });

  describe('business logic', () => {
    it('should handle category activation/deactivation', async () => {
      const activationUpdate = { isActive: false };
      const mockResponse = { data: { id: 123, isActive: false } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await ticketCategories.update(123, activationUpdate);

      expect(mockAxios.put).toHaveBeenCalledWith(
        '/TicketCategories/123',
        activationUpdate
      );
      expect(result.data.isActive).toBe(false);
    });

    it('should filter active categories', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Active Category', isActive: true },
          { id: 2, name: 'Another Active', isActive: true },
        ],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await ticketCategories.list({
        filter: { isActive: true },
      });

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketCategories', {
        params: { search: JSON.stringify({ isActive: true }) },
      });
      expect(result.data.every((cat: any) => cat.isActive)).toBe(true);
    });
  });

  describe('error handling with retry', () => {
    it('should retry failed requests', async () => {
      const error = new Error('Network timeout');
      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      const result = await ticketCategories.get(123);

      expect(mockAxios.get).toHaveBeenCalledTimes(3);
      expect(result.data).toEqual({ id: 123 });
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent error');
      mockAxios.get.mockRejectedValue(error);

      await expect(ticketCategories.get(123)).rejects.toThrow(
        'Persistent error'
      );
      expect(mockAxios.get).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('logging', () => {
    it('should log operations', async () => {
      mockAxios.get.mockResolvedValue({ data: { id: 123 } });

      await ticketCategories.get(123);

      expect(mockLogger.info).toHaveBeenCalledWith('Getting ticket category', {
        id: 123,
      });
    });

    it('should log warnings on retry', async () => {
      const error = new Error('Temporary error');
      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      await ticketCategories.get(123);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Request failed (attempt 1)')
      );
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = TicketCategories.getMetadata();

      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createTicketCategory',
        'getTicketCategory',
        'updateTicketCategory',
        'deleteTicketCategory',
        'listTicketCategories',
      ]);
    });
  });

  describe('type safety', () => {
    it('should accept valid ticket category data types', () => {
      const validCategory: TicketCategory = {
        name: 'Valid Category',
        description: 'A valid ticket category',
        isActive: true,
        displayColorRGB: 16711680, // Red color as number
        globalDefault: false,
      };

      // This should compile without errors - just verify the type is valid
      expect(validCategory).toBeDefined();
      expect(typeof validCategory.name).toBe('string');
      expect(typeof validCategory.isActive).toBe('boolean');
    });
  });
});
