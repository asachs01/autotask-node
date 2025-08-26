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
  DocumentTagAssociations,
  IDocumentTagAssociations,
  IDocumentTagAssociationsQuery,
} from '../../src/entities/documenttagassociations';

describe('DocumentTagAssociations Entity', () => {
  let documentTagAssociations: DocumentTagAssociations;
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

    documentTagAssociations = new DocumentTagAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list documenttagassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'DocumentTagAssociations 1' },
        { id: 2, name: 'DocumentTagAssociations 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentTagAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentTagAssociations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IDocumentTagAssociationsQuery = {
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

      await documentTagAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentTagAssociations/query', {
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
    it('should get documenttagassociations by id', async () => {
      const mockData = { id: 1, name: 'Test DocumentTagAssociations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentTagAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentTagAssociations/1');
    });
  });

  describe('create', () => {
    it('should create documenttagassociations successfully', async () => {
      const documentTagAssociationsData = { name: 'New DocumentTagAssociations' };
      const mockResponse = { id: 1, ...documentTagAssociationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await documentTagAssociations.create(documentTagAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/DocumentTagAssociations', documentTagAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete documenttagassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await documentTagAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/DocumentTagAssociations/1');
    });
  });
});