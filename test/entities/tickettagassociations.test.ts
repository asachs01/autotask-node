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
  TicketTagAssociations,
  ITicketTagAssociations,
  ITicketTagAssociationsQuery,
} from '../../src/entities/tickettagassociations';

describe('TicketTagAssociations Entity', () => {
  let setup: EntityTestSetup<TicketTagAssociations>;

  beforeEach(() => {
    setup = createEntityTestSetup(TicketTagAssociations);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list tickettagassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'TicketTagAssociations 1' },
        { id: 2, name: 'TicketTagAssociations 2' },
      ];

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith(
        '/TicketTagAssociations/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: ITicketTagAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.get.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith(
        '/TicketTagAssociations/query',
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
    it('should get tickettagassociations by id', async () => {
      const mockData = { id: 1, name: 'Test TicketTagAssociations' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith(
        '/TicketTagAssociations/1'
      );
    });
  });

  describe('create', () => {
    it('should create tickettagassociations successfully', async () => {
      const ticketTagAssociationsData = { name: 'New TicketTagAssociations' };
      const mockResponse = { id: 1, ...ticketTagAssociationsData };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(ticketTagAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TicketTagAssociations',
        ticketTagAssociationsData
      );
    });
  });

  describe('delete', () => {
    it('should delete tickettagassociations successfully', async () => {
      setup.mockAxios.get.mockResolvedValueOnce(createMockDeleteResponse());

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith(
        '/TicketTagAssociations/1'
      );
    });
  });
});
