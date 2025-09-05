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
  ServiceCallTaskResources,
  IServiceCallTaskResources,
  IServiceCallTaskResourcesQuery,
} from '../../src/entities/servicecalltaskresources';

describe('ServiceCallTaskResources Entity', () => {
  let serviceCallTaskResources: ServiceCallTaskResources;
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

    serviceCallTaskResources = new ServiceCallTaskResources(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list servicecalltaskresources successfully', async () => {
      const mockData = [
        { id: 1, name: 'ServiceCallTaskResources 1' },
        { id: 2, name: 'ServiceCallTaskResources 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await serviceCallTaskResources.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceCallTaskResources/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IServiceCallTaskResourcesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await serviceCallTaskResources.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceCallTaskResources/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get servicecalltaskresources by id', async () => {
      const mockData = { id: 1, name: 'Test ServiceCallTaskResources' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await serviceCallTaskResources.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceCallTaskResources/1');
    });
  });

  describe('create', () => {
    it('should create servicecalltaskresources successfully', async () => {
      const serviceCallTaskResourcesData = { name: 'New ServiceCallTaskResources' };
      const mockResponse = { id: 1, ...serviceCallTaskResourcesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await serviceCallTaskResources.create(serviceCallTaskResourcesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ServiceCallTaskResources', serviceCallTaskResourcesData);
    });
  });

  describe('delete', () => {
    it('should delete servicecalltaskresources successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await serviceCallTaskResources.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ServiceCallTaskResources/1');
    });
  });
});