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
  TimeOffRequestsApprove,
  ITimeOffRequestsApprove,
  ITimeOffRequestsApproveQuery,
} from '../../src/entities/timeoffrequestsapprove';

describe('TimeOffRequestsApprove Entity', () => {
  let timeOffRequestsApprove: TimeOffRequestsApprove;
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

    timeOffRequestsApprove = new TimeOffRequestsApprove(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list timeoffrequestsapprove successfully', async () => {
      const mockData = [
        { id: 1, name: 'TimeOffRequestsApprove 1' },
        { id: 2, name: 'TimeOffRequestsApprove 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await timeOffRequestsApprove.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TimeOffRequestsApprove/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITimeOffRequestsApproveQuery = {
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

      await timeOffRequestsApprove.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TimeOffRequestsApprove/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        }
      });
    });
  });

  describe('create', () => {
    it('should create timeoffrequestsapprove successfully', async () => {
      const timeOffRequestsApproveData = { name: 'New TimeOffRequestsApprove' };
      const mockResponse = { id: 1, ...timeOffRequestsApproveData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await timeOffRequestsApprove.create(timeOffRequestsApproveData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TimeOffRequestsApprove', timeOffRequestsApproveData);
    });
  });
});