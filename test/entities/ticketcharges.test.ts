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
  TicketCharges,
  ITicketCharges,
  ITicketChargesQuery,
} from '../../src/entities/ticketcharges';

describe('TicketCharges Entity', () => {
  let ticketCharges: TicketCharges;
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

    ticketCharges = new TicketCharges(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketcharges successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketCharges 1' },
        { id: 2, name: 'TicketCharges 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketCharges.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketCharges/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITicketChargesQuery = {
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

      await ticketCharges.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketCharges/query', {
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
    it('should get ticketcharges by id', async () => {
      const mockData = { id: 1, name: 'Test TicketCharges' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketCharges.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketCharges/1');
    });
  });

  describe('create', () => {
    it('should create ticketcharges successfully', async () => {
      const ticketChargesData = { name: 'New TicketCharges' };
      const mockResponse = { id: 1, ...ticketChargesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await ticketCharges.create(ticketChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TicketCharges', ticketChargesData);
    });
  });

  describe('update', () => {
    it('should update ticketcharges successfully', async () => {
      const ticketChargesData = { name: 'Updated TicketCharges' };
      const mockResponse = { id: 1, ...ticketChargesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketCharges.update(1, ticketChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/TicketCharges/1', ticketChargesData);
    });
  });

  describe('patch', () => {
    it('should partially update ticketcharges successfully', async () => {
      const ticketChargesData = { name: 'Patched TicketCharges' };
      const mockResponse = { id: 1, ...ticketChargesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketCharges.patch(1, ticketChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/TicketCharges/1', ticketChargesData);
    });
  });

  describe('delete', () => {
    it('should delete ticketcharges successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await ticketCharges.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TicketCharges/1');
    });
  });
});