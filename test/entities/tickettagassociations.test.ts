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
  let setup: EntityTestSetup<describe>;

  beforeEach(() => {
    setup = createEntityTestSetup(describe);
  });

    ticketTagAssociations = new TicketTagAssociations(mockAxios, mockLogger);
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

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(setup.entity.data).toEqual(mockData);
      expect(setup.setup.mockAxios.get).toHaveBeenCalledWith('/TicketTagAssociations/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ITicketTagAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.setup.mockAxios.get).toHaveBeenCalledWith('/TicketTagAssociations/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get tickettagassociations by id', async () => {
      const mockData = { id: 1, name: 'Test TicketTagAssociations' };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(setup.entity.data).toEqual(mockData);
      expect(setup.setup.mockAxios.get).toHaveBeenCalledWith('/TicketTagAssociations/1');
    });
  });

  describe('create', () => {
    it('should create tickettagassociations successfully', async () => {
      const ticketTagAssociationsData = { name: 'New TicketTagAssociations' };
      const mockResponse = { id: 1, ...ticketTagAssociationsData };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(ticketTagAssociationsData);

      expect(setup.entity.data).toEqual(mockResponse);
      expect(setup.setup.mockAxios.post).toHaveBeenCalledWith('/TicketTagAssociations', ticketTagAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete tickettagassociations successfully', async () => {
      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await setup.entity.delete(1);

      expect(setup.setup.mockAxios.delete).toHaveBeenCalledWith('/TicketTagAssociations/1');
    });
  });
});