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

    configurationItemAttachments = new ConfigurationItemAttachments(
      mockAxios,
      mockLogger
    );
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

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await configurationItemAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ConfigurationItemAttachments/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await configurationItemAttachments.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ConfigurationItemAttachments/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'eq', field: 'name', value: 'test' }),
          ]),
          sort: 'id',
          page: 1,
          maxRecords: 10,
        })
      );
    });
  });

  describe('get', () => {
    it('should get configurationitemattachments by id', async () => {
      const mockData = { id: 1, name: 'Test ConfigurationItemAttachments' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await configurationItemAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ConfigurationItemAttachments/1'
      );
    });
  });

  describe('create', () => {
    it('should create configurationitemattachments successfully', async () => {
      const configurationItemAttachmentsData = {
        name: 'New ConfigurationItemAttachments',
      };
      const mockResponse = { id: 1, ...configurationItemAttachmentsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await configurationItemAttachments.create(
        configurationItemAttachmentsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ConfigurationItemAttachments',
        configurationItemAttachmentsData
      );
    });
  });

  describe('delete', () => {
    it('should delete configurationitemattachments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await configurationItemAttachments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ConfigurationItemAttachments/1'
      );
    });
  });
});
