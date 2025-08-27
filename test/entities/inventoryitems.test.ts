import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import winston from 'winston';
import {
  InventoryItems,
  IInventoryItems,
  IInventoryItemsQuery,
} from '../../src/entities/inventoryitems';

describe('InventoryItems Entity', () => {
  let inventoryItems: InventoryItems;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
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

    mockLogger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })],
    });

    inventoryItems = new InventoryItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list inventoryitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'InventoryItems 1' },
        { id: 2, name: 'InventoryItems 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryItems/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IInventoryItemsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.get.mockResolvedValueOnce({
        data: { items: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await inventoryItems.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryItems/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        }
      });
    });
  });

  describe('get', () => {
    it('should get inventoryitems by id', async () => {
      const mockData = { id: 1, name: 'Test InventoryItems' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryItems/1');
    });
  });

  describe('create', () => {
    it('should create inventoryitems successfully', async () => {
      const inventoryItemsData = { name: 'New InventoryItems' };
      const mockResponse = { id: 1, ...inventoryItemsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryItems.create(inventoryItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/InventoryItems', inventoryItemsData);
    });
  });

  describe('update', () => {
    it('should update inventoryitems successfully', async () => {
      const inventoryItemsData = { name: 'Updated InventoryItems' };
      const mockResponse = { id: 1, ...inventoryItemsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryItems.update(1, inventoryItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/InventoryItems/1', inventoryItemsData);
    });
  });

  describe('patch', () => {
    it('should partially update inventoryitems successfully', async () => {
      const inventoryItemsData = { name: 'Patched InventoryItems' };
      const mockResponse = { id: 1, ...inventoryItemsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryItems.patch(1, inventoryItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/InventoryItems/1', inventoryItemsData);
    });
  });

  describe('delete', () => {
    it('should delete inventoryitems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await inventoryItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/InventoryItems/1');
    });
  });
});