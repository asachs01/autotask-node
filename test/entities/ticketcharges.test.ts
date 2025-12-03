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
  TicketCharges,
  ITicketCharges,
  ITicketChargesQuery,
} from '../../src/entities/ticketcharges';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';

describe('TicketCharges Entity', () => {
  let setup: EntityTestSetup<TicketCharges>;

  beforeEach(() => {
    setup = createEntityTestSetup(TicketCharges);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list ticketcharges successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketCharges 1' },
        { id: 2, name: 'TicketCharges 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TicketCharges/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: ITicketChargesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TicketCharges/query',
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
    it('should get ticketcharges by id', async () => {
      const mockData = { id: 1, name: 'Test TicketCharges' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketCharges/1');
    });
  });

  describe('create', () => {
    it('should create ticketcharges successfully', async () => {
      const ticketChargesData = { name: 'New TicketCharges' };
      const mockResponse = { id: 1, ...ticketChargesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(ticketChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TicketCharges',
        ticketChargesData
      );
    });
  });

  describe('update', () => {
    it('should update ticketcharges successfully', async () => {
      const ticketChargesData = { name: 'Updated TicketCharges' };
      const mockResponse = { id: 1, ...ticketChargesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, ticketChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/TicketCharges/1',
        ticketChargesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update ticketcharges successfully', async () => {
      const ticketChargesData = { name: 'Patched TicketCharges' };
      const mockResponse = { id: 1, ...ticketChargesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, ticketChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/TicketCharges/1',
        ticketChargesData
      );
    });
  });

  describe('delete', () => {
    it('should delete ticketcharges successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/TicketCharges/1');
    });
  });
});
