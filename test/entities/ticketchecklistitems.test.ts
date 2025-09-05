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
  TicketChecklistItems,
  ITicketChecklistItems,
  ITicketChecklistItemsQuery,
} from '../../src/entities/ticketchecklistitems';

describe('TicketChecklistItems Entity', () => {
  let ticketChecklistItems: TicketChecklistItems;
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

    ticketChecklistItems = new TicketChecklistItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketchecklistitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketChecklistItems 1' },
        { id: 2, name: 'TicketChecklistItems 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await ticketChecklistItems.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketChecklistItems/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ITicketChecklistItemsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await ticketChecklistItems.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketChecklistItems/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get ticketchecklistitems by id', async () => {
      const mockData = { id: 1, name: 'Test TicketChecklistItems' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await ticketChecklistItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketChecklistItems/1');
    });
  });

  describe('create', () => {
    it('should create ticketchecklistitems successfully', async () => {
      const ticketChecklistItemsData = { name: 'New TicketChecklistItems' };
      const mockResponse = { id: 1, ...ticketChecklistItemsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await ticketChecklistItems.create(ticketChecklistItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/TicketChecklistItems', ticketChecklistItemsData);
    });
  });

  describe('update', () => {
    it('should update ticketchecklistitems successfully', async () => {
      const ticketChecklistItemsData = { name: 'Updated TicketChecklistItems' };
      const mockResponse = { id: 1, ...ticketChecklistItemsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await ticketChecklistItems.update(1, ticketChecklistItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/TicketChecklistItems/1', ticketChecklistItemsData);
    });
  });

  describe('patch', () => {
    it('should partially update ticketchecklistitems successfully', async () => {
      const ticketChecklistItemsData = { name: 'Patched TicketChecklistItems' };
      const mockResponse = { id: 1, ...ticketChecklistItemsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await ticketChecklistItems.patch(1, ticketChecklistItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/TicketChecklistItems/1', ticketChecklistItemsData);
    });
  });
});