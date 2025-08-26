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
  DocumentConfigurationItemAssociations,
  IDocumentConfigurationItemAssociations,
  IDocumentConfigurationItemAssociationsQuery,
} from '../../src/entities/documentconfigurationitemassociations';

describe('DocumentConfigurationItemAssociations Entity', () => {
  let documentConfigurationItemAssociations: DocumentConfigurationItemAssociations;
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

    documentConfigurationItemAssociations = new DocumentConfigurationItemAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list documentconfigurationitemassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'DocumentConfigurationItemAssociations 1' },
        { id: 2, name: 'DocumentConfigurationItemAssociations 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentConfigurationItemAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentConfigurationItemAssociations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IDocumentConfigurationItemAssociationsQuery = {
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

      await documentConfigurationItemAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentConfigurationItemAssociations/query', {
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
    it('should get documentconfigurationitemassociations by id', async () => {
      const mockData = { id: 1, name: 'Test DocumentConfigurationItemAssociations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await documentConfigurationItemAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentConfigurationItemAssociations/1');
    });
  });

  describe('create', () => {
    it('should create documentconfigurationitemassociations successfully', async () => {
      const documentConfigurationItemAssociationsData = { name: 'New DocumentConfigurationItemAssociations' };
      const mockResponse = { id: 1, ...documentConfigurationItemAssociationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await documentConfigurationItemAssociations.create(documentConfigurationItemAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/DocumentConfigurationItemAssociations', documentConfigurationItemAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete documentconfigurationitemassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await documentConfigurationItemAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/DocumentConfigurationItemAssociations/1');
    });
  });
});