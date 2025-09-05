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
  ConfigurationItemDnsRecords,
  IConfigurationItemDnsRecords,
  IConfigurationItemDnsRecordsQuery,
} from '../../src/entities/configurationitemdnsrecords';

describe('ConfigurationItemDnsRecords Entity', () => {
  let configurationItemDnsRecords: ConfigurationItemDnsRecords;
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

    configurationItemDnsRecords = new ConfigurationItemDnsRecords(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list configurationitemdnsrecords successfully', async () => {
      const mockData = [
        { id: 1, name: 'ConfigurationItemDnsRecords 1' },
        { id: 2, name: 'ConfigurationItemDnsRecords 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await configurationItemDnsRecords.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemDnsRecords/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemDnsRecordsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await configurationItemDnsRecords.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemDnsRecords/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get configurationitemdnsrecords by id', async () => {
      const mockData = { id: 1, name: 'Test ConfigurationItemDnsRecords' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await configurationItemDnsRecords.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemDnsRecords/1');
    });
  });

  describe('create', () => {
    it('should create configurationitemdnsrecords successfully', async () => {
      const configurationItemDnsRecordsData = { name: 'New ConfigurationItemDnsRecords' };
      const mockResponse = { id: 1, ...configurationItemDnsRecordsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await configurationItemDnsRecords.create(configurationItemDnsRecordsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ConfigurationItemDnsRecords', configurationItemDnsRecordsData);
    });
  });

  describe('update', () => {
    it('should update configurationitemdnsrecords successfully', async () => {
      const configurationItemDnsRecordsData = { name: 'Updated ConfigurationItemDnsRecords' };
      const mockResponse = { id: 1, ...configurationItemDnsRecordsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await configurationItemDnsRecords.update(1, configurationItemDnsRecordsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ConfigurationItemDnsRecords/1', configurationItemDnsRecordsData);
    });
  });

  describe('patch', () => {
    it('should partially update configurationitemdnsrecords successfully', async () => {
      const configurationItemDnsRecordsData = { name: 'Patched ConfigurationItemDnsRecords' };
      const mockResponse = { id: 1, ...configurationItemDnsRecordsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await configurationItemDnsRecords.patch(1, configurationItemDnsRecordsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ConfigurationItemDnsRecords/1', configurationItemDnsRecordsData);
    });
  });

  describe('delete', () => {
    it('should delete configurationitemdnsrecords successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await configurationItemDnsRecords.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ConfigurationItemDnsRecords/1');
    });
  });
});