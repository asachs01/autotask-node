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
  ServiceCallTickets,
  IServiceCallTickets,
  IServiceCallTicketsQuery,
} from '../../src/entities/servicecalltickets';

describe('ServiceCallTickets Entity', () => {
  let serviceCallTickets: ServiceCallTickets;
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

    serviceCallTickets = new ServiceCallTickets(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list servicecalltickets successfully', async () => {
      const mockData = [
        { id: 1, name: 'ServiceCallTickets 1' },
        { id: 2, name: 'ServiceCallTickets 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await serviceCallTickets.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceCallTickets/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IServiceCallTicketsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await serviceCallTickets.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceCallTickets/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get servicecalltickets by id', async () => {
      const mockData = { id: 1, name: 'Test ServiceCallTickets' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await serviceCallTickets.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceCallTickets/1');
    });
  });

  describe('create', () => {
    it('should create servicecalltickets successfully', async () => {
      const serviceCallTicketsData = { name: 'New ServiceCallTickets' };
      const mockResponse = { id: 1, ...serviceCallTicketsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await serviceCallTickets.create(serviceCallTicketsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ServiceCallTickets', serviceCallTicketsData);
    });
  });

  describe('update', () => {
    it('should update servicecalltickets successfully', async () => {
      const serviceCallTicketsData = { name: 'Updated ServiceCallTickets' };
      const mockResponse = { id: 1, ...serviceCallTicketsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await serviceCallTickets.update(1, serviceCallTicketsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ServiceCallTickets/1', serviceCallTicketsData);
    });
  });

  describe('patch', () => {
    it('should partially update servicecalltickets successfully', async () => {
      const serviceCallTicketsData = { name: 'Patched ServiceCallTickets' };
      const mockResponse = { id: 1, ...serviceCallTicketsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await serviceCallTickets.patch(1, serviceCallTicketsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ServiceCallTickets/1', serviceCallTicketsData);
    });
  });

  describe('delete', () => {
    it('should delete servicecalltickets successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await serviceCallTickets.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ServiceCallTickets/1');
    });
  });
});