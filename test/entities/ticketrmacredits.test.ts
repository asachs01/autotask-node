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

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await ticketRmaCredits.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/TicketRmaCredits/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: ITicketRmaCreditsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await ticketRmaCredits.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/TicketRmaCredits/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get ticketrmacredits by id', async () => {
      const mockData = { id: 1, name: 'Test TicketRmaCredits' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await ticketRmaCredits.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketRmaCredits/1');
    });
  });

  describe('create', () => {
    it('should create ticketrmacredits successfully', async () => {
      const ticketRmaCreditsData = { name: 'New TicketRmaCredits' };
      const mockResponse = { id: 1, ...ticketRmaCreditsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await ticketRmaCredits.create(ticketRmaCreditsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TicketRmaCredits',
        ticketRmaCreditsData
      );
    });
  });

  describe('update', () => {
    it('should update ticketrmacredits successfully', async () => {
      const ticketRmaCreditsData = { name: 'Updated TicketRmaCredits' };
      const mockResponse = { id: 1, ...ticketRmaCreditsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await ticketRmaCredits.update(1, ticketRmaCreditsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/TicketRmaCredits/1',
        ticketRmaCreditsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update ticketrmacredits successfully', async () => {
      const ticketRmaCreditsData = { name: 'Patched TicketRmaCredits' };
      const mockResponse = { id: 1, ...ticketRmaCreditsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await ticketRmaCredits.patch(1, ticketRmaCreditsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/TicketRmaCredits/1',
        ticketRmaCreditsData
      );
    });
  });

  describe('delete', () => {
    it('should delete ticketrmacredits successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await ticketRmaCredits.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TicketRmaCredits/1');
    });
  });
});
