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
  ConfigurationItemRelatedItems,
  IConfigurationItemRelatedItems,
  IConfigurationItemRelatedItemsQuery,
} from '../../src/entities/configurationitemrelateditems';

describe('ConfigurationItemRelatedItems Entity', () => {
  let configurationItemRelatedItems: ConfigurationItemRelatedItems;
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

    configurationItemRelatedItems = new ConfigurationItemRelatedItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list configurationitemrelateditems successfully', async () => {
      const mockData = [
        { id: 1, name: 'ConfigurationItemRelatedItems 1' },
        { id: 2, name: 'ConfigurationItemRelatedItems 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemRelatedItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemRelatedItems/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemRelatedItemsQuery = {
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

      await configurationItemRelatedItems.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemRelatedItems/query', {
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
    it('should get configurationitemrelateditems by id', async () => {
      const mockData = { id: 1, name: 'Test ConfigurationItemRelatedItems' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemRelatedItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemRelatedItems/1');
    });
  });

  describe('create', () => {
    it('should create configurationitemrelateditems successfully', async () => {
      const configurationItemRelatedItemsData = { name: 'New ConfigurationItemRelatedItems' };
      const mockResponse = { id: 1, ...configurationItemRelatedItemsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemRelatedItems.create(configurationItemRelatedItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ConfigurationItemRelatedItems', configurationItemRelatedItemsData);
    });
  });

  describe('delete', () => {
    it('should delete configurationitemrelateditems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await configurationItemRelatedItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ConfigurationItemRelatedItems/1');
    });
  });
});