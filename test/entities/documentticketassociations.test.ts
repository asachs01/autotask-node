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
  DocumentTicketAssociations,
  IDocumentTicketAssociations,
  IDocumentTicketAssociationsQuery,
} from '../../src/entities/documentticketassociations';

describe('DocumentTicketAssociations Entity', () => {
  let documentTicketAssociations: DocumentTicketAssociations;
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

    documentTicketAssociations = new DocumentTicketAssociations(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list documentticketassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'DocumentTicketAssociations 1' },
        { id: 2, name: 'DocumentTicketAssociations 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await documentTicketAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/DocumentTicketAssociations/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IDocumentTicketAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await documentTicketAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/DocumentTicketAssociations/query',
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
    it('should get documentticketassociations by id', async () => {
      const mockData = { id: 1, name: 'Test DocumentTicketAssociations' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await documentTicketAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/DocumentTicketAssociations/1'
      );
    });
  });

  describe('create', () => {
    it('should create documentticketassociations successfully', async () => {
      const documentTicketAssociationsData = {
        name: 'New DocumentTicketAssociations',
      };
      const mockResponse = { id: 1, ...documentTicketAssociationsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await documentTicketAssociations.create(
        documentTicketAssociationsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/DocumentTicketAssociations',
        documentTicketAssociationsData
      );
    });
  });

  describe('delete', () => {
    it('should delete documentticketassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await documentTicketAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/DocumentTicketAssociations/1'
      );
    });
  });
});
