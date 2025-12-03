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
  DocumentChecklistItems,
  IDocumentChecklistItems,
  IDocumentChecklistItemsQuery,
} from '../../src/entities/documentchecklistitems';

describe('DocumentChecklistItems Entity', () => {
  let documentChecklistItems: DocumentChecklistItems;
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

    documentChecklistItems = new DocumentChecklistItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list documentchecklistitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'DocumentChecklistItems 1' },
        { id: 2, name: 'DocumentChecklistItems 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await documentChecklistItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/DocumentChecklistItems/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IDocumentChecklistItemsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await documentChecklistItems.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/DocumentChecklistItems/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          MaxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get documentchecklistitems by id', async () => {
      const mockData = { id: 1, name: 'Test DocumentChecklistItems' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await documentChecklistItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentChecklistItems/1');
    });
  });

  describe('create', () => {
    it('should create documentchecklistitems successfully', async () => {
      const documentChecklistItemsData = { name: 'New DocumentChecklistItems' };
      const mockResponse = { id: 1, ...documentChecklistItemsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await documentChecklistItems.create(
        documentChecklistItemsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/DocumentChecklistItems',
        documentChecklistItemsData
      );
    });
  });

  describe('update', () => {
    it('should update documentchecklistitems successfully', async () => {
      const documentChecklistItemsData = {
        name: 'Updated DocumentChecklistItems',
      };
      const mockResponse = { id: 1, ...documentChecklistItemsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await documentChecklistItems.update(
        1,
        documentChecklistItemsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/DocumentChecklistItems/1',
        documentChecklistItemsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update documentchecklistitems successfully', async () => {
      const documentChecklistItemsData = {
        name: 'Patched DocumentChecklistItems',
      };
      const mockResponse = { id: 1, ...documentChecklistItemsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await documentChecklistItems.patch(
        1,
        documentChecklistItemsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/DocumentChecklistItems/1',
        documentChecklistItemsData
      );
    });
  });

  describe('delete', () => {
    it('should delete documentchecklistitems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await documentChecklistItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/DocumentChecklistItems/1'
      );
    });
  });
});
