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
  TicketSecondaryResources,
  ITicketSecondaryResources,
  ITicketSecondaryResourcesQuery,
} from '../../src/entities/ticketsecondaryresources';

describe('TicketSecondaryResources Entity', () => {
  let ticketSecondaryResources: TicketSecondaryResources;
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

    ticketSecondaryResources = new TicketSecondaryResources(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketsecondaryresources successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketSecondaryResources 1' },
        { id: 2, name: 'TicketSecondaryResources 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await ticketSecondaryResources.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketSecondaryResources/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ITicketSecondaryResourcesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await ticketSecondaryResources.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketSecondaryResources/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get ticketsecondaryresources by id', async () => {
      const mockData = { id: 1, name: 'Test TicketSecondaryResources' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await ticketSecondaryResources.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketSecondaryResources/1');
    });
  });

  describe('create', () => {
    it('should create ticketsecondaryresources successfully', async () => {
      const ticketSecondaryResourcesData = { name: 'New TicketSecondaryResources' };
      const mockResponse = { id: 1, ...ticketSecondaryResourcesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await ticketSecondaryResources.create(ticketSecondaryResourcesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/TicketSecondaryResources', ticketSecondaryResourcesData);
    });
  });

  describe('delete', () => {
    it('should delete ticketsecondaryresources successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await ticketSecondaryResources.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/TicketSecondaryResources/1');
    });
  });
});