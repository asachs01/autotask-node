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
  ServiceCallTicketResources,
  IServiceCallTicketResources,
  IServiceCallTicketResourcesQuery,
} from '../../src/entities/servicecallticketresources';

describe('ServiceCallTicketResources Entity', () => {
  let serviceCallTicketResources: ServiceCallTicketResources;
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

    serviceCallTicketResources = new ServiceCallTicketResources(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list servicecallticketresources successfully', async () => {
      const mockData = [
        { id: 1, name: 'ServiceCallTicketResources 1' },
        { id: 2, name: 'ServiceCallTicketResources 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await serviceCallTicketResources.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceCallTicketResources/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IServiceCallTicketResourcesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await serviceCallTicketResources.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceCallTicketResources/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get servicecallticketresources by id', async () => {
      const mockData = { id: 1, name: 'Test ServiceCallTicketResources' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await serviceCallTicketResources.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceCallTicketResources/1');
    });
  });

  describe('create', () => {
    it('should create servicecallticketresources successfully', async () => {
      const serviceCallTicketResourcesData = { name: 'New ServiceCallTicketResources' };
      const mockResponse = { id: 1, ...serviceCallTicketResourcesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await serviceCallTicketResources.create(serviceCallTicketResourcesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ServiceCallTicketResources', serviceCallTicketResourcesData);
    });
  });

  describe('delete', () => {
    it('should delete servicecallticketresources successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await serviceCallTicketResources.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ServiceCallTicketResources/1');
    });
  });
});