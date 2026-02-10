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
  CompanyNotes,
  ICompanyNotes,
  ICompanyNotesQuery,
} from '../../src/entities/companynotes';

describe('CompanyNotes Entity', () => {
  let companyNotes: CompanyNotes;
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

    companyNotes = new CompanyNotes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list companynotes successfully', async () => {
      const mockData = [
        { id: 1, name: 'CompanyNotes 1' },
        { id: 2, name: 'CompanyNotes 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await companyNotes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyNotes/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: ICompanyNotesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await companyNotes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyNotes/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get companynotes by id', async () => {
      const mockData = { id: 1, name: 'Test CompanyNotes' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await companyNotes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyNotes/1');
    });
  });

  describe('create', () => {
    it('should create companynotes successfully', async () => {
      const companyNotesData = { name: 'New CompanyNotes' };
      const mockResponse = { id: 1, ...companyNotesData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await companyNotes.create(789, companyNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/Companies/789/Notes',
        companyNotesData
      );
    });
  });

  describe('update', () => {
    it('should update companynotes successfully', async () => {
      const companyNotesData = { name: 'Updated CompanyNotes' };
      const mockResponse = { id: 1, ...companyNotesData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await companyNotes.update(1, companyNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/CompanyNotes/1',
        companyNotesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update companynotes successfully', async () => {
      const companyNotesData = { name: 'Patched CompanyNotes' };
      const mockResponse = { id: 1, ...companyNotesData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await companyNotes.patch(1, companyNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/CompanyNotes/1',
        companyNotesData
      );
    });
  });
});
