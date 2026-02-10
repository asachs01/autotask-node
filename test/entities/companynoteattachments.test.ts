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
  CompanyNoteAttachments,
  ICompanyNoteAttachments,
  ICompanyNoteAttachmentsQuery,
} from '../../src/entities/companynoteattachments';

describe('CompanyNoteAttachments Entity', () => {
  let companyNoteAttachments: CompanyNoteAttachments;
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

    companyNoteAttachments = new CompanyNoteAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list companynoteattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'CompanyNoteAttachments 1' },
        { id: 2, name: 'CompanyNoteAttachments 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await companyNoteAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/CompanyNoteAttachments/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: ICompanyNoteAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await companyNoteAttachments.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/CompanyNoteAttachments/query',
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
    it('should get companynoteattachments by id', async () => {
      const mockData = { id: 1, name: 'Test CompanyNoteAttachments' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await companyNoteAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyNoteAttachments/1');
    });
  });

  describe('create', () => {
    it('should create companynoteattachments successfully', async () => {
      const companyNoteAttachmentsData = { name: 'New CompanyNoteAttachments' };
      const mockResponse = { id: 1, ...companyNoteAttachmentsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await companyNoteAttachments.create(
        companyNoteAttachmentsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/CompanyNoteAttachments',
        companyNoteAttachmentsData
      );
    });
  });

  describe('delete', () => {
    it('should delete companynoteattachments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await companyNoteAttachments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/CompanyNoteAttachments/1'
      );
    });
  });
});
