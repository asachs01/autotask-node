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
  InventoryItemSerialNumbers,
  IInventoryItemSerialNumbers,
  IInventoryItemSerialNumbersQuery,
} from '../../src/entities/inventoryitemserialnumbers';

describe('InventoryItemSerialNumbers Entity', () => {
  let inventoryItemSerialNumbers: InventoryItemSerialNumbers;
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

    inventoryItemSerialNumbers = new InventoryItemSerialNumbers(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list inventoryitemserialnumbers successfully', async () => {
      const mockData = [
        { id: 1, name: 'InventoryItemSerialNumbers 1' },
        { id: 2, name: 'InventoryItemSerialNumbers 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryItemSerialNumbers.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryItemSerialNumbers/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IInventoryItemSerialNumbersQuery = {
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

      await inventoryItemSerialNumbers.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryItemSerialNumbers/query', {
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
    it('should get inventoryitemserialnumbers by id', async () => {
      const mockData = { id: 1, name: 'Test InventoryItemSerialNumbers' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryItemSerialNumbers.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryItemSerialNumbers/1');
    });
  });

  describe('create', () => {
    it('should create inventoryitemserialnumbers successfully', async () => {
      const inventoryItemSerialNumbersData = { name: 'New InventoryItemSerialNumbers' };
      const mockResponse = { id: 1, ...inventoryItemSerialNumbersData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryItemSerialNumbers.create(inventoryItemSerialNumbersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/InventoryItemSerialNumbers', inventoryItemSerialNumbersData);
    });
  });

  describe('update', () => {
    it('should update inventoryitemserialnumbers successfully', async () => {
      const inventoryItemSerialNumbersData = { name: 'Updated InventoryItemSerialNumbers' };
      const mockResponse = { id: 1, ...inventoryItemSerialNumbersData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryItemSerialNumbers.update(1, inventoryItemSerialNumbersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/InventoryItemSerialNumbers/1', inventoryItemSerialNumbersData);
    });
  });

  describe('patch', () => {
    it('should partially update inventoryitemserialnumbers successfully', async () => {
      const inventoryItemSerialNumbersData = { name: 'Patched InventoryItemSerialNumbers' };
      const mockResponse = { id: 1, ...inventoryItemSerialNumbersData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryItemSerialNumbers.patch(1, inventoryItemSerialNumbersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/InventoryItemSerialNumbers/1', inventoryItemSerialNumbersData);
    });
  });

  describe('delete', () => {
    it('should delete inventoryitemserialnumbers successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await inventoryItemSerialNumbers.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/InventoryItemSerialNumbers/1');
    });
  });
});