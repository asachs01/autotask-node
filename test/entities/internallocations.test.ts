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
  InternalLocations,
  IInternalLocations,
  IInternalLocationsQuery,
} from '../../src/entities/internallocations';

describe('InternalLocations Entity', () => {
  let internalLocations: InternalLocations;
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

    internalLocations = new InternalLocations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list internallocations successfully', async () => {
      const mockData = [
        { id: 1, name: 'InternalLocations 1' },
        { id: 2, name: 'InternalLocations 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await internalLocations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InternalLocations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IInternalLocationsQuery = {
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

      await internalLocations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/InternalLocations/query', {
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
    it('should get internallocations by id', async () => {
      const mockData = { id: 1, name: 'Test InternalLocations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await internalLocations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InternalLocations/1');
    });
  });

  describe('create', () => {
    it('should create internallocations successfully', async () => {
      const internalLocationsData = { name: 'New InternalLocations' };
      const mockResponse = { id: 1, ...internalLocationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await internalLocations.create(internalLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/InternalLocations', internalLocationsData);
    });
  });

  describe('update', () => {
    it('should update internallocations successfully', async () => {
      const internalLocationsData = { name: 'Updated InternalLocations' };
      const mockResponse = { id: 1, ...internalLocationsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await internalLocations.update(1, internalLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/InternalLocations/1', internalLocationsData);
    });
  });

  describe('patch', () => {
    it('should partially update internallocations successfully', async () => {
      const internalLocationsData = { name: 'Patched InternalLocations' };
      const mockResponse = { id: 1, ...internalLocationsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await internalLocations.patch(1, internalLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/InternalLocations/1', internalLocationsData);
    });
  });

  describe('delete', () => {
    it('should delete internallocations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await internalLocations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/InternalLocations/1');
    });
  });
});