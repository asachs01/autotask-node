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
import { Tickets, ITickets, ITicketsQuery } from '../../src/entities/tickets';

describe('Tickets Entity', () => {
  let setup: EntityTestSetup<Tickets>;

  beforeEach(() => {
    setup = createEntityTestSetup(Tickets);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list tickets successfully', async () => {
      const mockData = [
        { id: 1, name: 'Tickets 1' },
        { id: 2, name: 'Tickets 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Tickets/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: ITicketsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Tickets/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get tickets by id', async () => {
      const mockData = { id: 1, name: 'Test Tickets' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets/1');
    });
  });

  describe('create', () => {
    it('should create tickets successfully', async () => {
      const ticketsData = { name: 'New Tickets' };
      const mockResponse = { id: 1, ...ticketsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(ticketsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/Tickets',
        ticketsData
      );
    });
  });

  describe('update', () => {
    it('should update tickets successfully', async () => {
      const ticketsData = { name: 'Updated Tickets' };
      const mockResponse = { id: 1, ...ticketsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, ticketsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/Tickets/1',
        ticketsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update tickets successfully', async () => {
      const ticketsData = { name: 'Patched Tickets' };
      const mockResponse = { id: 1, ...ticketsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, ticketsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/Tickets/1',
        ticketsData
      );
    });
  });
});
