import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';
import {
  ConfigurationItems,
  IConfigurationItems,
  IConfigurationItemsQuery,
} from '../../src/entities/configurationitems';

describe('ConfigurationItems Entity', () => {
  let configurationItems: ConfigurationItems;
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

    configurationItems = new ConfigurationItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list configurationitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'ConfigurationItems 1' },
        { id: 2, name: 'ConfigurationItems 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await configurationItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/ConfigurationItems/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await configurationItems.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/ConfigurationItems/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get configurationitems by id', async () => {
      const mockData = { id: 1, name: 'Test ConfigurationItems' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await configurationItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItems/1');
    });
  });

  describe('create', () => {
    it('should create configurationitems successfully', async () => {
      const configurationItemsData = { name: 'New ConfigurationItems' };
      const mockResponse = { id: 1, ...configurationItemsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await configurationItems.create(configurationItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ConfigurationItems',
        configurationItemsData
      );
    });
  });

  describe('update', () => {
    it('should update configurationitems successfully', async () => {
      const configurationItemsData = { name: 'Updated ConfigurationItems' };
      const mockResponse = { id: 1, ...configurationItemsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await configurationItems.update(1, configurationItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ConfigurationItems/1',
        configurationItemsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update configurationitems successfully', async () => {
      const configurationItemsData = { name: 'Patched ConfigurationItems' };
      const mockResponse = { id: 1, ...configurationItemsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await configurationItems.patch(1, configurationItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ConfigurationItems/1',
        configurationItemsData
      );
    });
  });
});
