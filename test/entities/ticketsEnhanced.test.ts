import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { TicketsEnhanced, Ticket } from '../../src/entities/ticketsEnhanced';
import { QueryResult } from '../../src/types/queryBuilder';
import { createMockAxios, createMockLogger } from '../utils/testHelpers';

describe('TicketsEnhanced', () => {
  let ticketsEnhanced: TicketsEnhanced;
  let mockAxios: any;
  let mockLogger: any;

  const mockTicket: Ticket = {
    id: 1,
    accountId: 123,
    title: 'Test Ticket',
    description: 'Test Description',
    status: 1,
    priority: 2,
    assignedResourceId: 456,
    createdDate: '2024-01-15T10:00:00Z',
    dueDateTime: '2024-01-20T17:00:00Z',
  };

  const mockQueryResult: QueryResult<Ticket> = {
    data: [mockTicket],
    metadata: {
      totalCount: 1,
      currentPage: 1,
      pageSize: 50,
      hasNextPage: false,
      hasPreviousPage: false,
      executionTime: 150,
      fromCache: false,
    },
  };

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    ticketsEnhanced = new TicketsEnhanced(mockAxios, mockLogger);

    // Default mock response for query builder
    setup.mockAxios.get.mockResolvedValue({
      data: [mockTicket],
      headers: {
        'x-total-count': '1',
        'x-current-page': '1',
        'x-page-size': '50',
      },
    });
  });

  describe('Traditional CRUD operations', () => {
    it('should create a ticket', async () => {
      setup.mockAxios.post.mockResolvedValue({ data: mockTicket });

      const result = await ticketsEnhanced.create(mockTicket);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Tickets', mockTicket);
      expect(result.data).toEqual(mockTicket);
    });

    it('should get a ticket by ID', async () => {
      setup.mockAxios.get.mockResolvedValue({ data: mockTicket });

      const result = await ticketsEnhanced.get(1);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets/1');
      expect(result.data).toEqual(mockTicket);
    });

    it('should update a ticket', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedTicket = { ...mockTicket, ...updateData };
      setup.mockAxios.put.mockResolvedValue({ data: updatedTicket });

      const result = await ticketsEnhanced.update(1, updateData);

      expect(setup.mockAxios.put).toHaveBeenCalledWith('/Tickets/1', updateData);
      expect(result.data).toEqual(updatedTicket);
    });

    it('should delete a ticket', async () => {
      setup.mockAxios.delete.mockResolvedValue({});

      await ticketsEnhanced.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/Tickets/1');
    });
  });

  describe('Query Builder Integration', () => {
    it('should provide query builder access', () => {
      const queryBuilder = ticketsEnhanced.query();
      expect(queryBuilder).toBeDefined();
      expect(typeof queryBuilder.where).toBe('function');
      expect(typeof queryBuilder.execute).toBe('function');
    });

    it('should support convenience where method', () => {
      const queryBuilder = ticketsEnhanced.where('status', 'eq', 1);
      expect(queryBuilder).toBeDefined();
      expect(typeof queryBuilder.execute).toBe('function');
    });

    it('should find by ID using query builder', async () => {
      const result = await ticketsEnhanced.findById(1);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: 'id eq 1',
          pageSize: 1,
        }),
      });
      expect(result).toEqual(mockTicket);
    });

    it('should find all tickets', async () => {
      const result = await ticketsEnhanced.findAll();

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.any(Object),
      });
      expect(result).toEqual([mockTicket]);
    });

    it('should find paginated tickets', async () => {
      const result = await ticketsEnhanced.findPaginated(2, 25);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          page: 2,
          pageSize: 25,
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should count all tickets', async () => {
      const count = await ticketsEnhanced.countAll();

      expect(setup.mockAxios.get).toHaveBeenCalled();
      expect(count).toBe(1);
    });

    it('should check if tickets exist', async () => {
      const exists = await ticketsEnhanced.exists('accountId', 123);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: 'accountId eq 123',
          pageSize: 1,
        }),
      });
      expect(exists).toBe(true);
    });
  });

  describe('Enhanced Query Methods', () => {
    it('should find tickets by status', async () => {
      const result = await ticketsEnhanced.findByStatus(1);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: 'status eq 1',
          sort: 'createdDate desc',
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should find tickets by account', async () => {
      const result = await ticketsEnhanced.findByAccount(123);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: 'accountId eq 123',
          sort: 'lastActivityDate desc',
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should find open tickets for resource', async () => {
      const result = await ticketsEnhanced.findOpenTicketsForResource(456);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: 'assignedResourceId eq 456 AND status in (1,5,8)',
          sort: 'priority desc,dueDateTime asc',
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should find overdue tickets', async () => {
      const now = new Date().toISOString();
      const result = await ticketsEnhanced.findOverdueTickets();

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: expect.stringContaining('dueDateTime lt'),
          sort: 'dueDateTime asc',
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should find tickets in date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const result = await ticketsEnhanced.findTicketsInDateRange(
        startDate,
        endDate
      );

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: `createdDate gte '${startDate}' AND createdDate lte '${endDate}'`,
          sort: 'createdDate desc',
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should find high priority tickets', async () => {
      const result = await ticketsEnhanced.findHighPriorityTickets();

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: 'priority in (1,2) AND status in (1,5,8)',
          sort: 'priority asc,createdDate asc',
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should find tickets with complex conditions', async () => {
      const result = await ticketsEnhanced.findComplexTickets();

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: expect.stringContaining('accountId eq 123'),
          sort: 'createdDate desc',
          pageSize: 50,
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should search tickets by term', async () => {
      const searchTerm = 'urgent issue';
      const result = await ticketsEnhanced.searchTickets(searchTerm);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: expect.stringContaining('title contains'),
          sort: 'lastActivityDate desc',
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should find tickets with custom field', async () => {
      const result = await ticketsEnhanced.findTicketsWithCustomField(
        'customField1',
        'value'
      );

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: "customField1 eq 'value'",
          sort: 'createdDate desc',
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });
  });

  describe('Advanced Features', () => {
    it('should get ticket statistics', async () => {
      // Mock different responses for different queries
      setup.mockAxios.get
        .mockResolvedValueOnce({
          data: [],
          headers: { 'x-total-count': '100' },
        }) // total count
        .mockResolvedValueOnce({ data: [], headers: { 'x-total-count': '75' } }) // open count
        .mockResolvedValueOnce({ data: [], headers: { 'x-total-count': '25' } }) // closed count
        .mockResolvedValueOnce({
          data: [],
          headers: { 'x-total-count': '10' },
        }); // overdue count

      const stats = await ticketsEnhanced.getTicketStats();

      expect(stats).toEqual({
        total: 100,
        open: 75,
        closed: 25,
        overdue: 10,
      });
      expect(setup.mockAxios.get).toHaveBeenCalledTimes(4);
    });

    it('should find tickets with includes', async () => {
      const result = await ticketsEnhanced.findTicketsWithAccount(123);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: 'accountId eq 123',
          include: 'Account,AssignedResource',
          sort: 'createdDate desc',
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should find tickets with includes (no account filter)', async () => {
      const result = await ticketsEnhanced.findTicketsWithAccount();

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          include: 'Account,AssignedResource',
          sort: 'createdDate desc',
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should get paginated tickets', async () => {
      const result = await ticketsEnhanced.getTicketsPaginated(2, 25);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          search: 'status ne 5',
          sort: 'priority asc,createdDate desc',
          page: 2,
          pageSize: 25,
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });

    it('should get paginated tickets with defaults', async () => {
      const result = await ticketsEnhanced.getTicketsPaginated();

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tickets', {
        params: expect.objectContaining({
          page: 1,
          pageSize: 25,
        }),
      });
      expect(result.data).toEqual([mockTicket]);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors in query execution', async () => {
      const error = new Error('API Error');
      setup.mockAxios.get.mockRejectedValue(error);

      await expect(ticketsEnhanced.findByStatus(1)).rejects.toThrow(
        'API Error'
      );
    });

    it('should handle API errors in CRUD operations', async () => {
      const error = new Error('Create failed');
      setup.mockAxios.post.mockRejectedValue(error);

      await expect(ticketsEnhanced.create(mockTicket)).rejects.toThrow(
        'Create failed'
      );
    });
  });

  describe('Metadata', () => {
    it('should return correct metadata', () => {
      const metadata = TicketsEnhanced.getMetadata();

      expect(metadata).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            operation: 'createTicket',
            endpoint: '/Tickets',
          }),
          expect.objectContaining({
            operation: 'queryTickets',
            returnType: 'QueryResult<Ticket>',
            endpoint: '/Tickets/query',
          }),
        ])
      );
    });
  });

  describe('Type Safety', () => {
    it('should provide type-safe field access', () => {
      // This test verifies that TypeScript compilation works correctly
      const query = ticketsEnhanced
        .query()
        .where('accountId', 'eq', 123)
        .where('status', 'in', [1, 5, 8])
        .orderBy('createdDate', 'desc');

      expect(query).toBeDefined();
    });

    it('should support string field names for custom fields', () => {
      const query = ticketsEnhanced
        .query()
        .where('customField_12345', 'eq', 'value')
        .orderBy('customField_67890', 'asc');

      expect(query).toBeDefined();
    });
  });
});
