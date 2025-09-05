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
  ConfigurationItemNoteAttachments,
  IConfigurationItemNoteAttachments,
  IConfigurationItemNoteAttachmentsQuery,
} from '../../src/entities/configurationitemnoteattachments';

describe('ConfigurationItemNoteAttachments Entity', () => {
  let configurationItemNoteAttachments: ConfigurationItemNoteAttachments;
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

    configurationItemNoteAttachments = new ConfigurationItemNoteAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list configurationitemnoteattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ConfigurationItemNoteAttachments 1' },
        { id: 2, name: 'ConfigurationItemNoteAttachments 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await configurationItemNoteAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemNoteAttachments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemNoteAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await configurationItemNoteAttachments.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemNoteAttachments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get configurationitemnoteattachments by id', async () => {
      const mockData = { id: 1, name: 'Test ConfigurationItemNoteAttachments' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await configurationItemNoteAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ConfigurationItemNoteAttachments/1');
    });
  });

  describe('create', () => {
    it('should create configurationitemnoteattachments successfully', async () => {
      const configurationItemNoteAttachmentsData = { name: 'New ConfigurationItemNoteAttachments' };
      const mockResponse = { id: 1, ...configurationItemNoteAttachmentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await configurationItemNoteAttachments.create(configurationItemNoteAttachmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ConfigurationItemNoteAttachments', configurationItemNoteAttachmentsData);
    });
  });

  describe('delete', () => {
    it('should delete configurationitemnoteattachments successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await configurationItemNoteAttachments.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ConfigurationItemNoteAttachments/1');
    });
  });
});