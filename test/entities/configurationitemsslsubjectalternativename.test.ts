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
  ConfigurationItemSslSubjectAlternativeName,
  IConfigurationItemSslSubjectAlternativeName,
  IConfigurationItemSslSubjectAlternativeNameQuery,
} from '../../src/entities/configurationitemsslsubjectalternativename';

describe('ConfigurationItemSslSubjectAlternativeName Entity', () => {
  let configurationItemSslSubjectAlternativeName: ConfigurationItemSslSubjectAlternativeName;
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

    configurationItemSslSubjectAlternativeName = new ConfigurationItemSslSubjectAlternativeName(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list configurationitemsslsubjectalternativename successfully', async () => {
      const mockData = [
        { id: 1, name: 'ConfigurationItemSslSubjectAlternativeName 1' },
        { id: 2, name: 'ConfigurationItemSslSubjectAlternativeName 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemSslSubjectAlternativeName.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemSslSubjectAlternativeName/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemSslSubjectAlternativeNameQuery = {
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

      await configurationItemSslSubjectAlternativeName.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemSslSubjectAlternativeName/query', {
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
    it('should get configurationitemsslsubjectalternativename by id', async () => {
      const mockData = { id: 1, name: 'Test ConfigurationItemSslSubjectAlternativeName' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemSslSubjectAlternativeName.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemSslSubjectAlternativeName/1');
    });
  });

  describe('create', () => {
    it('should create configurationitemsslsubjectalternativename successfully', async () => {
      const configurationItemSslSubjectAlternativeNameData = { name: 'New ConfigurationItemSslSubjectAlternativeName' };
      const mockResponse = { id: 1, ...configurationItemSslSubjectAlternativeNameData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemSslSubjectAlternativeName.create(configurationItemSslSubjectAlternativeNameData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ConfigurationItemSslSubjectAlternativeName', configurationItemSslSubjectAlternativeNameData);
    });
  });

  describe('update', () => {
    it('should update configurationitemsslsubjectalternativename successfully', async () => {
      const configurationItemSslSubjectAlternativeNameData = { name: 'Updated ConfigurationItemSslSubjectAlternativeName' };
      const mockResponse = { id: 1, ...configurationItemSslSubjectAlternativeNameData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemSslSubjectAlternativeName.update(1, configurationItemSslSubjectAlternativeNameData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ConfigurationItemSslSubjectAlternativeName/1', configurationItemSslSubjectAlternativeNameData);
    });
  });

  describe('patch', () => {
    it('should partially update configurationitemsslsubjectalternativename successfully', async () => {
      const configurationItemSslSubjectAlternativeNameData = { name: 'Patched ConfigurationItemSslSubjectAlternativeName' };
      const mockResponse = { id: 1, ...configurationItemSslSubjectAlternativeNameData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemSslSubjectAlternativeName.patch(1, configurationItemSslSubjectAlternativeNameData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ConfigurationItemSslSubjectAlternativeName/1', configurationItemSslSubjectAlternativeNameData);
    });
  });

  describe('delete', () => {
    it('should delete configurationitemsslsubjectalternativename successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await configurationItemSslSubjectAlternativeName.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ConfigurationItemSslSubjectAlternativeName/1');
    });
  });
});