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
  PurchaseApprovals,
  IPurchaseApprovals,
  IPurchaseApprovalsQuery,
} from '../../src/entities/purchaseapprovals';

describe('PurchaseApprovals Entity', () => {
  let purchaseApprovals: PurchaseApprovals;
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

    purchaseApprovals = new PurchaseApprovals(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list purchaseapprovals successfully', async () => {
      const mockData = [
        { id: 1, name: 'PurchaseApprovals 1' },
        { id: 2, name: 'PurchaseApprovals 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseApprovals.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseApprovals/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IPurchaseApprovalsQuery = {
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

      await purchaseApprovals.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseApprovals/query', {
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
    it('should get purchaseapprovals by id', async () => {
      const mockData = { id: 1, name: 'Test PurchaseApprovals' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseApprovals.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseApprovals/1');
    });
  });

  describe('create', () => {
    it('should create purchaseapprovals successfully', async () => {
      const purchaseApprovalsData = { name: 'New PurchaseApprovals' };
      const mockResponse = { id: 1, ...purchaseApprovalsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseApprovals.create(purchaseApprovalsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/PurchaseApprovals', purchaseApprovalsData);
    });
  });

  describe('update', () => {
    it('should update purchaseapprovals successfully', async () => {
      const purchaseApprovalsData = { name: 'Updated PurchaseApprovals' };
      const mockResponse = { id: 1, ...purchaseApprovalsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseApprovals.update(1, purchaseApprovalsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/PurchaseApprovals/1', purchaseApprovalsData);
    });
  });

  describe('patch', () => {
    it('should partially update purchaseapprovals successfully', async () => {
      const purchaseApprovalsData = { name: 'Patched PurchaseApprovals' };
      const mockResponse = { id: 1, ...purchaseApprovalsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseApprovals.patch(1, purchaseApprovalsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/PurchaseApprovals/1', purchaseApprovalsData);
    });
  });
});