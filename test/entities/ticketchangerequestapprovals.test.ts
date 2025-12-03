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

    ticketChangeRequestApprovals = new TicketChangeRequestApprovals(
      mockAxios,
      mockLogger
    );
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

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await ticketChangeRequestApprovals.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/TicketChangeRequestApprovals/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: ITicketChangeRequestApprovalsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await ticketChangeRequestApprovals.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/TicketChangeRequestApprovals/query',
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
    it('should get ticketchangerequestapprovals by id', async () => {
      const mockData = { id: 1, name: 'Test TicketChangeRequestApprovals' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await ticketChangeRequestApprovals.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/TicketChangeRequestApprovals/1'
      );
    });
  });

  describe('create', () => {
    it('should create ticketchangerequestapprovals successfully', async () => {
      const ticketChangeRequestApprovalsData = {
        name: 'New TicketChangeRequestApprovals',
      };
      const mockResponse = { id: 1, ...ticketChangeRequestApprovalsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await ticketChangeRequestApprovals.create(
        ticketChangeRequestApprovalsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TicketChangeRequestApprovals',
        ticketChangeRequestApprovalsData
      );
    });
  });

  describe('update', () => {
    it('should update ticketchangerequestapprovals successfully', async () => {
      const ticketChangeRequestApprovalsData = {
        name: 'Updated TicketChangeRequestApprovals',
      };
      const mockResponse = { id: 1, ...ticketChangeRequestApprovalsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await ticketChangeRequestApprovals.update(
        1,
        ticketChangeRequestApprovalsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/TicketChangeRequestApprovals/1',
        ticketChangeRequestApprovalsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update ticketchangerequestapprovals successfully', async () => {
      const ticketChangeRequestApprovalsData = {
        name: 'Patched TicketChangeRequestApprovals',
      };
      const mockResponse = { id: 1, ...ticketChangeRequestApprovalsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await ticketChangeRequestApprovals.patch(
        1,
        ticketChangeRequestApprovalsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/TicketChangeRequestApprovals/1',
        ticketChangeRequestApprovalsData
      );
    });
  });
});
