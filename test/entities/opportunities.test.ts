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
  Opportunities,
  IOpportunities,
  IOpportunitiesQuery,
} from '../../src/entities/opportunities';

describe('Opportunities Entity', () => {
  let opportunities: Opportunities;
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

    opportunities = new Opportunities(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list opportunities successfully', async () => {
      const mockData = [
        { id: 1, name: 'Opportunities 1' },
        { id: 2, name: 'Opportunities 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await opportunities.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Opportunities/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IOpportunitiesQuery = {
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

      await opportunities.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/Opportunities/query', {
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
    it('should get opportunities by id', async () => {
      const mockData = { id: 1, name: 'Test Opportunities' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await opportunities.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Opportunities/1');
    });
  });

  describe('create', () => {
    it('should create opportunities successfully', async () => {
      const opportunitiesData = { name: 'New Opportunities' };
      const mockResponse = { id: 1, ...opportunitiesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await opportunities.create(opportunitiesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/Opportunities', opportunitiesData);
    });
  });

  describe('update', () => {
    it('should update opportunities successfully', async () => {
      const opportunitiesData = { name: 'Updated Opportunities' };
      const mockResponse = { id: 1, ...opportunitiesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await opportunities.update(1, opportunitiesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/Opportunities/1', opportunitiesData);
    });
  });

  describe('patch', () => {
    it('should partially update opportunities successfully', async () => {
      const opportunitiesData = { name: 'Patched Opportunities' };
      const mockResponse = { id: 1, ...opportunitiesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await opportunities.patch(1, opportunitiesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/Opportunities/1', opportunitiesData);
    });
  });
});