import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
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

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await inventoryItemSerialNumbers.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InventoryItemSerialNumbers/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IInventoryItemSerialNumbersQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await inventoryItemSerialNumbers.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InventoryItemSerialNumbers/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get inventoryitemserialnumbers by id', async () => {
      const mockData = { id: 1, name: 'Test InventoryItemSerialNumbers' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await inventoryItemSerialNumbers.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InventoryItemSerialNumbers/1');
    });
  });

  describe('create', () => {
    it('should create inventoryitemserialnumbers successfully', async () => {
      const inventoryItemSerialNumbersData = { name: 'New InventoryItemSerialNumbers' };
      const mockResponse = { id: 1, ...inventoryItemSerialNumbersData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await inventoryItemSerialNumbers.create(inventoryItemSerialNumbersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/InventoryItemSerialNumbers', inventoryItemSerialNumbersData);
    });
  });

  describe('update', () => {
    it('should update inventoryitemserialnumbers successfully', async () => {
      const inventoryItemSerialNumbersData = { name: 'Updated InventoryItemSerialNumbers' };
      const mockResponse = { id: 1, ...inventoryItemSerialNumbersData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await inventoryItemSerialNumbers.update(1, inventoryItemSerialNumbersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/InventoryItemSerialNumbers/1', inventoryItemSerialNumbersData);
    });
  });

  describe('patch', () => {
    it('should partially update inventoryitemserialnumbers successfully', async () => {
      const inventoryItemSerialNumbersData = { name: 'Patched InventoryItemSerialNumbers' };
      const mockResponse = { id: 1, ...inventoryItemSerialNumbersData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await inventoryItemSerialNumbers.patch(1, inventoryItemSerialNumbersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/InventoryItemSerialNumbers/1', inventoryItemSerialNumbersData);
    });
  });

  describe('delete', () => {
    it('should delete inventoryitemserialnumbers successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await inventoryItemSerialNumbers.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/InventoryItemSerialNumbers/1');
    });
  });
});