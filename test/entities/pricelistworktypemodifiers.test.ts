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
  PriceListWorkTypeModifiers,
  IPriceListWorkTypeModifiers,
  IPriceListWorkTypeModifiersQuery,
} from '../../src/entities/pricelistworktypemodifiers';

describe('PriceListWorkTypeModifiers Entity', () => {
  let priceListWorkTypeModifiers: PriceListWorkTypeModifiers;
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

    priceListWorkTypeModifiers = new PriceListWorkTypeModifiers(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list pricelistworktypemodifiers successfully', async () => {
      const mockData = [
        { id: 1, name: 'PriceListWorkTypeModifiers 1' },
        { id: 2, name: 'PriceListWorkTypeModifiers 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await priceListWorkTypeModifiers.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IPriceListWorkTypeModifiersQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await priceListWorkTypeModifiers.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get pricelistworktypemodifiers by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListWorkTypeModifiers' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await priceListWorkTypeModifiers.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/1');
    });
  });

  describe('create', () => {
    it('should create pricelistworktypemodifiers successfully', async () => {
      const priceListWorkTypeModifiersData = { name: 'New PriceListWorkTypeModifiers' };
      const mockResponse = { id: 1, ...priceListWorkTypeModifiersData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await priceListWorkTypeModifiers.create(priceListWorkTypeModifiersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/PriceListWorkTypeModifiers', priceListWorkTypeModifiersData);
    });
  });

  describe('update', () => {
    it('should update pricelistworktypemodifiers successfully', async () => {
      const priceListWorkTypeModifiersData = { name: 'Updated PriceListWorkTypeModifiers' };
      const mockResponse = { id: 1, ...priceListWorkTypeModifiersData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await priceListWorkTypeModifiers.update(1, priceListWorkTypeModifiersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/1', priceListWorkTypeModifiersData);
    });
  });

  describe('patch', () => {
    it('should partially update pricelistworktypemodifiers successfully', async () => {
      const priceListWorkTypeModifiersData = { name: 'Patched PriceListWorkTypeModifiers' };
      const mockResponse = { id: 1, ...priceListWorkTypeModifiersData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await priceListWorkTypeModifiers.patch(1, priceListWorkTypeModifiersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/1', priceListWorkTypeModifiersData);
    });
  });

  describe('delete', () => {
    it('should delete pricelistworktypemodifiers successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await priceListWorkTypeModifiers.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/1');
    });
  });
});