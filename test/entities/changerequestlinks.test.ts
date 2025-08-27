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
  ChangeRequestLinks,
  IChangeRequestLinks,
  IChangeRequestLinksQuery,
} from '../../src/entities/changerequestlinks';

describe('ChangeRequestLinks Entity', () => {
  let changeRequestLinks: ChangeRequestLinks;
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

    changeRequestLinks = new ChangeRequestLinks(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list changerequestlinks successfully', async () => {
      const mockData = [
        { id: 1, name: 'ChangeRequestLinks 1' },
        { id: 2, name: 'ChangeRequestLinks 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await changeRequestLinks.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ChangeRequestLinks/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IChangeRequestLinksQuery = {
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

      await changeRequestLinks.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ChangeRequestLinks/query', {
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
    it('should get changerequestlinks by id', async () => {
      const mockData = { id: 1, name: 'Test ChangeRequestLinks' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await changeRequestLinks.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ChangeRequestLinks/1');
    });
  });

  describe('create', () => {
    it('should create changerequestlinks successfully', async () => {
      const changeRequestLinksData = { name: 'New ChangeRequestLinks' };
      const mockResponse = { id: 1, ...changeRequestLinksData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await changeRequestLinks.create(changeRequestLinksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ChangeRequestLinks', changeRequestLinksData);
    });
  });

  describe('delete', () => {
    it('should delete changerequestlinks successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await changeRequestLinks.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ChangeRequestLinks/1');
    });
  });
});