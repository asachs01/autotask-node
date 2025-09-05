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
  ChecklistLibraryChecklistItems,
  IChecklistLibraryChecklistItems,
  IChecklistLibraryChecklistItemsQuery,
} from '../../src/entities/checklistlibrarychecklistitems';

describe('ChecklistLibraryChecklistItems Entity', () => {
  let checklistLibraryChecklistItems: ChecklistLibraryChecklistItems;
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

    checklistLibraryChecklistItems = new ChecklistLibraryChecklistItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list checklistlibrarychecklistitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'ChecklistLibraryChecklistItems 1' },
        { id: 2, name: 'ChecklistLibraryChecklistItems 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await checklistLibraryChecklistItems.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ChecklistLibraryChecklistItems/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IChecklistLibraryChecklistItemsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await checklistLibraryChecklistItems.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ChecklistLibraryChecklistItems/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get checklistlibrarychecklistitems by id', async () => {
      const mockData = { id: 1, name: 'Test ChecklistLibraryChecklistItems' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await checklistLibraryChecklistItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ChecklistLibraryChecklistItems/1');
    });
  });

  describe('create', () => {
    it('should create checklistlibrarychecklistitems successfully', async () => {
      const checklistLibraryChecklistItemsData = { name: 'New ChecklistLibraryChecklistItems' };
      const mockResponse = { id: 1, ...checklistLibraryChecklistItemsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await checklistLibraryChecklistItems.create(checklistLibraryChecklistItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ChecklistLibraryChecklistItems', checklistLibraryChecklistItemsData);
    });
  });

  describe('update', () => {
    it('should update checklistlibrarychecklistitems successfully', async () => {
      const checklistLibraryChecklistItemsData = { name: 'Updated ChecklistLibraryChecklistItems' };
      const mockResponse = { id: 1, ...checklistLibraryChecklistItemsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await checklistLibraryChecklistItems.update(1, checklistLibraryChecklistItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ChecklistLibraryChecklistItems/1', checklistLibraryChecklistItemsData);
    });
  });

  describe('patch', () => {
    it('should partially update checklistlibrarychecklistitems successfully', async () => {
      const checklistLibraryChecklistItemsData = { name: 'Patched ChecklistLibraryChecklistItems' };
      const mockResponse = { id: 1, ...checklistLibraryChecklistItemsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await checklistLibraryChecklistItems.patch(1, checklistLibraryChecklistItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ChecklistLibraryChecklistItems/1', checklistLibraryChecklistItemsData);
    });
  });

  describe('delete', () => {
    it('should delete checklistlibrarychecklistitems successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await checklistLibraryChecklistItems.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ChecklistLibraryChecklistItems/1');
    });
  });
});