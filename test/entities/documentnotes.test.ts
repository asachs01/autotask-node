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
  DocumentNotes,
  IDocumentNotes,
  IDocumentNotesQuery,
} from '../../src/entities/documentnotes';

describe('DocumentNotes Entity', () => {
  let documentNotes: DocumentNotes;
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

    documentNotes = new DocumentNotes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list documentnotes successfully', async () => {
      const mockData = [
        { id: 1, name: 'DocumentNotes 1' },
        { id: 2, name: 'DocumentNotes 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await documentNotes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentNotes/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IDocumentNotesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await documentNotes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentNotes/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get documentnotes by id', async () => {
      const mockData = { id: 1, name: 'Test DocumentNotes' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await documentNotes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DocumentNotes/1');
    });
  });

  describe('create', () => {
    it('should create documentnotes successfully', async () => {
      const documentNotesData = { name: 'New DocumentNotes' };
      const mockResponse = { id: 1, ...documentNotesData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await documentNotes.create(documentNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/DocumentNotes',
        documentNotesData
      );
    });
  });

  describe('update', () => {
    it('should update documentnotes successfully', async () => {
      const documentNotesData = { name: 'Updated DocumentNotes' };
      const mockResponse = { id: 1, ...documentNotesData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await documentNotes.update(1, documentNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/DocumentNotes/1',
        documentNotesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update documentnotes successfully', async () => {
      const documentNotesData = { name: 'Patched DocumentNotes' };
      const mockResponse = { id: 1, ...documentNotesData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await documentNotes.patch(1, documentNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/DocumentNotes/1',
        documentNotesData
      );
    });
  });
});
