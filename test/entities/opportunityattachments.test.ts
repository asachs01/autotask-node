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
  OpportunityAttachments,
  IOpportunityAttachments,
  IOpportunityAttachmentsQuery,
} from '../../src/entities/opportunityattachments';

describe('OpportunityAttachments Entity', () => {
  let opportunityAttachments: OpportunityAttachments;
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

    opportunityAttachments = new OpportunityAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list opportunityattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'OpportunityAttachments 1' },
        { id: 2, name: 'OpportunityAttachments 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await opportunityAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/OpportunityAttachments/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IOpportunityAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await opportunityAttachments.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/OpportunityAttachments/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          MaxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get opportunityattachments by id', async () => {
      const mockData = { id: 1, name: 'Test OpportunityAttachments' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await opportunityAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/OpportunityAttachments/1');
    });
  });

  describe('create', () => {
    it('should create opportunityattachments successfully', async () => {
      const opportunityAttachmentsData = { name: 'New OpportunityAttachments' };
      const mockResponse = { id: 1, ...opportunityAttachmentsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await opportunityAttachments.create(
        opportunityAttachmentsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/OpportunityAttachments',
        opportunityAttachmentsData
      );
    });
  });

  describe('delete', () => {
    it('should delete opportunityattachments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await opportunityAttachments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/OpportunityAttachments/1'
      );
    });
  });
});
