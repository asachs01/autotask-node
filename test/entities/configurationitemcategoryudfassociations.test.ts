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
  ConfigurationItemCategoryUdfAssociations,
  IConfigurationItemCategoryUdfAssociations,
  IConfigurationItemCategoryUdfAssociationsQuery,
} from '../../src/entities/configurationitemcategoryudfassociations';

describe('ConfigurationItemCategoryUdfAssociations Entity', () => {
  let configurationItemCategoryUdfAssociations: ConfigurationItemCategoryUdfAssociations;
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

    configurationItemCategoryUdfAssociations = new ConfigurationItemCategoryUdfAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list configurationitemcategoryudfassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ConfigurationItemCategoryUdfAssociations 1' },
        { id: 2, name: 'ConfigurationItemCategoryUdfAssociations 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemCategoryUdfAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemCategoryUdfAssociations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemCategoryUdfAssociationsQuery = {
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

      await configurationItemCategoryUdfAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemCategoryUdfAssociations/query', {
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
    it('should get configurationitemcategoryudfassociations by id', async () => {
      const mockData = { id: 1, name: 'Test ConfigurationItemCategoryUdfAssociations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemCategoryUdfAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemCategoryUdfAssociations/1');
    });
  });
});