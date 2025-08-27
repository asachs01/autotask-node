import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import winston from 'winston';
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

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketNoteAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketNoteAttachments/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITicketNoteAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.get.mockResolvedValueOnce({
        data: { items: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await ticketNoteAttachments.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketNoteAttachments/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        }
      });
    });
  });

  describe('get', () => {
    it('should get ticketnoteattachments by id', async () => {
      const mockData = { id: 1, name: 'Test TicketNoteAttachments' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketNoteAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketNoteAttachments/1');
    });
  });

  describe('create', () => {
    it('should create ticketnoteattachments successfully', async () => {
      const ticketNoteAttachmentsData = { name: 'New TicketNoteAttachments' };
      const mockResponse = { id: 1, ...ticketNoteAttachmentsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await ticketNoteAttachments.create(ticketNoteAttachmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TicketNoteAttachments', ticketNoteAttachmentsData);
    });
  });

  describe('delete', () => {
    it('should delete ticketnoteattachments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await ticketNoteAttachments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TicketNoteAttachments/1');
    });
  });
});