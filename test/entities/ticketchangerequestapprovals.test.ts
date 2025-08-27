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
  TicketChangeRequestApprovals,
  ITicketChangeRequestApprovals,
  ITicketChangeRequestApprovalsQuery,
} from '../../src/entities/ticketchangerequestapprovals';

describe('TicketChangeRequestApprovals Entity', () => {
  let ticketChangeRequestApprovals: TicketChangeRequestApprovals;
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

    ticketChangeRequestApprovals = new TicketChangeRequestApprovals(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketchangerequestapprovals successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketChangeRequestApprovals 1' },
        { id: 2, name: 'TicketChangeRequestApprovals 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketChangeRequestApprovals.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketChangeRequestApprovals/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITicketChangeRequestApprovalsQuery = {
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

      await ticketChangeRequestApprovals.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketChangeRequestApprovals/query', {
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
    it('should get ticketchangerequestapprovals by id', async () => {
      const mockData = { id: 1, name: 'Test TicketChangeRequestApprovals' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketChangeRequestApprovals.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketChangeRequestApprovals/1');
    });
  });

  describe('create', () => {
    it('should create ticketchangerequestapprovals successfully', async () => {
      const ticketChangeRequestApprovalsData = { name: 'New TicketChangeRequestApprovals' };
      const mockResponse = { id: 1, ...ticketChangeRequestApprovalsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await ticketChangeRequestApprovals.create(ticketChangeRequestApprovalsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TicketChangeRequestApprovals', ticketChangeRequestApprovalsData);
    });
  });

  describe('update', () => {
    it('should update ticketchangerequestapprovals successfully', async () => {
      const ticketChangeRequestApprovalsData = { name: 'Updated TicketChangeRequestApprovals' };
      const mockResponse = { id: 1, ...ticketChangeRequestApprovalsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketChangeRequestApprovals.update(1, ticketChangeRequestApprovalsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/TicketChangeRequestApprovals/1', ticketChangeRequestApprovalsData);
    });
  });

  describe('patch', () => {
    it('should partially update ticketchangerequestapprovals successfully', async () => {
      const ticketChangeRequestApprovalsData = { name: 'Patched TicketChangeRequestApprovals' };
      const mockResponse = { id: 1, ...ticketChangeRequestApprovalsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketChangeRequestApprovals.patch(1, ticketChangeRequestApprovalsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/TicketChangeRequestApprovals/1', ticketChangeRequestApprovalsData);
    });
  });
});