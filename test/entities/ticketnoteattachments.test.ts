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
  TicketNoteAttachments,
  ITicketNoteAttachments,
  ITicketNoteAttachmentsQuery,
} from '../../src/entities/ticketnoteattachments';

describe('TicketNoteAttachments Entity', () => {
  let ticketNoteAttachments: TicketNoteAttachments;
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

    ticketNoteAttachments = new TicketNoteAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketnoteattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketNoteAttachments 1' },
        { id: 2, name: 'TicketNoteAttachments 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await ticketNoteAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketNoteAttachments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ITicketNoteAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await ticketNoteAttachments.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketNoteAttachments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get ticketnoteattachments by id', async () => {
      const mockData = { id: 1, name: 'Test TicketNoteAttachments' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await ticketNoteAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketNoteAttachments/1');
    });
  });

  describe('create', () => {
    it('should create ticketnoteattachments successfully', async () => {
      const ticketNoteAttachmentsData = { name: 'New TicketNoteAttachments' };
      const mockResponse = { id: 1, ...ticketNoteAttachmentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await ticketNoteAttachments.create(ticketNoteAttachmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/TicketNoteAttachments', ticketNoteAttachmentsData);
    });
  });

  describe('delete', () => {
    it('should delete ticketnoteattachments successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await ticketNoteAttachments.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/TicketNoteAttachments/1');
    });
  });
});