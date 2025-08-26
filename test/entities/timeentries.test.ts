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
  TimeEntries,
  ITimeEntries,
  ITimeEntriesQuery,
} from '../../src/entities/timeentries';

describe('TimeEntries Entity', () => {
  let timeEntries: TimeEntries;
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

    timeEntries = new TimeEntries(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list timeentries successfully', async () => {
      const mockData = [
        { id: 1, name: 'TimeEntries 1' },
        { id: 2, name: 'TimeEntries 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await timeEntries.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TimeEntries/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITimeEntriesQuery = {
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

      await timeEntries.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TimeEntries/query', {
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
    it('should get timeentries by id', async () => {
      const mockData = { id: 1, name: 'Test TimeEntries' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await timeEntries.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TimeEntries/1');
    });
  });

  describe('create', () => {
    it('should create timeentries successfully', async () => {
      const timeEntriesData = { name: 'New TimeEntries' };
      const mockResponse = { id: 1, ...timeEntriesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await timeEntries.create(timeEntriesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TimeEntries', timeEntriesData);
    });
  });

  describe('update', () => {
    it('should update timeentries successfully', async () => {
      const timeEntriesData = { name: 'Updated TimeEntries' };
      const mockResponse = { id: 1, ...timeEntriesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await timeEntries.update(1, timeEntriesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/TimeEntries/1', timeEntriesData);
    });
  });

  describe('patch', () => {
    it('should partially update timeentries successfully', async () => {
      const timeEntriesData = { name: 'Patched TimeEntries' };
      const mockResponse = { id: 1, ...timeEntriesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await timeEntries.patch(1, timeEntriesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/TimeEntries/1', timeEntriesData);
    });
  });

  describe('delete', () => {
    it('should delete timeentries successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await timeEntries.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TimeEntries/1');
    });
  });
});