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
  InventoryStockedItemsRemove,
  IInventoryStockedItemsRemove,
  IInventoryStockedItemsRemoveQuery,
} from '../../src/entities/inventorystockeditemsremove';

describe('InventoryStockedItemsRemove Entity', () => {
  let inventoryStockedItemsRemove: InventoryStockedItemsRemove;
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

    inventoryStockedItemsRemove = new InventoryStockedItemsRemove(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list inventorystockeditemsremove successfully', async () => {
      const mockData = [
        { id: 1, name: 'InventoryStockedItemsRemove 1' },
        { id: 2, name: 'InventoryStockedItemsRemove 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryStockedItemsRemove.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryStockedItemsRemove/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IInventoryStockedItemsRemoveQuery = {
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

      await inventoryStockedItemsRemove.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryStockedItemsRemove/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        }
      });
    });
  });

  describe('create', () => {
    it('should create inventorystockeditemsremove successfully', async () => {
      const inventoryStockedItemsRemoveData = { name: 'New InventoryStockedItemsRemove' };
      const mockResponse = { id: 1, ...inventoryStockedItemsRemoveData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryStockedItemsRemove.create(inventoryStockedItemsRemoveData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/InventoryStockedItemsRemove', inventoryStockedItemsRemoveData);
    });
  });
});