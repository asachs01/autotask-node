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
  TicketNotes,
  ITicketNotes,
  ITicketNotesQuery,
} from '../../src/entities/ticketnotes';

describe('TicketNotes Entity', () => {
  let ticketNotes: TicketNotes;
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

    ticketNotes = new TicketNotes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketnotes successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketNotes 1' },
        { id: 2, name: 'TicketNotes 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketNotes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketNotes/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITicketNotesQuery = {
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

      await ticketNotes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketNotes/query', {
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
    it('should get ticketnotes by id', async () => {
      const mockData = { id: 1, name: 'Test TicketNotes' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketNotes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketNotes/1');
    });
  });

  describe('create', () => {
    it('should create ticketnotes successfully', async () => {
      const ticketNotesData = { name: 'New TicketNotes' };
      const mockResponse = { id: 1, ...ticketNotesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await ticketNotes.create(ticketNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TicketNotes', ticketNotesData);
    });
  });

  describe('update', () => {
    it('should update ticketnotes successfully', async () => {
      const ticketNotesData = { name: 'Updated TicketNotes' };
      const mockResponse = { id: 1, ...ticketNotesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketNotes.update(1, ticketNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/TicketNotes/1', ticketNotesData);
    });
  });

  describe('patch', () => {
    it('should partially update ticketnotes successfully', async () => {
      const ticketNotesData = { name: 'Patched TicketNotes' };
      const mockResponse = { id: 1, ...ticketNotesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketNotes.patch(1, ticketNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/TicketNotes/1', ticketNotesData);
    });
  });
});