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
  PriceListRoles,
  IPriceListRoles,
  IPriceListRolesQuery,
} from '../../src/entities/pricelistroles';

describe('PriceListRoles Entity', () => {
  let priceListRoles: PriceListRoles;
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

    priceListRoles = new PriceListRoles(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list pricelistroles successfully', async () => {
      const mockData = [
        { id: 1, name: 'PriceListRoles 1' },
        { id: 2, name: 'PriceListRoles 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await priceListRoles.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PriceListRoles/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IPriceListRolesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await priceListRoles.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PriceListRoles/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get pricelistroles by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListRoles' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await priceListRoles.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PriceListRoles/1');
    });
  });

  describe('create', () => {
    it('should create pricelistroles successfully', async () => {
      const priceListRolesData = { name: 'New PriceListRoles' };
      const mockResponse = { id: 1, ...priceListRolesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await priceListRoles.create(priceListRolesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/PriceListRoles', priceListRolesData);
    });
  });

  describe('update', () => {
    it('should update pricelistroles successfully', async () => {
      const priceListRolesData = { name: 'Updated PriceListRoles' };
      const mockResponse = { id: 1, ...priceListRolesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await priceListRoles.update(1, priceListRolesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/PriceListRoles/1', priceListRolesData);
    });
  });

  describe('patch', () => {
    it('should partially update pricelistroles successfully', async () => {
      const priceListRolesData = { name: 'Patched PriceListRoles' };
      const mockResponse = { id: 1, ...priceListRolesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await priceListRoles.patch(1, priceListRolesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/PriceListRoles/1', priceListRolesData);
    });
  });

  describe('delete', () => {
    it('should delete pricelistroles successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await priceListRoles.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/PriceListRoles/1');
    });
  });
});