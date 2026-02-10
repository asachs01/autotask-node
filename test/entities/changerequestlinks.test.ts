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

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await changeRequestLinks.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/ChangeRequestLinks/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IChangeRequestLinksQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await changeRequestLinks.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/ChangeRequestLinks/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get changerequestlinks by id', async () => {
      const mockData = { id: 1, name: 'Test ChangeRequestLinks' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await changeRequestLinks.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ChangeRequestLinks/1');
    });
  });

  describe('create', () => {
    it('should create changerequestlinks successfully', async () => {
      const changeRequestLinksData = { name: 'New ChangeRequestLinks' };
      const mockResponse = { id: 1, ...changeRequestLinksData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await changeRequestLinks.create(changeRequestLinksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ChangeRequestLinks',
        changeRequestLinksData
      );
    });
  });

  describe('delete', () => {
    it('should delete changerequestlinks successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await changeRequestLinks.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ChangeRequestLinks/1');
    });
  });
});
