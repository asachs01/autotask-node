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
  TicketAdditionalContacts,
  ITicketAdditionalContacts,
  ITicketAdditionalContactsQuery,
} from '../../src/entities/ticketadditionalcontacts';

describe('TicketAdditionalContacts Entity', () => {
  let ticketAdditionalContacts: TicketAdditionalContacts;
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

    ticketAdditionalContacts = new TicketAdditionalContacts(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list ticketadditionalcontacts successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketAdditionalContacts 1' },
        { id: 2, name: 'TicketAdditionalContacts 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await ticketAdditionalContacts.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/TicketAdditionalContacts/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: ITicketAdditionalContactsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await ticketAdditionalContacts.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/TicketAdditionalContacts/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          MaxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get ticketadditionalcontacts by id', async () => {
      const mockData = { id: 1, name: 'Test TicketAdditionalContacts' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await ticketAdditionalContacts.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TicketAdditionalContacts/1');
    });
  });

  describe('create', () => {
    it('should create ticketadditionalcontacts successfully', async () => {
      const ticketAdditionalContactsData = {
        name: 'New TicketAdditionalContacts',
      };
      const mockResponse = { id: 1, ...ticketAdditionalContactsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await ticketAdditionalContacts.create(
        ticketAdditionalContactsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TicketAdditionalContacts',
        ticketAdditionalContactsData
      );
    });
  });

  describe('delete', () => {
    it('should delete ticketadditionalcontacts successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await ticketAdditionalContacts.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/TicketAdditionalContacts/1'
      );
    });
  });
});
