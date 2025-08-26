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
  UserDefinedFieldDefinitions,
  IUserDefinedFieldDefinitions,
  IUserDefinedFieldDefinitionsQuery,
} from '../../src/entities/userdefinedfielddefinitions';

describe('UserDefinedFieldDefinitions Entity', () => {
  let userDefinedFieldDefinitions: UserDefinedFieldDefinitions;
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

    userDefinedFieldDefinitions = new UserDefinedFieldDefinitions(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list userdefinedfielddefinitions successfully', async () => {
      const mockData = [
        { id: 1, name: 'UserDefinedFieldDefinitions 1' },
        { id: 2, name: 'UserDefinedFieldDefinitions 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await userDefinedFieldDefinitions.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/UserDefinedFieldDefinitions/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IUserDefinedFieldDefinitionsQuery = {
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

      await userDefinedFieldDefinitions.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/UserDefinedFieldDefinitions/query', {
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
    it('should get userdefinedfielddefinitions by id', async () => {
      const mockData = { id: 1, name: 'Test UserDefinedFieldDefinitions' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await userDefinedFieldDefinitions.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/UserDefinedFieldDefinitions/1');
    });
  });
});