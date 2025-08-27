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
  DocumentToArticleAssociations,
  IDocumentToArticleAssociations,
  IDocumentToArticleAssociationsQuery,
} from '../../src/entities/documenttoarticleassociations';

describe('DocumentToArticleAssociations Entity', () => {
  let documentToArticleAssociations: DocumentToArticleAssociations;
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

    documentToArticleAssociations = new DocumentToArticleAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list documenttoarticleassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'DocumentToArticleAssociations 1' },
        { id: 2, name: 'DocumentToArticleAssociations 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentToArticleAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentToArticleAssociations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IDocumentToArticleAssociationsQuery = {
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

      await documentToArticleAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentToArticleAssociations/query', {
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
    it('should get documenttoarticleassociations by id', async () => {
      const mockData = { id: 1, name: 'Test DocumentToArticleAssociations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentToArticleAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentToArticleAssociations/1');
    });
  });

  describe('create', () => {
    it('should create documenttoarticleassociations successfully', async () => {
      const documentToArticleAssociationsData = { name: 'New DocumentToArticleAssociations' };
      const mockResponse = { id: 1, ...documentToArticleAssociationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await documentToArticleAssociations.create(documentToArticleAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/DocumentToArticleAssociations', documentToArticleAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete documenttoarticleassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await documentToArticleAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/DocumentToArticleAssociations/1');
    });
  });
});