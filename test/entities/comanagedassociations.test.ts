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
  ComanagedAssociations,
  IComanagedAssociations,
  IComanagedAssociationsQuery,
} from '../../src/entities/comanagedassociations';

describe('ComanagedAssociations Entity', () => {
  let comanagedAssociations: ComanagedAssociations;
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

    comanagedAssociations = new ComanagedAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list comanagedassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ComanagedAssociations 1' },
        { id: 2, name: 'ComanagedAssociations 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await comanagedAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ComanagedAssociations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IComanagedAssociationsQuery = {
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

      await comanagedAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ComanagedAssociations/query', {
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
    it('should get comanagedassociations by id', async () => {
      const mockData = { id: 1, name: 'Test ComanagedAssociations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await comanagedAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ComanagedAssociations/1');
    });
  });

  describe('create', () => {
    it('should create comanagedassociations successfully', async () => {
      const comanagedAssociationsData = { name: 'New ComanagedAssociations' };
      const mockResponse = { id: 1, ...comanagedAssociationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await comanagedAssociations.create(comanagedAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ComanagedAssociations', comanagedAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete comanagedassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await comanagedAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ComanagedAssociations/1');
    });
  });
});