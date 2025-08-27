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
  Invoices,
  IInvoices,
  IInvoicesQuery,
} from '../../src/entities/invoices';

describe('Invoices Entity', () => {
  let invoices: Invoices;
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

    invoices = new Invoices(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list invoices successfully', async () => {
      const mockData = [
        { id: 1, name: 'Invoices 1' },
        { id: 2, name: 'Invoices 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await invoices.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Invoices/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        },
      });
    });

    it('should handle query parameters', async () => {
      const query: IInvoicesQuery = {
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

      await invoices.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/Invoices/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        },
      });
    });
  });

  describe('get', () => {
    it('should get invoices by id', async () => {
      const mockData = { id: 1, name: 'Test Invoices' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await invoices.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Invoices/1');
    });
  });

  describe('create', () => {
    it('should create invoices successfully', async () => {
      const invoicesData = { name: 'New Invoices' };
      const mockResponse = { id: 1, ...invoicesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await invoices.create(invoicesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/Invoices', invoicesData);
    });
  });

  describe('update', () => {
    it('should update invoices successfully', async () => {
      const invoicesData = { name: 'Updated Invoices' };
      const mockResponse = { id: 1, ...invoicesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await invoices.update(1, invoicesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/Invoices/1', invoicesData);
    });
  });

  describe('patch', () => {
    it('should partially update invoices successfully', async () => {
      const invoicesData = { name: 'Patched Invoices' };
      const mockResponse = { id: 1, ...invoicesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await invoices.patch(1, invoicesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/Invoices/1', invoicesData);
    });
  });
});
