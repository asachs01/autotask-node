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
  TimeOffRequests,
  ITimeOffRequests,
  ITimeOffRequestsQuery,
} from '../../src/entities/timeoffrequests';

describe('TimeOffRequests Entity', () => {
  let timeOffRequests: TimeOffRequests;
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

    timeOffRequests = new TimeOffRequests(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list timeoffrequests successfully', async () => {
      const mockData = [
        { id: 1, name: 'TimeOffRequests 1' },
        { id: 2, name: 'TimeOffRequests 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await timeOffRequests.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TimeOffRequests/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITimeOffRequestsQuery = {
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

      await timeOffRequests.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TimeOffRequests/query', {
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
    it('should get timeoffrequests by id', async () => {
      const mockData = { id: 1, name: 'Test TimeOffRequests' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await timeOffRequests.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TimeOffRequests/1');
    });
  });

  describe('create', () => {
    it('should create timeoffrequests successfully', async () => {
      const timeOffRequestsData = { name: 'New TimeOffRequests' };
      const mockResponse = { id: 1, ...timeOffRequestsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await timeOffRequests.create(timeOffRequestsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TimeOffRequests', timeOffRequestsData);
    });
  });

  describe('update', () => {
    it('should update timeoffrequests successfully', async () => {
      const timeOffRequestsData = { name: 'Updated TimeOffRequests' };
      const mockResponse = { id: 1, ...timeOffRequestsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await timeOffRequests.update(1, timeOffRequestsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/TimeOffRequests/1', timeOffRequestsData);
    });
  });

  describe('patch', () => {
    it('should partially update timeoffrequests successfully', async () => {
      const timeOffRequestsData = { name: 'Patched TimeOffRequests' };
      const mockResponse = { id: 1, ...timeOffRequestsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await timeOffRequests.patch(1, timeOffRequestsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/TimeOffRequests/1', timeOffRequestsData);
    });
  });

  describe('delete', () => {
    it('should delete timeoffrequests successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await timeOffRequests.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TimeOffRequests/1');
    });
  });
});