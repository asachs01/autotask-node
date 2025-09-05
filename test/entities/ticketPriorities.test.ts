import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import {
  TicketPriorities,
} from '../../src/entities/ticketPriorities';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';

describe('TicketPriorities Entity', () => {
  let setup: EntityTestSetup<TicketPriorities>;

  beforeEach(() => {
    setup = createEntityTestSetup(TicketPriorities);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list ticket priorities successfully', async () => {
      const mockData = [
        { id: 1, name: 'High', priorityLevel: 1, isActive: true },
        { id: 2, name: 'Medium', priorityLevel: 2, isActive: true },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/TicketPriorities/query', {
        includeFields: [],
        MaxRecords: 500,
      });
    });

    it('should handle query parameters', async () => {
      const mockData = [{ id: 1, name: 'High Priority' }];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const options = {
        search: { isActive: true },
        maxRecords: 10,
      };

      const result = await setup.entity.list(options);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/TicketPriorities/query', {
        includeFields: [],
        MaxRecords: 10,
        search: { isActive: true },
      });
    });
  });

  describe('get', () => {
    it('should get ticket priorities by id', async () => {
      const mockData = { id: 123, name: 'High Priority', priorityLevel: 1 };

      setup.mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await setup.entity.get(123);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TicketPriorities/123');
    });
  });

  describe('create', () => {
    it('should create ticket priorities successfully', async () => {
      const newData = { name: 'Custom Priority', priorityLevel: 5 };
      const mockResponse = { id: 789, ...newData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.create(newData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/TicketPriorities', newData);
    });
  });

  describe('update', () => {
    it('should update ticket priorities successfully', async () => {
      const updateData = { id: 123, name: 'Updated Priority' };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(updateData)
      );

      const result = await setup.entity.update(updateData);

      expect(result.data).toEqual(updateData);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/TicketPriorities', updateData);
    });
  });

  describe('patch', () => {
    it('should partially update ticket priorities successfully', async () => {
      const patchData = { id: 123, isActive: false };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(patchData)
      );

      const result = await setup.entity.patch(patchData);

      expect(result.data).toEqual(patchData);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/TicketPriorities', patchData);
    });
  });
});