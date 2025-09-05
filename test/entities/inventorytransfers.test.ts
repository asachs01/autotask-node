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
  InventoryTransfers,
  IInventoryTransfers,
  IInventoryTransfersQuery,
} from '../../src/entities/inventorytransfers';

describe('InventoryTransfers Entity', () => {
  let inventoryTransfers: InventoryTransfers;
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

    inventoryTransfers = new InventoryTransfers(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list inventorytransfers successfully', async () => {
      const mockData = [
        { id: 1, name: 'InventoryTransfers 1' },
        { id: 2, name: 'InventoryTransfers 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await inventoryTransfers.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InventoryTransfers/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IInventoryTransfersQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await inventoryTransfers.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InventoryTransfers/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get inventorytransfers by id', async () => {
      const mockData = { id: 1, name: 'Test InventoryTransfers' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await inventoryTransfers.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InventoryTransfers/1');
    });
  });

  describe('create', () => {
    it('should create inventorytransfers successfully', async () => {
      const inventoryTransfersData = { name: 'New InventoryTransfers' };
      const mockResponse = { id: 1, ...inventoryTransfersData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await inventoryTransfers.create(inventoryTransfersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/InventoryTransfers', inventoryTransfersData);
    });
  });

  describe('update', () => {
    it('should update inventorytransfers successfully', async () => {
      const inventoryTransfersData = { name: 'Updated InventoryTransfers' };
      const mockResponse = { id: 1, ...inventoryTransfersData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await inventoryTransfers.update(1, inventoryTransfersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/InventoryTransfers/1', inventoryTransfersData);
    });
  });

  describe('patch', () => {
    it('should partially update inventorytransfers successfully', async () => {
      const inventoryTransfersData = { name: 'Patched InventoryTransfers' };
      const mockResponse = { id: 1, ...inventoryTransfersData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await inventoryTransfers.patch(1, inventoryTransfersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/InventoryTransfers/1', inventoryTransfersData);
    });
  });

  describe('delete', () => {
    it('should delete inventorytransfers successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await inventoryTransfers.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/InventoryTransfers/1');
    });
  });
});