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

    inventoryStockedItemsRemove = new InventoryStockedItemsRemove(
      mockAxios,
      mockLogger
    );
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

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await inventoryStockedItemsRemove.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/InventoryStockedItemsRemove/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IInventoryStockedItemsRemoveQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await inventoryStockedItemsRemove.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/InventoryStockedItemsRemove/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'eq', field: 'name', value: 'test' }),
          ]),
          sort: 'id',
          page: 1,
          maxRecords: 10,
        })
      );
    });
  });

  describe('create', () => {
    it('should create inventorystockeditemsremove successfully', async () => {
      const inventoryStockedItemsRemoveData = {
        name: 'New InventoryStockedItemsRemove',
      };
      const mockResponse = { id: 1, ...inventoryStockedItemsRemoveData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await inventoryStockedItemsRemove.create(
        inventoryStockedItemsRemoveData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/InventoryStockedItemsRemove',
        inventoryStockedItemsRemoveData
      );
    });
  });
});
