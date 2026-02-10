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
  InventoryStockedItemsAdd,
  IInventoryStockedItemsAdd,
  IInventoryStockedItemsAddQuery,
} from '../../src/entities/inventorystockeditemsadd';

describe('InventoryStockedItemsAdd Entity', () => {
  let inventoryStockedItemsAdd: InventoryStockedItemsAdd;
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

    inventoryStockedItemsAdd = new InventoryStockedItemsAdd(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list inventorystockeditemsadd successfully', async () => {
      const mockData = [
        { id: 1, name: 'InventoryStockedItemsAdd 1' },
        { id: 2, name: 'InventoryStockedItemsAdd 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await inventoryStockedItemsAdd.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/InventoryStockedItemsAdd/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IInventoryStockedItemsAddQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await inventoryStockedItemsAdd.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/InventoryStockedItemsAdd/query',
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
    it('should create inventorystockeditemsadd successfully', async () => {
      const inventoryStockedItemsAddData = {
        name: 'New InventoryStockedItemsAdd',
      };
      const mockResponse = { id: 1, ...inventoryStockedItemsAddData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await inventoryStockedItemsAdd.create(
        inventoryStockedItemsAddData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/InventoryStockedItemsAdd',
        inventoryStockedItemsAddData
      );
    });
  });
});
