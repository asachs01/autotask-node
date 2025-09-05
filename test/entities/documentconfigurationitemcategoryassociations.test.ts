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

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await documentConfigurationItemCategoryAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/DocumentConfigurationItemCategoryAssociations/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IDocumentConfigurationItemCategoryAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await documentConfigurationItemCategoryAssociations.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/DocumentConfigurationItemCategoryAssociations/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get documentconfigurationitemcategoryassociations by id', async () => {
      const mockData = { id: 1, name: 'Test DocumentConfigurationItemCategoryAssociations' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await documentConfigurationItemCategoryAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/DocumentConfigurationItemCategoryAssociations/1');
    });
  });

  describe('create', () => {
    it('should create documentconfigurationitemcategoryassociations successfully', async () => {
      const documentConfigurationItemCategoryAssociationsData = { name: 'New DocumentConfigurationItemCategoryAssociations' };
      const mockResponse = { id: 1, ...documentConfigurationItemCategoryAssociationsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await documentConfigurationItemCategoryAssociations.create(documentConfigurationItemCategoryAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/DocumentConfigurationItemCategoryAssociations', documentConfigurationItemCategoryAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete documentconfigurationitemcategoryassociations successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await documentConfigurationItemCategoryAssociations.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/DocumentConfigurationItemCategoryAssociations/1');
    });
  });
});