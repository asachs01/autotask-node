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
  ConfigurationItemNotes,
  IConfigurationItemNotes,
  IConfigurationItemNotesQuery,
} from '../../src/entities/configurationitemnotes';

describe('ConfigurationItemNotes Entity', () => {
  let configurationItemNotes: ConfigurationItemNotes;
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

    configurationItemNotes = new ConfigurationItemNotes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list configurationitemnotes successfully', async () => {
      const mockData = [
        { id: 1, name: 'ConfigurationItemNotes 1' },
        { id: 2, name: 'ConfigurationItemNotes 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemNotes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemNotes/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemNotesQuery = {
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

      await configurationItemNotes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemNotes/query', {
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
    it('should get configurationitemnotes by id', async () => {
      const mockData = { id: 1, name: 'Test ConfigurationItemNotes' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemNotes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemNotes/1');
    });
  });

  describe('create', () => {
    it('should create configurationitemnotes successfully', async () => {
      const configurationItemNotesData = { name: 'New ConfigurationItemNotes' };
      const mockResponse = { id: 1, ...configurationItemNotesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemNotes.create(configurationItemNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ConfigurationItemNotes', configurationItemNotesData);
    });
  });

  describe('update', () => {
    it('should update configurationitemnotes successfully', async () => {
      const configurationItemNotesData = { name: 'Updated ConfigurationItemNotes' };
      const mockResponse = { id: 1, ...configurationItemNotesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemNotes.update(1, configurationItemNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ConfigurationItemNotes/1', configurationItemNotesData);
    });
  });

  describe('patch', () => {
    it('should partially update configurationitemnotes successfully', async () => {
      const configurationItemNotesData = { name: 'Patched ConfigurationItemNotes' };
      const mockResponse = { id: 1, ...configurationItemNotesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await configurationItemNotes.patch(1, configurationItemNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ConfigurationItemNotes/1', configurationItemNotesData);
    });
  });
});