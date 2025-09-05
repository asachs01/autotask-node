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
  TicketCategoryFieldDefaults,
  ITicketCategoryFieldDefaults,
  ITicketCategoryFieldDefaultsQuery,
} from '../../src/entities/ticketcategoryfielddefaults';

describe('TicketCategoryFieldDefaults Entity', () => {
  let ticketCategoryFieldDefaults: TicketCategoryFieldDefaults;
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

    ticketCategoryFieldDefaults = new TicketCategoryFieldDefaults(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketcategoryfielddefaults successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketCategoryFieldDefaults 1' },
        { id: 2, name: 'TicketCategoryFieldDefaults 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await ticketCategoryFieldDefaults.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketCategoryFieldDefaults/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ITicketCategoryFieldDefaultsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await ticketCategoryFieldDefaults.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketCategoryFieldDefaults/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get ticketcategoryfielddefaults by id', async () => {
      const mockData = { id: 1, name: 'Test TicketCategoryFieldDefaults' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await ticketCategoryFieldDefaults.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketCategoryFieldDefaults/1');
    });
  });
});