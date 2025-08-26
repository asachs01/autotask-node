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
  DocumentConfigurationItemCategoryAssociations,
  IDocumentConfigurationItemCategoryAssociations,
  IDocumentConfigurationItemCategoryAssociationsQuery,
} from '../../src/entities/documentconfigurationitemcategoryassociations';

describe('DocumentConfigurationItemCategoryAssociations Entity', () => {
  let documentConfigurationItemCategoryAssociations: DocumentConfigurationItemCategoryAssociations;
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

    documentConfigurationItemCategoryAssociations = new DocumentConfigurationItemCategoryAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list documentconfigurationitemcategoryassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'DocumentConfigurationItemCategoryAssociations 1' },
        { id: 2, name: 'DocumentConfigurationItemCategoryAssociations 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentConfigurationItemCategoryAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentConfigurationItemCategoryAssociations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IDocumentConfigurationItemCategoryAssociationsQuery = {
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

      await documentConfigurationItemCategoryAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentConfigurationItemCategoryAssociations/query', {
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
    it('should get documentconfigurationitemcategoryassociations by id', async () => {
      const mockData = { id: 1, name: 'Test DocumentConfigurationItemCategoryAssociations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentConfigurationItemCategoryAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentConfigurationItemCategoryAssociations/1');
    });
  });

  describe('create', () => {
    it('should create documentconfigurationitemcategoryassociations successfully', async () => {
      const documentConfigurationItemCategoryAssociationsData = { name: 'New DocumentConfigurationItemCategoryAssociations' };
      const mockResponse = { id: 1, ...documentConfigurationItemCategoryAssociationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await documentConfigurationItemCategoryAssociations.create(documentConfigurationItemCategoryAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/DocumentConfigurationItemCategoryAssociations', documentConfigurationItemCategoryAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete documentconfigurationitemcategoryassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await documentConfigurationItemCategoryAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/DocumentConfigurationItemCategoryAssociations/1');
    });
  });
});