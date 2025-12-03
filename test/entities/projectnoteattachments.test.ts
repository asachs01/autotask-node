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
  ProjectNoteAttachments,
  IProjectNoteAttachments,
  IProjectNoteAttachmentsQuery,
} from '../../src/entities/projectnoteattachments';

describe('ProjectNoteAttachments Entity', () => {
  let projectNoteAttachments: ProjectNoteAttachments;
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

    projectNoteAttachments = new ProjectNoteAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list projectnoteattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ProjectNoteAttachments 1' },
        { id: 2, name: 'ProjectNoteAttachments 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await projectNoteAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ProjectNoteAttachments/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IProjectNoteAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await projectNoteAttachments.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ProjectNoteAttachments/query',
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
    it('should get projectnoteattachments by id', async () => {
      const mockData = { id: 1, name: 'Test ProjectNoteAttachments' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await projectNoteAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ProjectNoteAttachments/1');
    });
  });

  describe('create', () => {
    it('should create projectnoteattachments successfully', async () => {
      const projectNoteAttachmentsData = { name: 'New ProjectNoteAttachments' };
      const mockResponse = { id: 1, ...projectNoteAttachmentsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await projectNoteAttachments.create(
        projectNoteAttachmentsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ProjectNoteAttachments',
        projectNoteAttachmentsData
      );
    });
  });

  describe('delete', () => {
    it('should delete projectnoteattachments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await projectNoteAttachments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ProjectNoteAttachments/1'
      );
    });
  });
});
