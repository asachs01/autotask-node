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
  BillingCodes,
  IBillingCodes,
  IBillingCodesQuery,
} from '../../src/entities/billingcodes';

describe('BillingCodes Entity', () => {
  let billingCodes: BillingCodes;
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

    billingCodes = new BillingCodes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list billingcodes successfully', async () => {
      const mockData = [
        { id: 1, name: 'BillingCodes 1' },
        { id: 2, name: 'BillingCodes 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await billingCodes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/BillingCodes/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IBillingCodesQuery = {
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

      await billingCodes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/BillingCodes/query', {
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
    it('should get billingcodes by id', async () => {
      const mockData = { id: 1, name: 'Test BillingCodes' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await billingCodes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/BillingCodes/1');
    });
  });

  describe('create', () => {
    it('should create billingcodes successfully', async () => {
      const billingCodesData = { name: 'New BillingCodes' };
      const mockResponse = { id: 1, ...billingCodesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await billingCodes.create(billingCodesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/BillingCodes', billingCodesData);
    });
  });

  describe('update', () => {
    it('should update billingcodes successfully', async () => {
      const billingCodesData = { name: 'Updated BillingCodes' };
      const mockResponse = { id: 1, ...billingCodesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await billingCodes.update(1, billingCodesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/BillingCodes/1', billingCodesData);
    });
  });

  describe('patch', () => {
    it('should partially update billingcodes successfully', async () => {
      const billingCodesData = { name: 'Patched BillingCodes' };
      const mockResponse = { id: 1, ...billingCodesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await billingCodes.patch(1, billingCodesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/BillingCodes/1', billingCodesData);
    });
  });
});