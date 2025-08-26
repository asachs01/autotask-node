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
  PriceListServices,
  IPriceListServices,
  IPriceListServicesQuery,
} from '../../src/entities/pricelistservices';

describe('PriceListServices Entity', () => {
  let priceListServices: PriceListServices;
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

    priceListServices = new PriceListServices(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list pricelistservices successfully', async () => {
      const mockData = [
        { id: 1, name: 'PriceListServices 1' },
        { id: 2, name: 'PriceListServices 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListServices.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListServices/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IPriceListServicesQuery = {
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

      await priceListServices.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListServices/query', {
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
    it('should get pricelistservices by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListServices' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListServices.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListServices/1');
    });
  });

  describe('create', () => {
    it('should create pricelistservices successfully', async () => {
      const priceListServicesData = { name: 'New PriceListServices' };
      const mockResponse = { id: 1, ...priceListServicesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await priceListServices.create(priceListServicesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/PriceListServices', priceListServicesData);
    });
  });

  describe('update', () => {
    it('should update pricelistservices successfully', async () => {
      const priceListServicesData = { name: 'Updated PriceListServices' };
      const mockResponse = { id: 1, ...priceListServicesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListServices.update(1, priceListServicesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/PriceListServices/1', priceListServicesData);
    });
  });

  describe('patch', () => {
    it('should partially update pricelistservices successfully', async () => {
      const priceListServicesData = { name: 'Patched PriceListServices' };
      const mockResponse = { id: 1, ...priceListServicesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListServices.patch(1, priceListServicesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/PriceListServices/1', priceListServicesData);
    });
  });

  describe('delete', () => {
    it('should delete pricelistservices successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await priceListServices.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/PriceListServices/1');
    });
  });
});