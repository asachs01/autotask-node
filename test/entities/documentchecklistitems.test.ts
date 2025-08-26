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

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentChecklistItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentChecklistItems/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IDocumentChecklistItemsQuery = {
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

      await documentChecklistItems.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentChecklistItems/query', {
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
    it('should get documentchecklistitems by id', async () => {
      const mockData = { id: 1, name: 'Test DocumentChecklistItems' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentChecklistItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentChecklistItems/1');
    });
  });

  describe('create', () => {
    it('should create documentchecklistitems successfully', async () => {
      const documentChecklistItemsData = { name: 'New DocumentChecklistItems' };
      const mockResponse = { id: 1, ...documentChecklistItemsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await documentChecklistItems.create(documentChecklistItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/DocumentChecklistItems', documentChecklistItemsData);
    });
  });

  describe('update', () => {
    it('should update documentchecklistitems successfully', async () => {
      const documentChecklistItemsData = { name: 'Updated DocumentChecklistItems' };
      const mockResponse = { id: 1, ...documentChecklistItemsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentChecklistItems.update(1, documentChecklistItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/DocumentChecklistItems/1', documentChecklistItemsData);
    });
  });

  describe('patch', () => {
    it('should partially update documentchecklistitems successfully', async () => {
      const documentChecklistItemsData = { name: 'Patched DocumentChecklistItems' };
      const mockResponse = { id: 1, ...documentChecklistItemsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentChecklistItems.patch(1, documentChecklistItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/DocumentChecklistItems/1', documentChecklistItemsData);
    });
  });

  describe('delete', () => {
    it('should delete documentchecklistitems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await documentChecklistItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/DocumentChecklistItems/1');
    });
  });
});