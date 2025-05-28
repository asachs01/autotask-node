import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
  PurchaseOrders,
  PurchaseOrder,
} from '../../src/entities/purchaseOrders';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { createMockAxios, createMockLogger } from '../utils/testHelpers';

describe('PurchaseOrders', () => {
  let purchaseOrders: PurchaseOrders;
  let mockAxios: any;
  let mockLogger: any;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    purchaseOrders = new PurchaseOrders(mockAxios, mockLogger);
  });

  describe('constructor', () => {
    it('should initialize with correct endpoint', () => {
      expect(purchaseOrders['endpoint']).toBe('/PurchaseOrders');
    });

    it('should store the axios instance and logger', () => {
      expect(purchaseOrders['axios']).toBe(mockAxios);
      expect(purchaseOrders['logger']).toBe(mockLogger);
    });
  });

  describe('list', () => {
    it('should call axios.get with correct parameters', async () => {
      const mockResponse = {
        data: [{ id: 1, purchaseOrderNumber: 'PO-001' }],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const options = { pageSize: 10, page: 1 };
      const result = await purchaseOrders.list(options);

      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrders', {
        params: { pageSize: 10, page: 1 },
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle empty options', async () => {
      const mockResponse = { data: [] };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await purchaseOrders.list();

      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrders', {
        params: {},
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle filter and sort options', async () => {
      const mockResponse = {
        data: [{ id: 1, purchaseOrderNumber: 'PO-002' }],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const options = {
        filter: { vendorAccountId: 123 },
        sort: 'purchaseOrderNumber asc',
        pageSize: 5,
      };
      const result = await purchaseOrders.list(options);

      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrders', {
        params: {
          search: JSON.stringify({ vendorAccountId: 123 }),
          sort: 'purchaseOrderNumber asc',
          pageSize: 5,
        },
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate errors from axios', async () => {
      const error = new Error('API Error');
      mockAxios.get.mockRejectedValue(error);

      await expect(purchaseOrders.list()).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should call axios.get with correct ID', async () => {
      const mockPO = { id: 123, purchaseOrderNumber: 'PO-123' };
      const mockResponse = { data: mockPO };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await purchaseOrders.get(123);

      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrders/123');
      expect(result.data).toEqual(mockPO);
    });

    it('should propagate errors for non-existent purchase order', async () => {
      const error = new Error('Purchase order not found');
      mockAxios.get.mockRejectedValue(error);

      await expect(purchaseOrders.get(999)).rejects.toThrow(
        'Purchase order not found'
      );
    });
  });

  describe('create', () => {
    it('should call axios.post with purchase order data', async () => {
      const poData: PurchaseOrder = {
        vendorAccountId: 123,
        purchaseOrderNumber: 'PO-NEW-001',
        description: 'New Purchase Order',
        orderDate: '2024-01-15',
        totalAmount: 1500.0,
      };
      const mockResponse = { data: { id: 789, ...poData } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await purchaseOrders.create(poData);

      expect(mockAxios.post).toHaveBeenCalledWith('/PurchaseOrders', poData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle minimal purchase order data', async () => {
      const minimalData: PurchaseOrder = {
        vendorAccountId: 123,
        purchaseOrderNumber: 'PO-MIN-001',
      };
      const mockResponse = { data: { id: 790, ...minimalData } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await purchaseOrders.create(minimalData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/PurchaseOrders',
        minimalData
      );
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate validation errors', async () => {
      const invalidData = { description: 'Missing required fields' };
      const error = new Error('Validation failed');
      mockAxios.post.mockRejectedValue(error);

      await expect(
        purchaseOrders.create(invalidData as PurchaseOrder)
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('update', () => {
    it('should call axios.put with ID and update data', async () => {
      const updateData = {
        description: 'Updated Purchase Order',
        totalAmount: 2000.0,
        status: 'Approved',
      };
      const mockResponse = { data: { id: 123, ...updateData } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await purchaseOrders.update(123, updateData);

      expect(mockAxios.put).toHaveBeenCalledWith(
        '/PurchaseOrders/123',
        updateData
      );
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle empty update data', async () => {
      const mockResponse = { data: { id: 123 } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await purchaseOrders.update(123, {});

      expect(mockAxios.put).toHaveBeenCalledWith('/PurchaseOrders/123', {});
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate errors for non-existent purchase order', async () => {
      const error = new Error('Purchase order not found');
      mockAxios.put.mockRejectedValue(error);

      await expect(
        purchaseOrders.update(999, { description: 'Update' })
      ).rejects.toThrow('Purchase order not found');
    });
  });

  describe('delete', () => {
    it('should call axios.delete with correct ID', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      await purchaseOrders.delete(123);

      expect(mockAxios.delete).toHaveBeenCalledWith('/PurchaseOrders/123');
    });

    it('should propagate errors for non-existent purchase order', async () => {
      const error = new Error('Purchase order not found');
      mockAxios.delete.mockRejectedValue(error);

      await expect(purchaseOrders.delete(999)).rejects.toThrow(
        'Purchase order not found'
      );
    });

    it('should not return a value on successful deletion', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      const result = await purchaseOrders.delete(123);

      expect(result).toBeUndefined();
    });
  });

  describe('business logic', () => {
    it('should handle purchase order status updates', async () => {
      const statusUpdate = { status: 'Approved' };
      const mockResponse = { data: { id: 123, status: 'Approved' } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await purchaseOrders.update(123, statusUpdate);

      expect(mockAxios.put).toHaveBeenCalledWith(
        '/PurchaseOrders/123',
        statusUpdate
      );
      expect(result.data.status).toBe('Approved');
    });

    it('should handle purchase order amount calculations', async () => {
      const poData: PurchaseOrder = {
        vendorAccountId: 123,
        purchaseOrderNumber: 'PO-CALC-001',
        totalAmount: 1000.0,
        taxAmount: 100.0,
        shippingAmount: 50.0,
      };
      const mockResponse = { data: { id: 789, ...poData } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await purchaseOrders.create(poData);

      expect(result.data.totalAmount).toBe(1000.0);
      expect(result.data.taxAmount).toBe(100.0);
      expect(result.data.shippingAmount).toBe(50.0);
    });
  });

  describe('error handling with retry', () => {
    it('should retry failed requests', async () => {
      const error = new Error('Network timeout');
      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      const result = await purchaseOrders.get(123);

      expect(mockAxios.get).toHaveBeenCalledTimes(3);
      expect(result.data).toEqual({ id: 123 });
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent error');
      mockAxios.get.mockRejectedValue(error);

      await expect(purchaseOrders.get(123)).rejects.toThrow('Persistent error');
      expect(mockAxios.get).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('logging', () => {
    it('should log operations', async () => {
      mockAxios.get.mockResolvedValue({ data: { id: 123 } });

      await purchaseOrders.get(123);

      expect(mockLogger.info).toHaveBeenCalledWith('Getting purchase order', {
        id: 123,
      });
    });

    it('should log warnings on retry', async () => {
      const error = new Error('Temporary error');
      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      await purchaseOrders.get(123);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Request failed (attempt 1)')
      );
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = PurchaseOrders.getMetadata();

      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createPurchaseOrder',
        'getPurchaseOrder',
        'updatePurchaseOrder',
        'deletePurchaseOrder',
        'listPurchaseOrders',
      ]);
    });
  });

  describe('type safety', () => {
    it('should accept valid purchase order data types', () => {
      const validPO: PurchaseOrder = {
        vendorAccountId: 123,
        purchaseOrderNumber: 'PO-VALID-001',
        description: 'Valid Purchase Order',
        orderDate: '2024-01-15',
        totalAmount: 1500.0,
        taxAmount: 150.0,
        shippingAmount: 25.0,
        status: 'Draft',
      };

      // This should compile without errors - just verify the type is valid
      expect(validPO).toBeDefined();
      expect(typeof validPO.vendorAccountId).toBe('number');
      expect(typeof validPO.purchaseOrderNumber).toBe('string');
    });
  });
});
