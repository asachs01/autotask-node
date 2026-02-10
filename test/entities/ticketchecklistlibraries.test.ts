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
  TicketChecklistLibraries,
  ITicketChecklistLibraries,
  ITicketChecklistLibrariesQuery,
} from '../../src/entities/ticketchecklistlibraries';

describe('TicketChecklistLibraries Entity', () => {
  let ticketChecklistLibraries: TicketChecklistLibraries;
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

    ticketChecklistLibraries = new TicketChecklistLibraries(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketchecklistlibraries successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketChecklistLibraries 1' },
        { id: 2, name: 'TicketChecklistLibraries 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await ticketChecklistLibraries.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TicketChecklistLibraries/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: ITicketChecklistLibrariesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await ticketChecklistLibraries.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TicketChecklistLibraries/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'eq', field: 'name', value: 'test' }),
          ]),
          sort: 'id',
          page: 1,
          maxRecords: 10,
        })
      );
    });
  });

  describe('get', () => {
    it('should get ticketchecklistlibraries by id', async () => {
      const mockData = { id: 1, name: 'Test TicketChecklistLibraries' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await ticketChecklistLibraries.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketChecklistLibraries/1');
    });
  });
});
