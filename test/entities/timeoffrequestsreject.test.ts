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
  TimeOffRequestsReject,
  ITimeOffRequestsReject,
  ITimeOffRequestsRejectQuery,
} from '../../src/entities/timeoffrequestsreject';

describe('TimeOffRequestsReject Entity', () => {
  let timeOffRequestsReject: TimeOffRequestsReject;
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

    timeOffRequestsReject = new TimeOffRequestsReject(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list timeoffrequestsreject successfully', async () => {
      const mockData = [
        { id: 1, name: 'TimeOffRequestsReject 1' },
        { id: 2, name: 'TimeOffRequestsReject 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await timeOffRequestsReject.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TimeOffRequestsReject/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITimeOffRequestsRejectQuery = {
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

      await timeOffRequestsReject.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TimeOffRequestsReject/query', {
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
    it('should create timeoffrequestsreject successfully', async () => {
      const timeOffRequestsRejectData = { name: 'New TimeOffRequestsReject' };
      const mockResponse = { id: 1, ...timeOffRequestsRejectData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await timeOffRequestsReject.create(timeOffRequestsRejectData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TimeOffRequestsReject', timeOffRequestsRejectData);
    });
  });
});