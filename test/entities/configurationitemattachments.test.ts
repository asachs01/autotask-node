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
  ConfigurationItemAttachments,
  IConfigurationItemAttachments,
  IConfigurationItemAttachmentsQuery,
} from '../../src/entities/configurationitemattachments';

describe('ConfigurationItemAttachments Entity', () => {
  let configurationItemAttachments: ConfigurationItemAttachments;
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

    configurationItemAttachments = new ConfigurationItemAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list configurationitemattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ConfigurationItemAttachments 1' },
        { id: 2, name: 'ConfigurationItemAttachments 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemAttachments/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemAttachmentsQuery = {
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

      await configurationItemAttachments.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemAttachments/query', {
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
    it('should get configurationitemattachments by id', async () => {
      const mockData = { id: 1, name: 'Test ConfigurationItemAttachments' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemAttachments/1');
    });
  });

  describe('create', () => {
    it('should create configurationitemattachments successfully', async () => {
      const configurationItemAttachmentsData = { name: 'New ConfigurationItemAttachments' };
      const mockResponse = { id: 1, ...configurationItemAttachmentsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemAttachments.create(configurationItemAttachmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ConfigurationItemAttachments', configurationItemAttachmentsData);
    });
  });

  describe('delete', () => {
    it('should delete configurationitemattachments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await configurationItemAttachments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ConfigurationItemAttachments/1');
    });
  });
});