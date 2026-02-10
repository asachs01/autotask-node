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
  InventoryStockedItemsTransfer,
  IInventoryStockedItemsTransfer,
  IInventoryStockedItemsTransferQuery,
} from '../../src/entities/inventorystockeditemstransfer';

describe('InventoryStockedItemsTransfer Entity', () => {
  let inventoryStockedItemsTransfer: InventoryStockedItemsTransfer;
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

    inventoryStockedItemsTransfer = new InventoryStockedItemsTransfer(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list inventorystockeditemstransfer successfully', async () => {
      const mockData = [
        { id: 1, name: 'InventoryStockedItemsTransfer 1' },
        { id: 2, name: 'InventoryStockedItemsTransfer 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await inventoryStockedItemsTransfer.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/InventoryStockedItemsTransfer/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IInventoryStockedItemsTransferQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await inventoryStockedItemsTransfer.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/InventoryStockedItemsTransfer/query',
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
    it('should create inventorystockeditemstransfer successfully', async () => {
      const inventoryStockedItemsTransferData = {
        name: 'New InventoryStockedItemsTransfer',
      };
      const mockResponse = { id: 1, ...inventoryStockedItemsTransferData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await inventoryStockedItemsTransfer.create(
        inventoryStockedItemsTransferData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/InventoryStockedItemsTransfer',
        inventoryStockedItemsTransferData
      );
    });
  });
});
