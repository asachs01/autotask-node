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
  AdditionalInvoiceFieldValues,
  IAdditionalInvoiceFieldValues,
  IAdditionalInvoiceFieldValuesQuery,
} from '../../src/entities/additionalinvoicefieldvalues';

describe('AdditionalInvoiceFieldValues Entity', () => {
  let additionalInvoiceFieldValues: AdditionalInvoiceFieldValues;
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

    additionalInvoiceFieldValues = new AdditionalInvoiceFieldValues(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list additionalinvoicefieldvalues successfully', async () => {
      const mockData = [
        { id: 1, name: 'AdditionalInvoiceFieldValues 1' },
        { id: 2, name: 'AdditionalInvoiceFieldValues 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await additionalInvoiceFieldValues.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/AdditionalInvoiceFieldValues/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IAdditionalInvoiceFieldValuesQuery = {
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

      await additionalInvoiceFieldValues.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/AdditionalInvoiceFieldValues/query', {
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
    it('should get additionalinvoicefieldvalues by id', async () => {
      const mockData = { id: 1, name: 'Test AdditionalInvoiceFieldValues' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await additionalInvoiceFieldValues.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/AdditionalInvoiceFieldValues/1');
    });
  });

  describe('create', () => {
    it('should create additionalinvoicefieldvalues successfully', async () => {
      const additionalInvoiceFieldValuesData = { name: 'New AdditionalInvoiceFieldValues' };
      const mockResponse = { id: 1, ...additionalInvoiceFieldValuesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await additionalInvoiceFieldValues.create(additionalInvoiceFieldValuesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/AdditionalInvoiceFieldValues', additionalInvoiceFieldValuesData);
    });
  });

  describe('update', () => {
    it('should update additionalinvoicefieldvalues successfully', async () => {
      const additionalInvoiceFieldValuesData = { name: 'Updated AdditionalInvoiceFieldValues' };
      const mockResponse = { id: 1, ...additionalInvoiceFieldValuesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await additionalInvoiceFieldValues.update(1, additionalInvoiceFieldValuesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/AdditionalInvoiceFieldValues/1', additionalInvoiceFieldValuesData);
    });
  });

  describe('patch', () => {
    it('should partially update additionalinvoicefieldvalues successfully', async () => {
      const additionalInvoiceFieldValuesData = { name: 'Patched AdditionalInvoiceFieldValues' };
      const mockResponse = { id: 1, ...additionalInvoiceFieldValuesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await additionalInvoiceFieldValues.patch(1, additionalInvoiceFieldValuesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/AdditionalInvoiceFieldValues/1', additionalInvoiceFieldValuesData);
    });
  });
});