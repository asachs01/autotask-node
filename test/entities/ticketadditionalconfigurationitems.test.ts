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
  TicketAdditionalConfigurationItems,
  ITicketAdditionalConfigurationItems,
  ITicketAdditionalConfigurationItemsQuery,
} from '../../src/entities/ticketadditionalconfigurationitems';

describe('TicketAdditionalConfigurationItems Entity', () => {
  let ticketAdditionalConfigurationItems: TicketAdditionalConfigurationItems;
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

    ticketAdditionalConfigurationItems = new TicketAdditionalConfigurationItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketadditionalconfigurationitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketAdditionalConfigurationItems 1' },
        { id: 2, name: 'TicketAdditionalConfigurationItems 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketAdditionalConfigurationItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketAdditionalConfigurationItems/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITicketAdditionalConfigurationItemsQuery = {
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

      await ticketAdditionalConfigurationItems.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TicketAdditionalConfigurationItems/query', {
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
    it('should get ticketadditionalconfigurationitems by id', async () => {
      const mockData = { id: 1, name: 'Test TicketAdditionalConfigurationItems' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await ticketAdditionalConfigurationItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketAdditionalConfigurationItems/1');
    });
  });

  describe('create', () => {
    it('should create ticketadditionalconfigurationitems successfully', async () => {
      const ticketAdditionalConfigurationItemsData = { name: 'New TicketAdditionalConfigurationItems' };
      const mockResponse = { id: 1, ...ticketAdditionalConfigurationItemsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await ticketAdditionalConfigurationItems.create(ticketAdditionalConfigurationItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TicketAdditionalConfigurationItems', ticketAdditionalConfigurationItemsData);
    });
  });

  describe('delete', () => {
    it('should delete ticketadditionalconfigurationitems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await ticketAdditionalConfigurationItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TicketAdditionalConfigurationItems/1');
    });
  });
});