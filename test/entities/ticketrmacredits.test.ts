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
  TicketRmaCredits,
  ITicketRmaCredits,
  ITicketRmaCreditsQuery,
} from '../../src/entities/ticketrmacredits';

describe('TicketRmaCredits Entity', () => {
  let ticketRmaCredits: TicketRmaCredits;
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

    ticketRmaCredits = new TicketRmaCredits(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketrmacredits successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketRmaCredits 1' },
        { id: 2, name: 'TicketRmaCredits 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketRmaCredits.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketRmaCredits/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITicketRmaCreditsQuery = {
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

      await ticketRmaCredits.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketRmaCredits/query', {
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
    it('should get ticketrmacredits by id', async () => {
      const mockData = { id: 1, name: 'Test TicketRmaCredits' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketRmaCredits.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketRmaCredits/1');
    });
  });

  describe('create', () => {
    it('should create ticketrmacredits successfully', async () => {
      const ticketRmaCreditsData = { name: 'New TicketRmaCredits' };
      const mockResponse = { id: 1, ...ticketRmaCreditsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await ticketRmaCredits.create(ticketRmaCreditsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TicketRmaCredits', ticketRmaCreditsData);
    });
  });

  describe('update', () => {
    it('should update ticketrmacredits successfully', async () => {
      const ticketRmaCreditsData = { name: 'Updated TicketRmaCredits' };
      const mockResponse = { id: 1, ...ticketRmaCreditsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketRmaCredits.update(1, ticketRmaCreditsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/TicketRmaCredits/1', ticketRmaCreditsData);
    });
  });

  describe('patch', () => {
    it('should partially update ticketrmacredits successfully', async () => {
      const ticketRmaCreditsData = { name: 'Patched TicketRmaCredits' };
      const mockResponse = { id: 1, ...ticketRmaCreditsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketRmaCredits.patch(1, ticketRmaCreditsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/TicketRmaCredits/1', ticketRmaCreditsData);
    });
  });

  describe('delete', () => {
    it('should delete ticketrmacredits successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await ticketRmaCredits.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TicketRmaCredits/1');
    });
  });
});