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

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await ticketAdditionalConfigurationItems.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketAdditionalConfigurationItems/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ITicketAdditionalConfigurationItemsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await ticketAdditionalConfigurationItems.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketAdditionalConfigurationItems/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get ticketadditionalconfigurationitems by id', async () => {
      const mockData = { id: 1, name: 'Test TicketAdditionalConfigurationItems' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await ticketAdditionalConfigurationItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketAdditionalConfigurationItems/1');
    });
  });

  describe('create', () => {
    it('should create ticketadditionalconfigurationitems successfully', async () => {
      const ticketAdditionalConfigurationItemsData = { name: 'New TicketAdditionalConfigurationItems' };
      const mockResponse = { id: 1, ...ticketAdditionalConfigurationItemsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await ticketAdditionalConfigurationItems.create(ticketAdditionalConfigurationItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/TicketAdditionalConfigurationItems', ticketAdditionalConfigurationItemsData);
    });
  });

  describe('delete', () => {
    it('should delete ticketadditionalconfigurationitems successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await ticketAdditionalConfigurationItems.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/TicketAdditionalConfigurationItems/1');
    });
  });
});